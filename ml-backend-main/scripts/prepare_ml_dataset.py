import pandas as pd
import numpy as np
import os
from pathlib import Path
import ta
from ta.trend import SMAIndicator, EMAIndicator, MACD
from ta.momentum import RSIIndicator, StochasticOscillator
from ta.volatility import BollingerBands
from ta.volume import VolumeWeightedAveragePrice
import psycopg2
from psycopg2.extras import execute_values
import warnings
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Minimum required data points for reliable technical analysis
MIN_DATA_POINTS = 50  # Minimum number of data points required
MIN_DAYS = 30  # Minimum number of days required

def get_db_connection():
    """Get database connection."""
    return psycopg2.connect(
        host=os.getenv('DB_HOST', 'host.docker.internal'),
        port=os.getenv('DB_PORT', '5433'),
        database=os.getenv('DB_NAME', 'stock_market'),
        user=os.getenv('DB_USER', 'postgres'),
        password=os.getenv('DB_PASSWORD', 'postgres')
    )

def get_data_directory():
    """Get the absolute path to the data directory."""
    # Get the absolute path to the backend directory
    backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    # Return the path to the all-data directory
    return os.path.join(backend_dir, 'all-data')

def load_and_prepare_data(data_dir=None):
    """Load all CSV files and prepare the dataset with technical indicators."""
    all_data = []
    skipped_files = []
    
    # Use the correct data directory path
    if data_dir is None:
        data_dir = get_data_directory()
    
    print(f"Looking for CSV files in: {data_dir}")
    
    # Get all CSV files
    csv_files = list(Path(data_dir).glob('*_daily_data_*.csv'))
    
    if not csv_files:
        warnings.warn(f"No CSV files found in {data_dir} directory")
        return None
    
    print(f"Found {len(csv_files)} CSV files")
    
    for file_path in csv_files:
        try:
            # Read CSV file
            df = pd.read_csv(file_path)
            
            # Check if file has enough data points
            if len(df) < MIN_DATA_POINTS:
                warnings.warn(f"Insufficient data points in {file_path.name}: {len(df)} points (minimum {MIN_DATA_POINTS} required)")
                skipped_files.append((file_path.name, "insufficient_data_points"))
                continue
            
            # Convert date to datetime
            df['date'] = pd.to_datetime(df['date'])
            
            # Check if data spans enough days
            date_range = (df['date'].max() - df['date'].min()).days
            if date_range < MIN_DAYS:
                warnings.warn(f"Insufficient date range in {file_path.name}: {date_range} days (minimum {MIN_DAYS} days required)")
                skipped_files.append((file_path.name, "insufficient_date_range"))
                continue
            
            # Sort by date
            df = df.sort_values('date')
            
            # Add symbol column if not present and format it
            if 'symbol' not in df.columns:
                symbol = file_path.stem.split('_')[0]
                # Remove any non-alphanumeric characters and convert to uppercase
                symbol = ''.join(c for c in symbol if c.isalnum()).upper()
                df['symbol'] = symbol
            
            # Check for missing values in essential columns
            essential_columns = ['open', 'high', 'low', 'close', 'volume']
            missing_values = df[essential_columns].isnull().sum()
            if missing_values.any():
                warnings.warn(f"Missing values found in {file_path.name}:\n{missing_values[missing_values > 0]}")
                skipped_files.append((file_path.name, "missing_values"))
                continue
            
            # Calculate technical indicators
            # Trend indicators
            df['sma_20'] = SMAIndicator(close=df['close'], window=20).sma_indicator()
            df['sma_50'] = SMAIndicator(close=df['close'], window=50).sma_indicator()
            df['ema_20'] = EMAIndicator(close=df['close'], window=20).ema_indicator()
            
            # MACD
            macd = MACD(close=df['close'])
            df['macd'] = macd.macd()
            df['macd_signal'] = macd.macd_signal()
            df['macd_diff'] = macd.macd_diff()
            
            # Momentum indicators
            df['rsi_14'] = RSIIndicator(close=df['close'], window=14).rsi()
            
            # Stochastic Oscillator
            stoch = StochasticOscillator(high=df['high'], low=df['low'], close=df['close'])
            df['stoch_k'] = stoch.stoch()
            df['stoch_d'] = stoch.stoch_signal()
            
            # Bollinger Bands
            bb = BollingerBands(close=df['close'])
            df['bb_high'] = bb.bollinger_hband()
            df['bb_low'] = bb.bollinger_lband()
            df['bb_mid'] = bb.bollinger_mavg()
            
            # Volume indicators
            df['vwap'] = VolumeWeightedAveragePrice(
                high=df['high'],
                low=df['low'],
                close=df['close'],
                volume=df['volume']
            ).volume_weighted_average_price()
            
            # Price changes
            df['price_change'] = df['close'].pct_change()
            df['price_change_5d'] = df['close'].pct_change(periods=5)
            
            # Volume changes
            df['volume_change'] = df['volume'].pct_change()
            
            # Generate target variable (BUY/SELL/HOLD signals)
            # Using a strategy based on SMA20 and SMA50 crossovers with higher thresholds
            df['signal'] = 0  # Default to HOLD
            
            # Calculate price position relative to SMAs
            df['above_sma20'] = df['close'] > df['sma_20']
            df['above_sma50'] = df['close'] > df['sma_50']
            
            # Calculate percentage distance from SMAs
            df['dist_from_sma20'] = ((df['close'] - df['sma_20']) / df['sma_20']) * 100
            df['dist_from_sma50'] = ((df['close'] - df['sma_50']) / df['sma_50']) * 100
            
            # Generate signals based on price position and trend
            # BUY: Price significantly above both SMAs (strong uptrend)
            # Require at least 2% above both SMAs
            buy_conditions = (
                (df['above_sma20']) & 
                (df['above_sma50']) & 
                (df['dist_from_sma20'] > 2.0) & 
                (df['dist_from_sma50'] > 2.0)
            )
            df.loc[buy_conditions, 'signal'] = 1
            
            # SELL: Price significantly below both SMAs (strong downtrend)
            # Require at least 2% below both SMAs
            sell_conditions = (
                (~df['above_sma20']) & 
                (~df['above_sma50']) & 
                (df['dist_from_sma20'] < -2.0) & 
                (df['dist_from_sma50'] < -2.0)
            )
            df.loc[sell_conditions, 'signal'] = -1
            
            # HOLD: Price near SMAs or between them
            # This includes:
            # 1. Price within 2% of either SMA
            # 2. Price between SMAs
            # 3. Price near crossover points
            hold_conditions = (
                # Price within 2% of SMA20
                (abs(df['dist_from_sma20']) <= 2.0) |
                # Price within 2% of SMA50
                (abs(df['dist_from_sma50']) <= 2.0) |
                # Price between SMAs (different signs of distance)
                ((df['dist_from_sma20'] * df['dist_from_sma50']) < 0) |
                # Price near crossover points (both distances small)
                ((abs(df['dist_from_sma20']) <= 1.0) & (abs(df['dist_from_sma50']) <= 1.0))
            )
            
            df.loc[hold_conditions, 'signal'] = 0
            
            # Handle infinite values and ensure numeric values are within range
            numeric_columns = df.select_dtypes(include=[np.number]).columns
            for col in numeric_columns:
                # Replace infinite values with NaN
                df[col] = df[col].replace([np.inf, -np.inf], np.nan)
                # Clip values to reasonable range for DECIMAL(10,2)
                if col not in ['signal']:  # Don't clip signal values
                    df[col] = df[col].clip(-99999999.99, 99999999.99)
            
            # Remove rows with NaN values (due to technical indicator calculations)
            df = df.dropna()
            
            # Check if enough data remains after technical indicator calculations
            if len(df) < MIN_DATA_POINTS:
                warnings.warn(f"Insufficient data points after technical calculations in {file_path.name}: {len(df)} points (minimum {MIN_DATA_POINTS} required)")
                skipped_files.append((file_path.name, "insufficient_data_after_calculations"))
                continue
            
            all_data.append(df)
            print(f"Successfully processed {file_path.name}")
            
        except Exception as e:
            warnings.warn(f"Error processing {file_path}: {str(e)}")
            skipped_files.append((file_path.name, str(e)))
            continue
    
    # Print summary of skipped files
    if skipped_files:
        print("\nSkipped Files Summary:")
        for filename, reason in skipped_files:
            print(f"- {filename}: {reason}")
    
    # Combine all dataframes
    if all_data:
        combined_df = pd.concat(all_data, ignore_index=True)
        print(f"\nSuccessfully processed {len(all_data)} files")
        print(f"Skipped {len(skipped_files)} files")
        return combined_df
    else:
        warnings.warn("No data was successfully processed")
        return None

def save_to_database(df):
    """Save the prepared dataset to the signal_history_analytics table."""
    if df is None:
        print("No data to save")
        return
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Create table if it doesn't exist
        create_table_query = """
            CREATE TABLE IF NOT EXISTS signal_history_analytics (
                id SERIAL PRIMARY KEY,
                symbol VARCHAR(50) NOT NULL,
                date DATE NOT NULL,
                open DECIMAL(10,2) NOT NULL,
                high DECIMAL(10,2) NOT NULL,
                low DECIMAL(10,2) NOT NULL,
                close DECIMAL(10,2) NOT NULL,
                volume BIGINT NOT NULL,
                sma_20 DECIMAL(10,2),
                sma_50 DECIMAL(10,2),
                ema_20 DECIMAL(10,2),
                macd DECIMAL(10,2),
                macd_signal DECIMAL(10,2),
                macd_diff DECIMAL(10,2),
                rsi_14 DECIMAL(10,2),
                stoch_k DECIMAL(10,2),
                stoch_d DECIMAL(10,2),
                bb_high DECIMAL(10,2),
                bb_low DECIMAL(10,2),
                bb_mid DECIMAL(10,2),
                vwap DECIMAL(10,2),
                price_change DECIMAL(10,2),
                price_change_5d DECIMAL(10,2),
                volume_change DECIMAL(10,2),
                signal INTEGER,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(symbol, date)
            );
        """
        cursor.execute(create_table_query)
        print("Ensured signal_history_analytics table exists")
        
        # Prepare data for insertion
        columns = ['symbol', 'date', 'open', 'high', 'low', 'close', 'volume',
                  'sma_20', 'sma_50', 'ema_20', 'macd', 'macd_signal', 'macd_diff',
                  'rsi_14', 'stoch_k', 'stoch_d', 'bb_high', 'bb_low', 'bb_mid',
                  'vwap', 'price_change', 'price_change_5d', 'volume_change', 'signal']
        
        # Convert DataFrame to list of tuples, replacing NaN with None
        values = []
        for _, row in df[columns].iterrows():
            # Convert row to list, replacing NaN with None
            row_values = [None if pd.isna(x) else x for x in row]
            values.append(tuple(row_values))
        
        # Insert data with UPSERT
        insert_query = f"""
            INSERT INTO signal_history_analytics (
                symbol, date, open, high, low, close, volume,
                sma_20, sma_50, ema_20, macd, macd_signal, macd_diff,
                rsi_14, stoch_k, stoch_d, bb_high, bb_low, bb_mid,
                vwap, price_change, price_change_5d, volume_change, signal
            ) VALUES %s
            ON CONFLICT (symbol, date) DO UPDATE SET
                open = EXCLUDED.open,
                high = EXCLUDED.high,
                low = EXCLUDED.low,
                close = EXCLUDED.close,
                volume = EXCLUDED.volume,
                sma_20 = EXCLUDED.sma_20,
                sma_50 = EXCLUDED.sma_50,
                ema_20 = EXCLUDED.ema_20,
                macd = EXCLUDED.macd,
                macd_signal = EXCLUDED.macd_signal,
                macd_diff = EXCLUDED.macd_diff,
                rsi_14 = EXCLUDED.rsi_14,
                stoch_k = EXCLUDED.stoch_k,
                stoch_d = EXCLUDED.stoch_d,
                bb_high = EXCLUDED.bb_high,
                bb_low = EXCLUDED.bb_low,
                bb_mid = EXCLUDED.bb_mid,
                vwap = EXCLUDED.vwap,
                price_change = EXCLUDED.price_change,
                price_change_5d = EXCLUDED.price_change_5d,
                volume_change = EXCLUDED.volume_change,
                signal = EXCLUDED.signal,
                created_at = CURRENT_TIMESTAMP
        """
        
        execute_values(cursor, insert_query, values)
        
        # Get count of records
        cursor.execute("SELECT COUNT(*) FROM signal_history_analytics")
        count = cursor.fetchone()[0]
        
        conn.commit()
        print(f"Successfully upserted data into signal_history_analytics table (total records: {count})")
        
    except Exception as e:
        conn.rollback()
        print(f"Error saving data to database: {str(e)}")
        raise
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    # Prepare the dataset
    df = load_and_prepare_data()
    
    # Save to database
    save_to_database(df) 
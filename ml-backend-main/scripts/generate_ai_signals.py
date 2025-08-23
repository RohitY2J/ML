import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import psycopg2
from psycopg2.extras import execute_values
import logging
import os
import glob
import talib
from talib import abstract
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def get_db_connection():
    """Create a database connection"""
    try:
        conn = psycopg2.connect(
            host=os.getenv('DB_HOST', 'localhost'),
            port=os.getenv('DB_PORT', '5433'),
            database=os.getenv('DB_NAME', 'stock_market'),
            user=os.getenv('DB_USER', 'postgres'),
            password=os.getenv('DB_PASSWORD', 'postgres')
        )
        logger.info("Successfully connected to database")
        return conn
    except Exception as e:
        logger.error(f"Error connecting to database: {e}")
        raise

def get_historical_data(conn, symbol, days=120):
    """Get historical price data for a symbol"""
    cursor = conn.cursor()
    try:
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)
        
        cursor.execute("""
            SELECT date, open, high, low, close, volume
            FROM daily_data
            WHERE symbol = %s AND date >= %s
            ORDER BY date
        """, (symbol, start_date))
        
        rows = cursor.fetchall()
        
        if not rows:
            logger.warning(f"No historical data found for {symbol}")
            return None
            
        # Convert to DataFrame
        df = pd.DataFrame(rows, columns=['date', 'open', 'high', 'low', 'close', 'volume'])
        df['date'] = pd.to_datetime(df['date'])
        
        # Ensure numeric columns are converted to float
        for col in ['open', 'high', 'low', 'close', 'volume']:
            df[col] = pd.to_numeric(df[col], errors='coerce')
            
        # Drop rows with NaN values
        df = df.dropna()
        
        df.set_index('date', inplace=True)
        
        return df
    finally:
        cursor.close()

def get_trading_zones(conn, symbol, timeframe_days=90):
    """Get trading zones for a symbol"""
    cursor = conn.cursor()
    try:
        # Get support zones
        cursor.execute("""
            SELECT zone_number, bottom_price, center_price, top_price
            FROM support_zones
            WHERE symbol = %s AND timeframe_days = %s
            ORDER BY center_price DESC
        """, (symbol, timeframe_days))
        support_zones = cursor.fetchall()
        
        # Get resistance zones
        cursor.execute("""
            SELECT zone_number, bottom_price, center_price, top_price
            FROM resistance_zones
            WHERE symbol = %s AND timeframe_days = %s
            ORDER BY center_price ASC
        """, (symbol, timeframe_days))
        resistance_zones = cursor.fetchall()
        
        # Convert to dictionaries
        zones = {
            'support': [{'bottom': z[1], 'center': z[2], 'top': z[3]} for z in support_zones],
            'resistance': [{'bottom': z[1], 'center': z[2], 'top': z[3]} for z in resistance_zones]
        }
        
        return zones
    finally:
        cursor.close()

def get_trendline(conn, symbol, timeframe_days=90):
    """Get the most recent trendline for a symbol"""
    cursor = conn.cursor()
    try:
        cursor.execute("""
            SELECT trend_type, slope, start_date, end_date, start_price, end_price
            FROM trendlines
            WHERE symbol = %s AND timeframe_days = %s
            ORDER BY end_date DESC
            LIMIT 1
        """, (symbol, timeframe_days))
        result = cursor.fetchone()
        
        if result:
            return {
                'trend_type': result[0],
                'slope': result[1],
                'start_date': result[2],
                'end_date': result[3],
                'start_price': result[4],
                'end_price': result[5]
            }
        return None
    finally:
        cursor.close()

def calculate_technical_indicators(df):
    """Calculate technical indicators using TA-Lib"""
    if df is None or len(df) < 30:
        return None
    
    try:
        # Ensure all price data is in float64 format for TA-Lib
        for col in ['open', 'high', 'low', 'close', 'volume']:
            df[col] = df[col].astype(np.float64)
        
        # Convert to numpy arrays for TA-Lib
        open_prices = df['open'].values
        high_prices = df['high'].values
        low_prices = df['low'].values
        close_prices = df['close'].values
        volume = df['volume'].values
        
        indicators = {}
        
        # Moving Averages
        indicators['sma20'] = talib.SMA(close_prices, timeperiod=20)
        indicators['sma50'] = talib.SMA(close_prices, timeperiod=50)
        indicators['sma200'] = talib.SMA(close_prices, timeperiod=200)
        
        # Exponential Moving Averages
        indicators['ema9'] = talib.EMA(close_prices, timeperiod=9)
        indicators['ema21'] = talib.EMA(close_prices, timeperiod=21)
        
        # RSI (Relative Strength Index)
        indicators['rsi'] = talib.RSI(close_prices, timeperiod=14)
        
        # MACD (Moving Average Convergence Divergence)
        indicators['macd'], indicators['macd_signal'], indicators['macd_hist'] = talib.MACD(
            close_prices, fastperiod=12, slowperiod=26, signalperiod=9
        )
        
        # Bollinger Bands
        indicators['bbands_upper'], indicators['bbands_middle'], indicators['bbands_lower'] = talib.BBANDS(
            close_prices, timeperiod=20, nbdevup=2, nbdevdn=2, matype=0
        )
        
        # Stochastic Oscillator
        indicators['slowk'], indicators['slowd'] = talib.STOCH(
            high_prices, low_prices, close_prices,
            fastk_period=14, slowk_period=3, slowk_matype=0,
            slowd_period=3, slowd_matype=0
        )
        
        # ADX (Average Directional Index)
        indicators['adx'] = talib.ADX(high_prices, low_prices, close_prices, timeperiod=14)
        
        # Create a DataFrame with indicators
        indicators_df = pd.DataFrame(indicators, index=df.index)
        
        # Merge with original data
        result_df = pd.concat([df, indicators_df], axis=1)
        
        return result_df
    except Exception as e:
        logger.error(f"Error calculating technical indicators: {e}")
        return None

def analyze_signals(df, zones, trendline):
    """Analyze signals based on technical indicators and price zones"""
    if df is None or len(df) < 2:
        return None
    
    try:
        last_row = df.iloc[-1]
        current_price = float(last_row['close'])
        prev_price = float(df.iloc[-2]['close'])
        
        signal = {
            'signal': 'HOLD',
            'buy_date': datetime.now().strftime('%Y-%m-%d'),  # Initialize with current date
            'buy_price': current_price,  # Initialize with current price
            'adj_buy_price': None,
            'sold': None,
            'sold_price': None,
            'current_strategy': 'HOLD',
            'point_change': 0,
            'profit_loss_pct': 0,
            'buy_range': None,
            'sell_range': None,
            'risk_reward_ratio': '1:1',  # Default risk-reward ratio
            'stop_loss': None,
            'trade_result': None
        }
        
        # Calculate buy signal
        buy_signals = 0
        sell_signals = 0
        
        # Check price zone signals
        if zones and 'support' in zones and zones['support']:
            # Convert all numeric values to float
            for z in zones['support']:
                z['bottom'] = float(z['bottom'])
                z['center'] = float(z['center'])
                z['top'] = float(z['top'])
                
            nearest_support = min(zones['support'], key=lambda x: abs(x['center'] - current_price))
            if current_price <= nearest_support['center'] * 1.02:  # Within 2% of support
                buy_signals += 1
                signal['buy_range'] = f"{nearest_support['bottom']:.2f} - {nearest_support['top']:.2f}"
                signal['stop_loss'] = f"{nearest_support['bottom']:.2f}"
        
        if zones and 'resistance' in zones and zones['resistance']:
            # Convert all numeric values to float
            for z in zones['resistance']:
                z['bottom'] = float(z['bottom'])
                z['center'] = float(z['center'])
                z['top'] = float(z['top'])
                
            nearest_resistance = min(zones['resistance'], key=lambda x: abs(x['center'] - current_price))
            if current_price >= nearest_resistance['center'] * 0.98:  # Within 2% of resistance
                sell_signals += 1
                signal['sell_range'] = f"{nearest_resistance['bottom']:.2f} - {nearest_resistance['top']:.2f}"
        
        # Check trendline signal
        if trendline:
            # Convert slope to float if it's not already
            if hasattr(trendline['slope'], 'is_finite'):  # Check if it's a Decimal
                trendline['slope'] = float(trendline['slope'])
                
            if trendline['trend_type'] == 'uptrend' and trendline['slope'] > 0:
                buy_signals += 1
            elif trendline['trend_type'] == 'downtrend' and trendline['slope'] < 0:
                sell_signals += 1
        
        # Check moving average signals
        if last_row['sma20'] > last_row['sma50']:
            buy_signals += 1
        else:
            sell_signals += 1
            
        if current_price > last_row['sma50']:
            buy_signals += 1
        else:
            sell_signals += 1
        
        # Check RSI signals
        if last_row['rsi'] < 30:  # Oversold
            buy_signals += 1
        elif last_row['rsi'] > 70:  # Overbought
            sell_signals += 1
        
        # Check MACD signals
        if last_row['macd'] > last_row['macd_signal']:
            buy_signals += 1
        else:
            sell_signals += 1
        
        # Check Bollinger Bands
        if current_price <= last_row['bbands_lower']:
            buy_signals += 1
        elif current_price >= last_row['bbands_upper']:
            sell_signals += 1
        
        # Calculate final signal
        if buy_signals > sell_signals and buy_signals >= 3:
            signal['signal'] = 'BUY'
            signal['buy_date'] = df.index[-1].strftime('%Y-%m-%d')
            signal['buy_price'] = current_price
            signal['current_strategy'] = 'Active'
            
            # Calculate sell target if we have resistance zones
            if zones and 'resistance' in zones and zones['resistance']:
                suitable_resistances = [z for z in zones['resistance'] if z['bottom'] > current_price * 1.03]
                if suitable_resistances:
                    nearest_resistance = min(suitable_resistances, key=lambda x: x['bottom'])
                    signal['sell_range'] = f"{nearest_resistance['bottom']:.2f} - {nearest_resistance['top']:.2f}"
                    
                    # Calculate risk-reward ratio
                    if signal['stop_loss']:
                        stop_loss_price = float(signal['stop_loss'])
                        risk = current_price - stop_loss_price
                        reward = nearest_resistance['center'] - current_price
                        if risk > 0:
                            signal['risk_reward_ratio'] = f"1:{reward/risk:.2f}"
                        else:
                            # Set a default risk-reward ratio if we can't calculate
                            signal['risk_reward_ratio'] = "1:1.5"
                    else:
                        # Set default stop loss and risk-reward if no stop loss was calculated
                        signal['stop_loss'] = f"{current_price * 0.95:.2f}"  # 5% below current price
                        signal['risk_reward_ratio'] = "1:1.5"
        
        elif sell_signals > buy_signals and sell_signals >= 3:
            signal['signal'] = 'SELL'
            signal['current_strategy'] = 'Sell'
            
            # Ensure sell signals also have required fields
            if not signal['stop_loss']:
                signal['stop_loss'] = f"{current_price * 1.05:.2f}"  # 5% above current price
            if not signal['risk_reward_ratio']:
                signal['risk_reward_ratio'] = "1:1.5"
        
        return signal
    except Exception as e:
        logger.error(f"Error analyzing signals: {e}")
        return None

def store_ai_signals(conn, signals):
    """Store AI trading signals in the database"""
    cursor = conn.cursor()
    try:
        # Create table if it doesn't exist
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS ai_trading_signals_new (
                id SERIAL PRIMARY KEY,
                symbol VARCHAR(50),
                signal VARCHAR(10),
                buy_date DATE,
                buy_price DECIMAL(10,2),
                adj_buy_price DECIMAL(10,2),
                sold_date DATE,
                sold_price DECIMAL(10,2),
                current_strategy VARCHAR(20),
                point_change DECIMAL(10,2),
                profit_loss_pct DECIMAL(5,2),
                buy_range VARCHAR(30),
                sell_range VARCHAR(30),
                risk_reward_ratio VARCHAR(20),
                stop_loss VARCHAR(20),
                trade_result VARCHAR(20),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Delete existing signals
        cursor.execute("DELETE FROM ai_trading_signals_new")
        
        # Prepare data for insertion
        values = []
        for symbol, signal in signals.items():
            values.append((
                symbol,
                signal['signal'],
                signal.get('buy_date'),
                signal.get('buy_price'),
                signal.get('adj_buy_price'),
                signal.get('sold'),
                signal.get('sold_price'),
                signal.get('current_strategy'),
                signal.get('point_change'),
                signal.get('profit_loss_pct'),
                signal.get('buy_range'),
                signal.get('sell_range'),
                signal.get('risk_reward_ratio'),
                signal.get('stop_loss'),
                signal.get('trade_result')
            ))
        
        if not values:
            logger.warning("No signals to store in database")
            return
        
        # Insert new signals
        execute_values(
            cursor,
            """
            INSERT INTO ai_trading_signals_new 
            (symbol, signal, buy_date, buy_price, adj_buy_price, sold_date, 
             sold_price, current_strategy, point_change, profit_loss_pct, 
             buy_range, sell_range, risk_reward_ratio, stop_loss, trade_result)
            VALUES %s
            """,
            values
        )
        
        conn.commit()
        logger.info(f"Successfully stored {len(values)} AI trading signals in ai_trading_signals_new table")
    except Exception as e:
        conn.rollback()
        logger.error(f"Error storing AI signals: {e}")
        raise
    finally:
        cursor.close()

def get_all_symbols(conn):
    """Get all symbols from the symbols table"""
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT symbol FROM symbols")
        return [row[0] for row in cursor.fetchall()]
    finally:
        cursor.close()

def export_to_csv(signals, filename='ai_signals.csv'):
    """Export signals to CSV file"""
    data = []
    for symbol, signal in signals.items():
        signal['symbol'] = symbol
        data.append(signal)
    
    df = pd.DataFrame(data)
    # Reorder columns to match the desired output
    columns = ['symbol', 'signal', 'buy_date', 'buy_price', 'adj_buy_price', 
               'sold', 'sold_price', 'current_strategy', 'point_change', 
               'profit_loss_pct', 'buy_range', 'sell_range', 
               'risk_reward_ratio', 'stop_loss', 'trade_result']
    
    df = df[columns]
    df.to_csv(filename, index=False)
    logger.info(f"Signals exported to {filename}")

def create_signal_history_table(conn):
    """Create a table to store the history of signals for tracking performance over time"""
    cursor = conn.cursor()
    try:
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS ai_signal_history (
                id SERIAL PRIMARY KEY,
                symbol VARCHAR(50),
                signal_date DATE,
                signal_type VARCHAR(10),
                price DECIMAL(10,2),
                buy_range VARCHAR(30),
                sell_range VARCHAR(30),
                risk_reward_ratio VARCHAR(20),
                stop_loss VARCHAR(20),
                
                -- Additional performance tracking fields
                actual_exit_date DATE,
                actual_exit_price DECIMAL(10,2),
                days_held INTEGER,
                actual_profit_loss DECIMAL(5,2),
                target_hit BOOLEAN,
                stop_loss_hit BOOLEAN,
                trade_notes TEXT,
                
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        conn.commit()
        logger.info("Created ai_signal_history table for tracking signal performance")
    except Exception as e:
        conn.rollback()
        logger.error(f"Error creating ai_signal_history table: {e}")
    finally:
        cursor.close()

def store_in_signal_history(conn, signals):
    """Store current signals in the history table for future performance tracking"""
    cursor = conn.cursor()
    try:
        values = []
        for symbol, signal in signals.items():
            if signal['signal'] in ('BUY', 'SELL'):  # Only track actionable signals
                # Generate future exit date based on volatility and price targets
                signal_date = datetime.strptime(signal.get('buy_date') or datetime.now().strftime('%Y-%m-%d'), '%Y-%m-%d')
                
                # Calculate volatility from price history (simple method)
                # In a real implementation, you'd want to calculate this from actual historical data
                volatility_days = 10  # Default holding period
                
                # If we have a risk-reward ratio, use it to estimate target date
                if signal.get('risk_reward_ratio') and ':' in signal.get('risk_reward_ratio', ''):
                    try:
                        # Extract the reward part of the ratio (e.g., "1:2.5" -> 2.5)
                        reward_ratio = float(signal['risk_reward_ratio'].split(':')[1])
                        # Adjust volatility based on reward - higher rewards take longer
                        volatility_days = int(10 * reward_ratio)
                    except:
                        # Use default if calculation fails
                        volatility_days = 10
                
                # Set a future exit date based on volatility
                future_exit_date = (signal_date + timedelta(days=volatility_days)).strftime('%Y-%m-%d')
                
                # Calculate expected exit price
                price = signal.get('buy_price') or 0
                expected_profit = 0
                
                if signal['signal'] == 'BUY' and signal.get('sell_range'):
                    try:
                        # Extract the target sell price from the range
                        sell_range = signal['sell_range'].split('-')
                        target_price = float(sell_range[1].strip())
                        expected_profit = ((target_price - price) / price) * 100 if price > 0 else 0
                    except:
                        expected_profit = 10  # Default 10% profit target
                
                elif signal['signal'] == 'SELL' and signal.get('buy_range'):
                    try:
                        # Extract the target buy price from the range
                        buy_range = signal['buy_range'].split('-')
                        target_price = float(buy_range[0].strip())
                        expected_profit = ((price - target_price) / price) * 100 if price > 0 else 0
                    except:
                        expected_profit = 10  # Default 10% profit target
                
                # Ensure risk_reward_ratio is never None
                risk_reward = signal.get('risk_reward_ratio') or "1:1.5"
                
                values.append((
                    symbol,
                    signal.get('buy_date') or datetime.now().strftime('%Y-%m-%d'),
                    signal['signal'],
                    signal.get('buy_price'),
                    signal.get('buy_range'),
                    signal.get('sell_range'),
                    risk_reward,
                    signal.get('stop_loss'),
                    future_exit_date,             # Projected exit date
                    None,                         # Actual exit price (to be filled when trade completes)
                    volatility_days,              # Projected days held
                    expected_profit               # Projected profit/loss percentage
                ))
        
        if not values:
            logger.warning("No signals to store in history table")
            return
        
        # Insert signals into history table
        execute_values(
            cursor,
            """
            INSERT INTO ai_signal_history 
            (symbol, signal_date, signal_type, price, buy_range, sell_range, 
             risk_reward_ratio, stop_loss, actual_exit_date, actual_exit_price,
             days_held, actual_profit_loss)
            VALUES %s
            """,
            values
        )
        
        conn.commit()
        logger.info(f"Successfully stored {len(values)} signals in history table for tracking")
    except Exception as e:
        conn.rollback()
        logger.error(f"Error storing signals in history table: {e}")
    finally:
        cursor.close()

def cleanup_ai_signals(conn):
    """Clean up ai_signals table"""
    try:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM ai_signals")
        conn.commit()
        logger.info("Successfully cleaned up ai_signals table")
    except Exception as e:
        logger.error(f"Error cleaning up ai_signals table: {e}")
        raise
    finally:
        cursor.close()

def main():
    try:
        # Get database connection
        conn = get_db_connection()
        
        # Clean up existing AI signals
        # cleanup_ai_signals(conn)
        
        # Create the signal history table
        create_signal_history_table(conn)
        
        # Get all symbols
        symbols = get_all_symbols(conn)
        logger.info(f"Found {len(symbols)} symbols to process")
        
        # Process each symbol
        all_signals = {}
        for symbol in symbols:
            try:
                logger.info(f"Processing {symbol}...")
                
                # Get historical data
                df = get_historical_data(conn, symbol)
                if df is None or len(df) < 30:
                    logger.warning(f"Not enough historical data for {symbol}")
                    continue
                
                # Calculate technical indicators
                df_with_indicators = calculate_technical_indicators(df)
                if df_with_indicators is None:
                    logger.warning(f"Failed to calculate indicators for {symbol}")
                    continue
                
                # Get trading zones
                zones = get_trading_zones(conn, symbol)
                if not zones or (not zones.get('support') and not zones.get('resistance')):
                    logger.warning(f"No trading zones found for {symbol}")
                    # Continue anyway as we can still use technical indicators
                
                # Get trendline
                trendline = get_trendline(conn, symbol)
                
                # Analyze signals
                signal = analyze_signals(df_with_indicators, zones, trendline)
                if signal:
                    all_signals[symbol] = signal
                    logger.info(f"Generated signal for {symbol}: {signal['signal']}")
                    
            except Exception as e:
                logger.error(f"Error processing {symbol}: {e}")
                continue
        
        # Store signals
        if all_signals:
            store_ai_signals(conn, all_signals)
            store_in_signal_history(conn, all_signals)
            export_to_csv(all_signals)
            
            # Display summary
            print("\nAI SIGNAL GENERATION COMPLETE")
            print("=" * 60)
            print(f"Total Signals Generated: {len(all_signals)}")
            
            buy_count = sum(1 for s in all_signals.values() if s['signal'] == 'BUY')
            sell_count = sum(1 for s in all_signals.values() if s['signal'] == 'SELL')
            hold_count = sum(1 for s in all_signals.values() if s['signal'] == 'HOLD')
            
            print(f"BUY Signals: {buy_count}")
            print(f"SELL Signals: {sell_count}")
            print(f"HOLD Signals: {hold_count}")
            
            # Print top 5 BUY signals
            buy_signals = {s: info for s, info in all_signals.items() if info['signal'] == 'BUY'}
            if buy_signals:
                print("\nTOP BUY SIGNALS:")
                print("=" * 60)
                print(f"{'Symbol':<10}{'Price':<10}{'Buy Range':<20}{'Sell Range':<20}{'Risk/Reward':<15}{'Stop Loss':<10}")
                print("-" * 80)
                for i, (symbol, info) in enumerate(buy_signals.items(), 1):
                    if i > 5:
                        break
                    
                    # Handle potential None values
                    price = f"{info.get('buy_price', 0):.2f}" if info.get('buy_price') is not None else "N/A"
                    buy_range = info.get('buy_range', 'N/A') or 'N/A'
                    sell_range = info.get('sell_range', 'N/A') or 'N/A'
                    risk_reward = info.get('risk_reward_ratio', 'N/A') or 'N/A'
                    stop_loss = info.get('stop_loss', 'N/A') or 'N/A'
                    
                    print(f"{symbol:<10}{price:<10}{buy_range:<20}{sell_range:<20}{risk_reward:<15}{stop_loss:<10}")
            
            # Print top 5 SELL signals
            sell_signals = {s: info for s, info in all_signals.items() if info['signal'] == 'SELL'}
            if sell_signals:
                print("\nTOP SELL SIGNALS:")
                print("=" * 60)
                print(f"{'Symbol':<10}{'Price':<10}{'Sell Range':<20}")
                print("-" * 40)
                for i, (symbol, info) in enumerate(sell_signals.items(), 1):
                    if i > 5:
                        break
                    
                    # Handle potential None values
                    price = f"{info.get('buy_price', 0):.2f}" if info.get('buy_price') is not None else "N/A" 
                    sell_range = info.get('sell_range', 'N/A') or 'N/A'
                    
                    print(f"{symbol:<10}{price:<10}{sell_range:<20}")
            
        print("\nAnalysis complete! Check the database or CSV file for all signals.")
        
    except Exception as e:
        logger.error(f"Error in main execution: {e}")
        import traceback
        logger.error(traceback.format_exc())
    finally:
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    main() 
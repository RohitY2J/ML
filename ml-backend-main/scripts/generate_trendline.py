import pandas as pd
import numpy as np
from scipy.signal import argrelextrema
from datetime import datetime, timedelta
import psycopg2
from psycopg2.extras import execute_values
import logging
import os
import glob
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

def store_trendlines(conn, trendlines, symbol, timeframe_days):
    """Store trendlines in the database"""
    cursor = conn.cursor()
    
    try:
        # Delete existing trendlines for this symbol and timeframe
        cursor.execute("DELETE FROM trendlines WHERE symbol = %s AND timeframe_days = %s",
                      (symbol, timeframe_days))
        logger.info(f"Deleted existing trendlines for {symbol} with timeframe {timeframe_days}")
        
        if not trendlines:
            logger.warning(f"No trendlines to store for {symbol} with timeframe {timeframe_days}")
            return
        
        # Prepare data for insertion
        values = []
        for i, trendline in enumerate(trendlines, 1):
            values.append((
                symbol,
                timeframe_days,
                i,
                trendline['start_date'],
                trendline['end_date'],
                float(trendline['start_price']),
                float(trendline['end_price']),
                float(trendline['slope']),
                trendline['trend_type']
            ))
        
        logger.info(f"Prepared {len(values)} trendlines for insertion")
        
        # Insert new trendlines
        execute_values(
            cursor,
            """
            INSERT INTO trendlines 
            (symbol, timeframe_days, trendline_number, start_date, end_date, 
             start_price, end_price, slope, trend_type)
            VALUES %s
            ON CONFLICT (symbol, timeframe_days, trendline_number) 
            DO UPDATE SET 
                start_date = EXCLUDED.start_date,
                end_date = EXCLUDED.end_date,
                start_price = EXCLUDED.start_price,
                end_price = EXCLUDED.end_price,
                slope = EXCLUDED.slope,
                trend_type = EXCLUDED.trend_type
            """,
            values
        )
        
        conn.commit()
        logger.info(f"Successfully stored {len(values)} trendlines in database")
    except Exception as e:
        conn.rollback()
        logger.error(f"Error storing trendlines: {e}")
        raise
    finally:
        cursor.close()

def analyze_trendlines(df, days, title_suffix, symbol):
    """
    Analyze trendlines for a specific timeframe
    """
    try:
        # Filter data for specified timeframe
        start_date = df.index.max() - timedelta(days=days)
        timeframe_df = df[df.index >= start_date].copy()
        
        logger.info(f"Analyzing {len(timeframe_df)} data points for {title_suffix}")
        
        if len(timeframe_df) < 2:
            logger.warning(f"Not enough data points for {title_suffix} analysis")
            return None
        
        # Find local minima and maxima
        min_idx = argrelextrema(timeframe_df['low'].values, np.less, order=5)[0]
        max_idx = argrelextrema(timeframe_df['high'].values, np.greater, order=5)[0]
        
        logger.info(f"Found {len(min_idx)} minima and {len(max_idx)} maxima points")
        
        # Create points for trendline analysis
        points = []
        
        # Add minima points
        for idx in min_idx:
            points.append({
                'date': timeframe_df.index[idx],
                'price': timeframe_df['low'].iloc[idx],
                'type': 'min'
            })
        
        # Add maxima points
        for idx in max_idx:
            points.append({
                'date': timeframe_df.index[idx],
                'price': timeframe_df['high'].iloc[idx],
                'type': 'max'
            })
        
        # Sort points by date
        points.sort(key=lambda x: x['date'])
        
        # Find trendlines
        trendlines = []
        
        # Analyze uptrends
        for i in range(len(points)):
            if points[i]['type'] == 'min':
                for j in range(i + 1, len(points)):
                    if points[j]['type'] == 'min':
                        # Calculate slope
                        days_diff = (points[j]['date'] - points[i]['date']).days
                        if days_diff > 0:
                            slope = (points[j]['price'] - points[i]['price']) / days_diff
                            if slope > 0:  # Uptrend
                                trendlines.append({
                                    'start_date': points[i]['date'],
                                    'end_date': points[j]['date'],
                                    'start_price': points[i]['price'],
                                    'end_price': points[j]['price'],
                                    'slope': slope,
                                    'trend_type': 'uptrend'
                                })
        
        # Analyze downtrends
        for i in range(len(points)):
            if points[i]['type'] == 'max':
                for j in range(i + 1, len(points)):
                    if points[j]['type'] == 'max':
                        # Calculate slope
                        days_diff = (points[j]['date'] - points[i]['date']).days
                        if days_diff > 0:
                            slope = (points[j]['price'] - points[i]['price']) / days_diff
                            if slope < 0:  # Downtrend
                                trendlines.append({
                                    'start_date': points[i]['date'],
                                    'end_date': points[j]['date'],
                                    'start_price': points[i]['price'],
                                    'end_price': points[j]['price'],
                                    'slope': slope,
                                    'trend_type': 'downtrend'
                                })
        
        # Sort trendlines by slope magnitude
        trendlines.sort(key=lambda x: abs(x['slope']), reverse=True)
        
        logger.info(f"Found {len(trendlines)} trendlines")
        
        # Store trendlines in database
        conn = get_db_connection()
        try:
            store_trendlines(conn, trendlines, symbol, days)
            logger.info(f"Stored {len(trendlines)} trendlines in database")
        except Exception as e:
            logger.error(f"Error storing trendlines in database: {e}")
        finally:
            conn.close()
        
        # Print trendlines
        print(f"\nTrendlines ({title_suffix}):")
        print("-" * 50)
        for i, trendline in enumerate(trendlines, 1):
            print(f"Trendline {i}: {trendline['trend_type']}")
            print(f"  Start: {trendline['start_date']} at {trendline['start_price']:.2f}")
            print(f"  End: {trendline['end_date']} at {trendline['end_price']:.2f}")
            print(f"  Slope: {trendline['slope']:.4f}")
        
        return True
    except Exception as e:
        logger.error(f"Error in analyze_trendlines: {e}")
        return None

def process_file(file_path):
    """Process a single daily data file"""
    try:
        # Extract symbol from filename
        filename = os.path.basename(file_path)
        symbol = filename.split('_')[0]
        
        print(f"\nProcessing {symbol}...")
        
        # Load and process the data
        df = pd.read_csv(file_path)
        df['date'] = pd.to_datetime(df['date'])
        df.set_index('date', inplace=True)
        
        # Sort index properly to ensure chronological order
        df = df.sort_index()
        logger.info(f"Loaded {len(df)} data points for {symbol}")
        
        # Define timeframes
        timeframes = [
            (90, "3 Months"),
            (180, "6 Months"),
            (365, "1 Year"),
            (730, "2 Years")
        ]
        
        # Generate trendlines for each timeframe
        for days, title in timeframes:
            print(f"\nAnalyzing {title} timeframe...")
            result = analyze_trendlines(df, days, title, symbol)
            if result:
                print(f"Successfully analyzed trendlines for {title}")
            else:
                print(f"Failed to analyze trendlines for {title}")
                
    except Exception as e:
        logger.error(f"Error processing file {file_path}: {e}")

def cleanup_trendlines(conn):
    """Clean up trendlines table"""
    try:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM trendlines")
        conn.commit()
        logger.info("Successfully cleaned up trendlines table")
    except Exception as e:
        logger.error(f"Error cleaning up trendlines table: {e}")
        raise
    finally:
        cursor.close()

def main():
    # Get the absolute path to the backend directory
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    all_data_dir = os.path.join(base_dir, "all-data")
    
    # Get all CSV files in the all-data directory
    csv_files = glob.glob(os.path.join(all_data_dir, "*_daily_data_*.csv"))
    
    if not csv_files:
        print("No daily data files found in the all-data directory")
        return
    
    print(f"Found {len(csv_files)} daily data files to process")
    
    # Get database connection and clean up existing data
    conn = get_db_connection()
    try:
        cleanup_trendlines(conn)
        
        # Process each file
        for file_path in csv_files:
            process_file(file_path)
        
        print("\nAnalysis complete! Check the database for stored trendlines.")
    finally:
        conn.close()

if __name__ == "__main__":
    main()
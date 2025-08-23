import pandas as pd
import numpy as np
from scipy.signal import argrelextrema
from sklearn.cluster import DBSCAN
from datetime import datetime, timedelta
import psycopg2
from psycopg2.extras import execute_values
import os
import glob
import logging
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

def store_zones(conn, zones, symbol, timeframe_days, zone_type):
    """Store zones in the database"""
    table_name = f"{zone_type}_zones"
    cursor = conn.cursor()
    
    # Delete existing zones for this symbol and timeframe
    cursor.execute(f"DELETE FROM {table_name} WHERE symbol = %s AND timeframe_days = %s",
                  (symbol, timeframe_days))
    
    # Prepare data for insertion
    values = []
    for i, zone in enumerate(zones, 1):
        values.append((
            symbol,
            timeframe_days,
            i,
            float(zone['bottom']),
            float(zone['center']),
            float(zone['top'])
        ))
    
    # Insert new zones
    execute_values(
        cursor,
        f"""
        INSERT INTO {table_name} 
        (symbol, timeframe_days, zone_number, bottom_price, center_price, top_price)
        VALUES %s
        ON CONFLICT (symbol, timeframe_days, zone_number) 
        DO UPDATE SET 
            bottom_price = EXCLUDED.bottom_price,
            center_price = EXCLUDED.center_price,
            top_price = EXCLUDED.top_price
        """,
        values
    )
    
    conn.commit()
    cursor.close()

def analyze_zones(df, days, title_suffix, zone_type='resistance', symbol='NEPSE'):
    """
    Analyze either support or resistance zones for a specific timeframe
    """
    # Filter data for specified timeframe
    start_date = df.index.max() - timedelta(days=days)
    timeframe_df = df[df.index >= start_date].copy()
    
    if len(timeframe_df) < 2:
        print(f"Not enough data points for {title_suffix} analysis")
        return None
    
    # Get current price
    current_price = timeframe_df['close'].iloc[-1]
    
    # Use a smaller window for more sensitive detection
    window = max(3, min(15, days // 20))
    
    if zone_type == 'resistance':
        # Find resistance points
        points = timeframe_df[timeframe_df['high'] >= timeframe_df['high'].rolling(window=window).max() * 0.995].copy()
        price_column = 'high'
    else:
        # Find support points with stricter criteria
        # Only consider points within 20% of current price
        price_threshold = current_price * 0.8
        points = timeframe_df[
            (timeframe_df['low'] <= timeframe_df['low'].rolling(window=window).min() * 1.005) &
            (timeframe_df['low'] >= price_threshold)
        ].copy()
        price_column = 'low'
    
    if not points.empty:
        # Cluster points
        X = points[[price_column]].values
        eps_value = np.std(X) * 0.2
        db = DBSCAN(eps=eps_value, min_samples=2).fit(X)
        points['cluster'] = db.labels_
        
        # Calculate zones
        zones = []
        
        for cluster in set(points['cluster']):
            if cluster != -1:
                cluster_points = points[points['cluster'] == cluster][price_column]
                zone_center = cluster_points.mean()
                # For support zones, use smaller width
                if zone_type == 'support':
                    zone_width = np.std(cluster_points) * 0.8 if len(cluster_points) > 1 else zone_center * 0.005
                else:
                    zone_width = np.std(cluster_points) * 1.5 if len(cluster_points) > 1 else zone_center * 0.01
                
                # Calculate the price difference in the zone
                price_diff = zone_width * 2  # Total width of the zone
                
                # For support zones, only include if price difference is significant
                if zone_type == 'support':
                    # Minimum price difference of 0.5% of the zone center
                    min_price_diff = zone_center * 0.005
                    if price_diff < min_price_diff:
                        continue
                
                zones.append({
                    'bottom': zone_center - zone_width,
                    'center': zone_center,
                    'top': zone_center + zone_width,
                    'points': points[points['cluster'] == cluster]
                })
        
        # Sort zones by price level
        zones.sort(key=lambda x: x['center'])
        
        # For support zones, only keep zones within 20% of current price
        if zone_type == 'support':
            zones = [zone for zone in zones if zone['center'] >= price_threshold]
        
        # Store zones in database
        conn = get_db_connection()
        try:
            store_zones(conn, zones, symbol, days, zone_type)
            print(f"Stored {len(zones)} {zone_type} zones in database")
        except Exception as e:
            print(f"Error storing zones in database: {e}")
        finally:
            conn.close()
        
        # Print zones
        print(f"\n{zone_type.title()} Zones ({title_suffix}):")
        print("-" * 50)
        for i, zone in enumerate(zones, 1):
            price_diff = zone['top'] - zone['bottom']
            print(f"Zone {i}: {zone['bottom']:.2f} - {zone['top']:.2f} (Width: {price_diff:.2f})")
        
        return True
    else:
        print(f"No {zone_type} zones found for {title_suffix} timeframe")
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
        
        # Only use 90-day timeframe
        days = 90
        title = "3 Months"
        
        print(f"\nAnalyzing {title} timeframe...")
        
        # Generate resistance zones
        resistance_result = analyze_zones(df, days, title, 'resistance', symbol)
        if resistance_result:
            print(f"Successfully analyzed resistance zones for {title}")
        
        # Generate support zones
        support_result = analyze_zones(df, days, title, 'support', symbol)
        if support_result:
            print(f"Successfully analyzed support zones for {title}")
                
    except Exception as e:
        print(f"Error processing file {file_path}: {e}")

def cleanup_zones(conn):
    """Clean up support and resistance zones tables"""
    try:
        cursor = conn.cursor()
        # cursor.execute("DELETE FROM support_zones")
        # cursor.execute("DELETE FROM resistance_zones")
        # conn.commit()
        logger.info("Successfully cleaned up zones tables")
    except Exception as e:
        logger.error(f"Error cleaning up zones tables: {e}")
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
        cleanup_zones(conn)
        
        # Process each file
        for file_path in csv_files:
            process_file(file_path)
        
        print("\nAnalysis complete! Check the database for stored zones.")
    finally:
        conn.close()

if __name__ == "__main__":
    main()
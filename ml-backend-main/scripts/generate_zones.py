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
        # conn = psycopg2.connect(
        #     host=os.getenv('DB_HOST', 'localhost'),
        #     port=os.getenv('DB_PORT', '5433'),
        #     database=os.getenv('DB_NAME', 'merolagani_pg'),
        #     user=os.getenv('DB_USER', 'postgres'),
        #     password=os.getenv('DB_PASSWORD', 'postgres')
        # )

        conn = psycopg2.connect(
            host=os.getenv('DB_HOST', 'wft-dev-postgres.postgres.database.azure.com'),
            port=os.getenv('DB_PORT', '5432'),
            database=os.getenv('DB_NAME', 'merolagani_pg'),
            user=os.getenv('DB_USER', 'merolagani_user'),
            password=os.getenv('DB_PASSWORD', 'X58Y03xkH6x1')
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

def merge_overlapping_zones(zones, proximity_threshold=0.01):
    """Merge overlapping zones or zones that are very close to each other"""
    if not zones:
        return zones
    
    # Sort zones by center price
    zones = sorted(zones, key=lambda x: x['center'])
    
    # If more than 3 zones, merge closest zones until we have 3 or fewer
    while len(zones) > 3:
        # Find the pair of zones with the smallest distance between centers
        min_distance = float('inf')
        merge_idx = 0
        for i in range(len(zones) - 1):
            distance = abs(zones[i]['center'] - zones[i + 1]['center'])
            if distance < min_distance:
                min_distance = distance
                merge_idx = i
        
        # Merge the two closest zones
        current_zone = zones[merge_idx]
        next_zone = zones[merge_idx + 1]
        current_zone['bottom'] = min(current_zone['bottom'], next_zone['bottom'])
        current_zone['top'] = max(current_zone['top'], next_zone['top'])
        current_zone['center'] = (current_zone['bottom'] + current_zone['top']) / 2
        current_zone['points'] = pd.concat([current_zone['points'], next_zone['points']])
        zones[merge_idx] = current_zone
        zones.pop(merge_idx + 1)
    
    # Merge overlapping or close zones
    merged_zones = []
    current_zone = zones[0]
    
    for next_zone in zones[1:]:
        # Calculate proximity threshold based on the current price
        price_range = (current_zone['top'] - current_zone['bottom'])
        effective_threshold = max(proximity_threshold * current_zone['center'], price_range * 0.5)
        
        # Check if zones overlap or are closer than the threshold
        if current_zone['top'] >= next_zone['bottom'] - effective_threshold:
            # Merge zones
            current_zone['bottom'] = min(current_zone['bottom'], next_zone['bottom'])
            current_zone['top'] = max(current_zone['top'], next_zone['top'])
            current_zone['center'] = (current_zone['bottom'] + current_zone['top']) / 2
            current_zone['points'] = pd.concat([current_zone['points'], next_zone['points']])
        else:
            merged_zones.append(current_zone)
            current_zone = next_zone
    
    merged_zones.append(current_zone)
    return merged_zones

def analyze_zones(df, days, title_suffix, symbol='NEPSE'):
    """
    Analyze support and resistance zones for a specific timeframe with improved logic
    """
    # Filter data for specified timeframe
    start_date = df.index.max() - timedelta(days=days)
    timeframe_df = df[df.index >= start_date].copy()
    
    if len(timeframe_df) < 2:
        print(f"Not enough data points for {title_suffix} analysis")
        return None, None
    
    # Get current price
    current_price = timeframe_df['close'].iloc[-1]
    
    # Use a smaller window for more sensitive detection
    window = max(3, min(15, days // 20))
    
    # Initialize lists for support and resistance zones
    support_zones = []
    resistance_zones = []
    
    # Find resistance points
    resistance_points = timeframe_df[timeframe_df['high'] >= timeframe_df['high'].rolling(window=window).max() * 0.995].copy()
    # Find support points within 20% of current price
    price_threshold = current_price * 0.8
    support_points = timeframe_df[
        (timeframe_df['low'] <= timeframe_df['low'].rolling(window=window).min() * 1.005) &
        (timeframe_df['low'] >= price_threshold)
    ].copy()
    
    # Process resistance zones
    if not resistance_points.empty:
        X = resistance_points[['high']].values
        eps_value = np.std(X) * 0.2
        db = DBSCAN(eps=eps_value, min_samples=2).fit(X)
        resistance_points['cluster'] = db.labels_
        
        for cluster in set(resistance_points['cluster']):
            if cluster != -1:
                cluster_points = resistance_points[resistance_points['cluster'] == cluster]['high']
                zone_center = cluster_points.mean()
                zone_width = np.std(cluster_points) * 1.5 if len(cluster_points) > 1 else zone_center * 0.01
                resistance_zones.append({
                    'bottom': zone_center - zone_width,
                    'center': zone_center,
                    'top': zone_center + zone_width,
                    'points': resistance_points[resistance_points['cluster'] == cluster]
                })
    
    # Process support zones
    if not support_points.empty:
        X = support_points[['low']].values
        eps_value = np.std(X) * 0.2
        db = DBSCAN(eps=eps_value, min_samples=2).fit(X)
        support_points['cluster'] = db.labels_
        
        for cluster in set(support_points['cluster']):
            if cluster != -1:
                cluster_points = support_points[support_points['cluster'] == cluster]['low']
                zone_center = cluster_points.mean()
                zone_width = np.std(cluster_points) * 0.8 if len(cluster_points) > 1 else zone_center * 0.005
                price_diff = zone_width * 2
                min_price_diff = zone_center * 0.005
                if price_diff >= min_price_diff:
                    support_zones.append({
                        'bottom': zone_center - zone_width,
                        'center': zone_center,
                        'top': zone_center + zone_width,
                        'points': support_points[support_points['cluster'] == cluster]
                    })
    
    # Convert zones based on close price
    final_support_zones = []
    final_resistance_zones = []
    
    # Process resistance zones
    for zone in resistance_zones:
        if zone['top'] < current_price:
            # Convert resistance zone below close price to support zone
            final_support_zones.append(zone)
        elif zone['bottom'] <= current_price <= zone['top']:
            # Close price is within the zone, treat as resistance
            final_resistance_zones.append(zone)
        elif zone['bottom'] > current_price:
            # Resistance zone above close price
            final_resistance_zones.append(zone)
    
    # Process support zones
    for zone in support_zones:
        if zone['bottom'] > current_price:
            # Convert support zone above close price to resistance zone
            final_resistance_zones.append(zone)
        elif zone['bottom'] <= current_price <= zone['top']:
            # Close price is within the zone, treat as support
            final_support_zones.append(zone)
        elif zone['top'] <= current_price:
            # Support zone below or at close price
            final_support_zones.append(zone)
    
    final_support_zones = merge_overlapping_zones(final_support_zones, proximity_threshold=0.008)
    final_resistance_zones = merge_overlapping_zones(final_resistance_zones, proximity_threshold=0.008)
    
    # Ensure no overlap between support and resistance zones
    non_overlapping_support_zones = []
    non_overlapping_resistance_zones = []
    
    for s_zone in final_support_zones:
        overlap = False
        for r_zone in final_resistance_zones:
            if not (s_zone['top'] < r_zone['bottom'] or s_zone['bottom'] > r_zone['top']):
                overlap = True
                # If overlap occurs, prioritize based on proximity to current price
                s_dist = abs(s_zone['center'] - current_price)
                r_dist = abs(r_zone['center'] - current_price)
                if s_dist < r_dist:
                    non_overlapping_support_zones.append(s_zone)
                else:
                    non_overlapping_resistance_zones.append(r_zone)
        if not overlap:
            non_overlapping_support_zones.append(s_zone)
    
    for r_zone in final_resistance_zones:
        if all(r_zone['bottom'] > s_zone['top'] or r_zone['top'] < s_zone['bottom'] for s_zone in final_support_zones):
            non_overlapping_resistance_zones.append(r_zone)
    
    # Store zones in database
    conn = get_db_connection()
    try:
        store_zones(conn, non_overlapping_support_zones, symbol, days, 'support')
        store_zones(conn, non_overlapping_resistance_zones, symbol, days, 'resistance')
        print(f"Stored {len(non_overlapping_support_zones)} support zones and {len(non_overlapping_resistance_zones)} resistance zones in database")
    except Exception as e:
        print(f"Error storing zones in database: {e}")
    finally:
        conn.close()
    
    # Print zones
    print(f"\nSupport Zones ({title_suffix}):")
    print("-" * 50)
    for i, zone in enumerate(non_overlapping_support_zones, 1):
        price_diff = zone['top'] - zone['bottom']
        print(f"Zone {i}: {zone['bottom']:.2f} - {zone['top']:.2f} (Width: {price_diff:.2f})")
    
    print(f"\nResistance Zones ({title_suffix}):")
    print("-" * 50)
    for i, zone in enumerate(non_overlapping_resistance_zones, 1):
        price_diff = zone['top'] - zone['bottom']
        print(f"Zone {i}: {zone['bottom']:.2f} - {zone['top']:.2f} (Width: {price_diff:.2f})")
    
    return non_overlapping_support_zones, non_overlapping_resistance_zones

def cleanup_zones(conn):
    """Clean up support and resistance zones tables"""
    try:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM support_zones")
        cursor.execute("DELETE FROM resistance_zones")
        conn.commit()
        logger.info("Successfully cleaned up zones tables")
    except Exception as e:
        logger.error(f"Error cleaning up zones tables: {e}")
        raise
    finally:
        cursor.close()

def main():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    data_dir = os.path.join(base_dir, "data")
    
    data_file = os.path.join(data_dir, "daily_data_202507172305.csv")
    
    if not os.path.exists(data_file):
        logger.error("No data file found in the data directory")
        return
    
    logger.info("Found data file to process")
    
    # Read the single data file
    df = pd.read_csv(data_file)
    df['date'] = pd.to_datetime(df['date'])
    
    # Get unique symbols and sort them alphabetically
    symbols = sorted(df['symbol'].unique())
    logger.info(f"Found {len(symbols)} unique symbols to process")
    
    #symbols = ['NEPSE','GLICL']
    conn = get_db_connection()
    try:
        cleanup_zones(conn)
        for symbol in symbols:
            # Filter data for current symbol
            symbol_df = df[df['symbol'] == symbol].copy()
            symbol_df.set_index('date', inplace=True)
            symbol_df = symbol_df.sort_index()
            
            # Validate required columns
            required_columns = ['open', 'high', 'low', 'close', 'volume']
            if not all(col in symbol_df.columns for col in required_columns):
                logger.error(f"Missing required columns for {symbol}: {required_columns}")
                continue
                
            process_symbol(symbol_df, symbol)
        logger.info("Analysis complete! Check the database for stored zones.")
    finally:
        conn.close()

def process_symbol(df, symbol):
    """Process data for a single symbol"""
    try:
        logger.info(f"Processing {symbol}...")
        
        days = 90
        title = "3 Months"
        
        logger.info(f"Analyzing {title} timeframe...")

        support_zones, resistance_zones = analyze_zones(df, days, title, symbol)
        if support_zones is not None or resistance_zones is not None:
            print(f"Successfully analyzed zones for {title}")
                
    except Exception as e:
        logger.error(f"Error processing symbol {symbol}: {e}")


if __name__ == "__main__":
    main()
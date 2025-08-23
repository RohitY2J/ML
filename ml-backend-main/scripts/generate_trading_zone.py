import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import psycopg2
from psycopg2.extras import execute_values
import logging
import os
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

def get_all_symbols(conn):
    """Get all symbols from the symbols table"""
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT symbol FROM symbols")
        symbols = [row[0] for row in cursor.fetchall()]
        logger.info(f"Found {len(symbols)} symbols in database")
        return symbols
    except Exception as e:
        logger.error(f"Error fetching symbols: {e}")
        raise
    finally:
        cursor.close()

def get_support_resistance_zones(conn, symbol, timeframe_days):
    """Get support and resistance zones from database"""
    cursor = conn.cursor()
    
    try:
        # Get support zones
        support_query = """
            SELECT zone_number, bottom_price, center_price, top_price
            FROM support_zones
            WHERE symbol = %s AND timeframe_days = %s
            ORDER BY center_price DESC
        """
        cursor.execute(support_query, (symbol, timeframe_days))
        support_zones = cursor.fetchall()
        
        # Get resistance zones
        resistance_query = """
            SELECT zone_number, bottom_price, center_price, top_price
            FROM resistance_zones
            WHERE symbol = %s AND timeframe_days = %s
            ORDER BY center_price ASC
        """
        cursor.execute(resistance_query, (symbol, timeframe_days))
        resistance_zones = cursor.fetchall()
        
        return support_zones, resistance_zones
    except Exception as e:
        logger.error(f"Error fetching zones: {e}")
        raise
    finally:
        cursor.close()

def calculate_trading_zones(support_zones, resistance_zones, current_price):
    """
    Calculate Immediate Demand Zone, Immediate Supply Zone, and Stop Loss Zone
    based on support and resistance zones and current price
    """
    # Find the closest support zone below current price
    immediate_demand_zone = None
    for zone in support_zones:
        if zone[2] < current_price:  # center_price < current_price
            immediate_demand_zone = {
                'bottom': zone[1],
                'center': zone[2],
                'top': zone[3]
            }
            break
    
    # Find the closest resistance zone above current price
    immediate_supply_zone = None
    for zone in resistance_zones:
        if zone[2] > current_price:  # center_price > current_price
            immediate_supply_zone = {
                'bottom': zone[1],
                'center': zone[2],
                'top': zone[3]
            }
            break
    
    # Calculate Stop Loss Zone
    stop_loss_zone = None
    if immediate_demand_zone:
        # Find the next support zone below the immediate demand zone
        for zone in support_zones:
            if zone[2] < immediate_demand_zone['bottom']:
                stop_loss_zone = {
                    'bottom': zone[1],
                    'center': zone[2],
                    'top': zone[3]
                }
                break
    
    return {
        'immediate_demand_zone': immediate_demand_zone,
        'immediate_supply_zone': immediate_supply_zone,
        'stop_loss_zone': stop_loss_zone
    }

def store_trading_zones(conn, zones, symbol, timeframe_days):
    """Store trading zones in the database"""
    cursor = conn.cursor()
    
    try:
        # Delete existing trading zones
        cursor.execute("DELETE FROM trading_zones WHERE symbol = %s AND timeframe_days = %s",
                      (symbol, timeframe_days))
        
        # Prepare data for insertion
        values = []
        for zone_type, zone in zones.items():
            if zone:
                values.append((
                    symbol,
                    timeframe_days,
                    zone_type,
                    zone['bottom'],
                    zone['center'],
                    zone['top']
                ))
        
        # Insert new trading zones
        execute_values(
            cursor,
            """
            INSERT INTO trading_zones 
            (symbol, timeframe_days, zone_type, bottom_price, center_price, top_price)
            VALUES %s
            ON CONFLICT (symbol, timeframe_days, zone_type) 
            DO UPDATE SET 
                bottom_price = EXCLUDED.bottom_price,
                center_price = EXCLUDED.center_price,
                top_price = EXCLUDED.top_price
            """,
            values
        )
        
        conn.commit()
        logger.info(f"Successfully stored {len(values)} trading zones in database")
    except Exception as e:
        conn.rollback()
        logger.error(f"Error storing trading zones: {e}")
        raise
    finally:
        cursor.close()

def analyze_trading_zones(symbol, timeframe_days):
    """
    Analyze and calculate trading zones for a symbol and timeframe
    """
    conn = None
    try:
        # Get current price from daily data
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Get the latest price
        cursor.execute("""
            SELECT close FROM daily_data 
            WHERE symbol = %s 
            ORDER BY date DESC LIMIT 1
        """, (symbol,))
        result = cursor.fetchone()
        
        if not result:
            logger.warning(f"No price data found for symbol {symbol}")
            return None
            
        current_price = result[0]
        
        # Get support and resistance zones
        support_zones, resistance_zones = get_support_resistance_zones(conn, symbol, timeframe_days)
        
        if not support_zones or not resistance_zones:
            logger.warning(f"No support/resistance zones found for symbol {symbol}")
            return None
        
        # Calculate trading zones
        trading_zones = calculate_trading_zones(support_zones, resistance_zones, current_price)
        
        # Store trading zones
        store_trading_zones(conn, trading_zones, symbol, timeframe_days)
        
        # Print results
        print(f"\nTrading Zones Analysis for {symbol} ({timeframe_days} days):")
        print("-" * 50)
        print(f"Current Price: {current_price:.2f}")
        
        if trading_zones['immediate_demand_zone']:
            print("\nImmediate Demand Zone:")
            print(f"Bottom: {trading_zones['immediate_demand_zone']['bottom']:.2f}")
            print(f"Center: {trading_zones['immediate_demand_zone']['center']:.2f}")
            print(f"Top: {trading_zones['immediate_demand_zone']['top']:.2f}")
        
        if trading_zones['immediate_supply_zone']:
            print("\nImmediate Supply Zone:")
            print(f"Bottom: {trading_zones['immediate_supply_zone']['bottom']:.2f}")
            print(f"Center: {trading_zones['immediate_supply_zone']['center']:.2f}")
            print(f"Top: {trading_zones['immediate_supply_zone']['top']:.2f}")
        
        if trading_zones['stop_loss_zone']:
            print("\nStop Loss Zone:")
            print(f"Bottom: {trading_zones['stop_loss_zone']['bottom']:.2f}")
            print(f"Center: {trading_zones['stop_loss_zone']['center']:.2f}")
            print(f"Top: {trading_zones['stop_loss_zone']['top']:.2f}")
        
        return trading_zones
    except Exception as e:
        logger.error(f"Error in analyze_trading_zones for {symbol}: {e}")
        return None
    finally:
        if conn:
            conn.close()

def cleanup_trading_zones(conn):
    """Clean up trading zones table"""
    try:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM trading_zones")
        conn.commit()
        logger.info("Successfully cleaned up trading zones table")
    except Exception as e:
        logger.error(f"Error cleaning up trading zones table: {e}")
        raise
    finally:
        cursor.close()

def main():
    # Get database connection
    conn = get_db_connection()
    try:
        # Clean up existing trading zones
        cleanup_trading_zones(conn)
        
        # Get all symbols
        symbols = get_all_symbols(conn)
        logger.info(f"Found {len(symbols)} symbols to process")
        
        # Process each symbol
        for symbol in symbols:
            try:
                logger.info(f"Processing {symbol}...")
                analyze_trading_zones(symbol, 90)  # Using 90-day timeframe
            except Exception as e:
                logger.error(f"Error processing {symbol}: {e}")
                continue
        
        print("\nAnalysis complete! Check the database for stored trading zones.")
    finally:
        conn.close()

if __name__ == "__main__":
    main() 
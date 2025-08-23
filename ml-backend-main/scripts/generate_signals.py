import pandas as pd
import numpy as np
from datetime import datetime
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

def get_latest_price_and_change(conn, symbol):
    """Get the latest price and change percentage for a symbol"""
    cursor = conn.cursor()
    try:
        cursor.execute("""
            WITH latest_data AS (
                SELECT close, date 
                FROM daily_data 
                WHERE symbol = %s 
                ORDER BY date DESC LIMIT 1
            ),
            previous_data AS (
                SELECT close
                FROM daily_data 
                WHERE symbol = %s 
                ORDER BY date DESC LIMIT 1 OFFSET 1
            )
            SELECT 
                l.close as current_price,
                l.date,
                ((l.close - p.close) / p.close * 100) as change_percent
            FROM latest_data l
            CROSS JOIN previous_data p
        """, (symbol, symbol))
        result = cursor.fetchone()
        if result:
            return {
                'price': result[0],
                'date': result[1],
                'change': result[2]
            }
        return None
    finally:
        cursor.close()

def get_trading_zones(conn, symbol, timeframe_days=90):
    """Get trading zones for a symbol"""
    cursor = conn.cursor()
    try:
        cursor.execute("""
            SELECT zone_type, bottom_price, center_price, top_price
            FROM trading_zones
            WHERE symbol = %s AND timeframe_days = %s
        """, (symbol, timeframe_days))
        zones = cursor.fetchall()
        
        # Convert to dictionary
        zone_dict = {}
        for zone in zones:
            zone_dict[zone[0]] = {
                'bottom': zone[1],
                'center': zone[2],
                'top': zone[3]
            }
        return zone_dict
    finally:
        cursor.close()

def get_trendline(conn, symbol, timeframe_days=90):
    """Get the most recent trendline for a symbol"""
    cursor = conn.cursor()
    try:
        cursor.execute("""
            SELECT trend_type, slope
            FROM trendlines
            WHERE symbol = %s AND timeframe_days = %s
            ORDER BY end_date DESC
            LIMIT 1
        """, (symbol, timeframe_days))
        return cursor.fetchone()
    finally:
        cursor.close()

def calculate_signals(price_data, zones, trendline):
    """Calculate trading signals based on price, zones, and trendline"""
    if not price_data or not zones:
        logger.warning(f"No price data or zones available for {price_data.get('symbol', 'unknown')}")
        return None
        
    current_price = price_data['price']
    symbol = price_data['symbol']
    
    logger.info(f"Calculating signals for {symbol} at price {current_price}")
    logger.info(f"Available zones: {zones}")
    if trendline:
        logger.info(f"Trendline: {trendline}")
    
    signal = {
        'symbol': symbol,
        'ltp': current_price,
        'signal': 'HOLD',
        'buy_target': None,
        'sell_target': None,
        'stop_loss': None,
        'change': price_data.get('change', 0)
    }
    
    # Get immediate demand and supply zones
    demand_zone = zones.get('immediate_demand_zone')
    supply_zone = zones.get('immediate_supply_zone')
    stop_loss_zone = zones.get('stop_loss_zone')
    
    # Calculate signal based on price position relative to zones
    if demand_zone:
        # Calculate percentage distance from demand zone
        demand_center = demand_zone['center']
        price_to_demand_ratio = (current_price - demand_center) / demand_center * 100
        
        # If price is within 2% of demand zone center, it's a BUY signal
        if abs(price_to_demand_ratio) <= 2:
            signal['signal'] = 'BUY'
            signal['buy_target'] = demand_zone['bottom']
            signal['sell_target'] = supply_zone['top'] if supply_zone else None
            signal['stop_loss'] = stop_loss_zone['bottom'] if stop_loss_zone else None
            logger.info(f"BUY signal generated for {symbol} at {current_price} (within 2% of demand zone center: {demand_center})")
    
    if supply_zone:
        # Calculate percentage distance from supply zone
        supply_center = supply_zone['center']
        price_to_supply_ratio = (current_price - supply_center) / supply_center * 100
        
        # If price is within 2% of supply zone center, it's a SELL signal
        if abs(price_to_supply_ratio) <= 2 and signal['signal'] != 'BUY':
            signal['signal'] = 'SELL'
            signal['sell_target'] = supply_zone['top']
            signal['stop_loss'] = demand_zone['top'] if demand_zone else None
            logger.info(f"SELL signal generated for {symbol} at {current_price} (within 2% of supply zone center: {supply_center})")
    
    # Adjust signal based on trendline
    if trendline:
        trend_type, slope = trendline
        if trend_type == 'uptrend' and slope > 0:
            # Only change to BUY if we don't already have a SELL signal
            if signal['signal'] == 'HOLD':
                signal['signal'] = 'BUY'
                logger.info(f"BUY signal generated for {symbol} based on uptrend")
        elif trend_type == 'downtrend' and slope < 0:
            # Only change to SELL if we don't already have a BUY signal
            if signal['signal'] == 'HOLD':
                signal['signal'] = 'SELL'
                logger.info(f"SELL signal generated for {symbol} based on downtrend")
    
    logger.info(f"Final signal for {symbol}: {signal}")
    return signal

def store_signals(conn, signals):
    """Store trading signals in the database"""
    cursor = conn.cursor()
    try:
        # Delete existing signals
        cursor.execute("DELETE FROM trading_signals")
        
        # Prepare data for insertion
        values = []
        for signal in signals:
            if signal:
                values.append((
                    signal['symbol'],
                    signal['ltp'],
                    signal['signal'],
                    signal['buy_target'],
                    signal['sell_target'],
                    signal['stop_loss'],
                    signal['change']
                ))
                logger.info(f"Preparing to store signal for {signal['symbol']}: {signal}")
        
        if not values:
            logger.warning("No signals to store in database")
            return
        
        # Insert new signals
        execute_values(
            cursor,
            """
            INSERT INTO trading_signals 
            (symbol, ltp, signal, buy_target, sell_target, stop_loss, change_percent)
            VALUES %s
            """,
            values
        )
        
        conn.commit()
        logger.info(f"Successfully stored {len(values)} trading signals")
        
        # Verify the stored data
        cursor.execute("SELECT * FROM trading_signals")
        stored_signals = cursor.fetchall()
        logger.info(f"Stored signals in database: {stored_signals}")
        
    except Exception as e:
        conn.rollback()
        logger.error(f"Error storing signals: {e}")
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

def cleanup_signals(conn):
    """Clean up signals table"""
    try:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM trading_signals")
        conn.commit()
        logger.info("Successfully cleaned up signals table")
    except Exception as e:
        logger.error(f"Error cleaning up signals table: {e}")
        raise
    finally:
        cursor.close()

def main():
    try:
        # Get database connection
        conn = get_db_connection()
        
        # Clean up existing signals
        cleanup_signals(conn)
        
        # Get all symbols
        symbols = get_all_symbols(conn)
        logger.info(f"Found {len(symbols)} symbols to process")
        
        # Process each symbol
        signals = []
        for symbol in symbols:
            try:
                # Get latest price and change
                price_data = get_latest_price_and_change(conn, symbol)
                if not price_data:
                    logger.warning(f"No price data found for {symbol}")
                    continue
                    
                price_data['symbol'] = symbol
                
                # Get trading zones
                zones = get_trading_zones(conn, symbol)
                if not zones:
                    logger.warning(f"No trading zones found for {symbol}")
                    continue
                
                # Get trendline
                trendline = get_trendline(conn, symbol)
                
                # Calculate signals
                signal = calculate_signals(price_data, zones, trendline)
                if signal:
                    signals.append(signal)
                    logger.info(f"Generated signal for {symbol}: {signal['signal']}")
                    
            except Exception as e:
                logger.error(f"Error processing {symbol}: {e}")
                continue
        
        # Store signals
        if signals:
            store_signals(conn, signals)
            
            # Print signals in the requested format
            print("\nCURRENT STRATEGY")
            print("BUY AT SUPPORT (BUY)")
            print("Buy Target (S1)")
            print("278-288")
            print("Sell Target(T1)")
            print("308-318")
            print("Stop Loss If Closing Below")
            print("278")
            print("\nBUY")
            print("SELL")
            print("HOLD")
            print("S.N\tStock\tLTP\tChange")
            
            # Sort signals by signal type (BUY, SELL, HOLD) and then by symbol
            sorted_signals = sorted(signals, key=lambda x: (x['signal'], x['symbol']))
            
            for i, signal in enumerate(sorted_signals, 1):
                print(f"{i}\t{signal['symbol']}\t{signal['ltp']:.2f}\t{signal['change']:.2f}%")
        
        print("\nAnalysis complete! Check the database for stored signals.")
        
    except Exception as e:
        logger.error(f"Error in main execution: {e}")
    finally:
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    main() 
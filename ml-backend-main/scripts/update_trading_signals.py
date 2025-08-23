import psycopg2
from psycopg2.extras import execute_values
import logging
from datetime import datetime
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def get_db_connection():
    """Get database connection."""
    return psycopg2.connect(
        host=os.getenv('DB_HOST', 'host.docker.internal'),
        port=os.getenv('DB_PORT', '5433'),
        database=os.getenv('DB_NAME', 'stock_market'),
        user=os.getenv('DB_USER', 'postgres'),
        password=os.getenv('DB_PASSWORD', 'postgres')
    )

def update_trading_signals():
    """Update trading_signals table with latest data from signal_history_analytics."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Clear existing data from trading_signals
        cursor.execute("DELETE FROM trading_signals")
        logger.info("Cleared existing trading signals")
        
        # Insert latest signals
        cursor.execute("""
            WITH latest_signals AS (
                SELECT 
                    symbol,
                    MAX(date) as latest_date
                FROM signal_history_analytics
                GROUP BY symbol
            ),
            previous_day AS (
                SELECT 
                    sha.symbol,
                    sha.close as prev_close
                FROM signal_history_analytics sha
                INNER JOIN latest_signals ls 
                    ON sha.symbol = ls.symbol 
                    AND sha.date < ls.latest_date
                WHERE sha.date = (
                    SELECT MAX(date) 
                    FROM signal_history_analytics 
                    WHERE symbol = sha.symbol 
                    AND date < ls.latest_date
                )
            )
            INSERT INTO trading_signals (
                symbol, ltp, signal, buy_target, sell_target, 
                stop_loss, change_percent, created_at
            )
            SELECT 
                sha.symbol,
                sha.close as ltp,
                CASE 
                    WHEN sha.signal = 1 THEN 'BUY'
                    WHEN sha.signal = -1 THEN 'SELL'
                    ELSE 'HOLD'
                END as signal,
                sha.bb_low as buy_target,
                sha.bb_high as sell_target,
                sha.bb_low * 0.98 as stop_loss,
                CASE 
                    WHEN pd.prev_close IS NOT NULL 
                    THEN ((sha.close - pd.prev_close) / pd.prev_close * 100)
                    ELSE 0
                END as change_percent,
                sha.created_at
            FROM signal_history_analytics sha
            INNER JOIN latest_signals ls 
                ON sha.symbol = ls.symbol 
                AND sha.date = ls.latest_date
            LEFT JOIN previous_day pd 
                ON sha.symbol = pd.symbol
            ORDER BY sha.created_at DESC, sha.symbol
        """)
        
        # Get count of inserted records
        cursor.execute("SELECT COUNT(*) FROM trading_signals")
        count = cursor.fetchone()[0]
        
        # Get signal distribution
        cursor.execute("""
            SELECT signal, COUNT(*) 
            FROM trading_signals 
            GROUP BY signal
        """)
        signal_dist = cursor.fetchall()
        
        conn.commit()
        
        # Print summary
        logger.info(f"Successfully inserted {count} trading signals")
        logger.info("\nSignal Distribution:")
        for signal, count in signal_dist:
            logger.info(f"{signal}: {count}")
            
    except Exception as e:
        conn.rollback()
        logger.error(f"Error updating trading signals: {str(e)}")
        raise
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    logger.info(f"Starting trading signals update at {datetime.now()}")
    update_trading_signals()
    logger.info(f"Completed trading signals update at {datetime.now()}") 
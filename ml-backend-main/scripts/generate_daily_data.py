import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import psycopg2
from psycopg2.extras import execute_values
import logging
import os
from dotenv import load_dotenv
import re

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

class DailyDataGenerator:
    def __init__(self):
        # Get the absolute path to the backend directory
        self.base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        self.input_file = os.path.join(self.base_dir, "data", "daily_data_202507172305.csv")
        self.output_dir = os.path.join(self.base_dir, "all-data")
        
    def _sanitize_filename(self, symbol: str) -> str:
        """Replace invalid filename characters with underscores"""
        # Replace any character that's not alphanumeric or underscore with underscore
        return re.sub(r'[^a-zA-Z0-9_]', '_', symbol)
        
    def generate_data(self):
        """Generate individual CSV files for each symbol from the main daily data file"""
        print(f"Reading data from {self.input_file}...")
        
        # Read the main CSV file
        df = pd.read_csv(self.input_file)
        
        # Create output directory if it doesn't exist
        if not os.path.exists(self.output_dir):
            os.makedirs(self.output_dir)
        
        # Get unique symbols
        symbols = df['symbol'].unique()
        
        # Generate timestamp once for all files
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        
        # Split data by symbol and save to individual files
        for symbol in symbols:
            print(f"Processing {symbol}...")
            symbol_data = df[df['symbol'] == symbol].copy()
            
            if not symbol_data.empty:
                # Sanitize the symbol name for the filename
                safe_symbol = self._sanitize_filename(symbol)
                filename = f"{safe_symbol}_daily_data_{timestamp}.csv"
                filepath = os.path.join(self.output_dir, filename)
                symbol_data.to_csv(filepath, index=False)
                print(f"Saved data for {symbol} to {filepath}")

if __name__ == "__main__":
    generator = DailyDataGenerator()
    generator.generate_data() 
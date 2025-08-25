import pandas as pd
import numpy as np
from scipy.signal import argrelextrema
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
            host=os.getenv('DB_HOST', 'postgres'),
            port=os.getenv('DB_PORT', '5432'),
            database=os.getenv('DB_NAME', 'merolagani_pg'),
            user=os.getenv('DB_USER', 'postgres'),
            password=os.getenv('DB_PASSWORD', 'password')
        )
        logger.info("Successfully connected to database")
        return conn
    except Exception as e:
        logger.error(f"Error connecting to database: {e}")
        raise

def find_trend_channel(df, timeframe_days):
    """Find a trend channel with upper and lower parallel lines"""
    if len(df) < 20:
        return None
    
    # Find pivot points for highs and lows
    pivot_highs = argrelextrema(df['high'].values, np.greater, order=5)[0]
    pivot_lows = argrelextrema(df['low'].values, np.less, order=5)[0]
    
    if len(pivot_highs) < 2 or len(pivot_lows) < 2:
        return None
    
    # Get pivot data
    high_prices = df.iloc[pivot_highs]['high'].values
    high_dates = df.iloc[pivot_highs].index
    low_prices = df.iloc[pivot_lows]['low'].values
    low_dates = df.iloc[pivot_lows].index
    
    # Find the best channel by trying different combinations
    best_channel = None
    best_r_squared = 0
    
    # Try combinations of high points for upper line
    for i in range(len(high_prices)):
        for j in range(i + 1, len(high_prices)):
            # Calculate upper line
            days_diff_upper = (high_dates[j] - high_dates[i]).days
            if days_diff_upper < 15:
                continue
            
            price_diff_upper = high_prices[j] - high_prices[i]
            slope_upper = price_diff_upper / days_diff_upper
            
            # Try combinations of low points for lower line
            for k in range(len(low_prices)):
                for l in range(k + 1, len(low_prices)):
                    # Calculate lower line
                    days_diff_lower = (low_dates[l] - low_dates[k]).days
                    if days_diff_lower < 15:
                        continue
                    
                    price_diff_lower = low_prices[l] - low_prices[k]
                    slope_lower = price_diff_lower / days_diff_lower
                    
                    # Check if slopes are similar (parallel lines)
                    slope_diff = abs(slope_upper - slope_lower)
                    if slope_diff > 0.1:  # Slopes should be similar for parallel lines
                        continue
                    
                    # Calculate channel width
                    avg_slope = (slope_upper + slope_lower) / 2
                    channel_width = calculate_channel_width(df, high_dates[i], high_dates[j], 
                                                          low_dates[k], low_dates[l], 
                                                          high_prices[i], high_prices[j],
                                                          low_prices[k], low_prices[l], avg_slope)
                    
                    # Calculate R-squared for the channel
                    r_squared = calculate_channel_r_squared(df, high_dates[i], high_dates[j], 
                                                          low_dates[k], low_dates[l], 
                                                          high_prices[i], high_prices[j],
                                                          low_prices[k], low_prices[l], avg_slope)
                    
                    # Check if this is a better channel
                    if r_squared > best_r_squared and r_squared > 0.2 and channel_width > 0:
                        best_r_squared = r_squared
                        best_channel = {
                            'upper_start_date': high_dates[i],
                            'upper_end_date': high_dates[j],
                            'upper_start_price': high_prices[i],
                            'upper_end_price': high_prices[j],
                            'lower_start_date': low_dates[k],
                            'lower_end_date': low_dates[l],
                            'lower_start_price': low_prices[k],
                            'lower_end_price': low_prices[l],
                            'slope': avg_slope,
                            'channel_width': channel_width,
                            'r_squared': r_squared,
                            'timeframe_days': timeframe_days
                        }
    
    return best_channel

def calculate_channel_width(df, upper_start, upper_end, lower_start, lower_end, 
                           upper_start_price, upper_end_price, lower_start_price, lower_end_price, slope):
    """Calculate the average width of the trend channel"""
    # Get the period where both lines exist
    start_date = max(upper_start, lower_start)
    end_date = min(upper_end, lower_end)
    
    if start_date >= end_date:
        return 0
    
    # Calculate expected prices at start and end
    days_from_upper_start = (start_date - upper_start).days
    days_from_lower_start = (start_date - lower_start).days
    
    upper_start_expected = upper_start_price + (slope * days_from_upper_start)
    lower_start_expected = lower_start_price + (slope * days_from_lower_start)
    
    days_from_upper_end = (end_date - upper_start).days
    days_from_lower_end = (end_date - lower_start).days
    
    upper_end_expected = upper_start_price + (slope * days_from_upper_end)
    lower_end_expected = lower_start_price + (slope * days_from_lower_end)
    
    # Calculate width at start and end
    width_start = upper_start_expected - lower_start_expected
    width_end = upper_end_expected - lower_end_expected
    
    return (width_start + width_end) / 2

def calculate_channel_r_squared(df, upper_start, upper_end, lower_start, lower_end, 
                               upper_start_price, upper_end_price, lower_start_price, lower_end_price, slope):
    """Calculate R-squared value for the trend channel"""
    # Get the period where both lines exist
    start_date = max(upper_start, lower_start)
    end_date = min(upper_end, lower_end)
    
    if start_date >= end_date:
        return 0
    
    # Get data points within the channel period
    mask = (df.index >= start_date) & (df.index <= end_date)
    period_data = df[mask]
    
    if len(period_data) < 5:
        return 0
    
    # Calculate expected prices along both lines
    expected_upper_prices = []
    expected_lower_prices = []
    actual_prices = []
    
    for date in period_data.index:
        days_from_upper_start = (date - upper_start).days
        days_from_lower_start = (date - lower_start).days
        
        expected_upper = upper_start_price + (slope * days_from_upper_start)
        expected_lower = lower_start_price + (slope * days_from_lower_start)
        
        expected_upper_prices.append(expected_upper)
        expected_lower_prices.append(expected_lower)
        actual_prices.append(period_data.loc[date, 'close'])
    
    # Calculate how well the price stays within the channel
    total_deviation = 0
    total_variance = 0
    mean_price = np.mean(actual_prices)
    
    for i, actual in enumerate(actual_prices):
        upper = expected_upper_prices[i]
        lower = expected_lower_prices[i]
        
        # Calculate deviation from channel center
        channel_center = (upper + lower) / 2
        deviation = abs(actual - channel_center)
        total_deviation += deviation
        
        # Calculate variance for R-squared
        total_variance += (actual - mean_price) ** 2
    
    if total_variance == 0:
        return 0
    
    # R-squared based on how well prices follow the channel
    r_squared = 1 - (total_deviation / total_variance)
    return max(0, r_squared)

def create_simple_channel(df, timeframe_days):
    """Create a simple trend channel based on recent price action"""
    if len(df) < 10:
        return None
    
    # Use the first and last 20% of the data to create a channel
    start_idx = int(len(df) * 0.2)
    end_idx = int(len(df) * 0.8)
    
    if end_idx <= start_idx:
        return None
    
    start_date = df.index[start_idx]
    end_date = df.index[end_idx]
    
    # Calculate slope based on close prices
    start_price = df.iloc[start_idx]['close']
    end_price = df.iloc[end_idx]['close']
    
    # Calculate slope
    days_diff = (end_date - start_date).days
    if days_diff < 10:
        return None
    
    price_diff = end_price - start_price
    slope = price_diff / days_diff
    
    # Calculate channel width based on recent volatility
    recent_volatility = df['high'].tail(20).max() - df['low'].tail(20).min()
    channel_width = recent_volatility * 0.3  # 30% of recent volatility
    
    # Create upper and lower lines
    upper_start_price = start_price + (channel_width / 2)
    upper_end_price = end_price + (channel_width / 2)
    lower_start_price = start_price - (channel_width / 2)
    lower_end_price = end_price - (channel_width / 2)
    
    return {
        'upper_start_date': start_date,
        'upper_end_date': end_date,
        'upper_start_price': upper_start_price,
        'upper_end_price': upper_end_price,
        'lower_start_date': start_date,
        'lower_end_date': end_date,
        'lower_start_price': lower_start_price,
        'lower_end_price': lower_end_price,
        'slope': slope,
        'channel_width': channel_width,
        'r_squared': 0.1,  # Low R-squared for simple channel
        'timeframe_days': timeframe_days
    }

def create_simple_trendline(df, timeframe_days):
    """Create a simple trendline based on recent price action"""
    if len(df) < 10:
        return None
    
    # Use the first and last 20% of the data to create a trendline
    start_idx = int(len(df) * 0.2)
    end_idx = int(len(df) * 0.8)
    
    if end_idx <= start_idx:
        return None
    
    start_date = df.index[start_idx]
    end_date = df.index[end_idx]
    start_price = df.iloc[start_idx]['close']
    end_price = df.iloc[end_idx]['close']
    
    # Calculate slope
    days_diff = (end_date - start_date).days
    if days_diff < 10:
        return None
    
    price_diff = end_price - start_price
    slope = price_diff / days_diff
    
    # Determine trend type
    trend_type = 'uptrend' if slope > 0 else 'downtrend'
    
    return {
        'start_date': start_date,
        'end_date': end_date,
        'start_price': start_price,
        'end_price': end_price,
        'slope': slope,
        'r_squared': 0.1,  # Low R-squared for simple trendline
        'trend_type': trend_type,
        'timeframe_days': timeframe_days
    }

def store_simplified_trendlines(conn, trendlines, symbol):
    """Store simplified trendlines in the database"""
    cursor = conn.cursor()
    
    # Clear existing trendlines for NEPSE
    cursor.execute("DELETE FROM trendlines WHERE symbol = %s", (symbol,))
    
    if not trendlines:
        logger.info("No trendlines to store")
        conn.commit()
        cursor.close()
        return
    
    # Store trend channels
    for i, channel in enumerate(trendlines, 1):
        if channel is None:
            continue
            
        # Store upper line of the channel
        cursor.execute("""
            INSERT INTO trendlines 
            (symbol, timeframe_days, trendline_number, start_date, end_date, 
             start_price, end_price, slope, trend_type)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            symbol,
            channel.get('timeframe_days', 180),  # Default to 6 months
            i * 2 - 1,  # Odd numbers for upper lines
            channel['upper_start_date'],
            channel['upper_end_date'],
            float(channel['upper_start_price']),
            float(channel['upper_end_price']),
            float(channel['slope']),
            'upper'
        ))
        
        # Store lower line of the channel
        cursor.execute("""
            INSERT INTO trendlines 
            (symbol, timeframe_days, trendline_number, start_date, end_date, 
             start_price, end_price, slope, trend_type)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            symbol,
            channel.get('timeframe_days', 180),  # Default to 6 months
            i * 2,  # Even numbers for lower lines
            channel['lower_start_date'],
            channel['lower_end_date'],
            float(channel['lower_start_price']),
            float(channel['lower_end_price']),
            float(channel['slope']),
            'lower'
        ))
    
    conn.commit()
    cursor.close()
    logger.info(f"Stored {len([t for t in trendlines if t is not None]) * 2} trendlines (channels) for {symbol}")

def analyze_nepse_simplified_trendlines():
    """Analyze NEPSE with simplified trendline strategy"""
    conn = get_db_connection()
    
    try:
        # Load NEPSE data
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        data_file = os.path.join(base_dir, "data", "daily_data_202507172305.csv")
        
        df = pd.read_csv(data_file)
        df['date'] = pd.to_datetime(df['date'])
        
        # Filter NEPSE data
        nepse_df = df[df['symbol'] == 'NEPSE'].copy()
        nepse_df.set_index('date', inplace=True)
        nepse_df = nepse_df.sort_index()
        
        if len(nepse_df) < 100:
            logger.error("Insufficient NEPSE data")
            return
        
        logger.info(f"Analyzing NEPSE with {len(nepse_df)} data points")
        logger.info(f"Date range: {nepse_df.index.min()} to {nepse_df.index.max()}")
        
        trendlines = []
        
        # 1. 3-Month Short-term Trend Channel
        logger.info("\n=== 3-Month Short-term Trend Channel ===")
        three_month_df = nepse_df.last('90D')  # 3 months
        
        if len(three_month_df) >= 20:
            channel_3m = find_trend_channel(three_month_df, 90)
            if channel_3m:
                trendlines.append(channel_3m)
                logger.info(f"3M Channel: Upper {channel_3m['upper_start_price']:.2f} → {channel_3m['upper_end_price']:.2f}, Lower {channel_3m['lower_start_price']:.2f} → {channel_3m['lower_end_price']:.2f} (Slope: {channel_3m['slope']:.4f}, Width: {channel_3m['channel_width']:.2f}, R²: {channel_3m['r_squared']:.3f})")
            else:
                # Create a simple channel based on recent price action
                simple_channel_3m = create_simple_channel(three_month_df, 90)
                if simple_channel_3m:
                    trendlines.append(simple_channel_3m)
                    logger.info(f"3M Simple Channel: Upper {simple_channel_3m['upper_start_price']:.2f} → {simple_channel_3m['upper_end_price']:.2f}, Lower {simple_channel_3m['lower_start_price']:.2f} → {simple_channel_3m['lower_end_price']:.2f} (Slope: {simple_channel_3m['slope']:.4f}, Width: {simple_channel_3m['channel_width']:.2f})")
                else:
                    logger.info("No significant 3M channel found")
                    trendlines.append(None)
        else:
            logger.warning("Insufficient data for 3-month analysis")
            trendlines.append(None)
        
        # 2. 6-Month Medium-term Trend Channel
        logger.info("\n=== 6-Month Medium-term Trend Channel ===")
        six_month_df = nepse_df.last('180D')  # 6 months
        
        if len(six_month_df) >= 30:
            channel_6m = find_trend_channel(six_month_df, 180)
            if channel_6m:
                trendlines.append(channel_6m)
                logger.info(f"6M Channel: Upper {channel_6m['upper_start_price']:.2f} → {channel_6m['upper_end_price']:.2f}, Lower {channel_6m['lower_start_price']:.2f} → {channel_6m['lower_end_price']:.2f} (Slope: {channel_6m['slope']:.4f}, Width: {channel_6m['channel_width']:.2f}, R²: {channel_6m['r_squared']:.3f})")
            else:
                logger.info("No significant 6M channel found")
                trendlines.append(None)
        else:
            logger.warning("Insufficient data for 6-month analysis")
            trendlines.append(None)
        
        # 3. 1.5-Year Long-term Trend Channel
        logger.info("\n=== 1.5-Year Long-term Trend Channel ===")
        eighteen_month_df = nepse_df.last('540D')  # 1.5 years (18 months)
        
        if len(eighteen_month_df) >= 60:
            channel_18m = find_trend_channel(eighteen_month_df, 540)
            if channel_18m:
                trendlines.append(channel_18m)
                logger.info(f"18M Channel: Upper {channel_18m['upper_start_price']:.2f} → {channel_18m['upper_end_price']:.2f}, Lower {channel_18m['lower_start_price']:.2f} → {channel_18m['lower_end_price']:.2f} (Slope: {channel_18m['slope']:.4f}, Width: {channel_18m['channel_width']:.2f}, R²: {channel_18m['r_squared']:.3f})")
            else:
                logger.info("No significant 18M channel found")
                trendlines.append(None)
        else:
            logger.warning("Insufficient data for 18-month analysis")
            trendlines.append(None)
        
        # 4. 3-Year Mega Trend Channel
        logger.info("\n=== 3-Year Mega Trend Channel ===")
        three_year_df = nepse_df.last('1095D')  # 3 years (1095 days)
        
        if len(three_year_df) >= 150:
            channel_3y = find_trend_channel(three_year_df, 1095)
            if channel_3y:
                # Extend the channel to cover the latest candle
                latest_date = nepse_df.index[-1]
                days_extension = (latest_date - channel_3y['upper_end_date']).days
                
                # Extend upper line
                channel_3y['upper_end_date'] = latest_date
                channel_3y['upper_end_price'] = channel_3y['upper_start_price'] + (channel_3y['slope'] * (channel_3y['upper_end_date'] - channel_3y['upper_start_date']).days)
                
                # Extend lower line
                channel_3y['lower_end_date'] = latest_date
                channel_3y['lower_end_price'] = channel_3y['lower_start_price'] + (channel_3y['slope'] * (channel_3y['lower_end_date'] - channel_3y['lower_start_date']).days)
                
                trendlines.append(channel_3y)
                logger.info(f"3Y Channel: Upper {channel_3y['upper_start_price']:.2f} → {channel_3y['upper_end_price']:.2f}, Lower {channel_3y['lower_start_price']:.2f} → {channel_3y['lower_end_price']:.2f} (Slope: {channel_3y['slope']:.4f}, Width: {channel_3y['channel_width']:.2f}, R²: {channel_3y['r_squared']:.3f})")
            else:
                # Create a simple channel based on 3-year data
                simple_channel_3y = create_simple_channel(three_year_df, 1095)
                if simple_channel_3y:
                    # Extend the simple channel to cover the latest candle
                    latest_date = nepse_df.index[-1]
                    
                    # Extend upper line
                    simple_channel_3y['upper_end_date'] = latest_date
                    simple_channel_3y['upper_end_price'] = simple_channel_3y['upper_start_price'] + (simple_channel_3y['slope'] * (simple_channel_3y['upper_end_date'] - simple_channel_3y['upper_start_date']).days)
                    
                    # Extend lower line
                    simple_channel_3y['lower_end_date'] = latest_date
                    simple_channel_3y['lower_end_price'] = simple_channel_3y['lower_start_price'] + (simple_channel_3y['slope'] * (simple_channel_3y['lower_end_date'] - simple_channel_3y['lower_start_date']).days)
                    
                    trendlines.append(simple_channel_3y)
                    logger.info(f"3Y Simple Channel: Upper {simple_channel_3y['upper_start_price']:.2f} → {simple_channel_3y['upper_end_price']:.2f}, Lower {simple_channel_3y['lower_start_price']:.2f} → {simple_channel_3y['lower_end_price']:.2f} (Slope: {simple_channel_3y['slope']:.4f}, Width: {simple_channel_3y['channel_width']:.2f})")
                else:
                    logger.info("No significant 3Y channel found")
                    trendlines.append(None)
        else:
            logger.warning("Insufficient data for 3-year analysis")
            trendlines.append(None)
        
        # Store trendlines
        store_simplified_trendlines(conn, trendlines, 'NEPSE')
        
        # Summary
        valid_trendlines = [t for t in trendlines if t is not None]
        logger.info(f"\n=== Summary ===")
        logger.info(f"Generated {len(valid_trendlines)} trend channels for NEPSE:")
        for i, channel in enumerate(valid_trendlines, 1):
            timeframe = "3M" if channel['timeframe_days'] == 90 else "6M" if channel['timeframe_days'] == 180 else "18M" if channel['timeframe_days'] == 540 else "3Y"
            logger.info(f"  {i}. {timeframe} Channel: Upper {channel['upper_start_price']:.2f} → {channel['upper_end_price']:.2f}, Lower {channel['lower_start_price']:.2f} → {channel['lower_end_price']:.2f} (Width: {channel['channel_width']:.2f}, R²: {channel['r_squared']:.3f})")
    
    except Exception as e:
        logger.error(f"Error in simplified trendline analysis: {e}")
    finally:
        conn.close()

def analyze_multiple_stocks_trendlines():
    """Analyze multiple stocks and generate simplified trend channels"""
    # List of stocks to analyze
    stocks = ['ACLBSL', 'ADBL', 'ADBLD83', 'ADLB', 'AHL']
    
    conn = get_db_connection()
    
    try:
        total_channels_generated = 0
        
        for stock_symbol in stocks:
            logger.info(f"\n{'='*60}")
            logger.info(f"ANALYZING STOCK: {stock_symbol}")
            logger.info(f"{'='*60}")
            
            try:
                # Load stock data
                base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
                data_file = os.path.join(base_dir, "data", "daily_data_202507172305.csv")
                
                df = pd.read_csv(data_file)
                df['date'] = pd.to_datetime(df['date'])
                
                # Filter stock data
                stock_df = df[df['symbol'] == stock_symbol].copy()
                stock_df.set_index('date', inplace=True)
                stock_df = stock_df.sort_index()
                
                if len(stock_df) < 100:
                    logger.warning(f"Insufficient data for {stock_symbol} ({len(stock_df)} points), skipping...")
                    continue
                
                logger.info(f"Analyzing {stock_symbol} with {len(stock_df)} data points")
                logger.info(f"Date range: {stock_df.index.min()} to {stock_df.index.max()}")
                
                trendlines = []
                
                # 1. 3-Month Short-term Trend Channel
                logger.info(f"\n=== {stock_symbol} 3-Month Short-term Trend Channel ===")
                three_month_df = stock_df.last('90D')  # 3 months
                
                if len(three_month_df) >= 20:
                    channel_3m = find_trend_channel(three_month_df, 90)
                    if channel_3m:
                        trendlines.append(channel_3m)
                        logger.info(f"3M Channel: Upper {channel_3m['upper_start_price']:.2f} → {channel_3m['upper_end_price']:.2f}, Lower {channel_3m['lower_start_price']:.2f} → {channel_3m['lower_end_price']:.2f} (Slope: {channel_3m['slope']:.4f}, Width: {channel_3m['channel_width']:.2f}, R²: {channel_3m['r_squared']:.3f})")
                    else:
                        # Create a simple channel based on recent price action
                        simple_channel_3m = create_simple_channel(three_month_df, 90)
                        if simple_channel_3m:
                            trendlines.append(simple_channel_3m)
                            logger.info(f"3M Simple Channel: Upper {simple_channel_3m['upper_start_price']:.2f} → {simple_channel_3m['upper_end_price']:.2f}, Lower {simple_channel_3m['lower_start_price']:.2f} → {simple_channel_3m['lower_end_price']:.2f} (Slope: {simple_channel_3m['slope']:.4f}, Width: {simple_channel_3m['channel_width']:.2f})")
                        else:
                            logger.info("No significant 3M channel found")
                            trendlines.append(None)
                else:
                    logger.warning("Insufficient data for 3-month analysis")
                    trendlines.append(None)
                
                # 2. 6-Month Medium-term Trend Channel
                logger.info(f"\n=== {stock_symbol} 6-Month Medium-term Trend Channel ===")
                six_month_df = stock_df.last('180D')  # 6 months
                
                if len(six_month_df) >= 30:
                    channel_6m = find_trend_channel(six_month_df, 180)
                    if channel_6m:
                        trendlines.append(channel_6m)
                        logger.info(f"6M Channel: Upper {channel_6m['upper_start_price']:.2f} → {channel_6m['upper_end_price']:.2f}, Lower {channel_6m['lower_start_price']:.2f} → {channel_6m['lower_end_price']:.2f} (Slope: {channel_6m['slope']:.4f}, Width: {channel_6m['channel_width']:.2f}, R²: {channel_6m['r_squared']:.3f})")
                    else:
                        logger.info("No significant 6M channel found")
                        trendlines.append(None)
                else:
                    logger.warning("Insufficient data for 6-month analysis")
                    trendlines.append(None)
                
                # 3. 1.5-Year Long-term Trend Channel
                logger.info(f"\n=== {stock_symbol} 1.5-Year Long-term Trend Channel ===")
                eighteen_month_df = stock_df.last('540D')  # 1.5 years (18 months)
                
                if len(eighteen_month_df) >= 60:
                    channel_18m = find_trend_channel(eighteen_month_df, 540)
                    if channel_18m:
                        trendlines.append(channel_18m)
                        logger.info(f"18M Channel: Upper {channel_18m['upper_start_price']:.2f} → {channel_18m['upper_end_price']:.2f}, Lower {channel_18m['lower_start_price']:.2f} → {channel_18m['lower_end_price']:.2f} (Slope: {channel_18m['slope']:.4f}, Width: {channel_18m['channel_width']:.2f}, R²: {channel_18m['r_squared']:.3f})")
                    else:
                        logger.info("No significant 18M channel found")
                        trendlines.append(None)
                else:
                    logger.warning("Insufficient data for 18-month analysis")
                    trendlines.append(None)
                
                # 4. 3-Year Mega Trend Channel
                logger.info(f"\n=== {stock_symbol} 3-Year Mega Trend Channel ===")
                three_year_df = stock_df.last('1095D')  # 3 years (1095 days)
                
                if len(three_year_df) >= 150:
                    channel_3y = find_trend_channel(three_year_df, 1095)
                    if channel_3y:
                        # Extend the channel to cover the latest candle
                        latest_date = stock_df.index[-1]
                        
                        # Extend upper line
                        channel_3y['upper_end_date'] = latest_date
                        channel_3y['upper_end_price'] = channel_3y['upper_start_price'] + (channel_3y['slope'] * (channel_3y['upper_end_date'] - channel_3y['upper_start_date']).days)
                        
                        # Extend lower line
                        channel_3y['lower_end_date'] = latest_date
                        channel_3y['lower_end_price'] = channel_3y['lower_start_price'] + (channel_3y['slope'] * (channel_3y['lower_end_date'] - channel_3y['lower_start_date']).days)
                        
                        trendlines.append(channel_3y)
                        logger.info(f"3Y Channel: Upper {channel_3y['upper_start_price']:.2f} → {channel_3y['upper_end_price']:.2f}, Lower {channel_3y['lower_start_price']:.2f} → {channel_3y['lower_end_price']:.2f} (Slope: {channel_3y['slope']:.4f}, Width: {channel_3y['channel_width']:.2f}, R²: {channel_3y['r_squared']:.3f})")
                    else:
                        # Create a simple channel based on 3-year data
                        simple_channel_3y = create_simple_channel(three_year_df, 1095)
                        if simple_channel_3y:
                            # Extend the simple channel to cover the latest candle
                            latest_date = stock_df.index[-1]
                            
                            # Extend upper line
                            simple_channel_3y['upper_end_date'] = latest_date
                            simple_channel_3y['upper_end_price'] = simple_channel_3y['upper_start_price'] + (simple_channel_3y['slope'] * (simple_channel_3y['upper_end_date'] - simple_channel_3y['upper_start_date']).days)
                            
                            # Extend lower line
                            simple_channel_3y['lower_end_date'] = latest_date
                            simple_channel_3y['lower_end_price'] = simple_channel_3y['lower_start_price'] + (simple_channel_3y['slope'] * (simple_channel_3y['lower_end_date'] - simple_channel_3y['lower_start_date']).days)
                            
                            trendlines.append(simple_channel_3y)
                            logger.info(f"3Y Simple Channel: Upper {simple_channel_3y['upper_start_price']:.2f} → {simple_channel_3y['upper_end_price']:.2f}, Lower {simple_channel_3y['lower_start_price']:.2f} → {simple_channel_3y['lower_end_price']:.2f} (Slope: {simple_channel_3y['slope']:.4f}, Width: {simple_channel_3y['channel_width']:.2f})")
                        else:
                            logger.info("No significant 3Y channel found")
                            trendlines.append(None)
                else:
                    logger.warning("Insufficient data for 3-year analysis")
                    trendlines.append(None)
                
                # Store trendlines for this stock
                if trendlines:
                    store_simplified_trendlines(conn, trendlines, stock_symbol)
                    valid_trendlines = [t for t in trendlines if t is not None]
                    total_channels_generated += len(valid_trendlines)
                    logger.info(f"Generated {len(valid_trendlines)} trend channels for {stock_symbol}")
                else:
                    logger.warning(f"No trendlines generated for {stock_symbol}")
                
            except Exception as e:
                logger.error(f"Error analyzing {stock_symbol}: {e}")
                continue
        
        logger.info(f"\n{'='*60}")
        logger.info(f"ANALYSIS COMPLETED")
        logger.info(f"{'='*60}")
        logger.info(f"Total channels generated: {total_channels_generated}")
        logger.info(f"Stocks processed: {len(stocks)}")
        
    except Exception as e:
        logger.error(f"Error in multi-stock analysis: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    analyze_multiple_stocks_trendlines()

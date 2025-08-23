-- Drop existing tables if they exist
DROP TABLE IF EXISTS trendlines CASCADE;

-- Create table for trendlines
CREATE TABLE IF NOT EXISTS trendlines (
    id SERIAL PRIMARY KEY,
    symbol VARCHAR(50),
    timeframe_days INTEGER,
    trendline_number INTEGER,
    start_date DATE,
    end_date DATE,
    start_price DECIMAL(10,2),
    end_price DECIMAL(10,2),
    slope DECIMAL(10,4),
    trend_type VARCHAR(10), -- 'uptrend' or 'downtrend'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(symbol, timeframe_days, trendline_number)
);

-- Import data from CSV file
-- \COPY trendlines(id, symbol, timeframe_days, trendline_number, start_date, end_date, start_price, end_price, slope, trend_type, created_at) FROM './data/trendlines_202505281906.csv' WITH (FORMAT csv, HEADER true); 
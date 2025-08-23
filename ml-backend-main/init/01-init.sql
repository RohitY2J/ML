-- Drop existing tables if they exist
DROP TABLE IF EXISTS daily_data CASCADE;
DROP TABLE IF EXISTS intraday_data CASCADE;

-- Create tables for daily and intraday data
CREATE TABLE IF NOT EXISTS daily_data (
    date DATE,
    symbol VARCHAR(50),
    open DECIMAL(10,2),
    high DECIMAL(10,2),
    low DECIMAL(10,2),
    close DECIMAL(10,2),
    volume DECIMAL(20,2),
    PRIMARY KEY (date, symbol)
);

CREATE TABLE IF NOT EXISTS intraday_data (
    timestamp TIMESTAMP,
    symbol VARCHAR(50),
    open DECIMAL(10,2),
    high DECIMAL(10,2),
    low DECIMAL(10,2),
    close DECIMAL(10,2),
    volume DECIMAL(20,2),
    PRIMARY KEY (timestamp, symbol)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_daily_data_symbol ON daily_data(symbol);
CREATE INDEX IF NOT EXISTS idx_intraday_data_symbol ON intraday_data(symbol);
CREATE INDEX IF NOT EXISTS idx_intraday_data_timestamp ON intraday_data(timestamp);

-- Import CSV files
\COPY daily_data FROM './data/daily_data_202507172305.csv' WITH (FORMAT csv, HEADER true, FORCE_NULL (volume));

-- Removed intraday data import as it is not needed

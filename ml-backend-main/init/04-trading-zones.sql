-- Drop existing tables if they exist
DROP TABLE IF EXISTS trading_zones CASCADE;

-- Create trading_zones table
CREATE TABLE IF NOT EXISTS trading_zones (
    id SERIAL PRIMARY KEY,
    symbol VARCHAR(50),
    timeframe_days INTEGER,
    zone_type VARCHAR(50),
    bottom_price DECIMAL(10,2),
    center_price DECIMAL(10,2),
    top_price DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(symbol, timeframe_days, zone_type)
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_trading_zones_symbol ON trading_zones(symbol);
CREATE INDEX IF NOT EXISTS idx_trading_zones_timeframe ON trading_zones(timeframe_days);
CREATE INDEX IF NOT EXISTS idx_trading_zones_zone_type ON trading_zones(zone_type);

-- Import data from CSV file
-- \COPY trading_zones(id, symbol, timeframe_days, zone_type, bottom_price, center_price, top_price, created_at) FROM './data/trading_zones_202505281906.csv' WITH (FORMAT csv, HEADER true); 
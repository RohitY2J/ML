-- Drop existing tables if they exist
DROP TABLE IF EXISTS support_zones CASCADE;
DROP TABLE IF EXISTS resistance_zones CASCADE;

-- Create tables for support and resistance zones
CREATE TABLE IF NOT EXISTS support_zones (
    id SERIAL PRIMARY KEY,
    symbol VARCHAR(50),
    timeframe_days INTEGER,
    zone_number INTEGER,
    bottom_price DECIMAL(10,2),
    center_price DECIMAL(10,2),
    top_price DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(symbol, timeframe_days, zone_number)
);

CREATE TABLE IF NOT EXISTS resistance_zones (
    id SERIAL PRIMARY KEY,
    symbol VARCHAR(50),
    timeframe_days INTEGER,
    zone_number INTEGER,
    bottom_price DECIMAL(10,2),
    center_price DECIMAL(10,2),
    top_price DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(symbol, timeframe_days, zone_number)
);

-- Import data from CSV files
-- \COPY support_zones(id, symbol, timeframe_days, zone_number, bottom_price, center_price, top_price, created_at) FROM './data/support_zones_202505281905.csv' WITH (FORMAT csv, HEADER true);
-- \COPY resistance_zones(id, symbol, timeframe_days, zone_number, bottom_price, center_price, top_price, created_at) FROM './data/resistance_zones_202505281905.csv' WITH (FORMAT csv, HEADER true); 
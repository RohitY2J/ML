-- Drop existing tables if they exist
DROP TABLE IF EXISTS symbols CASCADE;

-- Create symbols table with larger VARCHAR size
CREATE TABLE symbols (
    id SERIAL PRIMARY KEY,
    symbol VARCHAR(20) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on symbol column for faster lookups
CREATE INDEX IF NOT EXISTS idx_symbols_symbol ON symbols(symbol);

-- Import data from CSV file
-- \COPY symbols(id, symbol, created_at) FROM './data/symbols_202505281906.csv' WITH (FORMAT csv, HEADER true);

-- Commented out symbol generation from daily_data
INSERT INTO symbols (symbol)
SELECT DISTINCT symbol 
FROM daily_data
WHERE symbol NOT IN (SELECT symbol FROM symbols)
ORDER BY symbol;


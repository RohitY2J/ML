-- Drop existing tables if they exist
DROP TABLE IF EXISTS trading_signals CASCADE;

-- Create trading_signals table
CREATE TABLE IF NOT EXISTS trading_signals (
    id SERIAL PRIMARY KEY,
    symbol VARCHAR(50),
    ltp DECIMAL(10,2),
    signal VARCHAR(10),
    buy_target DECIMAL(10,2),
    sell_target DECIMAL(10,2),
    stop_loss DECIMAL(10,2),
    change_percent DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_trading_signals_symbol ON trading_signals(symbol);
CREATE INDEX IF NOT EXISTS idx_trading_signals_signal ON trading_signals(signal);
CREATE INDEX IF NOT EXISTS idx_trading_signals_created_at ON trading_signals(created_at);

-- Import data from CSV file
-- \COPY trading_signals(id, symbol, ltp, signal, buy_target, sell_target, stop_loss, change_percent, created_at) FROM './data/trading_signals_202505281906.csv' WITH (FORMAT csv, HEADER true); 
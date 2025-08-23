#!/bin/bash

# Analysis Pipeline Script
# This script runs all the data processing and analysis scripts in sequence:
# 1. generate_daily_data.py - Fetches and processes daily stock data
# 2. generate_zones.py - Identifies support and resistance zones
# 3. generate_trendline.py - Generates trendlines for technical analysis
# 4. generate_trading_zone.py - Creates trading zones based on technical indicators
# 5. generate_signals.py - Generates trading signals
# 6. generate_ai_signals.py - Generates AI-powered trading signals
# 7. prepare_ml_dataset.py - Prepares machine learning datasets
# 8. update_trading_signals.py - Updates trading signals with latest data

# Set up logging
LOG_FILE="script_execution.log"
echo "Starting analysis pipeline at $(date)" > $LOG_FILE

# Remove the all-data directory if it exists
if [ -d "all-data" ]; then
    echo "Removing existing all-data directory..." | tee -a $LOG_FILE
    rm -rf all-data
fi

# Function to run a script and log its execution
run_script() {
    local script_name=$1
    echo "Running $script_name at $(date)" | tee -a $LOG_FILE
    ../../myenv/bin/python $script_name
    if [ $? -eq 0 ]; then
        echo "$script_name completed successfully at $(date)" | tee -a $LOG_FILE
    else
        echo "ERROR: $script_name failed at $(date)" | tee -a $LOG_FILE
        exit 1
    fi
}

# Check if virtual environment exists
if [ ! -d "../../myenv" ]; then
    echo "ERROR: Virtual environment 'myenv' not found in parent directory" | tee -a $LOG_FILE
    echo "Please create the virtual environment first" | tee -a $LOG_FILE
    exit 1
fi

# Check if Python interpreter exists in virtual environment
if [ ! -f "../../myenv/bin/python" ]; then
    echo "ERROR: Python interpreter not found in virtual environment" | tee -a $LOG_FILE
    echo "Please ensure the virtual environment is properly set up" | tee -a $LOG_FILE
    exit 1
fi

# Create necessary directories
mkdir -p all-data

# Run scripts in sequence
echo "Starting analysis pipeline..." | tee -a $LOG_FILE

# 1. Generate daily data
run_script "generate_daily_data.py"

# 2. Generate zones
run_script "generate_zones.py"

# 3. Generate trendlines
run_script "generate_trendline.py"

# 4. Generate trading zones
run_script "generate_trading_zone.py"

# 5. Generate signals
run_script "generate_signals.py"

# 6. Generate AI signals
# run_script "generate_ai_signals.py"

# 7. Prepare ML dataset
run_script "prepare_ml_dataset.py"

# 8. Update Trading Signals
run_script "update_trading_signals.py"

echo "Analysis pipeline completed at $(date)" | tee -a $LOG_FILE 
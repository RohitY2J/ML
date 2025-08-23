#!/bin/bash

# Production Analysis Pipeline Script
# This script runs all the data processing and analysis scripts in sequence
# without requiring a virtual environment - uses system Python directly

# Set up logging
LOG_FILE="production_execution.log"
echo "Starting production analysis pipeline at $(date)" > $LOG_FILE

# Remove the all-data directory if it exists
if [ -d "all-data" ]; then
    echo "Removing existing all-data directory..." | tee -a $LOG_FILE
    rm -rf all-data
fi

# Function to run a script and log its execution
run_script() {
    local script_name=$1
    echo "Running $script_name at $(date)" | tee -a $LOG_FILE
    python3 $script_name
    if [ $? -eq 0 ]; then
        echo "$script_name completed successfully at $(date)" | tee -a $LOG_FILE
    else
        echo "ERROR: $script_name failed at $(date)" | tee -a $LOG_FILE
        exit 1
    fi
}

# Check if Python3 is available
if ! command -v python3 &> /dev/null; then
    echo "ERROR: Python3 is not installed or not in PATH" | tee -a $LOG_FILE
    echo "Please install Python3 and ensure it's available in your PATH" | tee -a $LOG_FILE
    exit 1
fi

# Check Python version
PYTHON_VERSION=$(python3 --version 2>&1 | cut -d' ' -f2 | cut -d'.' -f1,2)
echo "Using Python version: $(python3 --version)" | tee -a $LOG_FILE

# Install required packages if not already installed
echo "Checking and installing required Python packages..." | tee -a $LOG_FILE
python3 -c "
import sys
required_packages = [
    'pandas', 'numpy', 'requests', 'sqlalchemy', 'psycopg2-binary',
    'scikit-learn', 'matplotlib', 'seaborn', 'yfinance', 'ta'
]

missing_packages = []
for package in required_packages:
    try:
        __import__(package.replace('-', '_'))
    except ImportError:
        missing_packages.append(package)

if missing_packages:
    print(f'Installing missing packages: {missing_packages}')
    import subprocess
    for package in missing_packages:
        subprocess.check_call([sys.executable, '-m', 'pip', 'install', package])
    print('All required packages installed successfully')
else:
    print('All required packages are already installed')
" 2>&1 | tee -a $LOG_FILE

# Create necessary directories
mkdir -p all-data

# Run scripts in sequence
echo "Starting production analysis pipeline..." | tee -a $LOG_FILE

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

# 6. Generate AI signals (commented out by default)
# run_script "generate_ai_signals.py"

# 7. Prepare ML dataset
run_script "prepare_ml_dataset.py"

# 8. Update Trading Signals
run_script "update_trading_signals.py"

echo "Production analysis pipeline completed at $(date)" | tee -a $LOG_FILE
echo "Log file saved to: $LOG_FILE" | tee -a $LOG_FILE 
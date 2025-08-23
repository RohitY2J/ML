#!/usr/bin/env python3
"""
Production Analysis Pipeline Script
This script runs all the data processing and analysis scripts in sequence
without requiring a virtual environment - uses system Python directly
"""

import os
import sys
import subprocess
import logging
from datetime import datetime
import importlib.util

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('production_execution.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

def check_and_install_packages():
    """Check and install required packages"""
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
        logger.info(f"Installing missing packages: {missing_packages}")
        for package in missing_packages:
            try:
                subprocess.check_call([sys.executable, '-m', 'pip', 'install', package])
                logger.info(f"Successfully installed {package}")
            except subprocess.CalledProcessError as e:
                logger.error(f"Failed to install {package}: {e}")
                return False
        logger.info("All required packages installed successfully")
    else:
        logger.info("All required packages are already installed")
    
    return True

def run_script(script_name):
    """Run a Python script and log its execution"""
    logger.info(f"Running {script_name} at {datetime.now()}")
    
    try:
        # Run the script using subprocess
        result = subprocess.run([sys.executable, script_name], 
                              capture_output=True, text=True, check=True)
        
        # Log output
        if result.stdout:
            logger.info(f"{script_name} output: {result.stdout}")
        
        logger.info(f"{script_name} completed successfully at {datetime.now()}")
        return True
        
    except subprocess.CalledProcessError as e:
        logger.error(f"ERROR: {script_name} failed at {datetime.now()}")
        logger.error(f"Error output: {e.stderr}")
        return False
    except Exception as e:
        logger.error(f"ERROR: {script_name} failed with exception: {e}")
        return False

def main():
    """Main function to run the analysis pipeline"""
    logger.info("Starting production analysis pipeline")
    
    # Check Python version
    python_version = sys.version
    logger.info(f"Using Python version: {python_version}")
    
    # Check and install required packages
    if not check_and_install_packages():
        logger.error("Failed to install required packages. Exiting.")
        sys.exit(1)
    
    # Remove the all-data directory if it exists
    if os.path.exists("all-data"):
        logger.info("Removing existing all-data directory...")
        import shutil
        shutil.rmtree("all-data")
    
    # Create necessary directories
    os.makedirs("all-data", exist_ok=True)
    
    # List of scripts to run in sequence
    scripts = [
        "generate_daily_data.py",
        "generate_zones.py", 
        "generate_trendline.py",
        "generate_trading_zone.py",
        "generate_signals.py",
        # "generate_ai_signals.py",  # Commented out by default
        "prepare_ml_dataset.py",
        "update_trading_signals.py"
    ]
    
    # Run scripts in sequence
    for script in scripts:
        if not run_script(script):
            logger.error(f"Pipeline failed at {script}. Exiting.")
            sys.exit(1)
    
    logger.info("Production analysis pipeline completed successfully")
    logger.info("Log file saved to: production_execution.log")

if __name__ == "__main__":
    main() 
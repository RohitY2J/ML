#!/bin/bash

# Activate the virtual environment and run Python scripts
# Usage: ./run_python.sh script_name.py

# Get the directory of this script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
PARENT_DIR="$(dirname "$PROJECT_ROOT")"

# Activate virtual environment (located in parent directory)
source "$PARENT_DIR/myenv/bin/activate"

# Run the Python script with the virtual environment's Python
"$PARENT_DIR/myenv/bin/python" "$@" 
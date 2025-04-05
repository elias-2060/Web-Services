#!/bin/bash
#
# API Client Execution Script
#
# This script:
# 1. Activates the Python virtual environment
# 2. Verifies the API is running
# 3. Retrieves the current API key with validation
# 4. Executes the API client script (consume_api.py)
#
# Usage: ./run_script.sh
# Note: Requires the API to be running (via run_api.sh)

# -------------------------------------------------------------------
# Virtual Environment Activation
# -------------------------------------------------------------------

echo "Activating virtual environment..."
if [ -d "venv/Scripts" ]; then
    source venv/Scripts/activate  # Windows systems
else
    source venv/bin/activate      # Linux/macOS systems
fi

# -------------------------------------------------------------------
# API Availability Check
# -------------------------------------------------------------------

echo "Checking API availability..."
if ! curl -s http://127.0.0.1:5000 >/dev/null; then
    echo "ERROR: API not responding at http://127.0.0.1:5000" >&2
    echo "Solution: First run the API using './run_api.sh'" >&2
    exit 1
fi

# -------------------------------------------------------------------
# API Key Retrieval with Validation
# -------------------------------------------------------------------

echo "Retrieving API key..."
API_KEY=$(python3 -c "
import sys
try:
    from utils import get_api_key
    key = get_api_key()
    if not key:
        print('ERROR: No API key found', file=sys.stderr)
        exit(1)
    print(key)
except Exception as e:
    print(f'ERROR: {str(e)}', file=sys.stderr)
    exit(1)
")

# Check if key retrieval was successful
if [ $? -ne 0 ]; then
    echo "$API_KEY" >&2  # Forward the Python error message
    exit 1
fi

# Verify key is not empty
if [ -z "$API_KEY" ]; then
    echo "ERROR: Received empty API key" >&2
    exit 1
fi

# -------------------------------------------------------------------
# Client Script Execution
# -------------------------------------------------------------------

echo "Running client script with key: $API_KEY"
python3 consume_api.py --api-key "$API_KEY"
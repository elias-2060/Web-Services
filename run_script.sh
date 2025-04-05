#!/bin/bash

# 1. Activate virtual environment
if [ -d "venv/Scripts" ]; then
        source venv/Scripts/activate  # Windows
    else
        source venv/bin/activate     # Linux/macOS
fi

# 2. Check if API is responding
if ! curl -s http://127.0.0.1:5000 >/dev/null; then
    echo "API not responding at http://127.0.0.1:5000"
    echo "Note: Make sure to run ./run_api.sh first"
    exit 1
fi

# Get current key (with verification)
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

if [ $? -ne 0 ]; then
    echo "$API_KEY"  # The error message was already sent to stderr
    exit 1
fi

if [ -z "$API_KEY" ]; then
    echo "ERROR: Got empty API key"
    exit 1
fi

echo "Running tests with key: $API_KEY"
python3 consume_api.py --api-key "$API_KEY"
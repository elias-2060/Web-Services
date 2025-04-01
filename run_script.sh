#!/bin/bash

# Check if the API is running
if ! pgrep -f "app.py" > /dev/null; then
    echo "API is not running. Please start the API first with run_api.sh"
    exit 1
fi

# Get the API key from the running process
API_KEY=$(ps aux | grep "app.py --api-key" | grep -v grep | awk -F '--api-key ' '{print $2}' | awk '{print $1}')

if [ -z "$API_KEY" ]; then
    echo "Could not find API key. Is the API running?"
    exit 1
fi

echo "Running tests with API key: $API_KEY"
python3 consume_api.py --api-key "$API_KEY"
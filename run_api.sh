#!/bin/bash

# Create and activate venv if it doesn't exist
if [ ! -d "venv" ]; then
    python3 -m venv venv
    # activate the venv
    if [ -d "venv/Scripts" ]; then
        source venv/Scripts/activate  # Windows
    else
        source venv/bin/activate     # Linux/macOS
    fi

    pip install -r requirements.txt
else
    if [ -d "venv/Scripts" ]; then
        source venv/Scripts/activate  # Windows
    else
        source venv/bin/activate     # Linux/macOS
    fi
fi

# Generate new key (overwrites any existing)
API_KEY=$(python3 -c "from utils import generate_api_key; print(generate_api_key())")

echo "Starting API with key: $API_KEY"
echo "This is the ONLY valid key now"
python3 app.py --api-key "$API_KEY"
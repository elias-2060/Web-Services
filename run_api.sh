#!/bin/bash

# Generate a new API key
API_KEY=$(python3 -c "from utils import generate_api_key; print(generate_api_key())")

echo "Starting API with generated API key: $API_KEY"
python3 app.py --api-key "$API_KEY"
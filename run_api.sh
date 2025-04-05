#!/bin/bash
#
# API Initialization Script
#
# This script:
# 1. Sets up a Python virtual environment if one doesn't exist
# 2. Installs dependencies from requirements.txt
# 3. Generates a new secure API key
# 4. Starts the Flask API server with the generated key
#
# Usage: ./run_api.sh
# Note: This will overwrite any existing API key!

# -------------------------------------------------------------------
# Virtual Environment Setup
# -------------------------------------------------------------------

# Check if virtual environment exists, create if it doesn't
if [ ! -d "venv" ]; then
    echo "Creating new virtual environment..."
    python3 -m venv venv

    # Activate the virtual environment
    if [ -d "venv/Scripts" ]; then
        source venv/Scripts/activate  # Windows systems
    else
        source venv/bin/activate      # Linux/macOS systems
    fi

    # Install required packages
    echo "Installing dependencies..."
    pip install -r requirements.txt
else
    # Activate existing virtual environment
    if [ -d "venv/Scripts" ]; then
        source venv/Scripts/activate  # Windows systems
    else
        source venv/bin/activate      # Linux/macOS systems
    fi
fi

# -------------------------------------------------------------------
# API Key Generation and Server Startup
# -------------------------------------------------------------------

# Generate a new secure API key (overwrites any existing key)
echo "Generating new API key..."
API_KEY=$(python3 -c "from utils import generate_api_key; print(generate_api_key())")

# Display the generated key and start the API server
echo "Starting API with key: $API_KEY"
echo "Note: This is now the ONLY valid API key"
python3 app.py --api-key "$API_KEY"
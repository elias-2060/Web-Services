#!/bin/bash

# ---------------------------
# 0. Navigate to movie-app
# ---------------------------
FRONTEND_DIR="movie-app"

if [ ! -d "$FRONTEND_DIR" ]; then
  echo "❌ Frontend directory '$FRONTEND_DIR' not found"
  exit 1
fi

cd "$FRONTEND_DIR" || {
  echo "❌ Failed to enter $FRONTEND_DIR"
  exit 1
}

# ---------------------------
# 1. Check if Flask API is running
# ---------------------------
API_URL="http://127.0.0.1:5000"
API_KEY_FILE="../current_api_key.txt"

if ! curl -s "$API_URL" >/dev/null; then
  echo "❌ Flask API not running at $API_URL"
  echo "💡 First run: ./run_api.sh in another terminal"
  exit 1
fi

# ---------------------------
# 2. Get the API key
# ---------------------------
if [ ! -f "$API_KEY_FILE" ]; then
  echo "❌ API key file ($API_KEY_FILE) not found"
  exit 1
fi

API_KEY=$(cat "$API_KEY_FILE" | tr -d '\n')
if [ -z "$API_KEY" ]; then
  echo "❌ Could not read API key"
  exit 1
fi

# ---------------------------
# 3. Install frontend dependencies
# ---------------------------
echo "🔧 Installing React dependencies..."
npm install || {
  echo "❌ Failed to install npm packages"
  exit 1
}

# ---------------------------
# 4. Start React with API key
# ---------------------------
echo "🚀 Starting React app with API key: ${API_KEY:0:8}..." # Show first 8 chars
REACT_APP_API_KEY="$API_KEY" npm start
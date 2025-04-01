import secrets
import json
from pathlib import Path
from flask import request
import requests

# Base URL of my API
BASE_URL = "http://127.0.0.1:5000"

# Single key storage
API_KEY_FILE = Path("current_api_key.txt")


def get_api_key():
    """Reads the current API key from file"""
    try:
        return API_KEY_FILE.read_text().strip()
    except FileNotFoundError:
        return None


def generate_api_key():
    """Generates and stores a new API key"""
    api_key = secrets.token_hex(32)
    API_KEY_FILE.write_text(api_key)
    return api_key


def verify_api_key():
    """Verifies the request's API key"""
    current_key = get_api_key()
    provided_key = request.headers.get("API-Key", "").strip()

    if not current_key or provided_key != current_key:
        return {"error": "Invalid API key"}, 401
    return None


def make_request(method, endpoint, api_key, data=None):
    """Modified to handle empty keys"""
    if not api_key or not isinstance(api_key, str):
        print("Error: No API key provided")
        return None

    headers = {
        'API-Key': api_key.strip(),
        'Content-Type': 'application/json'
    }

    try:
        response = requests.request(
            method,
            f"{BASE_URL}{endpoint}",
            headers=headers,
            json=data if method in ('POST', 'PUT', 'PATCH') else None
        )
        return response.json() if response.status_code == 200 else None
    except Exception as e:
        print(f"Request failed: {str(e)}")
        return None

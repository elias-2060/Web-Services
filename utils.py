"""Utility functions for API key management and HTTP requests.

This module provides functionality for:
- Generating and storing secure API keys
- Verifying API keys in incoming requests
- Making authenticated HTTP requests to the API

The API key is stored in a local file (`current_api_key.txt`) for persistence.
"""

import secrets
from pathlib import Path
from flask import request
import requests

# Base URL of the API service
BASE_URL = "http://127.0.0.1:5000"

# Path to the file storing the current API key
API_KEY_FILE = Path("current_api_key.txt")


def get_api_key():
    """Retrieves the current API key from storage.

    Reads the API key from the persistent storage file. If the file doesn't exist,
    returns None.

    Returns:
        str | None: The current API key as a string if it exists, None otherwise.

    """
    try:
        return API_KEY_FILE.read_text().strip()
    except FileNotFoundError:
        return None


def generate_api_key():
    """Generates and stores a new cryptographically secure API key.

    Creates a new 64-character hexadecimal token using cryptographically secure
    generation and stores it in the API key file.

    Returns:
        str: The newly generated API key.

    """
    api_key = secrets.token_hex(32)
    API_KEY_FILE.write_text(api_key)
    return api_key


def verify_api_key():
    """Verifies the API key in the incoming request.

    Compares the API key provided in the request headers with the stored key.

    Returns:
        tuple[dict, int] | None: A tuple containing an error message and 401 status code
        if verification fails, None if verification succeeds.

    Note:
        This function is designed to be used as a Flask route decorator or pre-request check.

    """
    current_key = get_api_key()
    provided_key = request.headers.get("API-Key", "").strip()

    if not current_key or provided_key != current_key:
        return {"error": "Invalid API key"}, 401
    return None


def make_request(method, endpoint, api_key, data=None):
    """Makes an authenticated HTTP request to the API.

    Args:
        method (str): HTTP method (GET, POST, PUT, PATCH, DELETE).
        endpoint (str): API endpoint to call (e.g., '/users').
        api_key (str): API key for authentication.
        data (dict, optional): Payload for POST/PUT/PATCH requests. Defaults to None.

    Returns:
        dict | None: Parsed JSON response if successful (status code 200),
        None if the request fails or returns non-200 status.

    Raises:
        Prints error messages to console but doesn't raise exceptions to caller.

    """
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
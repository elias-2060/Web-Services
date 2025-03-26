import secrets
from flask import request

# Dictionary to store API keys and associated users
VALID_API_KEYS = ["7d6cbb373fde3004e19b40f41b77fd05ab3c4ebbdb8c38debab8dc204d1f217b",
                  "253e728f5c3233a96b9f34987abba31bfc76cd40ff32f4e63cc901ee16b768e4"]


def generate_api_key():
    """
        Generates a secure API key and stores it in the VALID_API_KEYS dictionary.

        Returns:
            str: The generated API key.
    """
    api_key = secrets.token_hex(32)  # 64-character secure key
    VALID_API_KEYS.append(api_key)  # Store the key
    return api_key


def verify_api_key():
    """
        Verifies if the API key provided in the request headers is valid.

        The function checks for the presence of an "API-Key" in the request headers.
        If the API key is missing or invalid, it returns a JSON response with an
        error message and a 401 Unauthorized status code.

        Returns:
            dict, int: A JSON response with an error message and HTTP status 401
                       if the API key is invalid.
            None: If the API key is valid, allowing further request processing.
    """
    api_key = request.headers.get("API-Key")
    if api_key not in VALID_API_KEYS:
        return {
                    "error": "Invalid API key",
                    "message": "You must be granted a valid key"
                }, 401
    return None

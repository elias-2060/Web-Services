"""
API Configuration Module

This module handles:
- Flask application initialization
- API documentation setup (Swagger/OpenAPI)
- External service configurations (TMDB, QuickChart)
- Caching configuration
- Rate limiting setup

Environment Variables:
    TMDB_API_KEY: API key for The Movie Database
"""

import os
import yaml
from flask import Flask
from flask_restful import Api
from flasgger import Swagger
from flask_caching import Cache
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

# Initialize Flask application
app = Flask(__name__)
api = Api(app)

# Swagger/OpenAPI Documentation Configuration
# ------------------------------------------
# Load API documentation from external YAML file for better maintainability
with open("swagger_docs.yml", "r") as file:
    swagger_template = yaml.safe_load(file)

# Initialize Swagger with custom template
swagger = Swagger(app, template=swagger_template)

# External Service Configurations
# ------------------------------
# The Movie Database (TMDB) API configuration
TMDB_API_KEY = os.getenv("TMDB_API_KEY", "2801197321e5eb6e35677a074ae45024")
TMDB_BASE_URL = "https://api.themoviedb.org/3"

# QuickChart.io configuration for generating charts
QUICKCHART_BASE_URL = "https://quickchart.io/chart"

# Caching Configuration
# --------------------
# Simple in-memory cache with 5 minute timeout
CACHE_TYPE = "simple"
CACHE_DEFAULT_TIMEOUT = 300
app.config["CACHE_TYPE"] = CACHE_TYPE
app.config["CACHE_DEFAULT_TIMEOUT"] = CACHE_DEFAULT_TIMEOUT
cache = Cache(app)

# Rate Limiting Configuration
# --------------------------
# Initialize Flask-Limiter with default rate limits
limiter = Limiter(
    get_remote_address,  # Uses client IP address for rate limiting
    app=app,
    default_limits=["100 per hour"]  # Global rate limit: 100 requests/hour/IP
)

# Custom rate limits for specific endpoints
RATE_LIMITS = {
    "default": "100 per hour",
    "random_movies": "10 per minute",
    "popular_movies": "10 per minute",
    "similar_genres": "100 per minute",
    "similar_runtime": "100 per minute",
    "movie_comparison": "100 per minute",
    "favorites": "100 per minute"
}
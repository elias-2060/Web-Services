import os
import yaml
from flask import Flask
from flask_restful import Api
from flasgger import Swagger
from flask_caching import Cache
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

# Initialize Flask app
app = Flask(__name__)
api = Api(app)

# Load Swagger documentation from an external YAML file
with open("swagger_docs.yml", "r") as file:
    swagger_template = yaml.safe_load(file)

# Initialize Swagger with external documentation
swagger = Swagger(app, template=swagger_template)

TMDB_API_KEY = os.getenv("TMDB_API_KEY", "2801197321e5eb6e35677a074ae45024")
TMDB_BASE_URL = "https://api.themoviedb.org/3"
QUICKCHART_BASE_URL = "https://quickchart.io/chart"

# Configure Flask-Caching
CACHE_TYPE = "simple"
CACHE_DEFAULT_TIMEOUT = 300
app.config["CACHE_TYPE"] = "simple"
app.config["CACHE_DEFAULT_TIMEOUT"] = 300  # Cache for 5 minutes
cache = Cache(app)

# Initialize Flask-Limiter
limiter = Limiter(
    get_remote_address,  # Uses client IP for rate limiting
    app=app,
    default_limits=["100 per hour"]  # Default: 100 requests per hour per IP
)

# Initialize the rare li
RATE_LIMITS = {
    "default": "100 per hour",
    "random_movies": "10 per minute",
    "popular_movies": "10 per minute",
    "similar_genres": "5 per minute",
    "similar_runtime": "5 per minute",
    "movie_comparison": "3 per minute",
    "favorites": "5 per minute"
}
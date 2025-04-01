from routes.movies import *
from config import *
from utils import *
from flask_cors import CORS
import argparse

# Set up argument parsing
parser = argparse.ArgumentParser(description='Movie Recommendation API')
parser.add_argument('--api-key', required=True, help='API key for authentication')
args = parser.parse_args()

# Store the API key
API_KEY = args.api_key
print(f"API started with key: {API_KEY}")

# Allow only my frontend's origin
CORS(app, resources={
    r"/movies/*": {
        "origins": ["http://localhost:3000"],
        "methods": ["GET", "POST", "DELETE"],
        "allow_headers": ["API-Key", "Content-Type"]
    }
})

# Register Routes
api.add_resource(RandomMovies, "/movies")
api.add_resource(PopularMovies, "/movies/popular")
api.add_resource(SimilarGenres, "/movies/<int:movie_id>/similar-genres")
api.add_resource(SimilarRuntime, "/movies/<int:movie_id>/similar-runtime")
api.add_resource(MovieComparison, "/movies/compare")
api.add_resource(FavoriteMovies, "/movies/favorites", "/movies/favorites/<int:movie_id>")

if __name__ == '__main__':
    app.run(debug=True)
from routes.movies import *
from config import *
from utils import *
from flask_cors import CORS

# Allow only your frontend's origin
CORS(app, resources={
    r"/movies/*": {
        "origins": ["http://localhost:3000", "http://your-production-domain.com"],
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
    # Generate an api key first so that we can access our endpoints
    # new_key = generate_api_key()
    # print(new_key)

    # Run the API
    app.run(debug=True)
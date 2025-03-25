from flask import Flask, request, jsonify
from flask_restful import Api, Resource
from flasgger import Swagger
import requests
import json
import random

app = Flask(__name__)
api = Api(app)
swagger = Swagger(app)

TMDB_API_KEY = "2801197321e5eb6e35677a074ae45024"
TMDB_BASE_URL = "https://api.themoviedb.org/3"
QUICKCHART_BASE_URL = "https://quickchart.io/chart"


# Endpoint to list random movies
class RandomMovies(Resource):
    def get(self):
        """
        Get a list of random movies
        ---
        tags:
          - Movies
        parameters:
          - name: n
            in: query
            type: integer
            required: true
            description: Number of random movies to list (1-20)
        responses:
          200:
            description: A list of random movies
            schema:
              type: array
              items:
                type: object
                properties:
                  title:
                    type: string
                  vote_average:
                    type: number
          400:
            description: Invalid parameter value
            schema:
              type: object
              properties:
                error:
                  type: string
                message:
                  type: string
          500:
            description: Internal server error when fetching movies
            schema:
              type: object
              properties:
                error:
                  type: string
                message:
                  type: string
        """
        try:
            n = int(request.args.get('n', 10))  # Default to 10 movies
            if not (1 <= n <= 20):
                return {
                    "error": "invalid_parameter",
                    "message": "n must be between 1 and 20"
                }, 400

            # Get a random page
            random_page = random.randint(1, 500)
            response = requests.get(
                f"{TMDB_BASE_URL}/discover/movie?api_key={TMDB_API_KEY}&language=en-US&page={random_page}")
            data = response.json()

            # Shuffle and return a random selection
            movies = data.get('results', [])
            if not movies:
                return {
                    "error": "no_movies_found",
                    "message": "No movies found in the random selection"
                }, 404

            random.shuffle(movies)
            return jsonify(movies[:n])
        except Exception as e:
            return {
                "error": "server_error",
                "message": f"An error occurred while fetching random movies: {str(e)}"
            }, 500


# Endpoint to list popular movies
class PopularMovies(Resource):
    def get(self):
        """
        Get a list of popular movies
        ---
        tags:
          - Movies
        parameters:
          - name: n
            in: query
            type: integer
            required: true
            description: Number of movies to list (1-20)
        responses:
          200:
            description: A list of popular movies
            schema:
              type: array
              items:
                type: object
                properties:
                  title:
                    type: string
                  vote_average:
                    type: number
          400:
            description: Invalid parameter value
            schema:
              type: object
              properties:
                error:
                  type: string
                message:
                  type: string
          404:
            description: No popular movies found
            schema:
              type: object
              properties:
                error:
                  type: string
                message:
                  type: string
          500:
            description: Internal server error
            schema:
              type: object
              properties:
                error:
                  type: string
                message:
                  type: string
        """
        try:
            n = int(request.args.get('n', 10))
            if not (1 <= n <= 20):
                return {
                    "error": "invalid_parameter",
                    "message": "n must be between 1 and 20"
                }, 400

            response = requests.get(f"{TMDB_BASE_URL}/movie/popular?api_key={TMDB_API_KEY}&language=en-US&page=1")
            data = response.json()

            if not data.get('results'):
                return {
                    "error": "no_movies_found",
                    "message": "No popular movies found"
                }, 404

            return jsonify(data['results'][:n])
        except Exception as e:
            return {
                "error": "server_error",
                "message": f"An error occurred while fetching popular movies: {str(e)}"
            }, 500


# Endpoint to find movies with similar genres
class SimilarGenres(Resource):
    def get(self, movie_id):
        """
        Get movies with similar genres to a specific movie
        ---
        tags:
          - Movies
        parameters:
          - name: movie_id
            in: path
            type: integer
            required: true
            description: The movie ID to search for similar genres
        responses:
          200:
            description: A list of movies with similar genres
            schema:
              type: array
              items:
                type: object
                properties:
                  title:
                    type: string
                  genre_ids:
                    type: array
                    items:
                      type: integer
          400:
            description: Invalid movie ID or no genres found
            schema:
              type: object
              properties:
                error:
                  type: string
                message:
                  type: string
          404:
            description: Movie not found
            schema:
              type: object
              properties:
                error:
                  type: string
                message:
                  type: string
          500:
            description: Internal server error
            schema:
              type: object
              properties:
                error:
                  type: string
                message:
                  type: string
        """
        try:
            response = requests.get(f"{TMDB_BASE_URL}/movie/{movie_id}?api_key={TMDB_API_KEY}")
            if response.status_code == 404:
                return {
                    "error": "movie_not_found",
                    "message": f"Movie with ID {movie_id} not found"
                }, 404

            data = response.json()
            genres = [genre['id'] for genre in data.get('genres', [])]

            if not genres:
                return {
                    "error": "no_genres_found",
                    "message": f"No genres found for movie ID {movie_id}"
                }, 400

            genre_query = ','.join(map(str, genres))
            response = requests.get(f"{TMDB_BASE_URL}/discover/movie?api_key={TMDB_API_KEY}&with_genres={genre_query}")
            results = response.json().get('results', [])

            if not results:
                return {
                    "error": "no_similar_movies",
                    "message": f"No movies found with similar genres to movie ID {movie_id}"
                }, 404

            return jsonify(results)
        except Exception as e:
            return {
                "error": "server_error",
                "message": f"An error occurred while fetching similar genres: {str(e)}"
            }, 500


# Endpoint to find movies with a similar runtime
class SimilarRuntime(Resource):
    def get(self, movie_id):
        """
        Get movies with similar runtime to a specific movie
        ---
        tags:
          - Movies
        parameters:
          - name: movie_id
            in: path
            type: integer
            required: true
            description: The movie ID to search for similar runtime
        responses:
          200:
            description: A list of movies with similar runtime
            schema:
              type: array
              items:
                type: object
                properties:
                  title:
                    type: string
                  runtime:
                    type: integer
          400:
            description: Invalid movie ID or runtime not found
            schema:
              type: object
              properties:
                error:
                  type: string
                message:
                  type: string
          404:
            description: Movie not found
            schema:
              type: object
              properties:
                error:
                  type: string
                message:
                  type: string
          500:
            description: Internal server error
            schema:
              type: object
              properties:
                error:
                  type: string
                message:
                  type: string
        """
        try:
            response = requests.get(f"{TMDB_BASE_URL}/movie/{movie_id}?api_key={TMDB_API_KEY}")
            if response.status_code == 404:
                return {
                    "error": "movie_not_found",
                    "message": f"Movie with ID {movie_id} not found"
                }, 404

            data = response.json()
            runtime = data.get('runtime')

            if runtime is None:
                return {
                    "error": "runtime_not_found",
                    "message": f"Runtime not found for movie ID {movie_id}"
                }, 400

            min_runtime, max_runtime = runtime - 10, runtime + 10
            response = requests.get(
                f"{TMDB_BASE_URL}/discover/movie?api_key={TMDB_API_KEY}&with_runtime.gte={min_runtime}&with_runtime.lte={max_runtime}")
            results = response.json().get('results', [])

            if not results:
                return {
                    "error": "no_similar_runtime_movies",
                    "message": f"No movies found with similar runtime to movie ID {movie_id}"
                }, 404

            return jsonify(results)
        except Exception as e:
            return {
                "error": "server_error",
                "message": f"An error occurred while fetching similar runtime movies: {str(e)}"
            }, 500


# Endpoint to generate a bar plot comparing movie scores
class MovieComparison(Resource):
    def post(self):
        """
        Generate a comparison chart for movies based on their scores
        ---
        tags:
          - Movies
        parameters:
          - name: body
            in: body
            required: true
            schema:
              type: object
              properties:
                movie_ids:
                  type: array
                  items:
                    type: integer
        responses:
          200:
            description: URL of the generated chart
            schema:
              type: object
              properties:
                chart_url:
                  type: string
          400:
            description: Invalid request or no movie IDs provided
            schema:
              type: object
              properties:
                error:
                  type: string
                message:
                  type: string
          404:
            description: One or more movies not found
            schema:
              type: object
              properties:
                error:
                  type: string
                message:
                  type: string
                not_found_ids:
                  type: array
                  items:
                    type: integer
          500:
            description: Internal server error
            schema:
              type: object
              properties:
                error:
                  type: string
                message:
                  type: string
        """
        try:
            if not request.json or 'movie_ids' not in request.json:
                return {
                    "error": "invalid_request",
                    "message": "Request body must contain movie_ids array"
                }, 400

            movie_ids = request.json.get('movie_ids', [])
            if not movie_ids:
                return {
                    "error": "no_movie_ids",
                    "message": "No movie IDs provided"
                }, 400

            movie_data = []
            not_found_ids = []

            for movie_id in movie_ids:
                response = requests.get(f"{TMDB_BASE_URL}/movie/{movie_id}?api_key={TMDB_API_KEY}")
                if response.status_code == 404:
                    not_found_ids.append(movie_id)
                    continue

                data = response.json()
                if 'vote_average' in data:
                    movie_data.append({"title": data['title'], "score": data['vote_average']})

            if not_found_ids:
                return {
                    "error": "movies_not_found",
                    "message": "Some movies were not found",
                    "not_found_ids": not_found_ids
                }, 404

            if not movie_data:
                return {
                    "error": "no_valid_movies",
                    "message": "No valid movies found with score data"
                }, 400

            chart_data = {
                "type": "bar",
                "data": {
                    "labels": [m["title"] for m in movie_data],
                    "datasets": [{"label": "Score", "data": [m["score"] for m in movie_data]}],
                },
            }
            chart_url = f"{QUICKCHART_BASE_URL}?c={json.dumps(chart_data)}"
            return jsonify({"chart_url": chart_url})
        except Exception as e:
            return {
                "error": "server_error",
                "message": f"An error occurred while generating comparison chart: {str(e)}"
            }, 500


# Endpoint to manage favorite movies
favorites = []


class FavoriteMovies(Resource):
    def post(self, movie_id):
        """
        Add a movie to favorites
        ---
        tags:
          - Movies
        parameters:
          - name: movie_id
            in: path
            type: integer
            required: true
            description: The movie ID to add to favorites
        responses:
          200:
            description: Movie added to favorites
            schema:
              type: object
              properties:
                message:
                  type: string
                favorites:
                  type: array
                  items:
                    type: integer
          201:
            description: Movie successfully added to favorites
            schema:
              type: object
              properties:
                message:
                  type: string
                favorites:
                  type: array
                  items:
                    type: integer
          400:
            description: Movie already in favorites
            schema:
              type: object
              properties:
                error:
                  type: string
                message:
                  type: string
                favorites:
                  type: array
                  items:
                    type: integer
          404:
            description: Movie not found
            schema:
              type: object
              properties:
                error:
                  type: string
                message:
                  type: string
          500:
            description: Internal server error
            schema:
              type: object
              properties:
                error:
                  type: string
                message:
                  type: string
        """
        try:
            # First verify the movie exists
            response = requests.get(f"{TMDB_BASE_URL}/movie/{movie_id}?api_key={TMDB_API_KEY}")
            if response.status_code == 404:
                return {
                    "error": "movie_not_found",
                    "message": f"Movie with ID {movie_id} not found"
                }, 404

            if movie_id in favorites:
                return {
                    "error": "movie_already_favorited",
                    "message": f"Movie with ID {movie_id} is already in favorites",
                    "favorites": favorites
                }, 400

            favorites.append(movie_id)
            return {
                "message": f"Movie with ID {movie_id} successfully added to favorites",
                "favorites": favorites
            }, 201
        except Exception as e:
            return {
                "error": "server_error",
                "message": f"An error occurred while adding to favorites: {str(e)}"
            }, 500

    def delete(self, movie_id):
        """
        Remove a movie from favorites
        ---
        tags:
          - Movies
        parameters:
          - name: movie_id
            in: path
            type: integer
            required: true
            description: The movie ID to remove from favorites
        responses:
          200:
            description: Movie removed from favorites
            schema:
              type: object
              properties:
                message:
                  type: string
                favorites:
                  type: array
                  items:
                    type: integer
          204:
            description: Movie not in favorites (no action taken)
            schema:
              type: object
              properties:
                message:
                  type: string
                favorites:
                  type: array
                  items:
                    type: integer
          404:
            description: Movie not found in favorites
            schema:
              type: object
              properties:
                error:
                  type: string
                message:
                  type: string
                favorites:
                  type: array
                  items:
                    type: integer
          500:
            description: Internal server error
            schema:
              type: object
              properties:
                error:
                  type: string
                message:
                  type: string
        """
        try:
            if movie_id not in favorites:
                return {
                    "error": "movie_not_in_favorites",
                    "message": f"Movie with ID {movie_id} not found in favorites",
                    "favorites": favorites
                }, 404

            favorites.remove(movie_id)
            return {
                "message": f"Movie with ID {movie_id} removed from favorites",
                "favorites": favorites
            }, 200
        except Exception as e:
            return {
                "error": "server_error",
                "message": f"An error occurred while removing from favorites: {str(e)}"
            }, 500

    def get(self):
        """
        Get a list of all favorite movies
        ---
        tags:
          - Movies
        responses:
          200:
            description: List of favorite movies
            schema:
              type: object
              properties:
                favorites:
                  type: array
                  items:
                    type: integer
          404:
            description: No favorites found
            schema:
              type: object
              properties:
                error:
                  type: string
                message:
                  type: string
          500:
            description: Internal server error
            schema:
              type: object
              properties:
                error:
                  type: string
                message:
                  type: string
        """
        try:
            if not favorites:
                return {
                    "error": "no_favorites",
                    "message": "No favorite movies found"
                }, 404

            return {"favorites": favorites}
        except Exception as e:
            return {
                "error": "server_error",
                "message": f"An error occurred while fetching favorites: {str(e)}"
            }, 500


api.add_resource(RandomMovies, "/movies")
api.add_resource(PopularMovies, "/movies/popular")
api.add_resource(SimilarGenres, "/movies/<int:movie_id>/similar-genres")
api.add_resource(SimilarRuntime, "/movies/<int:movie_id>/similar-runtime")
api.add_resource(MovieComparison, "/movies/compare")
api.add_resource(FavoriteMovies, "/movies/favorites", "/movies/favorites/<int:movie_id>")

if __name__ == '__main__':
    app.run(debug=True)
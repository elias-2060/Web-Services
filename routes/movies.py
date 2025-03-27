import random
import requests
from flask import jsonify, request
from flask_restful import Resource
from config import *
from utils import verify_api_key
import json


# Endpoint to list random movies
class RandomMovies(Resource):
    @cache.cached(timeout=300, query_string=True)  # Cache based on query parameters
    @limiter.limit(RATE_LIMITS["random_movies"])  # Max 10 requests per minute
    def get(self):
        # Verify API Key
        auth_error = verify_api_key()
        if auth_error:
            return auth_error

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
    @cache.cached(timeout=300, query_string=True)  # Cache based on query parameters
    @limiter.limit(RATE_LIMITS["popular_movies"])  # Max 10 requests per minute
    def get(self):
        # Verify API Key
        auth_error = verify_api_key()
        if auth_error:
            return auth_error

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
    @cache.cached(timeout=300)  # Cache for 5 minutes
    @limiter.limit(RATE_LIMITS["similar_genres"])  # Max 5 requests per minute
    def get(self, movie_id):
        # Verify API Key
        auth_error = verify_api_key()
        if auth_error:
            return auth_error

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
    @cache.cached(timeout=300)  # Cache for 5 minutes
    @limiter.limit(RATE_LIMITS["similar_runtime"])  # Max 5 requests per minute
    def get(self, movie_id):
        # Verify API Key
        auth_error = verify_api_key()
        if auth_error:
            return auth_error

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
    @cache.cached(timeout=600)  # Cache for 10 minutes
    @limiter.limit(RATE_LIMITS["movie_comparison"])  # Max 3 requests per minute
    def post(self):
        # Verify API Key
        auth_error = verify_api_key()
        if auth_error:
            return auth_error

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
    @limiter.limit(RATE_LIMITS["favorites"])
    def post(self, movie_id):
        # Verify API Key
        auth_error = verify_api_key()
        if auth_error:
            return auth_error

        try:
            # First verify the movie exists
            response = requests.get(f"{TMDB_BASE_URL}/movie/{movie_id}?api_key={TMDB_API_KEY}")
            if response.status_code == 404:
                return {
                    "error": "movie_not_found",
                    "message": f"Movie with ID {movie_id} not found"
                }, 404

            # Check if movie already favorited
            if any(movie['id'] == movie_id for movie in favorites):
                return {
                    "error": "movie_already_favorited",
                    "message": f"Movie with ID {movie_id} is already in favorites",
                    "favorites": favorites
                }, 400

            # Add full movie details to favorites
            movie_data = response.json()
            favorites.append(movie_data)

            return {
                "message": f"Movie '{movie_data.get('title')}' successfully added to favorites",
                "favorites": favorites
            }, 200
        except Exception as e:
            return {
                "error": "server_error",
                "message": f"An error occurred while adding to favorites: {str(e)}"
            }, 500

    @limiter.limit("5 per minute")
    def delete(self, movie_id):
        # Verify API Key
        auth_error = verify_api_key()
        if auth_error:
            return auth_error

        try:
            # Find the movie in favorites
            movie_to_remove = next((movie for movie in favorites if movie['id'] == movie_id), None)

            if not movie_to_remove:
                return {
                    "error": "movie_not_in_favorites",
                    "message": f"Movie with ID {movie_id} not found in favorites",
                    "favorites": favorites
                }, 404

            favorites.remove(movie_to_remove)
            return {
                "message": f"Movie '{movie_to_remove.get('title')}' removed from favorites",
                "favorites": favorites
            }, 200
        except Exception as e:
            return {
                "error": "server_error",
                "message": f"An error occurred while removing from favorites: {str(e)}"
            }, 500

    @limiter.limit("5 per minute")
    def get(self):
        # Verify API Key
        auth_error = verify_api_key()
        if auth_error:
            return auth_error

        try:
            if not favorites:
                return {
                    "error": "no_favorites",
                    "message": "No favorite movies found"
                }, 404

            return jsonify(favorites)
        except Exception as e:
            return {
                "error": "server_error",
                "message": f"An error occurred while fetching favorites: {str(e)}"
            }, 500

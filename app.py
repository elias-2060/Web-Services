from flask import Flask, request, jsonify
from flask_restful import Api, Resource
from flasgger import Swagger
import requests
import json

app = Flask(__name__)
api = Api(app)
swagger = Swagger(app)

TMDB_API_KEY = "YOUR_TMDB_API_KEY"
TMDB_BASE_URL = "https://api.themoviedb.org/3"
QUICKCHART_BASE_URL = "https://quickchart.io/chart"


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
        """
        n = int(request.args.get('n', 10))
        if not (1 <= n <= 20):
            return {"error": "n must be between 1 and 20"}, 400
        response = requests.get(f"{TMDB_BASE_URL}/movie/popular?api_key={TMDB_API_KEY}&language=en-US&page=1")
        data = response.json()
        return jsonify(data['results'][:n])


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
        """
        response = requests.get(f"{TMDB_BASE_URL}/movie/{movie_id}?api_key={TMDB_API_KEY}")
        data = response.json()
        genres = [genre['id'] for genre in data.get('genres', [])]
        if not genres:
            return {"error": "No genres found"}, 400
        genre_query = ','.join(map(str, genres))
        response = requests.get(f"{TMDB_BASE_URL}/discover/movie?api_key={TMDB_API_KEY}&with_genres={genre_query}")
        return jsonify(response.json().get('results', []))


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
        """
        response = requests.get(f"{TMDB_BASE_URL}/movie/{movie_id}?api_key={TMDB_API_KEY}")
        data = response.json()
        runtime = data.get('runtime')
        if runtime is None:
            return {"error": "Runtime not found"}, 400
        min_runtime, max_runtime = runtime - 10, runtime + 10
        response = requests.get(
            f"{TMDB_BASE_URL}/discover/movie?api_key={TMDB_API_KEY}&with_runtime.gte={min_runtime}&with_runtime.lte={max_runtime}")
        return jsonify(response.json().get('results', []))


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
        """
        movie_ids = request.json.get('movie_ids', [])
        if not movie_ids:
            return {"error": "No movie IDs provided"}, 400
        movie_data = []
        for movie_id in movie_ids:
            response = requests.get(f"{TMDB_BASE_URL}/movie/{movie_id}?api_key={TMDB_API_KEY}")
            data = response.json()
            if 'vote_average' in data:
                movie_data.append({"title": data['title'], "score": data['vote_average']})
        chart_data = {
            "type": "bar",
            "data": {
                "labels": [m["title"] for m in movie_data],
                "datasets": [{"label": "Score", "data": [m["score"] for m in movie_data]}],
            },
        }
        chart_url = f"{QUICKCHART_BASE_URL}?c={json.dumps(chart_data)}"
        return jsonify({"chart_url": chart_url})


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
        """
        if movie_id not in favorites:
            favorites.append(movie_id)
        return {"message": "Movie added to favorites", "favorites": favorites}

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
        """
        if movie_id in favorites:
            favorites.remove(movie_id)
        return {"message": "Movie removed from favorites", "favorites": favorites}

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
        """
        return {"favorites": favorites}


api.add_resource(PopularMovies, "/movies/popular")
api.add_resource(SimilarGenres, "/movies/similar_genres/<int:movie_id>")
api.add_resource(SimilarRuntime, "/movies/similar_runtime/<int:movie_id>")
api.add_resource(MovieComparison, "/movies/compare")
api.add_resource(FavoriteMovies, "/movies/favorites", "/movies/favorites/<int:movie_id>")

if __name__ == '__main__':
    app.run(debug=True)

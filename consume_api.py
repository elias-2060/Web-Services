"""
API Client Testing Script

This script tests all major functionalities of the Movie Recommendation API:
1. Popular movies listing
2. Genre-based recommendations
3. Runtime-based recommendations
4. Movie comparison visualization
5. Favorites management

Usage:
    python consume_api.py --api-key <your_api_key>

Requirements:
    - Python 3.6+
    - requests library (install via pip install requests)
"""

import argparse
from utils import *


def test_functionality_1(api_key, n=5):
    """Test Popular Movies Endpoint

    Tests the /movies/popular endpoint by retrieving and displaying the first n popular movies.

    Args:
        api_key (str): Valid API key for authentication
        n (int): Number of popular movies to retrieve (default: 5)
    """
    print("\n=== Testing Functionality 1: List the first n popular movies ===")
    result = make_request('GET', f"/movies/popular?n={n}", api_key)
    if result:
        print(f"Success! Retrieved {len(result)} popular movies:")
        for idx, movie in enumerate(result, 1):
            print(f"{idx}. {movie.get('title')} (ID: {movie.get('id')})")


def test_functionality_2(api_key, movie_id):
    """Test Genre-Based Recommendations

    Tests the /movies/{id}/similar-genres endpoint by finding movies with matching genres.

    Args:
        api_key (str): Valid API key for authentication
        movie_id (int): TMDB movie ID to find similar genres for
    """
    print(
        "\n=== Testing Functionality 2: Given a movie, return a list of movies that have all its genres in common ===")
    result = make_request('GET', f"/movies/{movie_id}/similar-genres", api_key)
    if result:
        print(f"Success! Movies with similar genres to movie ID {movie_id}:")
        for idx, movie in enumerate(result, 1):
            print(f"{idx}. {movie.get('title')} (ID: {movie.get('id')})")


def test_functionality_3(api_key, movie_id):
    """Test Runtime-Based Recommendations

    Tests the /movies/{id}/similar-runtime endpoint by finding movies with similar runtimes.

    Args:
        api_key (str): Valid API key for authentication
        movie_id (int): TMDB movie ID to find similar runtime movies for
    """
    print("\n=== Testing Functionality 3: Given a movie, return the movies with a similar runtime ===")
    result = make_request('GET', f"/movies/{movie_id}/similar-runtime", api_key)
    if result:
        print(f"Success! Movies with similar runtime to movie ID {movie_id}:")
        for idx, movie in enumerate(result, 1):
            print(f"{idx}. {movie.get('title')} (ID: {movie.get('id')})")


def test_functionality_4(api_key, movie_ids):
    """Test Movie Comparison Visualization

    Tests the /movies/compare endpoint by generating a bar chart comparing movie ratings.

    Args:
        api_key (str): Valid API key for authentication
        movie_ids (list): List of TMDB movie IDs to compare
    """
    print(
        "\n=== Testing Functionality 4: Given a set of movies, generate a bar plot comparing the average score of these movies ===")
    result = make_request('POST', "/movies/compare", api_key, {"movie_ids": movie_ids})
    if result:
        print(f"Success! Chart URL: {result.get('chart_url')}")
        print("Open this URL in a browser to view the comparison chart.")


def test_functionality_5(api_key):
    """Test Favorites Management

    Tests the complete favorites workflow:
    - Adding movies to favorites
    - Listing favorites
    - Removing from favorites

    Args:
        api_key (str): Valid API key for authentication
    """
    print(
        "\n=== Testing Functionality 5: Favorite/unfavorite movies and retrieve a list of currently favorite movies ===")

    # Test movies (The Shawshank Redemption and Pulp Fiction)
    movie_id_1 = 278  # The Shawshank Redemption
    movie_id_2 = 560  # Pulp Fiction

    # Add to favorites
    print("\nAdding movies to favorites...")
    result_1 = make_request('POST', f"/movies/favorites/{movie_id_1}", api_key)
    result_2 = make_request('POST', f"/movies/favorites/{movie_id_2}", api_key)
    if result_1:
        print(f"Success! {result_1.get('message')}")
    if result_2:
        print(f"Success! {result_2.get('message')}")

    # List favorites
    print("\nListing favorite movies...")
    result = make_request('GET', "/movies/favorites", api_key)
    if result:
        print("Success! Current favorites:")
        for idx, movie in enumerate(result, 1):
            print(f"{idx}. {movie.get('title')} (ID: {movie.get('id')})")

    # Remove from favorites
    print("\nRemoving movie from favorites...")
    result = make_request('DELETE', f"/movies/favorites/{movie_id_1}", api_key)
    if result:
        print(f"Success! {result.get('message')}")

    # Verify removal
    print("\nListing favorite movies after removal...")
    result = make_request('GET', "/movies/favorites", api_key)
    if result:
        print("Success! Current favorites:")
        for idx, movie in enumerate(result, 1):
            print(f"{idx}. {movie.get('title')} (ID: {movie.get('id')})")


def main():
    """Main execution function

    Parses command line arguments and executes all test functionalities.
    """
    parser = argparse.ArgumentParser(
        description="Test script for Movie Recommendation API",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter
    )
    parser.add_argument(
        '--api-key',
        required=True,
        help="Your API key for authentication"
    )
    args = parser.parse_args()

    print("Starting API consumption tests...")

    # Execute all test functionalities
    test_functionality_1(args.api_key, 5)  # Get 5 popular movies
    test_functionality_2(args.api_key, 278)  # Similar genres to The Shawshank Redemption
    test_functionality_3(args.api_key, 238)  # Similar runtime to The Godfather
    test_functionality_4(args.api_key, [278, 238, 550, 680])  # Compare movies
    test_functionality_5(args.api_key)  # Test favorites functionality


if __name__ == "__main__":
    main()
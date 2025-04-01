import argparse
from utils import *


def test_functionality_1(api_key, n=5):
    """Test Functionality 1: List the first n popular movies"""
    print("\n=== Testing Functionality 1: List the first n popular movies ===")
    result = make_request('GET', f"/movies/popular?n={n}", api_key)
    if result:
        print(f"Success! Retrieved {len(result)} popular movies:")
        for idx, movie in enumerate(result, 1):
            print(f"{idx}. {movie.get('title')} (ID: {movie.get('id')})")


def test_functionality_2(api_key, movie_id):
    """Test Functionality 2:  Given a movie, return a list of movies that have all its genres in common"""
    print("\n=== Testing Functionality 2: Given a movie, return a list of movies that have all its genres in common ===")
    result = make_request('GET', f"/movies/{movie_id}/similar-genres", api_key)
    if result:
        print(f"Success! Movies with similar genres to movie ID {movie_id}:")
        for idx, movie in enumerate(result, 1):
            print(f"{idx}. {movie.get('title')} (ID: {movie.get('id')})")


def test_functionality_3(api_key, movie_id):
    """Test Functionality 3: Given a movie, return the movies with a similar runtime"""
    print("\n=== Testing Functionality 3: Given a movie, return the movies with a similar runtime ===")
    result = make_request('GET', f"/movies/{movie_id}/similar-runtime", api_key)
    if result:
        print(f"Success! Movies with similar runtime to movie ID {movie_id}:")
        for idx, movie in enumerate(result, 1):
            print(f"{idx}. {movie.get('title')} (ID: {movie.get('id')})")


def test_functionality_4(api_key, movie_ids):
    """Test Functionality 4: Given a set of movies, generate a bar plot comparing
the average score of these movies."""
    print("\n=== Testing Functionality 4: Given a set of movies, generate a bar plot comparing the average score of these movies ===")
    result = make_request('POST', "/movies/compare", api_key, {"movie_ids": movie_ids})
    if result:
        print(f"Success! Chart URL: {result.get('chart_url')}")
        print("Open this URL in a browser to view the comparison chart.")


def test_functionality_5(api_key):
    """Test Functionality 5: Favorite/unfavorite movies and retrieve favorites"""
    print("\n=== Testing Functionality 5: Favorite/unfavorite movies and retrieve a list of currently favorite movies ===")

    # Test movie to favorite (The Shawshank Redemption)
    movie_id_1 = 278
    movie_id_2 = 560

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
        if result:
            print("Success! Current favorites:")
            for idx, movie in enumerate(result, 1):
                print(f"{idx}. {movie.get('title')} (ID: {movie.get('id')})")
        else:
            print("No favorites found")

    # Remove from favorites
    print("\nRemoving movie from favorites...")
    result = make_request('DELETE', f"/movies/favorites/{movie_id_1}", api_key)
    if result:
        print(f"Success! {result.get('message')}")

    # List favorites
    print("\nListing favorite movies...")
    result = make_request('GET', "/movies/favorites", api_key)
    if result:
        if result:
            print("Success! Current favorites:")
            for idx, movie in enumerate(result, 1):
                print(f"{idx}. {movie.get('title')} (ID: {movie.get('id')})")
        else:
            print("No favorites found")


def main():
    parser = argparse.ArgumentParser(description="Test script for Movie Recommendation API")
    parser.add_argument('--api-key', required=True, help="Your API key for authentication")
    args = parser.parse_args()

    print("Starting API consumption tests...")

    # Test all functionalities
    test_functionality_1(args.api_key, 5)  # Get 5 popular movies
    test_functionality_2(args.api_key, 278)  # Similar genres to The Shawshank Redemption (ID: 278)
    test_functionality_3(args.api_key, 238)  # Similar runtime to The Godfather (ID: 238)
    test_functionality_4(args.api_key, [278, 238, 550, 680])  # Compare these movies
    test_functionality_5(args.api_key)  # Test favorites functionality


if __name__ == "__main__":
    main()
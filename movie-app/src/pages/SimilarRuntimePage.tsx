/**
 * SimilarRuntimePage Component
 *
 * Allows users to find movies with similar runtime to a specified movie ID.
 *
 * Features:
 * - Movie ID input with validation
 * - Persistent storage of last used ID
 * - Configurable result count
 * - Favorite status indicators
 * - Loading and error states
 *
 * URL Parameters:
 * - movieId: Pre-fills the movie ID from URL if provided
 *
 * State Management:
 * @state {Movie[]} movies - Similar movies list
 * @state {number[]} favorites - IDs of favorite movies
 * @state {boolean} isLoading - Loading state
 * @state {string|null} error - Error message
 * @state {string} movieId - Current input value
 * @state {number|null} submittedId - Currently displayed movie ID
 * @state {number} count - Number of movies to display
 * @state {string|null} favoritesError - Favorites-specific error
 *
 * Dependencies:
 * - react-router-dom for routing and search params
 * - ../services/api for data fetching
 * - ../components/MovieList for displaying movies
 */

import React, { useEffect, useState } from 'react';
import { fetchSimilarRuntime, fetchFavorites } from '../services/api';
import MovieList from '../components/MovieList';
import { Movie } from '../types/movie';
import { useSearchParams } from 'react-router-dom';

const SimilarRuntimePage: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [movieId, setMovieId] = useState<string>('');
  const [submittedId, setSubmittedId] = useState<number | null>(null);
  const [count, setCount] = useState(20);
  const [favoritesError, setFavoritesError] = useState<string | null>(null);
  const [searchParams] = useSearchParams();

  /**
   * Loads movie ID from URL or localStorage on component mount
   */
  useEffect(() => {
    const urlMovieId = searchParams.get('movieId');
    if (urlMovieId) {
      setMovieId(urlMovieId);
      setSubmittedId(Number(urlMovieId));
      localStorage.setItem('lastSimilarRuntimeMovieId', urlMovieId);
      return;
    }

    const savedId = localStorage.getItem('lastSimilarRuntimeMovieId');
    if (savedId) {
      setMovieId(savedId);
      setSubmittedId(Number(savedId));
    }
  }, [searchParams]);

  /**
   * Handles form submission for movie ID input
   * @param {React.FormEvent} e - Form event
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = parseInt(movieId);
    if (!isNaN(id) && id > 0) {
      setSubmittedId(id);
      localStorage.setItem('lastSimilarRuntimeMovieId', id.toString());
    } else {
      setError('Please enter a valid movie ID (positive number)');
    }
  };

  /**
   * Refreshes the favorites list
   */
  const refreshFavorites = async () => {
    try {
      const favoriteMovies = await fetchFavorites();
      setFavorites(favoriteMovies.map(movie => movie.id));
      setFavoritesError(null);
    } catch (err) {
      console.error('Failed to refresh favorites:', err);
      setFavoritesError('Failed to update favorites. Please try again.');
    }
  };

  /**
   * Loads similar movies when submittedId changes
   */
  useEffect(() => {
    if (submittedId === null) return;

    const loadMovies = async () => {
      try {
        setIsLoading(true);
        setError(null);
        setFavoritesError(null);

        // Parallel loading of similar movies and favorites
        const [data, favoriteMovies] = await Promise.all([
          fetchSimilarRuntime(submittedId),
          fetchFavorites().catch(err => {
            console.error('Failed to load favorites:', err);
            setFavoritesError('Failed to load favorites. You may need to refresh.');
            return [];
          })
        ]);

        setMovies(data.slice(0, count));
        setFavorites(favoriteMovies.map(movie => movie.id));
      } catch (err) {
        setError('Failed to load similar movies. Please check the movie ID and try again.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadMovies();
  }, [submittedId, count]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
        <button
          onClick={() => setError(null)}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          aria-label="Clear error and try again"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Find Movies with Similar Runtime</h1>
        {submittedId && (
          <div className="flex items-center">
            <span className="mr-2">Show:</span>
            <select
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="border rounded px-3 py-1"
              aria-label="Number of movies to display"
            >
              <option value={8}>8</option>
              <option value={12}>12</option>
              <option value={16}>16</option>
              <option value={20}>20</option>
            </select>
            <span className="ml-2">movies</span>
          </div>
        )}
      </div>

      {favoritesError && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4" role="alert">
          <strong className="font-bold">Note:</strong>
          <span className="block sm:inline"> {favoritesError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mb-8">
        <div className="flex items-center">
          <label htmlFor="movieId" className="mr-2">
            Enter Movie ID:
          </label>
          <input
            type="text"
            id="movieId"
            value={movieId}
            onChange={(e) => setMovieId(e.target.value)}
            className="border rounded px-3 py-1 mr-2"
            placeholder="e.g., 123"
            aria-label="Enter movie ID to find similar runtime"
          />
          <button
            type="submit"
            className="px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 mr-2"
            aria-label="Search for similar movies"
          >
            Search
          </button>
          {submittedId && (
            <button
              type="button"
              onClick={() => {
                localStorage.removeItem('lastSimilarRuntimeMovieId');
                setMovieId('');
                setSubmittedId(null);
                setMovies([]);
              }}
              className="px-4 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
              aria-label="Clear current search"
            >
              Clear
            </button>
          )}
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Find the movie ID in the movie details.
        </p>
      </form>

      {submittedId && (
        <div className="mb-4">
          <h2 className="text-xl font-semibold">
            Movies with runtime similar to Movie ID: {submittedId}
          </h2>
        </div>
      )}

      <MovieList
        movies={movies}
        favorites={favorites}
        onFavoriteUpdate={refreshFavorites}
      />

      {submittedId && movies.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <p className="text-xl text-gray-600">No similar movies found for this ID.</p>
          <button
            onClick={() => setSubmittedId(null)}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            aria-label="Try another movie ID"
          >
            Try Another ID
          </button>
        </div>
      )}
    </div>
  );
};

export default SimilarRuntimePage;
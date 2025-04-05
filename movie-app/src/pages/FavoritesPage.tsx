/**
 * FavoritesPage Component
 *
 * Displays a user's favorite movies with the following features:
 * - Loads and displays favorited movies
 * - Handles loading and error states
 * - Shows empty state when no favorites exist
 * - Automatically refreshes when favorites change
 *
 * State Management:
 * @state {Movie[]} favoriteMovies - Array of favorite movie objects
 * @state {boolean} isLoading - Loading state during data fetch
 * @state {string|null} error - Error message if loading fails
 *
 * Dependencies:
 * - ../services/api for fetchFavorites function
 * - ../components/MovieList for displaying movies
 */

import React, { useEffect, useState } from 'react';
import { fetchFavorites } from '../services/api';
import MovieList from '../components/MovieList';
import { Movie } from '../types/movie';

const FavoritesPage: React.FC = () => {
  const [favoriteMovies, setFavoriteMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Loads favorite movies from API
   */
  const loadFavorites = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const favorites = await fetchFavorites();
      setFavoriteMovies(favorites);
    } catch (err: any) {
      if (err.response?.status === 500) {
        setError('Failed to load favorites');
        console.error(err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Load favorites on component mount
  useEffect(() => {
    loadFavorites();
  }, []);

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
          <button
            onClick={() => setError(null)}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            aria-label="Retry loading favorites"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Favorite Movies</h1>
        {favoriteMovies.length > 0 && (
          <div className="text-gray-500">
            {favoriteMovies.length} {favoriteMovies.length === 1 ? 'movie' : 'movies'}
          </div>
        )}
      </div>

      {/* Empty state */}
      {favoriteMovies.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-xl text-gray-600 mb-4">You haven't added any favorites yet.</p>
          <p className="text-gray-500">Browse movies and click the ♥ icon to add them to your favorites.</p>
        </div>
      ) : (
        <MovieList
          movies={favoriteMovies}
          favorites={favoriteMovies.map(movie => movie.id)}
          onFavoriteUpdate={loadFavorites}
        />
      )}
    </div>
  );
};

export default FavoritesPage;
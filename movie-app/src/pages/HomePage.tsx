/**
 * HomePage Component
 *
 * The main landing page that displays:
 * - Random selection of movies
 * - Favorite movie indicators
 * - Count selector for number of movies to display
 * - Error handling and loading states
 *
 * State Management:
 * @state {Movie[]} movies - Array of random movie objects
 * @state {number[]} favorites - Array of favorite movie IDs
 * @state {boolean} isLoading - Loading state during data fetch
 * @state {string|null} error - Main error message
 * @state {number} count - Number of movies to display
 * @state {string|null} favoritesError - Error specific to favorites loading
 *
 * Dependencies:
 * - ../services/api for fetchRandomMovies and fetchFavorites
 * - ../components/MovieList for displaying movies
 */

import React, { useEffect, useState } from 'react';
import { fetchRandomMovies, fetchFavorites } from '../services/api';
import MovieList from '../components/MovieList';
import { Movie } from '../types/movie';

const HomePage: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [count, setCount] = useState(20);
  const [favoritesError, setFavoritesError] = useState<string | null>(null);

  /**
   * Loads random movies and favorites when component mounts or count changes
   */
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        setFavoritesError(null);

        // Load random movies
        const randomMovies = await fetchRandomMovies(count);
        setMovies(randomMovies);

        // Try to load favorites (but don't block if it fails)
        try {
          const favoriteMovies = await fetchFavorites();
          setFavorites(favoriteMovies.map(movie => movie.id));
        } catch (err) {
          console.error('Failed to load favorites:', err);
          setFavoritesError('You have no favorites. You can favorite movies by clicking the heart icon.');
        }
      } catch (err) {
        setError('Failed to load movies. Please try again later.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [count]);

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
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            aria-label="Reload page"
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
        <h1 className="text-3xl font-bold">Random Movies</h1>
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
      </div>

      {/* Favorites loading warning */}
      {favoritesError && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4" role="alert">
          <strong className="font-bold">Note:</strong>
          <span className="block sm:inline"> {favoritesError}</span>
        </div>
      )}

      <MovieList
        movies={movies}
        favorites={favorites}
        onFavoriteUpdate={refreshFavorites}
      />

      {/* About section */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6 text-center">About This App</h2>
        <p className="text-gray-700 max-w-2xl mx-auto text-center">
          Discover the latest movies, browse through popular titles, and save your favorites.
          This app uses the TMDB API to fetch movie data in real-time.
        </p>
      </div>
    </div>
  );
};

export default HomePage;
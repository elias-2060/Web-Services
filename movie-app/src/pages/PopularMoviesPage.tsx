import React, { useEffect, useState } from 'react';
import { fetchPopularMovies, fetchFavorites } from '../services/api';
import MovieList from '../components/MovieList';
import { Movie } from '../types/movie';

const PopularMoviesPage: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [count, setCount] = useState(20);
  const [favoritesError, setFavoritesError] = useState<string | null>(null);

  // Load both popular movies and favorites
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        setFavoritesError(null);

        const popularMovies = await fetchPopularMovies(count);
        setMovies(popularMovies);

        try {
          const favoriteMovies = await fetchFavorites();
          setFavorites(favoriteMovies.map(movie => movie.id));
        } catch (err) {
          console.error('Failed to load favorites:', err);
          setFavoritesError('You have no favorites. You can favorite movies by clicking the heart icon.');
        }
      } catch (err) {
        setError('Failed to load popular movies. Please try again later.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [count]);

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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
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
        <h1 className="text-3xl font-bold">Popular Movies</h1>
        <div className="flex items-center">
          <span className="mr-2">Show:</span>
          <select
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="border rounded px-3 py-1"
          >
            <option value={8}>8</option>
            <option value={12}>12</option>
            <option value={16}>16</option>
            <option value={20}>20</option>
          </select>
          <span className="ml-2">movies</span>
        </div>
      </div>

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
        showDetails={true}
      />

      {movies.length === 0 && (
        <div className="text-center py-12">
          <p className="text-xl text-gray-600">No popular movies found.</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
};

export default PopularMoviesPage;
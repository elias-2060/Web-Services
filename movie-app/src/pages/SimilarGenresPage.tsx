import React, { useEffect, useState } from 'react';
import { fetchSimilarGenres, fetchFavorites } from '../services/api';
import MovieList from '../components/MovieList';
import { Movie } from '../types/movie';

const SimilarGenresPage: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [movieId, setMovieId] = useState<string>('');
  const [submittedId, setSubmittedId] = useState<number | null>(null);
  const [count, setCount] = useState(20);
  const [favoritesError, setFavoritesError] = useState<string | null>(null);

  // Remember the previous typed movie id when we refresh the page
  useEffect(() => {
    const savedId = localStorage.getItem('lastSimilarGenresMovieId');
    if (savedId) {
      setMovieId(savedId);
      setSubmittedId(Number(savedId));
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = parseInt(movieId);
    if (!isNaN(id) && id > 0) {
      setSubmittedId(id);
      localStorage.setItem('lastSimilarGenresMovieId', id.toString());
    } else {
      setError('Please enter a valid movie ID (positive number)');
    }
  };

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

  useEffect(() => {
    if (submittedId === null) return;

    const loadMovies = async () => {
      try {
        setIsLoading(true);
        setError(null);
        setFavoritesError(null);

        const [data, favoriteMovies] = await Promise.all([
          fetchSimilarGenres(submittedId),
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
        </div>
        <button
          onClick={() => setError(null)}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Find Movies with Similar Genres</h1>
        {submittedId && (
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
          />
          <button
            type="submit"
            className="px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 mr-2"
          >
            Search
          </button>
          {submittedId && (
            <button
              type="button"
              onClick={() => {
                localStorage.removeItem('lastSimilarGenresMovieId');
                setMovieId('');
                setSubmittedId(null);
                setMovies([]);
              }}
              className="px-4 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
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
            Movies with genres similar to Movie ID: {submittedId}
          </h2>
        </div>
      )}

      <MovieList
        movies={movies}
        favorites={favorites}
        onFavoriteUpdate={refreshFavorites}
        showDetails={true}
      />

      {submittedId && movies.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <p className="text-xl text-gray-600">No similar movies found for this ID.</p>
          <button
            onClick={() => setSubmittedId(null)}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Try Another ID
          </button>
        </div>
      )}
    </div>
  );
};

export default SimilarGenresPage;
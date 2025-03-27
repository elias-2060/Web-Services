import React, { useEffect, useState } from 'react';
import { fetchSimilarGenres } from '../services/api';
import MovieList from '../components/MovieList';
import { Movie } from '../types/movie';

const SimilarGenresPage: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [movieId, setMovieId] = useState<string>('');
  const [submittedId, setSubmittedId] = useState<number | null>(null);
  const [count, setCount] = useState(20);

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
      // Save to localStorage with a unique key for this page
      localStorage.setItem('lastSimilarGenresMovieId', id.toString());
    } else {
      setError('Please enter a valid movie ID (positive number)');
    }
  };

  useEffect(() => {
    if (submittedId === null) return;

    const loadMovies = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await fetchSimilarGenres(submittedId);
        setMovies(data.slice(0, count));
      } catch (err) {
        setError('Failed to load similar movies. Please check the movie ID and try again.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadMovies();
  }, [submittedId, count]);

  // ... [keep all the existing JSX the same, but add the Clear button as shown below]

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

      <MovieList movies={movies} />

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
import React, { useEffect, useState } from 'react';
import { fetchRandomMovies } from '../services/api';
import MovieList from '../components/MovieList';
import { Movie } from '../types/movie';

const RandomMoviesPage: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMovies = async () => {
      try {
        setIsLoading(true);
        const data = await fetchRandomMovies(12);
        setMovies(data);
      } catch (err) {
        setError('Failed to load random movies. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    loadMovies();
  }, []);

  if (isLoading) {
    return <div className="text-center py-8">Loading random movies...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Random Movies</h1>
      <MovieList movies={movies} />
    </div>
  );
};

export default RandomMoviesPage;
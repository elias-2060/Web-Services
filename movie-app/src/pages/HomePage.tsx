import React, { useEffect, useState } from 'react';
import {fetchRandomMovies} from '../services/api';
import MovieList from '../components/MovieList';
import { Movie } from '../types/movie';

const HomePage: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [count, setCount] = useState(20); // Default to 20 movies


  useEffect(() => {
    const loadMovies = async () => {
      try {
        setIsLoading(true);
        const data = await fetchRandomMovies(count); // Fetch 8 popular movies
        setMovies(data);
      } catch (err) {
        setError('Failed to load movies. Please try again later.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadMovies();
  }, [count]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline"> {error}</span>
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
          >
            <option value={8}>8</option>
            <option value={12}>12</option>
            <option value={16}>16</option>
            <option value={20}>20</option>
          </select>
          <span className="ml-2">movies</span>
        </div>
      </div>
      <MovieList movies={movies}/>

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
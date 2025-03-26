import React, { useState } from 'react';
import { compareMovies } from '../services/api';
import MovieCard from './MovieCard';
import { Movie } from '../types/movie';
import MovieList from "./MovieList";

interface MovieComparisonProps {
  selectedMovies: Movie[];
  onClearSelection: () => void;
}

const MovieComparison: React.FC<MovieComparisonProps> = ({
  selectedMovies,
  onClearSelection,
}) => {
  const [chartUrl, setChartUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCompare = async () => {
    if (selectedMovies.length < 2) {
      setError('Please select at least 2 movies to compare');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await compareMovies(selectedMovies.map(movie => movie.id));
      setChartUrl(result.chart_url);
    } catch (err) {
      setError('Failed to compare movies. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Compare Selected Movies</h2>

      <div className="mb-4">
        <MovieList movies={selectedMovies} showDetails={true} />
      </div>

      <div className="flex space-x-4 mb-4">
        <button
          onClick={handleCompare}
          disabled={isLoading || selectedMovies.length < 2}
          className={`px-4 py-2 rounded-md text-white ${selectedMovies.length < 2 ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'}`}
        >
          {isLoading ? 'Comparing...' : 'Compare Movies'}
        </button>

        <button
          onClick={onClearSelection}
          className="px-4 py-2 rounded-md bg-gray-500 text-white hover:bg-gray-600"
        >
          Clear Selection
        </button>
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {chartUrl && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Comparison Results</h3>
          <img src={chartUrl} alt="Movie comparison chart" className="w-full" />
        </div>
      )}
    </div>
  );
};

export default MovieComparison;
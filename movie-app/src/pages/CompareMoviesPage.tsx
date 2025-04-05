/**
 * CompareMoviesPage Component
 *
 * A page component that allows users to compare multiple movies by their IDs.
 * Features include:
 * - Input for adding movie IDs (comma-separated)
 * - Persistent storage of comparison history
 * - Visual comparison chart generation
 * - Management of movie IDs (add/remove/clear)
 *
 * State Management:
 * @state {string} inputValue - Current input field value
 * @state {number[]} movieIds - Array of movie IDs to compare
 * @state {string|null} chartUrl - URL of generated comparison chart
 * @state {boolean} isLoading - Loading state during API calls
 * @state {string|null} error - Error message if comparison fails
 *
 * Persistence:
 * - Uses localStorage with key 'movieComparisonIds' to remember comparisons
 *
 * Dependencies:
 * - ../services/api for compareMovies function
 */

import { useState, useEffect } from 'react';
import { compareMovies } from '../services/api';

const STORAGE_KEY = 'movieComparisonIds';

const CompareMoviesPage = () => {
  const [inputValue, setInputValue] = useState<string>('');
  const [movieIds, setMovieIds] = useState<number[]>([]);
  const [chartUrl, setChartUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load saved movie IDs from localStorage when component mounts
   * and automatically compare them if found
   */
  useEffect(() => {
    const savedIds = localStorage.getItem(STORAGE_KEY);
    if (savedIds) {
      const parsedIds = parseIds(savedIds);
      if (parsedIds.length > 0) {
        setMovieIds(parsedIds);
        setInputValue(savedIds);
        handleCompare(parsedIds);
      }
    }
  }, []);

  /**
   * Parses a string of comma-separated IDs into an array of numbers
   * @param {string} idString - Comma-separated string of movie IDs
   * @returns {number[]} Array of parsed movie IDs
   */
  const parseIds = (idString: string): number[] => {
    return idString.split(',')
      .map(id => parseInt(id.trim()))
      .filter(id => !isNaN(id));
  };

  /**
   * Handles the movie comparison process
   * @param {number[]} [idsToCompare] - Optional array of IDs to compare (defaults to current movieIds)
   */
  const handleCompare = async (idsToCompare?: number[]) => {
    const ids = idsToCompare || movieIds;

    if (ids.length === 0) {
      setError('Please enter at least one valid movie ID');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await compareMovies(ids);
      setChartUrl(response.chart_url);

      // Update localStorage with current IDs
      localStorage.setItem(STORAGE_KEY, ids.join(', '));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to compare movies');
      setChartUrl(null);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Adds new movie IDs from input field to comparison list
   */
  const handleAddMovie = () => {
    if (!inputValue.trim()) return;

    const newIds = parseIds(inputValue);
    if (newIds.length === 0) {
      setError('Please enter valid numeric movie IDs');
      return;
    }

    // Combine new IDs with existing ones and remove duplicates
    const combinedIds = [...movieIds];
    newIds.forEach(id => {
      if (!combinedIds.includes(id)) {
        combinedIds.push(id);
      }
    });

    setMovieIds(combinedIds);
    setInputValue(''); // Clear the input field after adding
    setError(null);

    // Automatically compare with the new IDs
    handleCompare(combinedIds);
  };

  /**
   * Clears all movie IDs and comparison results
   */
  const clearAll = () => {
    setMovieIds([]);
    setInputValue('');
    setChartUrl(null);
    setError(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  /**
   * Removes a specific movie ID from the comparison list
   * @param {number} idToRemove - Movie ID to remove
   */
  const removeMovie = (idToRemove: number) => {
    const updatedIds = movieIds.filter(id => id !== idToRemove);
    setMovieIds(updatedIds);

    if (updatedIds.length > 0) {
      handleCompare(updatedIds);
    } else {
      setChartUrl(null);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Compare Movies</h1>

      {/* Movie ID input section */}
      <div className="mb-8">
        <div className="mb-4">
          <label htmlFor="movieIds" className="block text-sm font-medium text-gray-700 mb-2">
            Add Movie IDs (comma-separated):
          </label>
          <div className="flex items-center">
            <input
              type="text"
              id="movieIds"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 mr-2"
              placeholder="e.g., 123, 456, 789"
              onKeyPress={(e) => e.key === 'Enter' && handleAddMovie()}
              aria-label="Enter movie IDs to compare"
            />
            <button
              onClick={handleAddMovie}
              disabled={isLoading || !inputValue.trim()}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
              aria-label="Add movies and compare"
            >
              Add & Compare
            </button>
            {movieIds.length > 0 && (
              <button
                onClick={clearAll}
                className="ml-2 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                aria-label="Clear all movies"
              >
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* Current movie IDs being compared */}
        {movieIds.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Currently Comparing:</h3>
            <div className="flex flex-wrap gap-2">
              {movieIds.map(id => (
                <div key={id} className="flex items-center bg-gray-100 px-3 py-1 rounded-full">
                  <span className="mr-2">#{id}</span>
                  <button
                    onClick={() => removeMovie(id)}
                    className="text-gray-500 hover:text-red-500"
                    aria-label={`Remove movie ${id}`}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error display */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-md">
            {error}
          </div>
        )}
      </div>

      {/* Comparison results */}
      {chartUrl && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Comparison Results</h2>
          <div className="flex justify-start">
            <img
              src={chartUrl}
              alt="Movie comparison chart showing ratings of selected movies"
              className="max-w-full h-auto border border-gray-200 rounded-lg"
              loading="lazy"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CompareMoviesPage;
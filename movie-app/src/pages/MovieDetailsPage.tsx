/**
 * MovieDetailsPage Component
 *
 * Displays detailed information about a specific movie along with:
 * - Movies with similar genres
 * - Movies with similar runtime
 * - Favorite status and management
 *
 * Features:
 * - Tab navigation between similar movies by genre/runtime
 * - Automatic loading of movie details and related movies
 * - Favorite status synchronization
 * - Error handling and loading states
 *
 * URL Parameters:
 * @param {string} id - Movie ID from URL route
 *
 * State Management:
 * @state {Movie|null} movie - Current movie details
 * @state {Movie[]} similarByGenre - Movies with similar genres
 * @state {Movie[]} similarByRuntime - Movies with similar runtime
 * @state {boolean} isLoading - Loading state
 * @state {string|null} error - Error message
 * @state {Movie[]} favoriteMovies - User's favorite movies
 * @state {'genre'|'runtime'} activeTab - Current active tab
 *
 * Dependencies:
 * - react-router-dom for routing
 * - ../services/api for data fetching
 * - ../components/MovieList for displaying movies
 */

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchMovieDetails, fetchSimilarGenres, fetchSimilarRuntime, fetchFavorites } from '../services/api';
import MovieList from '../components/MovieList';
import { Movie } from '../types/movie';

const MovieDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [similarByGenre, setSimilarByGenre] = useState<Movie[]>([]);
  const [similarByRuntime, setSimilarByRuntime] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [favoriteMovies, setFavoriteMovies] = useState<Movie[]>([]);
  const [activeTab, setActiveTab] = useState<'genre' | 'runtime'>('genre');

  // Extract favorite IDs for quick lookup
  const favoriteIds = favoriteMovies.map(movie => movie.id);

  /**
   * Loads all required data for the page:
   * - Movie details
   * - Similar movies by genre and runtime
   * - User's favorite movies
   */
  const loadData = async () => {
    try {
      setIsLoading(true);
      const movieId = Number(id);

      // Load favorites
      const favs = await fetchFavorites();
      setFavoriteMovies(favs);

      // Load main movie details
      const movieData = await fetchMovieDetails(movieId);
      setMovie(movieData);

      // Load similar movies (parallel requests)
      const [byGenre, byRuntime] = await Promise.all([
        fetchSimilarGenres(movieId),
        fetchSimilarRuntime(movieId)
      ]);

      setSimilarByGenre(byGenre);
      // Filter out the current movie from similar results
      setSimilarByRuntime(byRuntime.filter(m => m.id !== movieId));

    } catch (err) {
      setError('Failed to load movie details');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Load data when movie ID changes
  useEffect(() => {
    loadData();
  }, [id]);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Tab navigation */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          className={`py-2 px-4 font-medium ${activeTab === 'genre' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('genre')}
          aria-label="Show movies with similar genres"
        >
          Similar Genres
        </button>
        <button
          className={`py-2 px-4 font-medium ${activeTab === 'runtime' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('runtime')}
          aria-label="Show movies with similar runtime"
        >
          Similar Runtime
        </button>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'genre' ? (
        similarByGenre.length > 0 ? (
          <MovieList
            movies={similarByGenre}
            favorites={favoriteIds}
            onFavoriteUpdate={loadData}
          />
        ) : (
          <p className="text-gray-500">No similar movies found by genre.</p>
        )
      ) : similarByRuntime.length > 0 ? (
        <MovieList
          movies={similarByRuntime}
          favorites={favoriteIds}
          onFavoriteUpdate={loadData}
        />
      ) : (
        <p className="text-gray-500">No similar movies found by runtime.</p>
      )}
    </div>
  );
};

export default MovieDetailsPage;
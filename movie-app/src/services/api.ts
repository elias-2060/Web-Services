/**
 * API Service Module
 *
 * This module provides a centralized interface for all API calls to the backend service.
 * It handles:
 * - Authentication via API key
 * - Request/response formatting
 * - Error handling
 * - Type-safe return values
 *
 * Features:
 * - Base URL configuration
 * - Automatic API key injection
 * - Consistent error handling
 * - Type-safe endpoints
 * - CORS support
 *
 * Environment Requirements:
 * - REACT_APP_API_KEY must be set in environment variables
 * - Backend API must be running at API_BASE_URL
 *
 * Error Handling:
 * - Throws clear error messages for missing API key
 * - Standardizes API error responses
 * - Logs errors to console
 */

import { Movie, FavoriteActionResponse, ErrorResponse} from '../types/movie';

// Base configuration
const API_BASE_URL = 'http://127.0.0.1:5000';
const API_KEY = process.env.REACT_APP_API_KEY; // From environment variables

// Runtime validation of API key
if (!API_KEY) {
  throw new Error(
    'API key is missing. Ensure you:\n' +
    '1. Started the API with ./run_api.sh\n' +
    '2. Are running the frontend with ./start_frontend.sh\n' +
    '3. Have REACT_APP_API_KEY in your .env file for development'
  );
}

/**
 * Generic API request handler
 * @template T - Expected return type
 * @param {string} endpoint - API endpoint (e.g. '/movies')
 * @param {RequestInit} [options] - Fetch options
 * @returns {Promise<T>} - Promise resolving to the response data
 * @throws {Error} - For API errors or network failures
 */
const apiRequest = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
  if (!API_KEY) {
    throw new Error('API key not available');
  }

  // Prepare headers with API key
  const headers = new Headers({
    'Content-Type': 'application/json',
    'API-Key': API_KEY,
    ...options.headers,
  });

  const requestOptions: RequestInit = {
    ...options,
    headers,
    mode: 'cors', // Enable CORS
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, requestOptions);

    if (!response.ok) {
      // Try to parse error response, fallback to empty object
      const errorData: ErrorResponse = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error ||
        errorData.message ||
        `API request failed with status ${response.status}`
      );
    }

    return await response.json() as T;
  } catch (error) {
    console.error(`API request to ${endpoint} failed:`, error);
    throw error;
  }
};

// Movie-related API endpoints

/**
 * Fetches random movies
 * @param {number} [count=10] - Number of movies to return
 * @returns {Promise<Movie[]>} - Array of random movies
 */
export const fetchRandomMovies = async (count: number = 10): Promise<Movie[]> => {
  return apiRequest(`/movies/random?n=${count}`);
};

/**
 * Fetches currently popular movies
 * @param {number} [count=10] - Number of movies to return
 * @returns {Promise<Movie[]>} - Array of popular movies
 */
export const fetchPopularMovies = async (count: number = 10): Promise<Movie[]> => {
  return apiRequest(`/movies/popular?n=${count}`);
};

/**
 * Fetches details for a specific movie
 * @param {number} movieId - TMDB movie ID
 * @returns {Promise<Movie>} - Complete movie details
 */
export const fetchMovieDetails = async (movieId: number): Promise<Movie> => {
  return apiRequest(`/movies/${movieId}`);
};

/**
 * Fetches movies with similar genres
 * @param {number} movieId - TMDB movie ID to compare against
 * @returns {Promise<Movie[]>} - Array of similar movies
 */
export const fetchSimilarGenres = async (movieId: number): Promise<Movie[]> => {
  return apiRequest(`/movies/${movieId}/similar-genres`);
};

/**
 * Fetches movies with similar runtime
 * @param {number} movieId - TMDB movie ID to compare against
 * @returns {Promise<Movie[]>} - Array of similar movies
 */
export const fetchSimilarRuntime = async (movieId: number): Promise<Movie[]> => {
  return apiRequest(`/movies/${movieId}/similar-runtime`);
};

// Favorite-related API endpoints

/**
 * Fetches user's favorite movies
 * @returns {Promise<Movie[]>} - Array of favorite movies
 */
export const fetchFavorites = async (): Promise<Movie[]> => {
  return apiRequest(`/movies/favorites`);
};

/**
 * Adds a movie to favorites
 * @param {number} movieId - TMDB movie ID to add
 * @returns {Promise<FavoriteActionResponse>} - Action confirmation
 */
export const addFavorite = async (movieId: number): Promise<FavoriteActionResponse> => {
  return apiRequest(`/movies/favorites/${movieId}`, { method: 'POST' });
};

/**
 * Removes a movie from favorites
 * @param {number} movieId - TMDB movie ID to remove
 * @returns {Promise<FavoriteActionResponse>} - Action confirmation
 */
export const removeFavorite = async (movieId: number): Promise<FavoriteActionResponse> => {
  return apiRequest(`/movies/favorites/${movieId}`, { method: 'DELETE' });
};

// Comparison-related API endpoints

/**
 * Compares multiple movies
 * @param {number[]} movieIds - Array of TMDB movie IDs to compare
 * @returns {Promise<{chart_url: string}>} - URL of generated comparison chart
 */
export const compareMovies = async (movieIds: number[]): Promise<{ chart_url: string }> => {
  return apiRequest('/movies/compare', {
    method: 'POST',
    body: JSON.stringify({ movie_ids: movieIds }),
  });
};
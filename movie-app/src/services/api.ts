import { Movie, FavoriteActionResponse } from '../types/movie';

const API_BASE_URL = 'http://127.0.0.1:5000'; // Update if your API is hosted elsewhere
const API_KEY = '7d6cbb373fde3004e19b40f41b77fd05ab3c4ebbdb8c38debab8dc204d1f217b';

interface ErrorResponse {
  error?: string;
  message?: string;
  status_code?: number;
}

// Generic request handler
const apiRequest = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
  // Create new Headers object to ensure immutability
  const headers = new Headers({
    'Content-Type': 'application/json',
    'API-Key': API_KEY, // Case-sensitive header name
    ...options.headers, // Merge with any custom headers
  });

  // Create new request options
  const requestOptions: RequestInit = {
    ...options,
    headers,
    mode: 'cors', // Ensure CORS mode
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, requestOptions);
    console.log("test", response)
    if (!response.ok) {
      const errorData: ErrorResponse = await response.json();
      throw new Error(errorData.error || errorData.message || 'API request failed');
    }

    return await response.json() as T;
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error);
    throw error;
  }
};

// Movies
export const fetchRandomMovies = async (count: number = 10): Promise<Movie[]> => {
  return apiRequest(`/movies?n=${count}`);
};

export const fetchPopularMovies = async (count: number = 10): Promise<Movie[]> => {
  return apiRequest(`/movies/popular?n=${count}`);
};

export const fetchMovieDetails = async (movieId: number): Promise<Movie> => {
  return apiRequest(`/movies/${movieId}`);
};

export const fetchSimilarGenres = async (movieId: number): Promise<Movie[]> => {
  return apiRequest(`/movies/${movieId}/similar-genres`);
};

export const fetchSimilarRuntime = async (movieId: number): Promise<Movie[]> => {
  return apiRequest(`/movies/${movieId}/similar-runtime`);
};

// Favorites
export const fetchFavorites = async (): Promise<Movie[]> => {
  return apiRequest(`/movies/favorites`);
};

export const addFavorite = async (movieId: number): Promise<FavoriteActionResponse> => {
  return apiRequest(`/movies/favorites/${movieId}`, { method: 'POST' });
};

export const removeFavorite = async (movieId: number): Promise<FavoriteActionResponse> => {
  return apiRequest(`/movies/favorites/${movieId}`, { method: 'DELETE' });
};

// Comparison
export const compareMovies = async (movieIds: number[]): Promise<{ chart_url: string }> => {
  return apiRequest('/movies/compare', {
    method: 'POST',
    body: JSON.stringify({ movie_ids: movieIds }),
  });
};
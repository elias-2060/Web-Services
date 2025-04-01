import { Movie, FavoriteActionResponse } from '../types/movie';

const API_BASE_URL = 'http://127.0.0.1:5000';
const API_KEY = process.env.REACT_APP_API_KEY; // Now from environment variable

interface ErrorResponse {
  error?: string;
  message?: string;
  status_code?: number;
}

// Throw error if API key is missing at runtime
if (!API_KEY) {
  throw new Error(
    'API key is missing. Ensure you:\n' +
    '1. Started the API with ./run_api.sh\n' +
    '2. Are running the frontend with ./start_frontend.sh\n' +
    '3. Have REACT_APP_API_KEY in your .env file for development'
  );
}

// Enhanced request handler with key validation
const apiRequest = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
  if (!API_KEY) {
    throw new Error('API key not available');
  }

  const headers = new Headers({
    'Content-Type': 'application/json',
    'API-Key': API_KEY,
    ...options.headers,
  });

  const requestOptions: RequestInit = {
    ...options,
    headers,
    mode: 'cors',
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, requestOptions);

    if (!response.ok) {
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
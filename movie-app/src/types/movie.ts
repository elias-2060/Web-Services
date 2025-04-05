/**
 * Type definitions for movie-related data structures and component props
 *
 * This module contains interfaces for:
 * - Movie data structure
 * - Favorite actions responses
 * - Movie card and list component props
 * - Standard error response format
 */

/**
 * Represents a movie with its properties
 * @interface
 */
export interface Movie {
  id: number;
  title: string;
  original_title?: string;
  original_language?: string;
  poster_path?: string;
  overview?: string;
  vote_average?: number;
  runtime?: number;
  release_date?: string;
  popularity?: number;
}

/**
 * Response structure for favorite movie actions (add/remove/get)
 * @interface
 */
export interface FavoriteActionResponse {
  /** Response message */
  message: string;
  /** Array of favorite movie IDs */
  favorites: number[];
  /** Error message if the operation failed */
  error?: string;
}

/**
 * Props for the MovieCard component
 * @interface
 */
export interface MovieCardProps {
  /** Movie object to display */
  movie: Movie;
  /** Callback triggered when favorite status changes */
  onFavoriteUpdate?: () => void;
  /** Whether the movie is marked as favorite */
  isFavorite?: boolean;
  /** Whether to show detailed movie information */
  showDetails?: boolean;
}

/**
 * Props for the MovieList component
 * @interface
 */
export interface MovieListProps {
  /** Array of movie objects to display */
  movies: Movie[];
  /** Array of favorite movie IDs */
  favorites?: number[];
  /** Callback triggered when any movie's favorite status changes */
  onFavoriteUpdate?: () => void;
  /** Whether to show detailed information for each movie */
  showDetails?: boolean;
}

/**
 * Standard error response format
 * @interface
 */
export interface ErrorResponse {
  /** Error description */
  error?: string;
  /** Human-readable message */
  message?: string;
  /** HTTP status code */
  status_code?: number;
}
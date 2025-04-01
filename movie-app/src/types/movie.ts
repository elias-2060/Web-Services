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

export interface FavoriteActionResponse {
  message: string;
  favorites: number[];
  error?: string;
}

export interface MovieCardProps {
  movie: Movie;
  onFavoriteUpdate?: () => void;
  isFavorite?: boolean;
  showDetails?: boolean;
}

export interface MovieListProps {
  movies: Movie[];
  favorites?: number[];
  onFavoriteUpdate?: () => void;
  showDetails?: boolean;
}
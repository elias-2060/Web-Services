export interface Movie {
  id: number;
  title: string;
  poster_path?: string;
  overview?: string;
  vote_average?: number;
  runtime?: number;
  genres?: { id: number; name: string }[];
  release_date?: string;
}

export interface MovieComparisonData {
  title: string;
  score: number;
}

export interface FavoriteActionResponse {
  message: string;
  favorites: number[];
  error?: string;
}
import React from 'react';
import MovieCard from './MovieCard';
import { Movie } from '../types/movie';

interface MovieListProps {
  movies: Movie[];
  favorites?: number[];
  onFavoriteUpdate?: () => void;
  showDetails?: boolean;
}

const MovieList: React.FC<MovieListProps> = ({
  movies,
  favorites = [],
  onFavoriteUpdate,
  showDetails = false,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {movies.map((movie) => (
        <MovieCard
          key={movie.id}
          movie={movie}
          isFavorite={favorites.includes(movie.id)}
          onFavoriteUpdate={onFavoriteUpdate}
          showDetails={showDetails}
        />
      ))}
    </div>
  );
};

export default MovieList;
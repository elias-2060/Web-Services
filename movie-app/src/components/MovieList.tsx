import React from 'react';
import MovieCard from './MovieCard';
import { MovieListProps } from '../types/movie';

const MovieList: React.FC<MovieListProps> = ({
  movies,
  favorites = [],
  onFavoriteUpdate,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {movies.map((movie) => (
        <MovieCard
          key={movie.id}
          movie={movie}
          isFavorite={favorites.includes(movie.id)}
          onFavoriteUpdate={onFavoriteUpdate}
        />
      ))}
    </div>
  );
};

export default MovieList;
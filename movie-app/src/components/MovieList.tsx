/**
 * MovieList Component
 *
 * A responsive grid component for displaying a list of movie cards.
 *
 * Features:
 * - Responsive grid layout (1-5 columns based on screen size)
 * - Supports favorite highlighting
 * - Propagates favorite updates
 *
 * Props:
 * @param {Movie[]} movies - Array of movie objects to display
 * @param {number[]} [favorites=[]] - Array of favorite movie IDs
 * @param {() => void} [onFavoriteUpdate] - Callback when favorite status changes
 *
 * Dependencies:
 * - ./MovieCard for individual movie display
 */

import React from 'react';
import MovieCard from './MovieCard';
import { MovieListProps } from '../types/movie';

const MovieList: React.FC<MovieListProps> = ({
  movies,
  favorites = [],
  onFavoriteUpdate,
}) => {
  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
      aria-label="List of movies"
    >
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
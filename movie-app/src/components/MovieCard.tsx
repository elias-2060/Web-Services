import React from 'react';
import { Movie } from '../types/movie';

interface MovieCardProps {
  movie: Movie;
  onAddFavorite?: (id: number) => void;
  onRemoveFavorite?: (id: number) => void;
  isFavorite?: boolean;
  showDetails?: boolean;
}

const MovieCard: React.FC<MovieCardProps> = ({
  movie,
  onAddFavorite,
  onRemoveFavorite,
  isFavorite = false,
  showDetails = false,
}) => {
  const posterUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : 'https://via.placeholder.com/500x750?text=No+Poster';

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:scale-105">
      <img
        src={posterUrl}
        alt={movie.title}
        className="w-full h-64 object-cover"
      />
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2">{movie.title}</h3>

        {showDetails && (
          <>
            <p className="text-gray-600 text-sm mb-2 line-clamp-3">{movie.overview}</p>
            <div className="flex items-center mb-2">
              <span className="text-yellow-500 mr-1">★</span>
              <span>{movie.vote_average?.toFixed(1)}/10</span>
            </div>
            {movie.release_date && (
              <p className="text-gray-500 text-sm">
                Released: {new Date(movie.release_date).getFullYear()}
              </p>
            )}
          </>
        )}

        {onAddFavorite && onRemoveFavorite && (
          <button
            onClick={() => isFavorite ? onRemoveFavorite(movie.id) : onAddFavorite(movie.id)}
            className={`mt-3 px-4 py-2 rounded-md text-white ${isFavorite ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'}`}
          >
            {isFavorite ? 'Remove Favorite' : 'Add Favorite'}
          </button>
        )}
      </div>
    </div>
  );
};

export default MovieCard;
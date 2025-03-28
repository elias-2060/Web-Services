import React from 'react';
import { Movie } from '../types/movie';
import { addFavorite, removeFavorite } from '../services/api';

interface MovieCardProps {
  movie: Movie;
  onFavoriteUpdate?: () => void; // Callback to refresh favorites list if needed
  isFavorite?: boolean;
  showDetails?: boolean;
}

const MovieCard: React.FC<MovieCardProps> = ({
  movie,
  onFavoriteUpdate,
  isFavorite = false,
  showDetails = false,
}) => {
  const posterUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : 'https://via.placeholder.com/500x750?text=No+Poster';

  const handleFavoriteClick = async () => {
    try {
      if (isFavorite) {
        await removeFavorite(movie.id);
      } else {
        await addFavorite(movie.id);
      }
      // Call the callback to refresh favorites if provided
      if (onFavoriteUpdate) {
        onFavoriteUpdate();
      }
    } catch (error) {
      console.error('Error updating favorite:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:scale-105 relative">
      {/* Heart icon in top-right corner */}
      <button
        onClick={handleFavoriteClick}
        className="absolute top-2 right-2 p-2 bg-black bg-opacity-50 rounded-full z-10"
        aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill={isFavorite ? 'red' : 'none'}
          viewBox="0 0 24 24"
          stroke={isFavorite ? 'red' : 'white'}
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      </button>

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
      </div>
    </div>
  );
};

export default MovieCard;
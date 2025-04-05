/**
 * MovieCard Component
 *
 * A flip-card style component that displays movie information with:
 * - Front side: Basic movie details and poster
 * - Back side: Extended movie details and action buttons
 *
 * Features:
 * - Flip animation on click
 * - Favorite toggle functionality
 * - Movie ID copy button
 * - Navigation to similar movies by genres/runtime
 * - Responsive design
 *
 * Props:
 * @param {Movie} movie - The movie object containing all movie details
 * @param {() => void} [onFavoriteUpdate] - Callback when favorite status changes
 * @param {boolean} [isFavorite=false] - Whether the movie is currently a favorite
 *
 * Dependencies:
 * - react-router-dom for navigation
 * - ../services/api for favorite management
 * - Tailwind CSS for styling
 */

import React, { useState } from 'react';
import { MovieCardProps } from '../types/movie';
import { addFavorite, removeFavorite } from '../services/api';
import { useNavigate } from 'react-router-dom';

const MovieCard: React.FC<MovieCardProps> = ({
  movie,
  onFavoriteUpdate,
  isFavorite = false,
}) => {
  // State for card flip animation
  const [isFlipped, setIsFlipped] = useState(false);

  // State for copy feedback
  const [copied, setCopied] = useState(false);

  // Navigation hook
  const navigate = useNavigate();

  // Generate poster URL or use placeholder if not available
  const posterUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : 'https://via.placeholder.com/500x750?text=No+Poster';

  /**
   * Handles adding/removing movie from favorites
   * @param {React.MouseEvent} e - Click event
   */
  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (isFavorite) {
        await removeFavorite(movie.id);
      } else {
        await addFavorite(movie.id);
      }
      // Notify parent component of favorite change if callback provided
      if (onFavoriteUpdate) onFavoriteUpdate();
    } catch (error) {
      console.error('Error updating favorite:', error);
    }
  };

  /**
   * Toggles the card flip state
   */
  const handleCardClick = () => {
    setIsFlipped(!isFlipped);
  };

  /**
   * Copies movie ID to clipboard
   * @param {React.MouseEvent} e - Click event
   */
  const handleCopyId = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(movie.id.toString());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  /**
   * Navigates to similar movies by genres
   * @param {React.MouseEvent} e - Click event
   */
  const handleSimilarGenres = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/similar-genres?movieId=${movie.id}`);
  };

  /**
   * Navigates to similar movies by runtime
   * @param {React.MouseEvent} e - Click event
   */
  const handleSimilarRuntime = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/similar-runtime?movieId=${movie.id}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className="cursor-pointer perspective-1000 w-full h-full min-h-[460px]"
      aria-label={`Movie card for ${movie.title}. Click to flip.`}
    >
      {/* Card container with flip animation */}
      <div className={`relative w-full h-full transition-transform duration-500 transform-style-preserve-3d ${
        isFlipped ? 'rotate-y-180' : ''
      }`}>
        {/* Front of the card - Basic movie info */}
        <div className={`bg-white rounded-lg shadow-md overflow-hidden backface-hidden h-full ${isFlipped ? 'hidden' : ''}`}>
          {/* Favorite button */}
          <button
            onClick={handleFavoriteClick}
            className="absolute top-3 right-3 p-2 bg-black bg-opacity-50 rounded-full z-10 hover:bg-opacity-70 transition-all"
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
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

          {/* Movie poster */}
          <img
            src={posterUrl}
            alt={movie.title}
            className="w-full h-80 object-cover"
            loading="lazy"
          />

          {/* Movie details */}
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-2 line-clamp-1">{movie.title}</h3>
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">ID: {movie.id}</span>
                {/* Copy ID button */}
                <button
                  onClick={handleCopyId}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                  aria-label="Copy movie ID"
                  title="Copy ID"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                    />
                  </svg>
                </button>
                {copied && <span className="text-xs text-green-500">Copied!</span>}
              </div>
              {/* Rating display */}
              <div className="flex items-center">
                <span className="text-yellow-500 mr-1">★</span>
                <span>{movie.vote_average?.toFixed(1)}/10</span>
              </div>
            </div>
            {/* Movie overview (truncated) */}
            <p className="text-gray-600 text-sm line-clamp-2">{movie.overview}</p>
          </div>
        </div>

        {/* Back of the card - Extended movie info */}
        <div className={`absolute top-0 left-0 w-full h-full bg-white rounded-lg shadow-md p-5 backface-hidden rotate-y-180 ${!isFlipped ? 'hidden' : ''}`}>
          <h3 className="text-xl font-bold mb-3">{movie.title}</h3>
          <p className="text-gray-600 text-sm mb-4 line-clamp-5">{movie.overview}</p>

          {/* Detailed movie information grid */}
          <div className="grid grid-cols-2 gap-4 mb-5">
            {/* Rating */}
            <div>
              <p className="text-gray-500 text-sm font-semibold mb-1">Rating</p>
              <div className="flex items-center">
                <span className="text-yellow-500 mr-1">★</span>
                <span className="text-gray-700">{movie.vote_average?.toFixed(1)}/10</span>
              </div>
            </div>

            {/* Popularity */}
            <div>
              <p className="text-gray-500 text-sm font-semibold mb-1">Popularity</p>
              <div className="flex items-center">
                <span className="text-red-500 mr-1">🔥</span>
                <span className="text-gray-700">
                  {movie.popularity ? Math.round(movie.popularity) : 'N/A'}
                </span>
              </div>
            </div>

            {/* Release year */}
            {movie.release_date && (
              <div>
                <p className="text-gray-500 text-sm font-semibold mb-1">Release Year</p>
                <p className="text-gray-700 text-sm">
                  {new Date(movie.release_date).getFullYear()}
                </p>
              </div>
            )}

            {/* Movie ID with copy button */}
            <div>
              <p className="text-gray-500 text-sm font-semibold mb-1">ID</p>
              <div className="flex items-center space-x-2">
                <p className="text-gray-700 text-sm">{movie.id}</p>
                <button
                  onClick={handleCopyId}
                  className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
                  aria-label="Copy movie ID"
                  title="Copy ID"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                    />
                  </svg>
                </button>
                {copied && <span className="text-xs text-green-500">Copied!</span>}
              </div>
            </div>

            {/* Original title (if different) */}
            {movie.original_title && movie.original_title !== movie.title && (
              <div>
                <p className="text-gray-500 text-sm font-semibold mb-1">Original Title</p>
                <p className="text-gray-700 text-sm italic">{movie.original_title}</p>
              </div>
            )}

            {/* Original language */}
            {movie.original_language && (
              <div>
                <p className="text-gray-500 text-sm font-semibold mb-1">Original Language</p>
                <p className="text-gray-700 text-sm">
                  {movie.original_language.toUpperCase()}
                </p>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex justify-center gap-3 mt-4">
            <button
              onClick={handleSimilarGenres}
              className="flex-1 max-w-[160px] px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white
                         text-sm font-medium rounded-md shadow-sm hover:shadow-md transition-all
                         focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-opacity-50"
              aria-label={`Find movies with similar genres to ${movie.title}`}
            >
              Similar Genres
            </button>
            <button
              onClick={handleSimilarRuntime}
              className="flex-1 max-w-[160px] px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white
                         text-sm font-medium rounded-md shadow-sm hover:shadow-md transition-all
                         focus:outline-none focus:ring-2 focus:ring-green-300 focus:ring-opacity-50"
              aria-label={`Find movies with similar runtime to ${movie.title}`}
            >
              Similar Runtime
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
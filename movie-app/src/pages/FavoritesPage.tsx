import React, { useEffect, useState } from 'react';
import { fetchFavorites, removeFavorite } from '../services/api';
import { fetchMovieDetails } from '../services/api'; // You'll need to add this to your api.ts
import MovieList from '../components/MovieList';
import { Movie } from '../types/movie';

const FavoritesPage: React.FC = () => {
  const [favoriteMovies, setFavoriteMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch favorite movie details
  const fetchFavoriteMoviesDetails = async (favoriteIds: number[]) => {
    try {
      const moviePromises = favoriteIds.map(id => fetchMovieDetails(id));
      const movies = await Promise.all(moviePromises);
      setFavoriteMovies(movies);
    } catch (err) {
      setError('Failed to load favorite movies details');
      console.error(err);
    }
  };

  // Load favorites
  useEffect(() => {
    const loadFavorites = async () => {
      try {
        setIsLoading(true);
        const favoriteIds = await fetchFavorites();

        if (favoriteIds.length === 0) {
          setFavoriteMovies([]);
          return;
        }

        await fetchFavoriteMoviesDetails(favoriteIds);
      } catch (err) {
        setError('Failed to load favorites');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadFavorites();
  }, []);

  const handleRemoveFavorite = async (movieId: number) => {
    try {
      await removeFavorite(movieId);
      setFavoriteMovies(prev => prev.filter(movie => movie.id !== movieId));
    } catch (err) {
      setError('Failed to remove favorite');
      console.error(err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline"> {error}</span>
        <button
          onClick={() => window.location.reload()}
          className="absolute top-0 bottom-0 right-0 px-4 py-3"
        >
          <svg className="fill-current h-6 w-6 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <title>Close</title>
            <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/>
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Favorite Movies</h1>

      {favoriteMovies.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-xl text-gray-600 mb-4">You haven't added any favorites yet.</p>
          <p className="text-gray-500">Browse movies and click the ♥ icon to add them to your favorites.</p>
        </div>
      ) : (
        <MovieList
          movies={favoriteMovies}
          onRemoveFavorite={handleRemoveFavorite}
          showDetails={true}
        />
      )}
    </div>
  );
};

export default FavoritesPage;
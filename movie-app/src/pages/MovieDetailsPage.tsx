import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchMovieDetails, fetchSimilarGenres, fetchSimilarRuntime } from '../services/api';
import MovieList from '../components/MovieList';
import { Movie } from '../types/movie';
import { addFavorite, removeFavorite, fetchFavorites } from '../services/api';

const MovieDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [similarByGenre, setSimilarByGenre] = useState<Movie[]>([]);
  const [similarByRuntime, setSimilarByRuntime] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState<'genre' | 'runtime'>('genre');

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const movieId = Number(id);

        // Load favorites first
        const favs = await fetchFavorites();
        setFavorites(favs);

        // Load main movie details
        const movieData = await fetchMovieDetails(movieId);
        setMovie(movieData);

        // Load similar movies
        const [byGenre, byRuntime] = await Promise.all([
          fetchSimilarGenres(movieId),
          fetchSimilarRuntime(movieId)
        ]);

        setSimilarByGenre(byGenre);
        setSimilarByRuntime(byRuntime.filter(m => m.id !== movieId)); // Exclude current movie

      } catch (err) {
        setError('Failed to load movie details');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [id]);

  const handleFavoriteToggle = async () => {
    if (!movie) return;

    try {
      if (favorites.includes(movie.id)) {
        await removeFavorite(movie.id);
        setFavorites(prev => prev.filter(id => id !== movie.id));
      } else {
        await addFavorite(movie.id);
        setFavorites(prev => [...prev, movie.id]);
      }
    } catch (err) {
      setError('Failed to update favorites');
      console.error(err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative max-w-2xl mx-auto mt-8">
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline"> {error}</span>
        <button
          onClick={() => window.location.reload()}
          className="absolute top-0 bottom-0 right-0 px-4 py-3"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold">Movie not found</h2>
        <p className="text-gray-600 mt-2">The movie you're looking for doesn't exist.</p>
      </div>
    );
  }

  const posterUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : '/placeholder-movie.png';

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8 mb-12">
        <div className="md:w-1/3">
          <img
            src={posterUrl}
            alt={movie.title}
            className="w-full rounded-lg shadow-lg"
          />
        </div>

        <div className="md:w-2/3">
          <div className="flex justify-between items-start">
            <h1 className="text-3xl font-bold mb-2">{movie.title}</h1>
            <button
              onClick={handleFavoriteToggle}
              className={`px-4 py-2 rounded-full ${favorites.includes(movie.id) 
                ? 'bg-red-500 text-white hover:bg-red-600' 
                : 'bg-gray-200 hover:bg-gray-300'}`}
            >
              {favorites.includes(movie.id) ? '♥ Remove Favorite' : '♡ Add Favorite'}
            </button>
          </div>

          <div className="flex items-center mb-4">
            <span className="text-yellow-500 mr-1">★</span>
            <span>{movie.vote_average?.toFixed(1)}/10</span>
            <span className="mx-2">•</span>
            <span>{movie.runtime} minutes</span>
            <span className="mx-2">•</span>
            <span>{movie.release_date?.substring(0, 4)}</span>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Overview</h3>
            <p className="text-gray-700">{movie.overview}</p>
          </div>

          {movie.genres && movie.genres.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Genres</h3>
              <div className="flex flex-wrap gap-2">
                {movie.genres.map(genre => (
                  <span
                    key={genre.id}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mb-8">
        <div className="flex border-b mb-4">
          <button
            className={`px-4 py-2 font-medium ${activeTab === 'genre' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('genre')}
          >
            Similar by Genre ({similarByGenre.length})
          </button>
          <button
            className={`px-4 py-2 font-medium ${activeTab === 'runtime' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('runtime')}
          >
            Similar by Runtime ({similarByRuntime.length})
          </button>
        </div>

        {activeTab === 'genre' ? (
          similarByGenre.length > 0 ? (
            <MovieList
              movies={similarByGenre}
              favorites={favorites}
              onAddFavorite={addFavorite}
              onRemoveFavorite={removeFavorite}
            />
          ) : (
            <p className="text-gray-500">No similar movies found by genre.</p>
          )
        ) : similarByRuntime.length > 0 ? (
          <MovieList
            movies={similarByRuntime}
            favorites={favorites}
            onAddFavorite={addFavorite}
            onRemoveFavorite={removeFavorite}
          />
        ) : (
          <p className="text-gray-500">No similar movies found by runtime.</p>
        )}
      </div>
    </div>
  );
};

export default MovieDetailsPage;
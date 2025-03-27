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
  const [favoriteMovies, setFavoriteMovies] = useState<Movie[]>([]); // Changed to store Movie objects

  const [activeTab, setActiveTab] = useState<'genre' | 'runtime'>('genre');

  // Extract just the favorite IDs for checking
  const favoriteIds = favoriteMovies.map(movie => movie.id);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const movieId = Number(id);

        // Load favorites - now gets full movie objects
        const favs = await fetchFavorites();
        setFavoriteMovies(favs);

        // Load main movie details
        const movieData = await fetchMovieDetails(movieId);
        setMovie(movieData);

        // Load similar movies
        const [byGenre, byRuntime] = await Promise.all([
          fetchSimilarGenres(movieId),
          fetchSimilarRuntime(movieId)
        ]);

        setSimilarByGenre(byGenre);
        setSimilarByRuntime(byRuntime.filter(m => m.id !== movieId));

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
      if (favoriteIds.includes(movie.id)) {
        await removeFavorite(movie.id);
        setFavoriteMovies(prev => prev.filter(m => m.id !== movie.id));
      } else {
        await addFavorite(movie.id);
        // Fetch the full movie details to add to favorites
        const movieData = await fetchMovieDetails(movie.id);
        setFavoriteMovies(prev => [...prev, movieData]);
      }
    } catch (err) {
      setError('Failed to update favorites');
      console.error(err);
    }
  };

  // ... [rest of the component remains the same until the MovieList components]

  return (
    <div className="container mx-auto px-4 py-8">
      {/* ... [previous JSX remains the same until the MovieList components] ... */}

      {activeTab === 'genre' ? (
        similarByGenre.length > 0 ? (
          <MovieList
            movies={similarByGenre}
            favorites={favoriteIds} // Pass just the IDs for checking
            onAddFavorite={addFavorite}
            onRemoveFavorite={removeFavorite}
          />
        ) : (
          <p className="text-gray-500">No similar movies found by genre.</p>
        )
      ) : similarByRuntime.length > 0 ? (
        <MovieList
          movies={similarByRuntime}
          favorites={favoriteIds} // Pass just the IDs for checking
          onAddFavorite={addFavorite}
          onRemoveFavorite={removeFavorite}
        />
      ) : (
        <p className="text-gray-500">No similar movies found by runtime.</p>
      )}
    </div>
  );
};

export default MovieDetailsPage;
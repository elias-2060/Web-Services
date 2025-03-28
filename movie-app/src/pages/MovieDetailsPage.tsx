import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchMovieDetails, fetchSimilarGenres, fetchSimilarRuntime, fetchFavorites } from '../services/api';
import MovieList from '../components/MovieList';
import { Movie } from '../types/movie';

const MovieDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [similarByGenre, setSimilarByGenre] = useState<Movie[]>([]);
  const [similarByRuntime, setSimilarByRuntime] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [favoriteMovies, setFavoriteMovies] = useState<Movie[]>([]);
  const [activeTab, setActiveTab] = useState<'genre' | 'runtime'>('genre');

  const favoriteIds = favoriteMovies.map(movie => movie.id);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const movieId = Number(id);

      // Load favorites
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

  useEffect(() => {
    loadData();
  }, [id]);

  return (
    <div className="container mx-auto px-4 py-8">

      {activeTab === 'genre' ? (
        similarByGenre.length > 0 ? (
          <MovieList
            movies={similarByGenre}
            favorites={favoriteIds}
            onFavoriteUpdate={loadData}
          />
        ) : (
          <p className="text-gray-500">No similar movies found by genre.</p>
        )
      ) : similarByRuntime.length > 0 ? (
        <MovieList
          movies={similarByRuntime}
          favorites={favoriteIds}
          onFavoriteUpdate={loadData}
        />
      ) : (
        <p className="text-gray-500">No similar movies found by runtime.</p>
      )}
    </div>
  );
};

export default MovieDetailsPage;
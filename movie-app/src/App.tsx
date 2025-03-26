import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import RandomMoviesPage from './pages/RandomMoviesPage';
import PopularMoviesPage from './pages/PopularMoviesPage';
import FavoritesPage from './pages/FavoritesPage';

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Navbar />

        <div className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/random" element={<RandomMoviesPage />} />
            <Route path="/popular" element={<PopularMoviesPage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
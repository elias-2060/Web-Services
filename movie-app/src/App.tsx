import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import PopularMoviesPage from './pages/PopularMoviesPage';
import FavoritesPage from './pages/FavoritesPage';
import SimilarGenresPage from "./pages/SimilarGenresPage";
import SimilarRuntimePage from "./pages/SimilarRuntimePage";
import CompareMoviesPage from "./pages/CompareMoviesPage";

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Navbar />

        <div className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/popular" element={<PopularMoviesPage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/similar-genres" element={<SimilarGenresPage/>} />
            <Route path="/similar-runtime" element={<SimilarRuntimePage/>} />
            <Route path="/compare" element={<CompareMoviesPage/>} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
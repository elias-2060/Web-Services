import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import PopularMoviesPage from './pages/PopularMoviesPage';
import FavoritesPage from './pages/FavoritesPage';
import SimilarGenresPage from "./pages/SimilarGenresPage";
import SimilarRuntimePage from "./pages/SimilarRuntimePage";
import CompareMoviesPage from "./pages/CompareMoviesPage";

/**
 * Main application component that sets up the routing and overall layout
 *
 * @component
 * @returns {React.FC} The root application component with routing configuration
 *
 */
const App: React.FC = () => {
  return (
    <Router>
      {/* Main container with minimum height and background color */}
      <div className="min-h-screen bg-gray-100">
        {/* Navigation bar displayed on all pages */}
        <Navbar />

        {/* Main content container with responsive padding */}
        <div className="container mx-auto px-4 py-8">
          {/* Application routes configuration */}
          <Routes>
            {/* Home page route */}
            <Route path="/" element={<HomePage />} />

            {/* Popular movies listing page */}
            <Route path="/popular" element={<PopularMoviesPage />} />

            {/* User's favorite movies page */}
            <Route path="/favorites" element={<FavoritesPage />} />

            {/* Movies with similar genres page */}
            <Route path="/similar-genres" element={<SimilarGenresPage/>} />

            {/* Movies with similar runtime page */}
            <Route path="/similar-runtime" element={<SimilarRuntimePage/>} />

            {/* Movie comparison tool page */}
            <Route path="/compare" element={<CompareMoviesPage/>} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
/**
 * Navbar Component
 *
 * The main navigation bar for the application.
 *
 * Features:
 * - Responsive design
 * - Consistent styling with shadow and color scheme
 * - Navigation links to all major sections
 *
 * Dependencies:
 * - react-router-dom for navigation
 */

import React from 'react';
import { Link } from 'react-router-dom';

const Navbar: React.FC = () => {
  return (
    <nav
      className="bg-blue-600 text-white shadow-lg"
      aria-label="Main navigation"
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* App logo/home link */}
          <Link
            to="/"
            className="text-xl font-bold"
            aria-label="Movie Explorer home"
          >
            Movie Explorer
          </Link>

          {/* Navigation links */}
          <div className="flex space-x-6">
            <Link
              to="/popular"
              className="hover:text-blue-200"
              aria-label="Popular movies"
            >
              Popular Movies
            </Link>
            <Link
              to="/similar-genres"
              className="hover:text-blue-200"
              aria-label="Movies by similar genres"
            >
              Similar Genres
            </Link>
            <Link
              to="/similar-runtime"
              className="hover:text-blue-200"
              aria-label="Movies by similar runtime"
            >
              Similar Runtime
            </Link>
            <Link
              to="/compare"
              className="hover:text-blue-200"
              aria-label="Compare movies"
            >
              Compare Movies
            </Link>
            <Link
              to="/favorites"
              className="hover:text-blue-200"
              aria-label="My favorite movies"
            >
              My Favorites
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
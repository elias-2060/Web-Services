import React from 'react';
import { Link } from 'react-router-dom';

const Navbar: React.FC = () => {
  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-xl font-bold">
            Movie Explorer
          </Link>

          <div className="flex space-x-6">
            <Link to="/random" className="hover:text-blue-200">
              Random Movies
            </Link>
            <Link to="/popular" className="hover:text-blue-200">
              Popular Movies
            </Link>
            <Link to="/favorites" className="hover:text-blue-200">
              My Favorites
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
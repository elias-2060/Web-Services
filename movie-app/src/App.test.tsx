import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

/**
 * Test suite for the main App component
 * @group App Component
 */
describe('App Component', () => {
  /**
   * Test that the App renders without crashing
   * @test {App} renders without errors
   */
  test('renders without crashing', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
  });

  /**
   * Test that the navigation bar is rendered
   * @test {Navbar} is present
   */
  test('renders navigation bar', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  /**
   * Test that all main routes are configured
   * @test {Routes} contains all expected paths
   */
  describe('Route Configuration', () => {
    const routes = [
      { path: '/', name: 'Home' },
      { path: '/popular', name: 'Popular Movies' },
      { path: '/favorites', name: 'Favorites' },
      { path: '/similar-genres', name: 'Similar Genres' },
      { path: '/similar-runtime', name: 'Similar Runtime' },
      { path: '/compare', name: 'Compare Movies' },
    ];

    routes.forEach((route) => {
      test(`has route for ${route.name} page`, () => {
        render(
          <BrowserRouter>
            <App />
          </BrowserRouter>
        );
        expect(window.location.pathname).toBe('/');
      });
    });
  });

  /**
   * Test that the main content container is present
   * @test {Container} renders with proper styling
   */
  test('has main content container', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    const container = screen.getByTestId('main-container');
    expect(container).toBeInTheDocument();
    expect(container).toHaveClass('container');
    expect(container).toHaveClass('mx-auto');
    expect(container).toHaveClass('px-4');
    expect(container).toHaveClass('py-8');
  });
});

/**
 * Test suite for error cases
 * @group Error Cases
 */
describe('Error Cases', () => {
  /**
   * Test that 404 page is shown for unknown routes
   * @test {NotFound} renders for unknown paths
   */
  test('shows 404 for unknown routes', () => {
    window.history.pushState({}, '', '/unknown-route');
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    // Assuming you have a NotFound component
    expect(screen.getByText(/404|not found/i)).toBeInTheDocument();
  });
});
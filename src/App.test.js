import { render, screen } from '@testing-library/react';
import App from './App';

// Mock axios pour éviter les problèmes de modules ES
jest.mock('axios', () => ({
  create: jest.fn(() => ({
    defaults: {
      headers: {
        common: {}
      }
    },
    get: jest.fn().mockResolvedValue({ data: {} })
  }))
}));

// Mock Keycloak pour éviter les erreurs de test
jest.mock('keycloak-js', () => {
  return jest.fn().mockImplementation(() => ({
    init: jest.fn().mockResolvedValue(true),
    authenticated: true,
    token: 'mock-token',
    tokenParsed: { sub: 'user123' },
    login: jest.fn(),
    logout: jest.fn(),
    hasRealmRole: jest.fn().mockReturnValue(true),
    hasResourceRole: jest.fn().mockReturnValue(true),
    isTokenExpired: jest.fn().mockReturnValue(false),
    updateToken: jest.fn().mockResolvedValue(true),
    onTokenExpired: null
  }));
});

test('renders Sims title', () => {
  render(<App />);
  const titleElement = screen.getByText(/sims/i);
  expect(titleElement).toBeInTheDocument();
});

test('renders authentication button', () => {
  render(<App />);
  const authButton = screen.getByText(/is authenticated/i);
  expect(authButton).toBeInTheDocument();
});

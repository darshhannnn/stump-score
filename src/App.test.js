import { render, screen } from '@testing-library/react';
import App from './App';

test('renders app header', () => {
  render(<App />);
  const brandElement = screen.getAllByText(/stumpscore/i)[0];
  expect(brandElement).toBeInTheDocument();
});

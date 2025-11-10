import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Kamaji header', () => {
  render(<App />);
  expect(screen.getByText(/Kamaji/i)).toBeInTheDocument();
});

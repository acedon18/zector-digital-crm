import React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../App';

test('renders main app text', () => {
  render(<App />);
  expect(screen.getByText(/Zector Digital Leads CRM Frontend/i)).toBeInTheDocument();
});

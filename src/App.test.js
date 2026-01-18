import { render, screen } from '@testing-library/react';
import App from './App';

test('renders JMESPath Testing Tool title', () => {
  render(<App />);
  const titleElement = screen.getByText(/JMESPath Testing Tool/i);
  expect(titleElement).toBeInTheDocument();
});

test('renders input areas', () => {
  render(<App />);
  const jmespathInput = screen.getByPlaceholderText(/Enter JMESPath expression/i);
  const jsonInput = screen.getByPlaceholderText(/Enter JSON data here/i);
  expect(jmespathInput).toBeInTheDocument();
  expect(jsonInput).toBeInTheDocument();
});

test('renders result area', () => {
  render(<App />);
  const resultArea = screen.getByPlaceholderText(/Results will appear here/i);
  expect(resultArea).toBeInTheDocument();
});
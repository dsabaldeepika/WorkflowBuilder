import { render, screen, fireEvent } from '@testing-library/react';
import { TemplateSearch } from '../TemplateSearch';
describe('TemplateSearch', () => {
  it('renders search input', () => {
    render(<TemplateSearch />);
    expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
  });
  // Add more tests for filtering, favorites, etc.
}); 
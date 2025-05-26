import { render, screen, fireEvent } from '@testing-library/react';
import { TemplateFavoriteButton } from '../TemplateFavoriteButton';
describe('TemplateFavoriteButton', () => {
  it('renders star icon', () => {
    render(<TemplateFavoriteButton templateId={1} />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
  // Add more tests for toggling favorite, callback, etc.
}); 
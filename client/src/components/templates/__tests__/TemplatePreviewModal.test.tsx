import { render, screen } from '@testing-library/react';
import { TemplatePreviewModal } from '../TemplatePreviewModal';
describe('TemplatePreviewModal', () => {
  it('renders nothing if no template is provided', () => {
    render(<TemplatePreviewModal isOpen={true} onClose={jest.fn()} template={null} onUseTemplate={jest.fn()} />);
    expect(screen.queryByText(/Use Template/i)).not.toBeInTheDocument();
  });
  // Add more tests for rendering with a template, button clicks, etc.
}); 
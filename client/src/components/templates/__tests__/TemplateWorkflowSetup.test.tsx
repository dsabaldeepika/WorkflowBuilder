import { render, screen } from '@testing-library/react';
import { TemplateWorkflowSetup } from '../TemplateWorkflowSetup';
describe('TemplateWorkflowSetup', () => {
  it('shows loading state', () => {
    render(<TemplateWorkflowSetup templateId="1" />);
    expect(screen.getByText(/Loading template/i)).toBeInTheDocument();
  });
  // Add more tests for error, success, and user flows
}); 
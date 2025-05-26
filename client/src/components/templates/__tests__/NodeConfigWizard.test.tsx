import { render, screen, fireEvent } from '@testing-library/react';
import { NodeConfigWizard } from '../NodeConfigWizard';
import { Node } from 'reactflow';

describe('NodeConfigWizard', () => {
  const mockNodes: Node<any>[] = [
    { id: '1', type: 'test', position: { x: 0, y: 0 }, data: { label: 'Test Node', config: {} } }
  ];
  it('renders loading state', () => {
    render(<NodeConfigWizard nodes={mockNodes} onComplete={jest.fn()} onCancel={jest.fn()} />);
    expect(screen.getByText(/Loading Node Configurations/i)).toBeInTheDocument();
  });
  // Add more tests for user interaction, validation, etc.
}); 
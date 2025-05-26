import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Node, Edge } from 'reactflow';
import { NodeData } from '@/types/workflow';
import { NodeConfigWizard } from '@/components/templates/NodeConfigWizard';
import { WorkflowExecutionOverview } from '@/components/workflow/WorkflowExecutionOverview';
import { NodeExecutionStatus } from '@/components/workflow/NodeExecutionStatus';
import { useNodeConfig } from '@/hooks/useNodeConfig';
import { useNodeValidation } from '@/hooks/useNodeValidation';
import { useNodeExecution } from '@/hooks/useNodeExecution';

// Mock the hooks
jest.mock('@/hooks/useNodeConfig');
jest.mock('@/hooks/useNodeValidation');
jest.mock('@/hooks/useNodeExecution');
jest.mock('@/hooks/use-toast');

describe('Node System Integration', () => {
  // Sample test data
  const mockNodes: Node<NodeData>[] = [
    {
      id: 'node1',
      type: 'trigger',
      position: { x: 0, y: 0 },
      data: {
        label: 'Trigger Node',
        nodeType: 'trigger',
        config: {
          event: 'test_event'
        }
      }
    },
    {
      id: 'node2',
      type: 'action',
      position: { x: 200, y: 0 },
      data: {
        label: 'Action Node',
        nodeType: 'action',
        config: {
          action: 'test_action'
        }
      }
    }
  ];

  const mockEdges: Edge[] = [
    {
      id: 'edge1',
      source: 'node1',
      target: 'node2',
      type: 'default'
    }
  ];

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Setup mock implementations
    (useNodeConfig as jest.Mock).mockReturnValue({
      nodeConfigs: [],
      isLoading: false,
      createConfig: jest.fn(),
      updateConfig: jest.fn(),
      deleteConfig: jest.fn(),
      validateConfig: jest.fn()
    });

    (useNodeValidation as jest.Mock).mockReturnValue({
      validateNodeConfig: jest.fn().mockReturnValue({ isValid: true }),
      validateConnection: jest.fn().mockReturnValue({ isValid: true }),
      checkForCycles: jest.fn().mockReturnValue(false)
    });

    (useNodeExecution as jest.Mock).mockReturnValue({
      executeNode: jest.fn(),
      executeWorkflow: jest.fn(),
      executionStates: {},
      isExecuting: false,
      resetExecutionStates: jest.fn()
    });
  });

  describe('NodeConfigWizard', () => {
    it('should render and handle node configuration', async () => {
      const onComplete = jest.fn();
      const onCancel = jest.fn();

      render(
        <NodeConfigWizard
          nodes={mockNodes}
          onComplete={onComplete}
          onCancel={onCancel}
        />
      );

      // Check if nodes are rendered
      expect(screen.getByText('Trigger Node')).toBeInTheDocument();
      expect(screen.getByText('Action Node')).toBeInTheDocument();

      // Test configuration validation
      const nextButton = screen.getByText('Next');
      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(useNodeValidation().validateNodeConfig).toHaveBeenCalled();
      });
    });
  });

  describe('WorkflowExecutionOverview', () => {
    it('should render and handle workflow execution', async () => {
      render(
        <WorkflowExecutionOverview
          nodes={mockNodes}
          edges={mockEdges}
        />
      );

      // Check if execution controls are rendered
      expect(screen.getByText('Execute')).toBeInTheDocument();
      expect(screen.getByText('Reset')).toBeInTheDocument();

      // Test workflow execution
      const executeButton = screen.getByText('Execute');
      fireEvent.click(executeButton);

      await waitFor(() => {
        expect(useNodeExecution().executeWorkflow).toHaveBeenCalledWith(mockNodes, mockEdges);
      });
    });
  });

  describe('NodeExecutionStatus', () => {
    it('should render node execution status correctly', () => {
      const mockNode = mockNodes[0];
      
      render(
        <NodeExecutionStatus
          node={mockNode}
          status="running"
          startTime={Date.now()}
        />
      );

      expect(screen.getByText('Executing...')).toBeInTheDocument();
    });

    it('should handle execution success', () => {
      const mockNode = mockNodes[0];
      const result = { success: true };
      
      render(
        <NodeExecutionStatus
          node={mockNode}
          status="success"
          result={result}
          startTime={Date.now() - 1000}
          endTime={Date.now()}
        />
      );

      expect(screen.getByText('Completed successfully')).toBeInTheDocument();
    });

    it('should handle execution error', () => {
      const mockNode = mockNodes[0];
      const error = new Error('Test error');
      
      render(
        <NodeExecutionStatus
          node={mockNode}
          status="error"
          error={error}
          startTime={Date.now() - 1000}
          endTime={Date.now()}
        />
      );

      expect(screen.getByText('Test error')).toBeInTheDocument();
    });
  });

  describe('End-to-end workflow execution', () => {
    it('should execute a complete workflow successfully', async () => {
      const mockExecuteWorkflow = jest.fn().mockResolvedValue({
        node1: { success: true },
        node2: { success: true }
      });

      (useNodeExecution as jest.Mock).mockReturnValue({
        executeWorkflow: mockExecuteWorkflow,
        executionStates: {
          node1: { status: 'success', result: { success: true } },
          node2: { status: 'success', result: { success: true } }
        },
        isExecuting: false
      });

      render(
        <WorkflowExecutionOverview
          nodes={mockNodes}
          edges={mockEdges}
        />
      );

      // Execute workflow
      const executeButton = screen.getByText('Execute');
      fireEvent.click(executeButton);

      await waitFor(() => {
        expect(mockExecuteWorkflow).toHaveBeenCalledWith(mockNodes, mockEdges);
      });

      // Check execution results
      expect(screen.getByText('Completed successfully')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument(); // Total nodes
      expect(screen.getByText('2')).toBeInTheDocument(); // Completed nodes
    });

    it('should handle workflow execution errors', async () => {
      const mockError = new Error('Workflow execution failed');
      const mockExecuteWorkflow = jest.fn().mockRejectedValue(mockError);

      (useNodeExecution as jest.Mock).mockReturnValue({
        executeWorkflow: mockExecuteWorkflow,
        executionStates: {
          node1: { status: 'success', result: { success: true } },
          node2: { status: 'error', error: mockError }
        },
        isExecuting: false
      });

      render(
        <WorkflowExecutionOverview
          nodes={mockNodes}
          edges={mockEdges}
        />
      );

      // Execute workflow
      const executeButton = screen.getByText('Execute');
      fireEvent.click(executeButton);

      await waitFor(() => {
        expect(mockExecuteWorkflow).toHaveBeenCalledWith(mockNodes, mockEdges);
        expect(screen.getByText('Workflow execution failed')).toBeInTheDocument();
      });
    });
  });
}); 
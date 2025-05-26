import { useCallback, useState } from 'react';
import { Node, Edge } from 'reactflow';
import { NodeData } from '@/types/workflow';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/lib/logger';

interface NodeExecutionOptions {
  onExecutionStart?: (nodeId: string) => void;
  onExecutionComplete?: (nodeId: string, result: any) => void;
  onExecutionError?: (nodeId: string, error: Error) => void;
  onWorkflowComplete?: (results: Record<string, any>) => void;
}

interface NodeExecutionState {
  status: 'idle' | 'running' | 'success' | 'error';
  result?: any;
  error?: Error;
  startTime?: number;
  endTime?: number;
}

export function useNodeExecution({
  onExecutionStart,
  onExecutionComplete,
  onExecutionError,
  onWorkflowComplete,
}: NodeExecutionOptions = {}) {
  const { toast } = useToast();
  const [executionStates, setExecutionStates] = useState<Record<string, NodeExecutionState>>({});
  const [isExecuting, setIsExecuting] = useState(false);

  // Execute a single node
  const executeNode = useCallback(async (
    node: Node<NodeData>,
    inputs: Record<string, any> = {}
  ) => {
    try {
      logger.info(`Executing node ${node.id}`, {
        nodeId: node.id,
        nodeType: node.type,
        inputs
      });

      // Update node state to running
      setExecutionStates(prev => ({
        ...prev,
        [node.id]: {
          status: 'running',
          startTime: Date.now()
        }
      }));

      onExecutionStart?.(node.id);

      // Make API call to execute node
      const response = await fetch(`/api/workflow/execute-node/${node.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs,
          config: node.data?.config
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to execute node: ${response.statusText}`);
      }

      const result = await response.json();

      // Update node state to success
      setExecutionStates(prev => ({
        ...prev,
        [node.id]: {
          status: 'success',
          result,
          startTime: prev[node.id]?.startTime,
          endTime: Date.now()
        }
      }));

      onExecutionComplete?.(node.id, result);
      return result;
    } catch (error) {
      logger.error(`Error executing node ${node.id}:`, 
        error instanceof Error ? error : new Error(String(error))
      );

      // Update node state to error
      setExecutionStates(prev => ({
        ...prev,
        [node.id]: {
          status: 'error',
          error: error instanceof Error ? error : new Error(String(error)),
          startTime: prev[node.id]?.startTime,
          endTime: Date.now()
        }
      }));

      onExecutionError?.(node.id, error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }, [onExecutionStart, onExecutionComplete, onExecutionError]);

  // Execute workflow
  const executeWorkflow = useCallback(async (
    nodes: Node<NodeData>[],
    edges: Edge[]
  ) => {
    if (isExecuting) {
      toast({
        title: 'Workflow Execution',
        description: 'Workflow is already executing',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsExecuting(true);
      const results: Record<string, any> = {};

      // Build dependency graph
      const graph = new Map<string, string[]>();
      const inDegree = new Map<string, number>();
      
      nodes.forEach(node => {
        graph.set(node.id, []);
        inDegree.set(node.id, 0);
      });

      edges.forEach(edge => {
        graph.get(edge.source)?.push(edge.target);
        inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1);
      });

      // Find nodes with no dependencies
      const queue = nodes
        .filter(node => (inDegree.get(node.id) || 0) === 0)
        .map(node => node.id);

      // Execute nodes in topological order
      while (queue.length > 0) {
        const nodeId = queue.shift()!;
        const node = nodes.find(n => n.id === nodeId);
        
        if (!node) continue;

        try {
          // Get input values from predecessor nodes
          const inputs = edges
            .filter(edge => edge.target === nodeId)
            .reduce((acc, edge) => ({
              ...acc,
              [edge.targetHandle || 'input']: results[edge.source]
            }), {});

          // Execute node
          const result = await executeNode(node, inputs);
          results[nodeId] = result;

          // Add successor nodes to queue
          graph.get(nodeId)?.forEach(successorId => {
            inDegree.set(successorId, (inDegree.get(successorId) || 0) - 1);
            if (inDegree.get(successorId) === 0) {
              queue.push(successorId);
            }
          });
        } catch (error) {
          logger.error(`Error executing workflow at node ${nodeId}:`, 
            error instanceof Error ? error : new Error(String(error))
          );
          throw error;
        }
      }

      onWorkflowComplete?.(results);
      
      toast({
        title: 'Workflow Execution',
        description: 'Workflow executed successfully',
        variant: 'default',
      });

      return results;
    } catch (error) {
      logger.error('Error executing workflow:', 
        error instanceof Error ? error : new Error(String(error))
      );
      
      toast({
        title: 'Workflow Execution Error',
        description: error instanceof Error ? error.message : 'Failed to execute workflow',
        variant: 'destructive',
      });
      
      throw error;
    } finally {
      setIsExecuting(false);
    }
  }, [executeNode, isExecuting, onWorkflowComplete, toast]);

  // Reset execution states
  const resetExecutionStates = useCallback(() => {
    setExecutionStates({});
    setIsExecuting(false);
  }, []);

  return {
    executeNode,
    executeWorkflow,
    executionStates,
    isExecuting,
    resetExecutionStates,
  };
} 
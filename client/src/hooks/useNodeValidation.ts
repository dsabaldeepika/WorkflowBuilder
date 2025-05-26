import { Node, Edge, Connection } from 'reactflow';
import { NodeData, NodeConfig } from '@/types/workflow';
import { useCallback } from 'react';

interface ValidationResult {
  isValid: boolean;
  message?: string;
}

interface UseNodeValidationOptions {
  onValidationError?: (error: string) => void;
}

export function useNodeValidation({ onValidationError }: UseNodeValidationOptions = {}) {
  // Validate node configuration
  const validateNodeConfig = useCallback((node: Node<NodeData>, config: NodeConfig): ValidationResult => {
    try {
      // Check required fields
      if (config.inputFields) {
        for (const field of config.inputFields) {
          if (field.required && !node.data?.config?.[field.name]) {
            throw new Error(`Required field "${field.name}" is missing`);
          }
        }
      }

      // Validate field types and constraints
      if (node.data?.config && config.inputFields) {
        for (const field of config.inputFields) {
          const value = node.data.config[field.name];
          if (value !== undefined) {
            // Type validation
            switch (field.type) {
              case 'number':
                if (typeof value !== 'number') {
                  throw new Error(`Field "${field.name}" must be a number`);
                }
                // Range validation
                if (field.validation?.min !== undefined && value < field.validation.min) {
                  throw new Error(`Field "${field.name}" must be at least ${field.validation.min}`);
                }
                if (field.validation?.max !== undefined && value > field.validation.max) {
                  throw new Error(`Field "${field.name}" must be at most ${field.validation.max}`);
                }
                break;
              case 'string':
                if (typeof value !== 'string') {
                  throw new Error(`Field "${field.name}" must be a string`);
                }
                // Pattern validation
                if (field.validation?.pattern && !new RegExp(field.validation.pattern).test(value)) {
                  throw new Error(`Field "${field.name}" has invalid format`);
                }
                break;
              case 'boolean':
                if (typeof value !== 'boolean') {
                  throw new Error(`Field "${field.name}" must be a boolean`);
                }
                break;
              case 'array':
                if (!Array.isArray(value)) {
                  throw new Error(`Field "${field.name}" must be an array`);
                }
                break;
              case 'object':
                if (typeof value !== 'object' || value === null || Array.isArray(value)) {
                  throw new Error(`Field "${field.name}" must be an object`);
                }
                break;
            }
          }
        }
      }

      return { isValid: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Validation failed';
      onValidationError?.(message);
      return { isValid: false, message };
    }
  }, [onValidationError]);

  // Validate node connections
  const validateConnection = useCallback((
    connection: Connection,
    nodes: Node<NodeData>[],
    edges: Edge[]
  ): ValidationResult => {
    try {
      const sourceNode = nodes.find(n => n.id === connection.source);
      const targetNode = nodes.find(n => n.id === connection.target);

      if (!sourceNode || !targetNode) {
        throw new Error('Invalid connection: source or target node not found');
      }

      // Check if connection already exists
      const connectionExists = edges.some(
        edge => edge.source === connection.source && 
               edge.target === connection.target &&
               edge.sourceHandle === connection.sourceHandle &&
               edge.targetHandle === connection.targetHandle
      );

      if (connectionExists) {
        throw new Error('Connection already exists');
      }

      // Validate port compatibility
      const sourcePort = sourceNode.data?.ports?.find(p => p.id === connection.sourceHandle);
      const targetPort = targetNode.data?.ports?.find(p => p.id === connection.targetHandle);

      if (!sourcePort || !targetPort) {
        throw new Error('Invalid connection: port not found');
      }

      // Check port types
      if (sourcePort.type !== 'output' || targetPort.type !== 'input') {
        throw new Error('Invalid connection: incompatible port types');
      }

      // Check data type compatibility
      if (sourcePort.dataType !== targetPort.dataType) {
        // Check if target port allows this data type
        if (!targetPort.allowedConnections?.includes(sourcePort.dataType)) {
          throw new Error(`Invalid connection: incompatible data types (${sourcePort.dataType} → ${targetPort.dataType})`);
        }
      }

      // Check for circular dependencies
      const wouldCreateCycle = checkForCycles(nodes, edges, connection);
      if (wouldCreateCycle) {
        throw new Error('Invalid connection: would create a circular dependency');
      }

      return { isValid: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Validation failed';
      onValidationError?.(message);
      return { isValid: false, message };
    }
  }, [onValidationError]);

  // Helper function to check for cycles in the graph
  const checkForCycles = useCallback((
    nodes: Node<NodeData>[],
    edges: Edge[],
    newConnection: Connection
  ): boolean => {
    const graph = new Map<string, string[]>();
    
    // Build adjacency list from existing edges
    for (const edge of edges) {
      if (!graph.has(edge.source)) {
        graph.set(edge.source, []);
      }
      graph.get(edge.source)?.push(edge.target);
    }

    // Add the new connection
    if (newConnection.source && newConnection.target) {
      if (!graph.has(newConnection.source)) {
        graph.set(newConnection.source, []);
      }
      graph.get(newConnection.source)?.push(newConnection.target);
    }

    // Helper function for DFS
    const hasCycle = (node: string, visited: Set<string>, recursionStack: Set<string>): boolean => {
      visited.add(node);
      recursionStack.add(node);

      const neighbors = graph.get(node) || [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          if (hasCycle(neighbor, visited, recursionStack)) {
            return true;
          }
        } else if (recursionStack.has(neighbor)) {
          return true;
        }
      }

      recursionStack.delete(node);
      return false;
    };

    // Check for cycles from each node
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    for (const node of nodes) {
      if (!visited.has(node.id)) {
        if (hasCycle(node.id, visited, recursionStack)) {
          return true;
        }
      }
    }

    return false;
  }, []);

  return {
    validateNodeConfig,
    validateConnection,
    checkForCycles,
  };
} 
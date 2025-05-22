import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Node, Edge } from 'reactflow';
import { NodeData } from '@/store/useWorkflowStore';

export interface WorkflowData {
  id: number;
  name: string;
  description: string | null;
  nodes: Node<NodeData>[];
  edges: Edge[];
  createdAt: string;
  updatedAt: string;
}

export function useWorkflow(id: string | number) {
  return useQuery<WorkflowData>({
    queryKey: ['/api/workflows', id],
    queryFn: async () => {
      const res = await fetch(`/api/workflows/${id}`);
      if (!res.ok) throw new Error(`Failed to fetch workflow with id ${id}`);
      return res.json();
    }
  });
}

export function useWorkflowTemplate(id: string | number) {
  return useQuery({
    queryKey: ['/api/workflow/templates', id],
    queryFn: async () => {
      const res = await fetch(`/api/workflow/templates/${id}`);
      if (!res.ok) throw new Error(`Failed to fetch template with id ${id}`);
      const template = await res.json();
      
      // Parse nodes and edges if they're strings
      if (typeof template.nodes === 'string') {
        template.nodes = JSON.parse(template.nodes);
      }
      if (typeof template.edges === 'string') {
        template.edges = JSON.parse(template.edges);
      }

      // Map backend node data to frontend format
      template.nodes = template.nodes.map((node: any) => {
        // Ensure proper node structure
        const nodeData: NodeData = {
          label: node.data?.label || node.data?.name || node.id,
          backendId: node.data?.nodeTypeId, // Reference to the backend node type
          service: node.data?.service || '',
          event: node.data?.event || '',
          action: node.data?.action || '',
          config: node.data?.config || {},
          description: node.data?.description
        };

        return {
          id: node.id,
          type: node.type || 'default',
          position: node.position || { x: 0, y: 0 },
          data: nodeData
        };
      });

      return template;
    }
  });
}

export function useSaveWorkflow() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { 
      name: string; 
      description?: string; 
      nodes: Node<NodeData>[]; 
      edges: Edge[];
      id?: number;
    }) => {
      const url = data.id ? `/api/workflows/${data.id}` : '/api/workflows';
      const method = data.id ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!res.ok) throw new Error('Failed to save workflow');
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/workflows'] });
      return data;
    },
  });
}

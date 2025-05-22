import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Node, Edge } from 'reactflow';
import { NodeData } from '@/store/useWorkflowStore';

export interface WorkflowTemplate {
  id: number;
  name: string;
  description: string | null;
  category: string;
  nodes: Node<NodeData>[];
  edges: Edge[];
  isOfficial: boolean;
  imageUrl: string | null;
  popularity: number;
  createdAt: string;
  updatedAt: string;
}

export function useTemplates() {
  return useQuery<WorkflowTemplate[]>({
    queryKey: ['/api/workflow/templates'],
    queryFn: async () => {
      const res = await fetch('/api/workflow/templates');
      if (!res.ok) throw new Error('Failed to fetch workflow templates');
      return res.json();
    }
  });
}

export function useTemplate(id: string | number) {
  return useQuery<WorkflowTemplate>({
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
      template.nodes = await Promise.all(template.nodes.map(async (node: any) => {
        let nodeData = { ...node.data };
        
        // If node has a nodeTypeId, fetch its configuration
        if (node.data?.nodeTypeId) {
          try {
            const typeRes = await fetch(`/api/node-types/${node.data.nodeTypeId}`);
            if (typeRes.ok) {
              const nodeType = await typeRes.json();
              nodeData = {
                ...nodeData,
                label: nodeType.displayName,
                description: nodeType.description,
                icon: nodeType.icon,
                category: nodeType.category,
                inputFields: nodeType.inputFields,
                outputFields: nodeType.outputFields,
                backendId: node.data.nodeTypeId
              };
            }
          } catch (error) {
            console.error(`Error fetching node type ${node.data.nodeTypeId}:`, error);
          }
        }

        return {
          ...node,
          data: nodeData,
          type: node.type || 'default',
          position: node.position || { x: 0, y: 0 }
        };
      }));

      return template;
    }
  });
}

export function useCreateTemplate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Partial<WorkflowTemplate>) => {
      const res = await fetch('/api/workflow/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!res.ok) throw new Error('Failed to create template');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/workflow/templates'] });
    },
  });
}

export function useUpdateTemplate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<WorkflowTemplate> }) => {
      const res = await fetch(`/api/workflow/templates/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!res.ok) throw new Error('Failed to update template');
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/workflow/templates'] });
      queryClient.invalidateQueries({ queryKey: ['/api/workflow/templates', variables.id] });
    },
  });
}

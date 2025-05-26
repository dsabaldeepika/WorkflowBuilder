import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Node, Edge } from 'reactflow';
import { NodeData } from '@/store/useWorkflowStore';

export interface WorkflowTemplate {
  id: number;
  name: string;
  description: string | null;
  category: string;
  tags: string[] | null;
  difficulty: string;
  workflowData: unknown;
  nodes: Node<NodeData>[];
  edges: Edge[];
  isOfficial: boolean;
  imageUrl: string | null;
  popularity: number;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
  isPublic: boolean;
  version: string;
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
      try {
        const res = await fetch(`/api/workflow/templates/${id}`);
        if (!res.ok) throw new Error(`Failed to fetch template with id ${id}`);
        
        const template = await res.json();
        
        // Ensure all required fields have default values
        return {
          id: template.id,
          name: template.name || 'Untitled Template',
          description: template.description || null,
          category: template.category || 'uncategorized',
          tags: template.tags || null,
          difficulty: template.difficulty || 'beginner',
          workflowData: template.workflowData || null,
          nodes: Array.isArray(template.nodes) ? template.nodes : [],
          edges: Array.isArray(template.edges) ? template.edges : [],
          isOfficial: template.isOfficial || false,
          imageUrl: template.imageUrl || null,
          popularity: template.popularity || 0,
          createdBy: template.createdBy || null,
          createdAt: template.createdAt || new Date().toISOString(),
          updatedAt: template.updatedAt || new Date().toISOString(),
          isPublic: template.isPublic || false,
          version: template.version || '1.0.0'
        };
      } catch (error) {
        console.error('Error fetching template:', error);
        throw error;
      }
    },
    retry: 1
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

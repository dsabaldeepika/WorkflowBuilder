import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface NodeConfig {
  nodeTypeId: number;
  name: string;
  displayName: string;
  category: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  inputFields: any;
  outputFields: any;
  workflowId: number | null;
  templateId: number | null;
  createdAt: string;
  updatedAt: string;
}

export function useNodeConfig(nodeId: string | number) {
  return useQuery<NodeConfig>({
    queryKey: ['/api/node-config', nodeId],
    queryFn: async () => {
      const res = await fetch(`/api/node-config/${nodeId}`);
      if (!res.ok) throw new Error(`Failed to fetch node config for id ${nodeId}`);
      return res.json();
    }
  });
}

export function useNodeConfigs(workflowId?: number) {
  return useQuery<NodeConfig[]>({
    queryKey: ['/api/node-config', { workflowId }],
    queryFn: async () => {
      const url = workflowId 
        ? `/api/node-config?workflowId=${workflowId}`
        : '/api/node-config';
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch node configs');
      return res.json();
    },
    enabled: !workflowId || !!workflowId // Only fetch if workflowId is undefined or truthy
  });
}

export function useCreateNodeConfig() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Partial<NodeConfig>) => {
      const res = await fetch('/api/node-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!res.ok) throw new Error('Failed to create node config');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/node-config'] });
    },
  });
}

export function useUpdateNodeConfig() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<NodeConfig> }) => {
      const res = await fetch(`/api/node-config/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!res.ok) throw new Error('Failed to update node config');
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/node-config'] });
      queryClient.invalidateQueries({ queryKey: ['/api/node-config', variables.id] });
    },
  });
}

export function useDeleteNodeConfig() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/node-config/${id}`, {
        method: 'DELETE',
      });
      
      if (!res.ok) throw new Error('Failed to delete node config');
      return res.json();
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['/api/node-config'] });
      queryClient.invalidateQueries({ queryKey: ['/api/node-config', id] });
    },
  });
}

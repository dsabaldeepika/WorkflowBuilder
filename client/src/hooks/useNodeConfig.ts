import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { NodeConfig, NodeConfigSchema, validateNodeConfig } from '@/types/workflow';
import { toast } from '@/hooks/use-toast';

interface UseNodeConfigOptions {
  workflowId?: number;
  templateId?: number;
  nodeId?: string;
}

interface NodeConfigResponse {
  configs: NodeConfig[];
  total: number;
  page: number;
  pageSize: number;
}

export function useNodeConfig({ workflowId, templateId, nodeId }: UseNodeConfigOptions = {}) {
  const queryClient = useQueryClient();

  // Fetch all node configurations
  const {
    data: nodeConfigs,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery<NodeConfigResponse>({
    queryKey: ['/api/node-config', { workflowId, templateId, nodeId }],
    queryFn: async () => {
      try {
        const params = new URLSearchParams();
        if (workflowId) params.append('workflowId', workflowId.toString());
        if (templateId) params.append('templateId', templateId.toString());
        if (nodeId) params.append('nodeId', nodeId);

        const res = await fetch(`/api/node-config?${params.toString()}`);
        if (!res.ok) {
          throw new Error('Failed to fetch node configurations');
        }

        const data = await res.json();
        return {
          configs: data.configs.map((config: unknown) => validateNodeConfig(config)),
          total: data.total,
          page: data.page,
          pageSize: data.pageSize
        };
      } catch (error) {
        console.error('Error fetching node configs:', error);
        throw error;
      }
    }
  });

  // Create a new node configuration
  const createMutation = useMutation({
    mutationFn: async (newConfig: Partial<NodeConfig>) => {
      try {
        const res = await fetch('/api/node-config', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newConfig),
        });

        if (!res.ok) {
          throw new Error('Failed to create node configuration');
        }

        const data = await res.json();
        return validateNodeConfig(data);
      } catch (error) {
        console.error('Error creating node config:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/node-config'] });
      toast({
        title: 'Success',
        description: 'Node configuration created successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create node configuration',
        variant: 'destructive',
      });
    },
  });

  // Update an existing node configuration
  const updateMutation = useMutation({
    mutationFn: async ({ id, config }: { id: string; config: Partial<NodeConfig> }) => {
      try {
        const res = await fetch(`/api/node-config/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(config),
        });

        if (!res.ok) {
          throw new Error('Failed to update node configuration');
        }

        const data = await res.json();
        return validateNodeConfig(data);
      } catch (error) {
        console.error('Error updating node config:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/node-config'] });
      toast({
        title: 'Success',
        description: 'Node configuration updated successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update node configuration',
        variant: 'destructive',
      });
    },
  });

  // Delete a node configuration
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      try {
        const res = await fetch(`/api/node-config/${id}`, {
          method: 'DELETE',
        });

        if (!res.ok) {
          throw new Error('Failed to delete node configuration');
        }
      } catch (error) {
        console.error('Error deleting node config:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/node-config'] });
      toast({
        title: 'Success',
        description: 'Node configuration deleted successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete node configuration',
        variant: 'destructive',
      });
    },
  });

  // Validate a node configuration
  const validateConfig = (config: unknown) => {
    try {
      return NodeConfigSchema.parse(config);
    } catch (error) {
      console.error('Node configuration validation error:', error);
      return null;
    }
  };

  return {
    nodeConfigs: nodeConfigs?.configs || [],
    total: nodeConfigs?.total || 0,
    page: nodeConfigs?.page || 1,
    pageSize: nodeConfigs?.pageSize || 10,
    isLoading,
    isError,
    error,
    refetch,
    createConfig: createMutation.mutate,
    updateConfig: updateMutation.mutate,
    deleteConfig: deleteMutation.mutate,
    validateConfig,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

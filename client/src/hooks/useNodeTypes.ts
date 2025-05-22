import { useQuery } from '@tanstack/react-query';

export interface NodeType {
  id: number;
  name: string;
  displayName: string;
  category: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  inputFields: any;
  outputFields: any;
  createdAt: string;
  updatedAt: string;
}

export function useNodeTypes() {
  return useQuery<NodeType[]>({
    queryKey: ['/api/node-types'],
    queryFn: async () => {
      const res = await fetch('/api/node-types');
      if (!res.ok) throw new Error('Failed to fetch node types');
      return res.json();
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
}

export function useNodeType(id: string | number) {
  return useQuery<NodeType>({
    queryKey: ['/api/node-types', id],
    queryFn: async () => {
      const res = await fetch(`/api/node-types/${id}`);
      if (!res.ok) throw new Error(`Failed to fetch node type with id ${id}`);
      return res.json();
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
}

export function useNodeTypeByName(name: string) {
  return useQuery<NodeType>({
    queryKey: ['/api/node-types/by-name', name],
    queryFn: async () => {
      const res = await fetch(`/api/node-types/by-name/${encodeURIComponent(name)}`);
      if (!res.ok) throw new Error(`Failed to fetch node type with name ${name}`);
      return res.json();
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
}

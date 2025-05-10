import { create } from "zustand";
import { Node, Edge } from "reactflow";
import { persist } from "zustand/middleware";

interface WorkflowState {
  nodes: Node[];
  edges: Edge[];
  isModalOpen: boolean;
  addNode: (node: Node) => void;
  setEdges: (edges: Edge[]) => void;
  removeNode: (nodeId: string) => void;
  openNodePicker: () => void;
  closeNodePicker: () => void;
  saveWorkflow: () => void;
  loadWorkflow: () => void;
  clearWorkflow: () => void;
}

export const useWorkflowStore = create<WorkflowState>()(
  persist(
    (set, get) => ({
      nodes: [],
      edges: [],
      isModalOpen: false,
      
      addNode: (node) => 
        set((state) => ({ 
          nodes: [...state.nodes, node]
        })),
      
      setEdges: (edges) => 
        set({ edges }),
      
      removeNode: (nodeId) => 
        set((state) => ({
          nodes: state.nodes.filter((node) => node.id !== nodeId),
          edges: state.edges.filter(
            (edge) => edge.source !== nodeId && edge.target !== nodeId
          ),
        })),
      
      openNodePicker: () => 
        set({ isModalOpen: true }),
      
      closeNodePicker: () => 
        set({ isModalOpen: false }),
      
      saveWorkflow: () => {
        const { nodes, edges } = get();
        localStorage.setItem('workflow', JSON.stringify({ nodes, edges }));
      },
      
      loadWorkflow: () => {
        try {
          const savedWorkflow = localStorage.getItem('workflow');
          if (savedWorkflow) {
            const { nodes, edges } = JSON.parse(savedWorkflow);
            set({ nodes, edges });
          }
        } catch (error) {
          console.error("Error loading workflow:", error);
        }
      },
      
      clearWorkflow: () => {
        localStorage.removeItem('workflow');
        set({ nodes: [], edges: [] });
      },
    }),
    {
      name: 'workflow-storage',
    }
  )
);

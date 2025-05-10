import { create } from "zustand";
import { Node, Edge } from "reactflow";
import { persist } from "zustand/middleware";

interface WorkflowState {
  nodes: Node[];
  edges: Edge[];
  isModalOpen: boolean;
  isAIAssistantOpen: boolean;
  addNode: (node: Node) => void;
  setEdges: (edges: Edge[]) => void;
  removeNode: (nodeId: string) => void;
  openNodePicker: () => void;
  closeNodePicker: () => void;
  openAIAssistant: () => void;
  closeAIAssistant: () => void;
  generateWorkflowFromDescription: (description: string) => void;
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
      isAIAssistantOpen: false,
      
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
      
      openAIAssistant: () => 
        set({ isAIAssistantOpen: true }),
      
      closeAIAssistant: () => 
        set({ isAIAssistantOpen: false }),
      
      generateWorkflowFromDescription: (description: string) => {
        // This would typically call an AI service to generate a workflow
        console.log('Generating workflow from description:', description);
        
        // For now, we'll create a simple demo workflow with 2 nodes
        const demoNode1 = {
          id: `node-${Date.now()}-1`,
          type: 'workflowNode',
          position: { x: 250, y: 100 },
          data: {
            app: {
              id: 'google-sheets',
              label: 'Google Sheets',
              description: 'Manage spreadsheet data',
              icon: () => null,
              iconBg: 'green',
              iconColor: 'green',
              modules: []
            },
            module: {
              id: 'watch-sheet',
              label: 'Watch Spreadsheet',
              description: 'Triggers when spreadsheet is updated',
              type: 'trigger',
              icon: () => null
            },
            config: {
              scheduleFrequency: 'hourly'
            }
          }
        };
        
        const demoNode2 = {
          id: `node-${Date.now()}-2`,
          type: 'workflowNode',
          position: { x: 250, y: 250 },
          data: {
            app: {
              id: 'slack',
              label: 'Slack',
              description: 'Team communication tool',
              icon: () => null,
              iconBg: 'purple',
              iconColor: 'purple',
              modules: []
            },
            module: {
              id: 'send-message',
              label: 'Send Message',
              description: 'Sends a message to a Slack channel',
              type: 'action',
              icon: () => null
            },
            config: {}
          }
        };
        
        // Add an edge connecting the nodes
        const demoEdge = {
          id: `${demoNode1.id}-${demoNode2.id}`,
          source: demoNode1.id,
          target: demoNode2.id,
          animated: true,
          style: { stroke: '#2563eb', strokeWidth: 2 },
          type: 'smoothstep'
        };
        
        set((state) => ({
          nodes: [...state.nodes, demoNode1, demoNode2],
          edges: [...state.edges, demoEdge]
        }));
      },
      
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

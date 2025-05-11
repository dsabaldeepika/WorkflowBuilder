import { create } from 'zustand';
import { Node, Edge, Connection, addEdge } from 'reactflow';
import { App, NodeCategory, Workflow, WorkflowTemplate, NodeType } from '@/types/workflow';
import { WorkflowState as NodeState } from '@/components/workflow/StateChangeAnimation';

export type NodeData = {
  label: string;
  type?: string;
  nodeType?: string;
  category?: NodeCategory;
  app?: App;
  inputs?: Record<string, any>;
  outputs?: Record<string, any>;
  icon?: string;
  description?: string;
  configuration?: Record<string, any>;
  state?: NodeState;
  optimized?: boolean;
  module?: any; // Support for module property used in some components
  ports?: Array<{
    id: string;
    type: 'input' | 'output';
    dataType: string;
    required?: boolean;
    allowedConnections?: string[];
  }>;
};

interface WorkflowStoreState {
  nodes: Node<NodeData>[];
  edges: Edge[];
  selectedNodeId: string | null;
  selectedEdgeId: string | null;
  isModalOpen: boolean;
  isAIAssistantOpen: boolean;
  isTemplateGalleryOpen: boolean;
  isAgentBuilderOpen: boolean;
  nodeStates: Record<string, NodeState>;
  connectionValidations: Record<string, {
    isValid: boolean;
    message?: string;
  }>;
  
  // Actions
  addNode: (node: Node<NodeData>) => void;
  updateNode: (id: string, data: Partial<NodeData>) => void;
  removeNode: (id: string) => void;
  onNodesChange: (changes: any) => void;
  onEdgesChange: (changes: any) => void;
  onConnect: (connection: Connection) => void;
  setNodes: (nodes: Node<NodeData>[]) => void;
  setEdges: (edges: Edge[]) => void;
  clearWorkflow: () => void;
  saveWorkflow: () => void;
  loadWorkflow: (workflow: Workflow) => void;
  exportWorkflow: () => Workflow;
  setSelectedNode: (id: string | null) => void;
  setSelectedEdge: (id: string | null) => void;
  
  // Modal controls
  openNodePicker: () => void;
  closeNodePicker: () => void;
  openAIAssistant: () => void;
  closeAIAssistant: () => void;
  openTemplateGallery: () => void;
  closeTemplateGallery: () => void;
  openAgentBuilder: () => void;
  closeAgentBuilder: () => void;
  
  // AI & template features
  generateWorkflowFromDescription: (description: string) => void;
  applyWorkflowTemplate: (template: WorkflowTemplate) => void;
  createAgent: (agentConfig: any) => void;
  
  // Node state management
  setNodeState: (nodeId: string, state: NodeState) => void;
  
  // Connection validation
  validateConnection: (connection: Connection) => boolean;
  setConnectionValidation: (edgeId: string, isValid: boolean, message?: string) => void;
}

export const useWorkflowStore = create<WorkflowStoreState>((set, get) => ({
  nodes: [],
  edges: [],
  selectedNodeId: null,
  selectedEdgeId: null,
  isModalOpen: false,
  isAIAssistantOpen: false,
  isTemplateGalleryOpen: false,
  isAgentBuilderOpen: false,
  nodeStates: {},
  connectionValidations: {},
  
  addNode: (node) => {
    set((state) => ({
      nodes: [...state.nodes, node],
    }));
  },
  
  updateNode: (id, data) => {
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === id
          ? { ...node, data: { ...node.data, ...data } }
          : node
      ),
    }));
  },
  
  removeNode: (id) => {
    set((state) => ({
      nodes: state.nodes.filter((node) => node.id !== id),
      edges: state.edges.filter(
        (edge) => edge.source !== id && edge.target !== id
      ),
    }));
  },
  
  onNodesChange: (changes) => {
    set((state) => {
      const { nodes } = state;
      // Apply all the node changes
      const updatedNodes = changes.reduce((acc: Node[], change: any) => {
        switch (change.type) {
          case 'add':
            return [...acc, change.item];
          case 'remove':
            return acc.filter((node) => node.id !== change.id);
          case 'position':
            return acc.map((node) =>
              node.id === change.id
                ? { ...node, position: change.position }
                : node
            );
          default:
            return acc;
        }
      }, nodes);
      
      return { nodes: updatedNodes };
    });
  },
  
  onEdgesChange: (changes) => {
    set((state) => {
      const { edges } = state;
      // Apply all the edge changes
      const updatedEdges = changes.reduce((acc: Edge[], change: any) => {
        switch (change.type) {
          case 'add':
            return [...acc, change.item];
          case 'remove':
            return acc.filter((edge) => edge.id !== change.id);
          default:
            return acc;
        }
      }, edges);
      
      return { edges: updatedEdges };
    });
  },
  
  onConnect: (connection) => {
    // Check if connection is valid before adding
    const isValid = get().validateConnection(connection);
    if (!isValid) return;
    
    set((state) => {
      const newEdge = {
        ...connection,
        id: `e${connection.source}-${connection.target}`,
      };
      
      return {
        edges: addEdge(newEdge, state.edges),
        connectionValidations: {
          ...state.connectionValidations,
          [newEdge.id]: { isValid: true }
        }
      };
    });
  },
  
  setNodes: (nodes) => {
    set({ nodes });
  },
  
  setEdges: (edges) => {
    set({ edges });
  },
  
  clearWorkflow: () => {
    set({
      nodes: [],
      edges: [],
      selectedNodeId: null,
      selectedEdgeId: null,
      nodeStates: {},
      connectionValidations: {}
    });
  },
  
  saveWorkflow: async () => {
    const { nodes, edges } = get();
    const { toast } = useToast();
    
    try {
      // Get the user ID from auth context (this needs to be updated based on your auth implementation)
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = user?.id || user?.claims?.sub;
      
      if (!userId) {
        throw new Error('User ID not found. Please log in again.');
      }
      
      const workflowData = {
        name: "New Workflow", // This could be made dynamic with user input
        description: "Created workflow", // This could be made dynamic with user input
        workflowData: {
          nodes,
          edges,
        },
        userId: parseInt(userId),
        status: "draft",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const response = await fetch('/api/workflows', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(workflowData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save workflow');
      }
      
      const savedWorkflow = await response.json();
      console.log('Workflow saved successfully:', savedWorkflow);
      
      toast({
        title: "Success",
        description: "Workflow saved successfully!",
      });
      
      // Redirect to dashboard after successful save
      window.location.href = '/dashboard';
      
      return savedWorkflow;
    } catch (error) {
      console.error('Error saving workflow:', error);
      
      toast({
        title: "Error",
        description: error.message || "Failed to save workflow",
        variant: "destructive",
      });
      
      return null;
    }
  },
  
  loadWorkflow: (workflow) => {
    set({
      nodes: workflow.nodes,
      edges: workflow.edges,
      selectedNodeId: null,
      selectedEdgeId: null,
    });
  },
  
  exportWorkflow: () => {
    return {
      id: 'exported-workflow',
      name: 'Exported Workflow',
      nodes: get().nodes,
      edges: get().edges,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  },
  
  setSelectedNode: (id) => {
    set({ selectedNodeId: id });
  },
  
  setSelectedEdge: (id) => {
    set({ selectedEdgeId: id });
  },
  
  openNodePicker: () => {
    set({ isModalOpen: true });
  },
  
  closeNodePicker: () => {
    set({ isModalOpen: false });
  },
  
  openAIAssistant: () => {
    set({ isAIAssistantOpen: true });
  },
  
  closeAIAssistant: () => {
    set({ isAIAssistantOpen: false });
  },
  
  openTemplateGallery: () => {
    set({ isTemplateGalleryOpen: true });
  },
  
  closeTemplateGallery: () => {
    set({ isTemplateGalleryOpen: false });
  },
  
  openAgentBuilder: () => {
    set({ isAgentBuilderOpen: true });
  },
  
  closeAgentBuilder: () => {
    set({ isAgentBuilderOpen: false });
  },
  
  generateWorkflowFromDescription: (description) => {
    // Simulate AI generating a workflow
    console.log('Generating workflow from:', description);
    
    // Sample workflow generation based on description
    const sampleNodes: Node[] = [
      {
        id: 'trigger-1',
        type: 'trigger',
        position: { x: 250, y: 100 },
        data: {
          label: 'Schedule Trigger',
          type: 'trigger',
          nodeType: 'trigger',
          description: 'Starts the workflow on a schedule',
          icon: 'clock',
        },
      },
      {
        id: 'action-1',
        type: 'action',
        position: { x: 250, y: 250 },
        data: {
          label: 'Process Data',
          type: 'action',
          nodeType: 'action',
          description: 'Processes incoming data',
          icon: 'activity',
        },
      },
      {
        id: 'action-2',
        type: 'action',
        position: { x: 250, y: 400 },
        data: {
          label: 'Send Output',
          type: 'action',
          nodeType: 'action',
          description: 'Sends the result',
          icon: 'send',
        },
      },
    ];
    
    const sampleEdges: Edge[] = [
      {
        id: 'e1-2',
        source: 'trigger-1',
        target: 'action-1',
      },
      {
        id: 'e2-3',
        source: 'action-1',
        target: 'action-2',
      },
    ];
    
    set({
      nodes: sampleNodes,
      edges: sampleEdges,
      isAIAssistantOpen: false,
    });
  },
  
  applyWorkflowTemplate: (template) => {
    // Apply a template to the current workflow
    set({
      nodes: template.nodes,
      edges: template.edges,
      isTemplateGalleryOpen: false,
    });
  },
  
  createAgent: (agentConfig) => {
    // Create a new agent from configuration
    console.log('Creating agent with config:', agentConfig);
    
    // Sample agent node creation
    const agentNode: Node = {
      id: `agent-${Date.now()}`,
      type: 'agent',
      position: { x: 250, y: 250 },
      data: {
        label: agentConfig.name || 'New Agent',
        type: 'agent',
        nodeType: 'agent',
        description: agentConfig.description || 'Custom agent',
        configuration: agentConfig,
        icon: 'bot',
      },
    };
    
    set((state) => ({
      nodes: [...state.nodes, agentNode],
      isAgentBuilderOpen: false,
    }));
  },
  
  setNodeState: (nodeId, state) => {
    set((prev) => ({
      nodeStates: {
        ...prev.nodeStates,
        [nodeId]: state
      },
      nodes: prev.nodes.map((node) => 
        node.id === nodeId
          ? { ...node, data: { ...node.data, state } }
          : node
      )
    }));
  },
  
  validateConnection: (connection) => {
    // Basic validation - could be extended with more rules
    if (!connection.source || !connection.target) return false;
    
    const { nodes } = get();
    
    // Find source and target nodes
    const sourceNode = nodes.find((n) => n.id === connection.source);
    const targetNode = nodes.find((n) => n.id === connection.target);
    
    if (!sourceNode || !targetNode) return false;
    
    // Simple rule: Don't allow connections to triggers
    if (targetNode.type === 'trigger' || targetNode.data?.nodeType === 'trigger') {
      return false;
    }
    
    // If both nodes have ports defined, check compatibility
    if (sourceNode.data?.ports && targetNode.data?.ports) {
      const sourcePort = sourceNode.data.ports.find(
        (p) => p.id === connection.sourceHandle && p.type === 'output'
      );
      
      const targetPort = targetNode.data.ports.find(
        (p) => p.id === connection.targetHandle && p.type === 'input'
      );
      
      if (sourcePort && targetPort) {
        // Check data type compatibility
        if (sourcePort.dataType !== targetPort.dataType && 
            sourcePort.dataType !== 'any' && 
            targetPort.dataType !== 'any') {
          return false;
        }
        
        // Check if target allows connections from source node type
        if (targetPort.allowedConnections && 
            targetPort.allowedConnections.length > 0 &&
            !targetPort.allowedConnections.includes(sourceNode.type as string)) {
          return false;
        }
      }
    }
    
    return true;
  },
  
  setConnectionValidation: (edgeId, isValid, message) => {
    set((state) => ({
      connectionValidations: {
        ...state.connectionValidations,
        [edgeId]: { isValid, message }
      }
    }));
  }
}));
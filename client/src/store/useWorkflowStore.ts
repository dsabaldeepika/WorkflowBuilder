import { create } from 'zustand';
import { Node, Edge, Connection, addEdge } from 'reactflow';
import { 
  App, 
  NodeCategory, 
  Workflow, 
  WorkflowTemplate, 
  NodeType, 
  NodeTemplate 
} from '@/types/workflow';
import { WorkflowState as NodeState } from '@/components/workflow/StateChangeAnimation';
import type { ScheduleOptions, ScheduleFrequency } from '@/components/workflow/ScheduleOptions';

// Load custom node templates from localStorage
const loadCustomTemplates = (): NodeTemplate[] => {
  try {
    const savedTemplates = localStorage.getItem('customNodeTemplates');
    if (savedTemplates) {
      return JSON.parse(savedTemplates);
    }
  } catch (error) {
    console.error('Failed to load custom templates from localStorage:', error);
  }
  return [];
};

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
  config?: Record<string, any>; // Additional config field for templates
  state?: NodeState;
  optimized?: boolean;
  module?: any; // Support for module property used in some components
  service?: string; // Service name for integrations
  event?: string; // Event type for triggers
  action?: string; // Action type for actions
  // Connection status indicators for visual feedback
  sourceConnectionStatus?: 'success' | 'error' | 'pending' | undefined;
  targetConnectionStatus?: 'success' | 'error' | 'pending' | undefined;
  connectionValidated?: boolean; // Flag to track if connections have been validated
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
  isCustomTemplatesOpen: boolean;
  nodeStates: Record<string, NodeState>;
  schedule: ScheduleOptions;
  connectionValidations: Record<string, {
    isValid: boolean;
    message?: string;
  }>;
  customTemplates: NodeTemplate[];
  
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
  saveWorkflow: (workflowParams?: { name?: string; description?: string; nodes?: any[]; edges?: any[] }) => Promise<any>;
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
  loadWorkflowFromTemplate: (nodes: any[], edges: any[]) => void;
  createAgent: (agentConfig: any) => void;
  
  // Node state management
  setNodeState: (nodeId: string, state: NodeState) => void;
  
  // Connection validation
  validateConnection: (connection: Connection) => boolean;
  setConnectionValidation: (edgeId: string, isValid: boolean, message?: string) => void;
  
  // Schedule management
  updateSchedule: (schedule: ScheduleOptions) => void;
  
  // Custom templates management
  openCustomTemplates: () => void;
  closeCustomTemplates: () => void;
  addCustomTemplate: (template: NodeTemplate) => void;
  updateCustomTemplate: (id: string, template: Partial<NodeTemplate>) => void;
  removeCustomTemplate: (id: string) => void;
  duplicateCustomTemplate: (id: string) => void;
  applyNodeTemplate: (template: NodeTemplate) => void;
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
  isCustomTemplatesOpen: false,
  nodeStates: {},
  connectionValidations: {},
  customTemplates: loadCustomTemplates(),
  schedule: {
    enabled: false,
    frequency: 'once',
    runCount: 0
  },
  
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
    
    set((state) => {
      const { nodes } = state;
      const sourceNodeIndex = nodes.findIndex((n) => n.id === connection.source);
      const targetNodeIndex = nodes.findIndex((n) => n.id === connection.target);
      
      // Create a copy of nodes to update connection status
      const updatedNodes = [...nodes];
      
      if (sourceNodeIndex !== -1 && targetNodeIndex !== -1) {
        // Update source node connection status
        updatedNodes[sourceNodeIndex] = {
          ...updatedNodes[sourceNodeIndex],
          data: {
            ...updatedNodes[sourceNodeIndex].data,
            sourceConnectionStatus: isValid ? 'success' : 'error',
            connectionValidated: true
          }
        };
        
        // Update target node connection status
        updatedNodes[targetNodeIndex] = {
          ...updatedNodes[targetNodeIndex],
          data: {
            ...updatedNodes[targetNodeIndex].data,
            targetConnectionStatus: isValid ? 'success' : 'error',
            connectionValidated: true
          }
        };
      }
      
      if (!isValid) {
        // Don't create the edge but update the visual indicators
        return { 
          nodes: updatedNodes,
          connectionValidations: {
            ...state.connectionValidations,
            [`e${connection.source}-${connection.target}`]: { 
              isValid: false,
              message: 'Invalid connection type or incompatible nodes'
            }
          }
        };
      }
      
      const newEdge = {
        ...connection,
        id: `e${connection.source}-${connection.target}`,
        data: { validated: true, invalid: false }
      };
      
      // Save the connection state to the database
      try {
        fetch('/api/workflow/connections', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sourceNodeId: connection.source,
            targetNodeId: connection.target,
            edgeId: newEdge.id,
            isValid: true
          })
        }).catch(err => console.error('Error saving connection:', err));
      } catch (error) {
        console.error('Failed to save connection to database:', error);
      }
      
      return {
        nodes: updatedNodes,
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
  
  saveWorkflow: (workflowParams?: { name?: string; description?: string; nodes?: any[]; edges?: any[] }) => {
    // Return a promise that the components can await and handle UI feedback
    return new Promise(async (resolve, reject) => {
      try {
        const storeState = get();
        
        // Use provided params or fall back to store state
        const nodesToSave = workflowParams?.nodes || storeState.nodes;
        const edgesToSave = workflowParams?.edges || storeState.edges;
        
        // Collect workflow metadata - either from params or prompt user
        let name, description;
        if (workflowParams?.name && workflowParams?.description) {
          name = workflowParams.name;
          description = workflowParams.description;
        } else {
          name = prompt("Enter workflow name:", "New Workflow") || "New Workflow";
          description = prompt("Enter workflow description:", "Created workflow") || "Created workflow";
        }
        
        // Get the currently authenticated user's ID
        // This approach works with the existing Replit Auth implementation
        const response = await fetch('/api/auth/user');
        
        if (!response.ok) {
          throw new Error('Authentication required. Please log in again.');
        }
        
        const user = await response.json();
        const userId = user.id;
        
        if (!userId) {
          throw new Error('User ID not found. Please log in again.');
        }
        
        // Build workflow data
        const workflowData = {
          name,
          description,
          // Pass nodes and edges as separate properties as expected by the API
          nodes: nodesToSave,
          edges: edgesToSave,
          createdByUserId: userId,
          isPublished: false // Set default state as unpublished
        };
        
        // Send to API
        const saveResponse = await fetch('/api/workflows', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(workflowData),
        });
        
        // Parse the response first, since both success and error responses have JSON bodies
        const responseData = await saveResponse.json();
        
        if (!saveResponse.ok) {
          // Check if this is a subscription limit error (HTTP 403)
          if (saveResponse.status === 403 && responseData.upgradeRequired) {
            const { currentCount, maxAllowed, subscriptionTier } = responseData;
            
            // Show a more informative message with upgrade prompt
            const upgradeConfirm = confirm(
              `You've reached your workflow limit (${currentCount}/${maxAllowed}) on your ${subscriptionTier} plan.\n\n` +
              'Would you like to upgrade your subscription to create more workflows?'
            );
            
            if (upgradeConfirm) {
              // Navigate to pricing page
              window.location.href = '/pricing';
              return;
            } else {
              throw new Error('Workflow limit reached. Please upgrade your subscription or delete existing workflows.');
            }
          }
          
          // Handle other error types
          throw new Error(`Failed to save workflow: ${responseData.message || 'Unknown error'}`);
        }
        
        // Success path
        const savedWorkflow = responseData;
        console.log('Workflow saved successfully:', savedWorkflow);
        
        // If response includes subscription info, show remaining count
        if (savedWorkflow.subscriptionInfo) {
          const { currentCount, maxAllowed, remainingWorkflows } = savedWorkflow.subscriptionInfo;
          
          // Construct a more informative success message
          let successMessage = 'Workflow saved successfully!';
          
          if (remainingWorkflows !== -1) { // -1 means unlimited
            successMessage += `\n\nYou have used ${currentCount} of ${maxAllowed} workflows in your plan.`;
            
            // Add a warning if they're getting close to the limit (80% or more)
            if (remainingWorkflows <= Math.ceil(maxAllowed * 0.2) && remainingWorkflows > 0) {
              successMessage += `\n\nWarning: You only have ${remainingWorkflows} workflow${remainingWorkflows === 1 ? '' : 's'} remaining in your plan.`;
            }
          }
          
          alert(successMessage);
        } else {
          // Fallback to basic success message if subscription info isn't available
          alert('Workflow saved successfully!');
        }
        
        // Resolve with the saved workflow
        resolve(savedWorkflow);
        
        // Navigate to dashboard after saving
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1000);
      } catch (error: any) {
        console.error('Error saving workflow:', error);
        alert(`Error saving workflow: ${error.message}`);
        reject(error);
      }
    });
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
  
  loadWorkflowFromTemplate: (nodes, edges) => {
    // Parse the nodes and edges if they're strings, otherwise use as-is
    const parsedNodes = typeof nodes === 'string' ? JSON.parse(nodes) : nodes;
    const parsedEdges = typeof edges === 'string' ? JSON.parse(edges) : edges;
    
    // Convert to ReactFlow node format if needed
    const formattedNodes = parsedNodes.map((node: any) => {
      // Make sure each node has the required ReactFlow properties
      return {
        ...node,
        id: node.id,
        type: node.type || 'default',
        position: node.position || { x: 0, y: 0 },
        data: {
          ...node.data,
          // Add any missing required properties for our node data
          label: node.data?.label || node.id,
          state: node.data?.state || 'default'
        }
      };
    });
    
    // Convert to ReactFlow edge format if needed
    const formattedEdges = parsedEdges.map((edge: any) => {
      // Make sure each edge has the required ReactFlow properties
      return {
        ...edge,
        id: edge.id || `${edge.source}-${edge.target}`,
        source: edge.source,
        target: edge.target,
        // Add any other edge properties needed
        type: edge.type || 'default'
      };
    });
    
    // Set the nodes and edges in the store
    set({
      nodes: formattedNodes,
      edges: formattedEdges
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
  },
  
  updateSchedule: (newSchedule) => {
    set({ schedule: newSchedule });
  },
  
  // Custom templates management
  openCustomTemplates: () => {
    set({ isCustomTemplatesOpen: true });
  },
  
  closeCustomTemplates: () => {
    set({ isCustomTemplatesOpen: false });
  },
  
  addCustomTemplate: (template) => {
    set((state) => ({
      customTemplates: [...state.customTemplates, template]
    }));
    
    // Store in localStorage for persistence
    try {
      const existingTemplates = JSON.parse(localStorage.getItem('customNodeTemplates') || '[]');
      localStorage.setItem('customNodeTemplates', JSON.stringify([...existingTemplates, template]));
    } catch (error) {
      console.error('Failed to save template to localStorage:', error);
    }
  },
  
  updateCustomTemplate: (id, templateUpdate) => {
    set((state) => {
      const updatedTemplates = state.customTemplates.map(template => 
        template.id === id 
          ? { 
              ...template, 
              ...templateUpdate, 
              updatedAt: new Date().toISOString() 
            } 
          : template
      );
      
      // Update localStorage
      try {
        localStorage.setItem('customNodeTemplates', JSON.stringify(updatedTemplates));
      } catch (error) {
        console.error('Failed to update template in localStorage:', error);
      }
      
      return { customTemplates: updatedTemplates };
    });
  },
  
  removeCustomTemplate: (id) => {
    set((state) => {
      const filteredTemplates = state.customTemplates.filter(template => template.id !== id);
      
      // Update localStorage
      try {
        localStorage.setItem('customNodeTemplates', JSON.stringify(filteredTemplates));
      } catch (error) {
        console.error('Failed to remove template from localStorage:', error);
      }
      
      return { customTemplates: filteredTemplates };
    });
  },
  
  duplicateCustomTemplate: (id) => {
    set((state) => {
      const templateToDuplicate = state.customTemplates.find(template => template.id === id);
      
      if (!templateToDuplicate) return state;
      
      const duplicatedTemplate: NodeTemplate = {
        ...templateToDuplicate,
        id: `custom-${Date.now()}`,
        name: `${templateToDuplicate.name} (Copy)`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isFavorite: false
      };
      
      const updatedTemplates = [...state.customTemplates, duplicatedTemplate];
      
      // Update localStorage
      try {
        localStorage.setItem('customNodeTemplates', JSON.stringify(updatedTemplates));
      } catch (error) {
        console.error('Failed to save duplicated template to localStorage:', error);
      }
      
      return { customTemplates: updatedTemplates };
    });
  },
  
  applyNodeTemplate: (template) => {
    const { nodes, addNode } = get();
    
    // Create a position that doesn't overlap with existing nodes
    const position = { 
      x: Math.random() * 300 + 100, 
      y: Math.random() * 300 + 100 
    };
    
    // If there are existing nodes, position relative to them
    if (nodes.length > 0) {
      const lastNode = nodes[nodes.length - 1];
      position.x = lastNode.position.x + 250;
      position.y = lastNode.position.y;
    }
    
    // Create a new node from the template
    const newNode: Node<NodeData> = {
      id: `node-${Date.now()}`,
      type: template.nodeType,
      position,
      data: {
        label: template.name,
        nodeType: template.nodeType,
        category: template.category,
        description: template.description,
        icon: template.icon,
        configuration: template.configuration,
        inputs: template.inputs || {},
        outputs: template.outputs || {},
        ports: template.ports || []
      }
    };
    
    // Add the node to the canvas
    addNode(newNode);
    
    // Mark template as recently used
    if (template.isCustom) {
      get().updateCustomTemplate(template.id, { updatedAt: new Date().toISOString() });
    }
  }
}));
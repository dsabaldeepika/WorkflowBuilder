import { useCallback, useEffect, useState, useRef } from "react";
import ReactFlow, { 
  Background, 
  Controls, 
  Edge, 
  MiniMap,
  MarkerType,
  Panel,
  addEdge, 
  useEdgesState, 
  useNodesState,
  useReactFlow,
  ReactFlowProvider
} from "reactflow";
import { PlusButton } from "./PlusButton";
import { WorkflowNode } from "./WorkflowNode";
import { useWorkflowStore } from "@/store/useWorkflowStore";
import { Button } from "@/components/ui/button";
import { Trash2, ZoomIn, ZoomOut, Maximize2, Grid, Eye } from "lucide-react";

// Define node types
const nodeTypes = {
  workflowNode: WorkflowNode
};

// Default edge options
const defaultEdgeOptions = {
  animated: true,
  style: { stroke: '#2563eb', strokeWidth: 2 },
  type: 'smoothstep',
  markerEnd: {
    type: MarkerType.ArrowClosed,
    width: 15,
    height: 15,
    color: '#2563eb',
  },
};

interface WorkflowCanvasProps {
  onAddNodeClick: () => void;
}

function WorkflowCanvasInner({ onAddNodeClick }: WorkflowCanvasProps) {
  // Get workflow nodes from store
  const { 
    nodes: storeNodes, 
    edges: storeEdges, 
    addNode, 
    setEdges, 
    loadWorkflow,
    clearWorkflow
  } = useWorkflowStore();
  
  // React Flow state
  const [nodes, setNodes, onNodesChange] = useNodesState(storeNodes);
  const [edges, setRfEdges, onEdgesChange] = useEdgesState(storeEdges);
  const [showMiniMap, setShowMiniMap] = useState(true);
  
  // Get React Flow instance
  const reactFlowInstance = useReactFlow();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  // Load workflow from localStorage on mount
  useEffect(() => {
    loadWorkflow();
  }, [loadWorkflow]);

  // Update nodes in the store when they change
  useEffect(() => {
    useWorkflowStore.setState({ nodes });
  }, [nodes]);

  // Update edges in the store when they change
  useEffect(() => {
    setEdges(edges);
  }, [edges, setEdges]);

  // Handle edge connection
  const onConnect = useCallback((params: any) => {
    // Check if there's already a connection from the source node to any other node
    const sourceNodeId = params.source;
    const existingConnection = edges.find(edge => edge.source === sourceNodeId);
    
    // If connection already exists, replace it
    if (existingConnection) {
      const newEdges = edges.filter(edge => edge.id !== existingConnection.id);
      setRfEdges([...newEdges, { 
        ...params, 
        id: `${params.source}-${params.target}`,
        animated: true,
        style: { stroke: '#2563eb', strokeWidth: 2 },
        type: 'smoothstep',
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 15,
          height: 15,
          color: '#2563eb',
        },
      }]);
    } else {
      // Create a new edge
      setRfEdges((eds) => addEdge({ 
        ...params, 
        animated: true,
        style: { stroke: '#2563eb', strokeWidth: 2 },
        type: 'smoothstep', 
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 15,
          height: 15,
          color: '#2563eb',
        },
      }, eds));
    }
  }, [edges, setRfEdges]);

  // Handle dropping a node onto the canvas
  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();

      if (reactFlowWrapper.current) {
        const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
        const position = reactFlowInstance.project({
          x: event.clientX - reactFlowBounds.left,
          y: event.clientY - reactFlowBounds.top,
        });

        // You would normally get data from the drag event
        // For demo purposes, we're just creating a fixed node
        const newNode = {
          id: `node-${nodes.length + 1}`,
          type: 'workflowNode',
          position,
          data: { /* your node data */ },
        };

        setNodes([...nodes, newNode]);
      }
    },
    [reactFlowInstance, nodes, setNodes]
  );

  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const fitCanvas = useCallback(() => {
    if (nodes.length > 0) {
      reactFlowInstance.fitView({ padding: 0.2 });
    }
  }, [reactFlowInstance, nodes]);

  const zoomIn = useCallback(() => {
    reactFlowInstance.zoomIn();
  }, [reactFlowInstance]);

  const zoomOut = useCallback(() => {
    reactFlowInstance.zoomOut();
  }, [reactFlowInstance]);

  const handleClearCanvas = useCallback(() => {
    if (confirm('Are you sure you want to clear all nodes from the canvas?')) {
      clearWorkflow();
    }
  }, [clearWorkflow]);

  const toggleMiniMap = useCallback(() => {
    setShowMiniMap(prev => !prev);
  }, []);

  return (
    <main className="flex-1 overflow-hidden bg-gray-50 relative" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        fitView
        onDrop={onDrop}
        onDragOver={onDragOver}
        deleteKeyCode="Delete"
        selectionKeyCode="Shift"
        multiSelectionKeyCode="Control"
      >
        <Background 
          color="#d1d5db" 
          size={20} 
          gap={20}
        />
        <Controls />
        {showMiniMap && <MiniMap 
          nodeStrokeColor="#aaa" 
          nodeColor="#fff"
          nodeBorderRadius={8} 
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            border: '1px solid #ddd',
          }}
        />}

        {/* Controls Panel */}
        <Panel position="top-right" className="bg-white rounded-md shadow border border-gray-200 flex flex-col space-y-1 p-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-gray-600"
            onClick={zoomIn}
            title="Zoom In"
          >
            <ZoomIn size={16} />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-gray-600"
            onClick={zoomOut}
            title="Zoom Out"
          >
            <ZoomOut size={16} />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-gray-600"
            onClick={fitCanvas}
            title="Fit View"
          >
            <Maximize2 size={16} />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className={`h-8 w-8 ${showMiniMap ? 'text-primary' : 'text-gray-600'}`}
            onClick={toggleMiniMap}
            title="Toggle Minimap"
          >
            <Eye size={16} />
          </Button>
          {nodes.length > 0 && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-red-500 hover:bg-red-50"
              onClick={handleClearCanvas}
              title="Clear Canvas"
            >
              <Trash2 size={16} />
            </Button>
          )}
        </Panel>
      </ReactFlow>

      {/* Show plus button only if there are no nodes */}
      {nodes.length === 0 && (
        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <PlusButton onClick={onAddNodeClick} />
        </div>
      )}
    </main>
  );
}

// Wrap with ReactFlowProvider to access React Flow methods
export function WorkflowCanvas(props: WorkflowCanvasProps) {
  return (
    <ReactFlowProvider>
      <WorkflowCanvasInner {...props} />
    </ReactFlowProvider>
  );
}

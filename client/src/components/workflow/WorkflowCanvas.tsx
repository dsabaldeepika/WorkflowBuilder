import React, { useCallback, useState } from 'react';
import ReactFlow, {
  Controls,
  Background,
  MiniMap,
  NodeTypes,
  EdgeTypes,
  Node,
  Edge,
  Panel,
  useReactFlow,
  ConnectionLineType,
  ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';
import WorkflowNode from './WorkflowNode';
import { ValidatedEdge } from './ConnectionValidator';
import { WorkflowControls, downloadJSONFile, uploadJSONFile } from './WorkflowControls';
import { useWorkflowStore } from '@/store/useWorkflowStore';
import { WorkflowState } from './StateChangeAnimation';
import { toast } from '@/hooks/use-toast';

// Define custom node types outside of component to avoid recreation on each render
const customNodeTypes = {
  default: WorkflowNode,
  trigger: WorkflowNode,
  action: WorkflowNode,
  condition: WorkflowNode,
  data: WorkflowNode,
  integration: WorkflowNode,
  agent: WorkflowNode,
};

// Define custom edge types outside of component to avoid recreation on each render
const customEdgeTypes = {
  default: ValidatedEdge,
};

interface WorkflowCanvasProps {
  onAddNodeClick: () => void;
}

export function WorkflowCanvas({ onAddNodeClick }: WorkflowCanvasProps) {
  return (
    <ReactFlowProvider>
      <WorkflowCanvasContent onAddNodeClick={onAddNodeClick} />
    </ReactFlowProvider>
  );
}

function WorkflowCanvasContent({ onAddNodeClick }: WorkflowCanvasProps) {
  const { 
    nodes, 
    edges, 
    onNodesChange, 
    onEdgesChange, 
    onConnect,
    setNodes,
    setEdges,
    setSelectedNode,
    saveWorkflow,
    exportWorkflow,
    setNodeState
  } = useWorkflowStore();
  
  const reactFlowInstance = useReactFlow();
  
  // Handle node click to select
  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node.id);
  }, [setSelectedNode]);
  
  // Handle edge click to select
  const onEdgeClick = useCallback((event: React.MouseEvent, edge: Edge) => {
    // Handle edge selection if needed
  }, []);
  
  // Handle node state change (for animations)
  const handleNodeStateChange = useCallback((nodeId: string, state: WorkflowState) => {
    setNodeState(nodeId, state);
  }, [setNodeState]);
  
  // Handle workflow export
  const handleExport = useCallback(() => {
    const flowData = exportWorkflow();
    downloadJSONFile(flowData, `workflow-${Date.now()}.json`);
    
    toast({
      title: 'Workflow Exported',
      description: 'Your workflow has been exported to a JSON file.',
    });
  }, [exportWorkflow]);
  
  // Handle workflow import
  const handleImport = useCallback(() => {
    uploadJSONFile((data) => {
      try {
        // Check if data looks like a valid workflow
        if (!data.nodes || !Array.isArray(data.nodes) || !data.edges || !Array.isArray(data.edges)) {
          throw new Error('Invalid workflow format');
        }
        
        // Set nodes and edges from the imported file
        setNodes(data.nodes);
        setEdges(data.edges);
        
        toast({
          title: 'Workflow Imported',
          description: 'Your workflow has been imported successfully.',
        });
      } catch (error) {
        toast({
          title: 'Import Failed',
          description: 'The file does not contain a valid workflow.',
          variant: 'destructive',
        });
      }
    });
  }, [setNodes, setEdges]);
  
  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={customNodeTypes}
        edgeTypes={customEdgeTypes}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        connectionLineType={ConnectionLineType.SmoothStep}
        fitView
        minZoom={0.2}
        maxZoom={2}
        defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
        snapToGrid
        snapGrid={[20, 20]}
        className="workflow-canvas"
      >
        <Background />
        <Controls />
        <MiniMap
          nodeStrokeWidth={3}
          zoomable
          pannable
        />
        <Panel position="top-left" className="p-4">
          <h2 className="text-xl font-semibold mb-1">Workflow Builder</h2>
          <p className="text-sm text-slate-500">Design and connect nodes to create your automation</p>
        </Panel>
        
        {/* Add workflow controls */}
        <WorkflowControls 
          onNodeStateChange={handleNodeStateChange}
          onSave={async () => {
            try {
              await saveWorkflow();
              // Toast message is now handled in the saveWorkflow function
            } catch (error) {
              console.error('Error saving workflow', error);
              // Error handling is also done in the saveWorkflow function
            }
          }}
          onExport={handleExport}
          onImport={handleImport}
        />
      </ReactFlow>
    </div>
  );
}
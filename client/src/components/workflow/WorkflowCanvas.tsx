import { useCallback, useEffect, useState } from "react";
import ReactFlow, { 
  Background, 
  Controls, 
  Edge, 
  MiniMap,
  addEdge, 
  useEdgesState, 
  useNodesState 
} from "reactflow";
import { PlusButton } from "./PlusButton";
import { WorkflowNode } from "./WorkflowNode";
import { useWorkflowStore } from "@/store/useWorkflowStore";

// Define node types
const nodeTypes = {
  workflowNode: WorkflowNode
};

interface WorkflowCanvasProps {
  onAddNodeClick: () => void;
}

export function WorkflowCanvas({ onAddNodeClick }: WorkflowCanvasProps) {
  // Get workflow nodes from store
  const { nodes: storeNodes, edges: storeEdges, addNode, setEdges, loadWorkflow } = useWorkflowStore();
  
  // React Flow state
  const [nodes, setNodes, onNodesChange] = useNodesState(storeNodes);
  const [edges, setRfEdges, onEdgesChange] = useEdgesState(storeEdges);

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
    setRfEdges((eds) => addEdge({ ...params, animated: true }, eds));
  }, [setRfEdges]);

  return (
    <main className="flex-1 overflow-hidden bg-gray-50 relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background 
          color="#d1d5db" 
          size={20} 
          gap={20} 
          variant="dots" 
        />
        <Controls />
        <MiniMap />
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

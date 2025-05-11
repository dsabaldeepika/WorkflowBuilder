import React, { useCallback, useState, useEffect } from 'react';
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
import EmptyWorkflowPlaceholder from './EmptyWorkflowPlaceholder';
import WorkflowOnboarding, { OnboardingStep } from './WorkflowOnboarding';
import OnboardingGuide from './OnboardingGuide';
import TriggerScheduleDialog from './TriggerScheduleDialog';

// Define custom node types outside of component to avoid recreation on each render
const customNodeTypes = {
  default: WorkflowNode,
  workflowNode: WorkflowNode, // Added to fix the node type error
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
  // State for onboarding and guided tour
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [onboardingSteps, setOnboardingSteps] = useState<OnboardingStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [showGuide, setShowGuide] = useState(false);
  
  // State for schedule dialog
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  
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
    setNodeState,
    schedule,
    updateSchedule
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
  
  // Handle onboarding 
  const handleStartWorkflow = useCallback((steps: OnboardingStep[]) => {
    setOnboardingSteps(steps);
    setShowGuide(true);
    setCurrentStepIndex(0);
  }, []);
  
  // Handle completing a step in the guide
  const handleCompleteStep = useCallback((index: number) => {
    const updatedSteps = [...onboardingSteps];
    updatedSteps[index].completed = true;
    setOnboardingSteps(updatedSteps);
    
    // Move to next step if available
    if (index < updatedSteps.length - 1) {
      setCurrentStepIndex(index + 1);
    } else {
      // All steps completed
      setShowGuide(false);
      toast({
        title: 'Onboarding Completed',
        description: 'You\'ve successfully completed the workflow onboarding!',
      });
    }
  }, [onboardingSteps]);
  
  // Handle schedule dialog change
  const handleScheduleChange = useCallback((newSchedule: any) => {
    updateSchedule(newSchedule);
  }, [updateSchedule]);
  
  // Handle adding schedule to workflow
  const handleAddScheduleToWorkflow = useCallback(() => {
    // Create a trigger node with the schedule configuration
    const triggerNode = {
      id: `trigger-${Date.now()}`,
      type: 'trigger',
      position: { x: 100, y: 100 },
      data: {
        label: `Schedule (${schedule.frequency})`,
        description: 'Triggers workflow on a schedule',
        type: 'trigger',
        nodeType: 'trigger',
        category: 'triggers',
        icon: 'clock',
        configuration: { schedule },
      }
    };
    
    // Add the node to the workflow
    setNodes([...nodes, triggerNode]);
    
    // Close the dialog
    setShowScheduleDialog(false);
    
    // Show toast notification
    toast({
      title: 'Schedule Trigger Added',
      description: `Added a new trigger that runs ${schedule.frequency}.`,
    });
  }, [schedule, nodes, setNodes]);
  
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
  
  // Check if there are any nodes in the workflow
  const isEmpty = nodes.length === 0;

  return (
    <div className="h-full w-full">
      {isEmpty ? (
        <EmptyWorkflowPlaceholder onAddNodeClick={onAddNodeClick} />
      ) : (
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
            schedule={schedule}
            onScheduleChange={updateSchedule}
            subscriptionTier="PROFESSIONAL"
            maxRunsPerMonth={1000}
            currentRunCount={42}
          />
        </ReactFlow>
      )}
    </div>
  );
}
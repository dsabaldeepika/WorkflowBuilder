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
import { useWorkflowStore, NodeData } from '@/store/useWorkflowStore';
import { WorkflowState } from './StateChangeAnimation';
import { toast } from '@/hooks/use-toast';
import EmptyWorkflowPlaceholder from './EmptyWorkflowPlaceholder';
import { NodeCategory } from '@/types/workflow';
import WorkflowOnboarding, { OnboardingStep } from './WorkflowOnboarding';
import OnboardingGuide from './OnboardingGuide';
import TriggerScheduleDialog, { ScheduleOptions } from './TriggerScheduleDialog';
import { WorkflowNodePicker } from './WorkflowNodePicker';
import { AgentBuilder } from '../agent/AgentBuilder';
import { Clock, Plus, Sparkles } from 'lucide-react';

// Define custom node types outside of component to avoid recreation on each render
const customNodeTypes = {
  default: WorkflowNode,
  workflowNode: WorkflowNode, // Added to fix the node type error
  trigger: WorkflowNode,
  action: WorkflowNode,
  condition: WorkflowNode, 
  transformer: WorkflowNode,
  api: WorkflowNode,
  connector: WorkflowNode,
};

const customEdgeTypes = {
  default: ValidatedEdge,
};

// Props are no longer needed since we handle node picking internally
interface WorkflowCanvasProps {}

export function WorkflowCanvas({}: WorkflowCanvasProps) {
  return (
    <ReactFlowProvider>
      <WorkflowCanvasContent />
    </ReactFlowProvider>
  );
}

function WorkflowCanvasContent() {
  // State for onboarding and guided tour
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [onboardingSteps, setOnboardingSteps] = useState<OnboardingStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [showGuide, setShowGuide] = useState(false);
  
  // State for dialogs
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [showNodePicker, setShowNodePicker] = useState(false);
  const [showAgentBuilder, setShowAgentBuilder] = useState(false);
  const [nodePickerCategory, setNodePickerCategory] = useState<NodeCategory>('trigger');
  
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
  
  // Handle adding schedule to workflow
  const handleAddScheduleToWorkflow = useCallback(() => {
    // Update workflow-level schedule instead of creating a node
    const updatedSchedule = {
      ...schedule,
      enabled: true
    };
    
    // Update the schedule in the store
    updateSchedule(updatedSchedule);
    
    // Close the dialog
    setShowScheduleDialog(false);
    
    // Show toast notification
    toast({
      title: 'Workflow Schedule Updated',
      description: `This workflow will run ${schedule.frequency}.`,
    });
    
    // If no nodes exist, prompt user to add their first node
    if (nodes.length === 0) {
      setShowGuide(true);
      setOnboardingSteps([
        {
          title: 'Add your first node',
          description: 'Click the canvas to add your first workflow node',
          completed: false,
          type: 'trigger'
        }
      ]);
      setCurrentStepIndex(0);
    }
  }, [schedule, nodes, updateSchedule, setShowGuide, setOnboardingSteps, setCurrentStepIndex]);
  
  // Handle direct schedule creation from the empty state
  const handleScheduleChange = useCallback((newSchedule: ScheduleOptions) => {
    updateSchedule(newSchedule);
  }, [updateSchedule]);
  
  // Function to show our custom node picker
  const handleAddNode = useCallback(() => {
    console.log('Opening custom node picker');
    setShowNodePicker(true);
  }, []);
  
  // Create workflow with pre-selected schedule or open node picker
  const handleCreateWorkflow = useCallback((useSchedule: boolean) => {
    if (useSchedule) {
      // If we already set up a schedule, show guide for next steps
      setShowGuide(true);
      setOnboardingSteps([
        {
          title: 'Add your first action node',
          description: 'Click the canvas or use the + button to add an action node',
          completed: false,
          type: 'action'
        }
      ]);
      setCurrentStepIndex(0);
      
      // Show confirmation toast
      toast({
        title: 'Workflow Schedule Set',
        description: `Your workflow will run ${schedule.frequency}. Now add your first action.`,
      });
      
      // Show node picker to start building
      handleAddNode();
    } else {
      // Just open the node picker without schedule
      handleAddNode();
    }
  }, [schedule, setShowGuide, setOnboardingSteps, setCurrentStepIndex, handleAddNode]);
  
  // Handle node selection from the picker
  const handleSelectNode = useCallback((nodeType: string, category: NodeCategory) => {
    console.log('Creating node:', nodeType, category);
    // Create a node at a fixed position in the viewport
    const centerX = 250;
    const centerY = 150;
    
    // Get a unique ID for the new node
    const newNodeId = `node-${Date.now()}`;
    
    // Set node data based on type
    let nodeData: NodeData = {
      label: 'New Node',
      description: 'Node description',
      category: category,
      icon: '📋',
      state: 'default' as WorkflowState,
      inputs: {},
      outputs: {},
    };
    
    // Customize based on node type
    if (nodeType.startsWith('google-sheets')) {
      nodeData.label = 'Google Sheets';
      nodeData.icon = '📊';
      nodeData.description = nodeType.includes('add-row') 
        ? 'Add a row to Google Sheets' 
        : nodeType.includes('get-rows')
          ? 'Get rows from Google Sheets'
          : nodeType.includes('update-row')
            ? 'Update a row in Google Sheets'
            : 'Google Sheets action';
    } else if (nodeType.startsWith('slack')) {
      nodeData.label = 'Slack';
      nodeData.icon = '💬';
      nodeData.description = nodeType.includes('send-message')
        ? 'Send a message to Slack'
        : 'Slack action';
    } else if (nodeType.startsWith('schedule')) {
      nodeData.label = 'Schedule';
      nodeData.icon = '⏰';
      nodeData.description = nodeType.includes('once')
        ? 'Run once at a specific time'
        : nodeType.includes('interval')
          ? 'Run at intervals'
          : 'Run on a schedule';
    } else if (nodeType === 'webhook') {
      nodeData.label = 'Webhook';
      nodeData.icon = '🌐';
      nodeData.description = 'Triggered by an HTTP request';
    } else if (nodeType === 'filter') {
      nodeData.label = 'Filter';
      nodeData.icon = '🔍';
      nodeData.description = 'Filter data based on conditions';
    } else if (nodeType === 'code') {
      nodeData.label = 'Code';
      nodeData.icon = '🧩';
      nodeData.description = 'Run custom code';
    } else if (nodeType === 'delay') {
      nodeData.label = 'Delay';
      nodeData.icon = '⏱️';
      nodeData.description = 'Add a delay between steps';
    } else if (nodeType.startsWith('openai')) {
      nodeData.label = 'OpenAI';
      nodeData.icon = '🤖';
      nodeData.description = nodeType.includes('generate-text')
        ? 'Generate text with AI'
        : nodeType.includes('create-image')
          ? 'Generate an image with AI'
          : 'AI-powered action';
    }
    
    // Add a new node at the center of the viewport
    const newNode = {
      id: newNodeId,
      type: 'default', // Use the custom node type
      position: { x: centerX - 75, y: centerY - 40 },
      data: nodeData,
    };
    
    setNodes([...nodes, newNode as Node<NodeData>]);
    setSelectedNode(newNodeId); // Select the newly created node
    
    // Show toast notification
    toast({
      title: 'Node Added',
      description: `A new ${nodeData.label} node has been added to the workflow.`,
    });
  }, [reactFlowInstance, setNodes, setSelectedNode, toast]);
  
  // Handle creating an AI agent
  const handleCreateAgent = useCallback((agentData: any) => {
    // Create a node at a fixed position in the viewport
    const centerX = 250;
    const centerY = 150;
    
    // Get a unique ID for the new node
    const newNodeId = `agent-${Date.now()}`;
    
    // Create an agent node
    const newNode = {
      id: newNodeId,
      type: 'default',
      position: { x: centerX - 75, y: centerY - 40 },
      data: {
        label: agentData.name,
        description: agentData.description || 'AI Agent',
        category: 'agent' as NodeCategory,
        icon: '🤖',
        state: 'default' as WorkflowState,
        agentSettings: agentData.settings,
        inputs: {},
        outputs: {},
      },
    };
    
    setNodes([...nodes, newNode as Node<NodeData>]);
    setSelectedNode(newNodeId);
    
    toast({
      title: 'Agent Created',
      description: `Agent "${agentData.name}" has been added to your workflow.`,
    });
  }, [reactFlowInstance, setNodes, setSelectedNode, toast]);
  
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

  // Effect to check local storage flag for first-time users
  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('pumpflux_hasSeenOnboarding');
    setShowOnboarding(!hasSeenOnboarding);
  }, []);

  return (
    <div className="h-full w-full">
      {isEmpty ? (
        <EmptyWorkflowPlaceholder 
          onAddNodeClick={handleAddNode}
          onScheduleChange={handleScheduleChange}
          onCreateWorkflow={handleCreateWorkflow}
        />
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
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold mb-1">Workflow Builder</h2>
                <p className="text-sm text-slate-500">Design and connect nodes to create your automation</p>
              </div>
              {schedule?.enabled && (
                <div 
                  className="ml-4 flex items-center gap-1 border rounded-md px-3 py-1 text-sm bg-blue-50 text-blue-700 cursor-pointer hover:bg-blue-100"
                  onClick={() => setShowScheduleDialog(true)}
                >
                  <Clock className="h-4 w-4 text-blue-500" />
                  <span>
                    {schedule.frequency === 'once' ? 'Run once' : 
                    schedule.frequency === 'hourly' ? 'Run hourly' :
                    schedule.frequency === 'daily' ? 'Run daily' :
                    schedule.frequency === 'weekly' ? 'Run weekly' :
                    schedule.frequency === 'monthly' ? 'Run monthly' :
                    'Custom'}
                  </span>
                </div>
              )}
            </div>
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
          
          {/* Onboarding guide */}
          {showGuide && onboardingSteps.length > 0 && (
            <OnboardingGuide
              steps={onboardingSteps}
              currentStepIndex={currentStepIndex}
              onDismiss={() => setShowGuide(false)}
              onCompleteStep={handleCompleteStep}
            />
          )}
        </ReactFlow>
      )}
      
      {/* Onboarding modal for first-time users */}
      <WorkflowOnboarding
        isOpen={showOnboarding}
        onClose={() => {
          setShowOnboarding(false);
          // Save preference in local storage
          localStorage.setItem('pumpflux_hasSeenOnboarding', 'true');
        }}
        onStartWorkflow={() => {
          // Start a new workflow by showing the node picker
          handleAddNode();
          // Setup initial guide if needed
          setShowGuide(true);
          setOnboardingSteps([
            {
              title: 'Add your first trigger node',
              description: 'Start by adding a trigger node to your workflow',
              completed: false,
              type: 'trigger'
            }
          ]);
          setCurrentStepIndex(0);
        }}
      />
      
      {/* Schedule configuration dialog */}
      <TriggerScheduleDialog
        isOpen={showScheduleDialog}
        onClose={() => setShowScheduleDialog(false)}
        schedule={schedule}
        onScheduleChange={handleScheduleChange}
        onAddToWorkflow={handleAddScheduleToWorkflow}
      />
      
      {/* Node picker dialog */}
      <WorkflowNodePicker
        isOpen={showNodePicker}
        onClose={() => setShowNodePicker(false)}
        onSelectNode={handleSelectNode}
        initialCategory="trigger"
      />
    </div>
  );
}
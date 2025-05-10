import React, { useState, useCallback } from 'react';
import { Node, Edge } from 'reactflow';
import { NodeData } from '@/store/useWorkflowStore';
import { WorkflowExecution, ExecutionLog } from '@/types/workflow';
import { v4 as uuidv4 } from 'uuid';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, CheckCircle2, Play, StopCircle, RefreshCw, Terminal, Clock, FileJson } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { WorkflowState } from './StateChangeAnimation';

// Helper function to find starting nodes (trigger nodes with no incoming edges)
function findStartNodes(nodes: Node<NodeData>[], edges: Edge[]): Node<NodeData>[] {
  return nodes.filter(node => 
    (node.type === 'trigger' || node.data.nodeType === 'trigger') && 
    !edges.some(edge => edge.target === node.id)
  );
}

// Helper function to find nodes that follow a given node
function findNextNodes(nodeId: string, edges: Edge[], nodes: Node<NodeData>[]): Node<NodeData>[] {
  const nextNodeIds = edges
    .filter(edge => edge.source === nodeId)
    .map(edge => edge.target);
  
  return nodes.filter(node => nextNodeIds.includes(node.id));
}

// Helper to log a node execution
function createNodeLog(
  nodeId: string,
  message: string,
  level: 'info' | 'warn' | 'error' | 'debug' = 'info',
  data?: any
): ExecutionLog {
  return {
    timestamp: new Date().toISOString(),
    nodeId,
    message,
    level,
    data
  };
}

// Helper function to simulate node execution time based on node type
function getNodeExecutionTime(nodeType: string): number {
  const baseTime = 500; // Base execution time in ms
  
  // Different node types have different execution times
  const executionTimes: Record<string, number> = {
    'trigger': 300,
    'action': 800,
    'condition': 200,
    'data': 400,
    'integration': 1500, // Integration nodes are typically slower
    'agent': 2000, // Agent nodes are the slowest as they involve AI processing
    'default': 500
  };
  
  const time = executionTimes[nodeType] || executionTimes.default;
  
  // Add some randomness to the execution time (±30%)
  const randomFactor = 0.7 + Math.random() * 0.6; // 0.7 to 1.3
  return Math.floor(time * randomFactor);
}

// Helper to check if a condition node evaluates to true (simplified, always returns true 70% of the time)
function evaluateCondition(node: Node<NodeData>): boolean {
  // Simplified condition evaluation - 70% chance of true, 30% chance of false
  return Math.random() < 0.7;
}

// Simulated node data processing with mock values
function processNodeData(node: Node<NodeData>): any {
  // Generate mock data based on node type
  switch (node.type || node.data.nodeType) {
    case 'trigger':
      return {
        event: 'trigger_activated',
        timestamp: new Date().toISOString(),
        payload: {
          id: uuidv4(),
          source: node.data.label || 'Unknown Trigger'
        }
      };
    
    case 'action':
      return {
        action: 'executed',
        status: 'success',
        result: {
          id: uuidv4(),
          processed: true,
          timestamp: new Date().toISOString()
        }
      };
    
    case 'data':
      return {
        records: Array.from({ length: 3 }, (_, i) => ({
          id: uuidv4(),
          name: `Sample Data ${i + 1}`,
          value: Math.floor(Math.random() * 1000),
          timestamp: new Date().toISOString()
        }))
      };
    
    case 'integration':
      return {
        api_response: {
          status: 200,
          body: {
            success: true,
            data: {
              id: uuidv4(),
              message: 'API request processed successfully',
              timestamp: new Date().toISOString()
            }
          }
        }
      };
    
    case 'agent':
      return {
        agent_response: {
          execution_id: uuidv4(),
          completion: 'Agent task completed successfully',
          confidence: 0.87,
          timestamp: new Date().toISOString()
        }
      };
    
    default:
      return {
        processed: true,
        node_id: node.id,
        timestamp: new Date().toISOString()
      };
  }
}

// Main function that executes the workflow
export async function executeWorkflow(
  nodes: Node<NodeData>[],
  edges: Edge[],
  onNodeStateChange: (nodeId: string, state: WorkflowState) => void,
  onWorkflowStatusChange: (status: 'pending' | 'running' | 'completed' | 'failed' | 'canceled') => void,
  onLogAdded: (log: ExecutionLog) => void
): Promise<WorkflowExecution> {
  // Create a unique execution ID
  const executionId = uuidv4();
  
  // Set up the execution state
  const execution: WorkflowExecution = {
    id: executionId,
    workflowId: 'current', // Use the current workflow
    status: 'pending',
    startTime: new Date().toISOString(),
    logs: [],
    result: {}
  };
  
  // Add starting log
  const startingLog = createNodeLog(
    'workflow',
    'Starting workflow execution',
    'info',
    { executionId }
  );
  execution.logs.push(startingLog);
  onLogAdded(startingLog);
  
  try {
    // Mark workflow as running
    execution.status = 'running';
    onWorkflowStatusChange('running');
    
    // Reset all node states
    nodes.forEach(node => {
      onNodeStateChange(node.id, 'idle');
    });
    
    // Find starting nodes (triggers)
    const startNodes = findStartNodes(nodes, edges);
    
    if (startNodes.length === 0) {
      const noTriggerLog = createNodeLog(
        'workflow',
        'No trigger nodes found in workflow',
        'error'
      );
      execution.logs.push(noTriggerLog);
      onLogAdded(noTriggerLog);
      
      execution.status = 'failed';
      execution.error = 'No trigger nodes found in workflow';
      onWorkflowStatusChange('failed');
      
      return execution;
    }
    
    // Set of processed node IDs
    const processedNodes = new Set<string>();
    
    // Map to store node outputs
    const nodeOutputs = new Map<string, any>();
    
    // Execute the workflow starting from trigger nodes
    for (const startNode of startNodes) {
      await executeNode(startNode);
    }
    
    // Mark workflow as completed
    execution.status = 'completed';
    execution.endTime = new Date().toISOString();
    
    // Add completion log
    const completionLog = createNodeLog(
      'workflow',
      'Workflow execution completed successfully',
      'info',
      { duration: new Date(execution.endTime).getTime() - new Date(execution.startTime).getTime() }
    );
    execution.logs.push(completionLog);
    onLogAdded(completionLog);
    
    onWorkflowStatusChange('completed');
    
    // Update the final result with all node outputs
    execution.result = Object.fromEntries(nodeOutputs);
    
    return execution;
    
    // Internal function to execute a single node
    async function executeNode(node: Node<NodeData>): Promise<void> {
      // Skip if node was already processed (prevent cycles)
      if (processedNodes.has(node.id)) {
        return;
      }
      
      // Mark node as processed to prevent cycles
      processedNodes.add(node.id);
      
      // Start node execution
      onNodeStateChange(node.id, 'starting');
      
      // Log node starting
      const startNodeLog = createNodeLog(
        node.id,
        `Starting execution of ${node.data.label || 'unnamed node'}`,
        'info'
      );
      execution.logs.push(startNodeLog);
      onLogAdded(startNodeLog);
      
      // Simulate node execution time
      const nodeType = node.type || node.data.nodeType || 'default';
      const executionTime = getNodeExecutionTime(nodeType);
      
      // Set node to running state
      onNodeStateChange(node.id, 'running');
      
      // Log node running
      const runningNodeLog = createNodeLog(
        node.id,
        `Executing ${node.data.label || 'unnamed node'}`,
        'info',
        { estimatedTime: executionTime }
      );
      execution.logs.push(runningNodeLog);
      onLogAdded(runningNodeLog);
      
      // Simulate execution time
      await new Promise(resolve => setTimeout(resolve, executionTime));
      
      try {
        // Process node data
        const nodeResult = processNodeData(node);
        nodeOutputs.set(node.id, nodeResult);
        
        // Special handling for condition nodes
        let shouldContinue = true;
        
        if (nodeType === 'condition') {
          shouldContinue = evaluateCondition(node);
          
          // Log condition result
          const conditionLog = createNodeLog(
            node.id,
            `Condition ${shouldContinue ? 'passed' : 'failed'}: ${node.data.label || 'unnamed condition'}`,
            'info',
            { result: shouldContinue }
          );
          execution.logs.push(conditionLog);
          onLogAdded(conditionLog);
        }
        
        // Mark node as completed
        onNodeStateChange(node.id, 'completed');
        
        // Log node completion
        const completeNodeLog = createNodeLog(
          node.id,
          `Completed execution of ${node.data.label || 'unnamed node'}`,
          'info',
          { 
            executionTime, 
            result: nodeResult,
            ...(nodeType === 'condition' ? { conditionResult: shouldContinue } : {})
          }
        );
        execution.logs.push(completeNodeLog);
        onLogAdded(completeNodeLog);
        
        // Find next nodes to execute
        const nextNodes = findNextNodes(node.id, edges, nodes);
        
        // For conditions, only follow the path if condition is true
        if (nodeType === 'condition' && !shouldContinue) {
          // Don't execute next nodes if condition is false
          return;
        }
        
        // Execute next nodes sequentially
        for (const nextNode of nextNodes) {
          await executeNode(nextNode);
        }
      } catch (error) {
        // Handle node execution error
        onNodeStateChange(node.id, 'failed');
        
        // Log node failure
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        const errorNodeLog = createNodeLog(
          node.id,
          `Error executing ${node.data.label || 'unnamed node'}: ${errorMessage}`,
          'error',
          { error }
        );
        execution.logs.push(errorNodeLog);
        onLogAdded(errorNodeLog);
        
        // Do not stop the entire workflow, but mark the branch as failed
        return;
      }
    }
  } catch (error) {
    // Handle workflow execution error
    execution.status = 'failed';
    execution.endTime = new Date().toISOString();
    execution.error = error instanceof Error ? error.message : 'Unknown error during workflow execution';
    
    // Log workflow failure
    const failureLog = createNodeLog(
      'workflow',
      `Workflow execution failed: ${execution.error}`,
      'error',
      { error }
    );
    execution.logs.push(failureLog);
    onLogAdded(failureLog);
    
    onWorkflowStatusChange('failed');
  }
  
  return execution;
}

// Component that handles workflow execution
export const WorkflowExecutor: React.FC<{
  nodes: Node<NodeData>[];
  edges: Edge[];
  onNodeStateChange: (nodeId: string, state: WorkflowState) => void;
}> = ({ nodes, edges, onNodeStateChange }) => {
  const [execution, setExecution] = useState<WorkflowExecution | null>(null);
  const [executionStatus, setExecutionStatus] = useState<'pending' | 'running' | 'completed' | 'failed' | 'canceled'>('pending');
  const [isExecuting, setIsExecuting] = useState(false);
  const [logs, setLogs] = useState<ExecutionLog[]>([]);
  const [activeTab, setActiveTab] = useState('logs');
  
  // Handle starting the workflow execution
  const handleStart = useCallback(() => {
    if (isExecuting) return;
    
    setIsExecuting(true);
    setExecutionStatus('pending');
    setLogs([]);
    
    // Reset all node states
    nodes.forEach(node => {
      onNodeStateChange(node.id, 'idle');
    });
    
    const onLogAdded = (log: ExecutionLog) => {
      setLogs(prevLogs => [...prevLogs, log]);
    };
    
    const onWorkflowStatusChange = (status: 'pending' | 'running' | 'completed' | 'failed' | 'canceled') => {
      setExecutionStatus(status);
    };
    
    executeWorkflow(nodes, edges, onNodeStateChange, onWorkflowStatusChange, onLogAdded)
      .then(result => {
        setExecution(result);
        setIsExecuting(false);
        
        if (result.status === 'completed') {
          toast({
            title: 'Workflow Execution Complete',
            description: 'The workflow executed successfully.',
            variant: 'success',
          });
        } else if (result.status === 'failed') {
          toast({
            title: 'Workflow Execution Failed',
            description: result.error || 'An unknown error occurred.',
            variant: 'destructive',
          });
        }
      })
      .catch(error => {
        console.error('Error executing workflow:', error);
        setExecutionStatus('failed');
        setIsExecuting(false);
        
        toast({
          title: 'Execution Error',
          description: error instanceof Error ? error.message : 'An unexpected error occurred',
          variant: 'destructive',
        });
      });
  }, [nodes, edges, isExecuting, onNodeStateChange]);
  
  // Handle stopping the workflow execution
  const handleStop = useCallback(() => {
    if (!isExecuting) return;
    
    // Simply mark it as canceled - we don't actually have a way to stop the promises
    setExecutionStatus('canceled');
    setIsExecuting(false);
    
    // Reset all node states
    nodes.forEach(node => {
      onNodeStateChange(node.id, 'idle');
    });
    
    toast({
      title: 'Execution Canceled',
      description: 'Workflow execution has been canceled.',
    });
  }, [isExecuting, nodes, onNodeStateChange]);
  
  // Function to clear the execution results
  const handleClear = useCallback(() => {
    setExecution(null);
    setLogs([]);
    
    // Reset all node states
    nodes.forEach(node => {
      onNodeStateChange(node.id, 'idle');
    });
  }, [nodes, onNodeStateChange]);
  
  // Render log entries
  const renderLogs = useCallback(() => {
    if (logs.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Terminal className="h-12 w-12 text-muted-foreground/40 mb-4" />
          <p className="text-muted-foreground">No execution logs yet. Start the workflow to see logs.</p>
        </div>
      );
    }
    
    return (
      <ScrollArea className="h-[400px] pr-4">
        <div className="space-y-2">
          {logs.map((log, index) => (
            <div
              key={index}
              className="p-2 border rounded-md"
              style={{
                borderLeftWidth: '4px',
                borderLeftColor: log.level === 'error' 
                  ? '#ef4444' 
                  : log.level === 'warn' 
                    ? '#f97316' 
                    : log.level === 'debug'
                      ? '#6366f1'
                      : '#10b981'
              }}
            >
              <div className="flex items-center justify-between">
                <Badge variant={
                  log.level === 'error' 
                    ? 'destructive'
                    : log.level === 'warn'
                      ? 'outline'
                      : log.level === 'debug'
                        ? 'secondary'
                        : 'success'
                }>
                  {log.level.toUpperCase()}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
              </div>
              
              <div className="mt-1 text-sm">
                {log.message}
              </div>
              
              {log.nodeId !== 'workflow' && (
                <div className="mt-1 text-xs text-muted-foreground">
                  Node: {log.nodeId}
                </div>
              )}
              
              {log.data && (
                <details className="mt-2">
                  <summary className="text-xs font-medium text-primary cursor-pointer">
                    View Details
                  </summary>
                  <pre className="mt-1 p-2 text-xs bg-slate-50 rounded overflow-auto">
                    {JSON.stringify(log.data, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    );
  }, [logs]);
  
  // Render the results tab
  const renderResults = useCallback(() => {
    if (!execution || !execution.result) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <FileJson className="h-12 w-12 text-muted-foreground/40 mb-4" />
          <p className="text-muted-foreground">No execution results yet. Start the workflow to see results.</p>
        </div>
      );
    }
    
    return (
      <ScrollArea className="h-[400px] pr-4">
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Execution Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Status</span>
                  <Badge variant={execution.status === 'completed' ? 'success' : execution.status === 'failed' ? 'destructive' : 'secondary'}>
                    {execution.status.toUpperCase()}
                  </Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Start Time</span>
                  <span className="text-sm text-muted-foreground">
                    {new Date(execution.startTime).toLocaleString()}
                  </span>
                </div>
                
                {execution.endTime && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">End Time</span>
                    <span className="text-sm text-muted-foreground">
                      {new Date(execution.endTime).toLocaleString()}
                    </span>
                  </div>
                )}
                
                {execution.endTime && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Duration</span>
                    <span className="text-sm text-muted-foreground">
                      {((new Date(execution.endTime).getTime() - new Date(execution.startTime).getTime()) / 1000).toFixed(2)}s
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          {execution.error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                {execution.error}
              </AlertDescription>
            </Alert>
          )}
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Result Data</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs bg-slate-50 p-4 rounded overflow-auto max-h-[300px]">
                {JSON.stringify(execution.result, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    );
  }, [execution]);
  
  // Render the status summary
  const renderStatusSummary = useCallback(() => {
    if (!execution && !isExecuting) {
      return (
        <div className="text-center p-4 border rounded-md bg-slate-50">
          <p className="text-sm text-muted-foreground">
            Workflow not executed yet.
          </p>
        </div>
      );
    }
    
    const statusInfo = {
      pending: {
        icon: <Clock className="h-5 w-5 text-yellow-500" />,
        title: 'Workflow Pending',
        description: 'Preparing to execute the workflow...',
        color: 'bg-yellow-50 border-yellow-200'
      },
      running: {
        icon: <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />,
        title: 'Workflow Running',
        description: 'Executing workflow nodes...',
        color: 'bg-blue-50 border-blue-200'
      },
      completed: {
        icon: <CheckCircle2 className="h-5 w-5 text-emerald-500" />,
        title: 'Workflow Completed',
        description: 'All nodes executed successfully.',
        color: 'bg-emerald-50 border-emerald-200'
      },
      failed: {
        icon: <AlertCircle className="h-5 w-5 text-rose-500" />,
        title: 'Workflow Failed',
        description: execution?.error || 'An error occurred during execution.',
        color: 'bg-rose-50 border-rose-200'
      },
      canceled: {
        icon: <StopCircle className="h-5 w-5 text-slate-500" />,
        title: 'Workflow Canceled',
        description: 'Execution was manually canceled.',
        color: 'bg-slate-50 border-slate-200'
      }
    };
    
    const status = statusInfo[executionStatus];
    
    return (
      <div className={`flex items-center p-4 border rounded-md gap-3 ${status.color}`}>
        {status.icon}
        <div>
          <h3 className="font-medium text-sm">{status.title}</h3>
          <p className="text-xs text-muted-foreground">{status.description}</p>
        </div>
      </div>
    );
  }, [execution, executionStatus, isExecuting]);
  
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl flex items-center">
              <Play className="mr-2 h-5 w-5 text-emerald-500" />
              Workflow Executor
            </CardTitle>
            <CardDescription>
              Test and run your workflow to see results
            </CardDescription>
          </div>
          
          <div className="flex gap-2">
            {!isExecuting ? (
              <Button 
                onClick={handleStart}
                disabled={nodes.length === 0}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white"
              >
                <Play className="mr-2 h-4 w-4" />
                Run Workflow
              </Button>
            ) : (
              <Button 
                onClick={handleStop}
                variant="destructive"
              >
                <StopCircle className="mr-2 h-4 w-4" />
                Stop Execution
              </Button>
            )}
            
            {execution && (
              <Button 
                variant="outline" 
                onClick={handleClear}
              >
                Clear Results
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {renderStatusSummary()}
        
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="logs">Execution Logs</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
          </TabsList>
          
          <TabsContent value="logs" className="mt-4">
            {renderLogs()}
          </TabsContent>
          
          <TabsContent value="results" className="mt-4">
            {renderResults()}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
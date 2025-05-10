import React, { useState, useEffect, useCallback } from 'react';
import { Node, Edge, useReactFlow } from 'reactflow';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardFooter 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { 
  Play, 
  Pause, 
  StopCircle, 
  RotateCcw, 
  CheckCircle, 
  XCircle, 
  Info, 
  AlertTriangle,
  Bug,
  ChevronDown,
  ChevronUp,
  Clock,
  FileJson,
  MessagesSquare,
  Layers
} from 'lucide-react';
import { motion } from 'framer-motion';
import { WorkflowStateIndicator, WorkflowState } from './StateChangeAnimation';

// Types
export interface ExecutionResult {
  success: boolean;
  executionTime: number;
  nodeResults: NodeExecutionResult[];
  errors: ExecutionError[];
  logs: LogEntry[];
  outputData: any;
  testResults?: TestResult[];
}

export interface NodeExecutionResult {
  nodeId: string;
  nodeName: string;
  status: 'success' | 'error' | 'skipped';
  executionTime: number;
  inputData: any;
  outputData: any;
  error?: string;
}

export interface ExecutionError {
  nodeId: string;
  nodeName: string;
  message: string;
  details?: string;
  timestamp: number;
}

export interface LogEntry {
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  nodeId?: string;
  nodeName?: string;
  timestamp: number;
  data?: any;
}

export interface TestResult {
  name: string;
  status: 'passed' | 'failed';
  expected: any;
  actual: any;
  message?: string;
}

interface NodeData {
  label: string;
  type?: string;
  [key: string]: any;
}

// Function to get next node in execution
function getNextNodes(currentNodeId: string, edges: Edge[]): string[] {
  return edges
    .filter(edge => edge.source === currentNodeId)
    .map(edge => edge.target);
}

// Function to execute a single node
async function executeNode(node: Node<NodeData>, inputData: any = {}): Promise<NodeExecutionResult> {
  // This would be a real implementation that calls the actual node logic
  // For demo, we'll simulate different node behaviors based on node type
  
  const startTime = performance.now();
  let result: Partial<NodeExecutionResult> = {
    nodeId: node.id,
    nodeName: node.data.label || `Node ${node.id}`,
    inputData
  };
  
  try {
    // Simulate different node behaviors
    switch (node.type) {
      case 'trigger':
        // Trigger nodes start workflows
        result.outputData = { triggered: true, timestamp: new Date().toISOString() };
        break;
        
      case 'api':
        // Simulate API call with delay
        await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 700));
        
        // Randomly fail some API calls for demo
        if (Math.random() < 0.1) {
          throw new Error('API request failed: 429 Too Many Requests');
        }
        
        result.outputData = { 
          status: 200, 
          data: { success: true, message: 'API call successful' } 
        };
        break;
        
      case 'transform':
        // Transform input data
        const transformedData = { ...inputData };
        
        // Apply transform based on node configuration
        if (node.data.transformation === 'uppercase' && inputData.text) {
          transformedData.text = inputData.text.toUpperCase();
        } else if (node.data.transformation === 'lowercase' && inputData.text) {
          transformedData.text = inputData.text.toLowerCase();
        } else if (inputData.value !== undefined) {
          transformedData.value = inputData.value * 2; // Simple doubling transform
        }
        
        result.outputData = transformedData;
        break;
        
      case 'condition':
        // Evaluate a condition
        let conditionMet = false;
        
        if (node.data.condition === 'equals' && inputData.value !== undefined) {
          conditionMet = inputData.value === node.data.value;
        } else if (node.data.condition === 'greater' && inputData.value !== undefined) {
          conditionMet = inputData.value > node.data.value;
        } else if (inputData.value !== undefined) {
          conditionMet = !!inputData.value; // Default to truthy check
        }
        
        result.outputData = { 
          conditionMet, 
          path: conditionMet ? 'true' : 'false' 
        };
        break;
        
      case 'action':
        // Perform some action
        await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 300));
        result.outputData = { actionPerformed: true, result: 'success' };
        break;
        
      default:
        // Generic node processing
        result.outputData = { 
          processed: true, 
          input: inputData,
          timestamp: new Date().toISOString()
        };
    }
    
    result.status = 'success';
  } catch (error) {
    result.status = 'error';
    result.error = error instanceof Error ? error.message : 'Unknown error';
    result.outputData = { error: result.error };
  }
  
  const endTime = performance.now();
  result.executionTime = Math.round(endTime - startTime);
  
  return result as NodeExecutionResult;
}

// Main function to execute an entire workflow
export async function executeWorkflow(
  nodes: Node[], 
  edges: Edge[],
  onNodeExecution?: (nodeId: string, status: 'running' | 'success' | 'error') => void
): Promise<ExecutionResult> {
  const startTime = performance.now();
  const nodeResults: NodeExecutionResult[] = [];
  const errors: ExecutionError[] = [];
  const logs: LogEntry[] = [];
  
  // Find trigger nodes (entry points)
  const triggerNodes = nodes.filter(node => 
    node.type === 'trigger' || 
    !edges.some(edge => edge.target === node.id)
  );
  
  if (triggerNodes.length === 0) {
    return {
      success: false,
      executionTime: 0,
      nodeResults: [],
      errors: [{
        nodeId: '',
        nodeName: 'Workflow',
        message: 'No trigger node found to start workflow execution',
        timestamp: Date.now()
      }],
      logs: [{
        level: 'error',
        message: 'No trigger node found to start workflow execution',
        timestamp: Date.now()
      }],
      outputData: null
    };
  }
  
  // Add initial log
  logs.push({
    level: 'info',
    message: 'Starting workflow execution',
    timestamp: Date.now()
  });
  
  // Track nodes that have been executed
  const executedNodes = new Set<string>();
  
  // Track nodes waiting to be executed
  const nodeQueue: { nodeId: string; inputData: any }[] = triggerNodes.map(node => ({
    nodeId: node.id,
    inputData: {}
  }));
  
  // Execute nodes in the queue until empty
  while (nodeQueue.length > 0) {
    const { nodeId, inputData } = nodeQueue.shift()!;
    
    // Skip if already executed
    if (executedNodes.has(nodeId)) continue;
    
    const node = nodes.find(n => n.id === nodeId);
    if (!node) continue;
    
    try {
      // Signal node is running
      if (onNodeExecution) {
        onNodeExecution(nodeId, 'running');
      }
      
      logs.push({
        level: 'info',
        message: `Executing node: ${node.data.label || node.id}`,
        nodeId: node.id,
        nodeName: node.data.label,
        timestamp: Date.now()
      });
      
      // Execute the node
      const result = await executeNode(node, inputData);
      nodeResults.push(result);
      executedNodes.add(nodeId);
      
      // Signal node execution status
      if (onNodeExecution) {
        onNodeExecution(nodeId, result.status === 'success' ? 'success' : 'error');
      }
      
      // Log the result
      logs.push({
        level: result.status === 'success' ? 'info' : 'error',
        message: result.status === 'success' 
          ? `Node executed successfully: ${node.data.label || node.id}`
          : `Node execution failed: ${node.data.label || node.id} - ${result.error}`,
        nodeId: node.id,
        nodeName: node.data.label,
        timestamp: Date.now(),
        data: result.status === 'success' ? { output: result.outputData } : { error: result.error }
      });
      
      // If there was an error, record it
      if (result.status === 'error') {
        errors.push({
          nodeId: node.id,
          nodeName: node.data.label || `Node ${node.id}`,
          message: result.error || 'Unknown error',
          timestamp: Date.now()
        });
        continue; // Don't process next nodes on error
      }
      
      // Add next nodes to the queue
      const nextNodeIds = getNextNodes(nodeId, edges);
      for (const nextNodeId of nextNodeIds) {
        nodeQueue.push({
          nodeId: nextNodeId,
          inputData: result.outputData
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Record error
      errors.push({
        nodeId: node.id,
        nodeName: node.data.label || `Node ${node.id}`,
        message: errorMessage,
        timestamp: Date.now()
      });
      
      // Log error
      logs.push({
        level: 'error',
        message: `Error executing node: ${node.data.label || node.id} - ${errorMessage}`,
        nodeId: node.id,
        nodeName: node.data.label,
        timestamp: Date.now()
      });
      
      // Signal node error
      if (onNodeExecution) {
        onNodeExecution(nodeId, 'error');
      }
    }
  }
  
  const endTime = performance.now();
  const executionTime = Math.round(endTime - startTime);
  
  // Add final log
  logs.push({
    level: errors.length > 0 ? 'warn' : 'info',
    message: errors.length > 0 
      ? `Workflow execution completed with ${errors.length} errors in ${executionTime}ms`
      : `Workflow execution completed successfully in ${executionTime}ms`,
    timestamp: Date.now()
  });
  
  // Get the final output data from the last executed nodes
  // (nodes with no outgoing edges)
  const finalNodes = nodes.filter(node => 
    !edges.some(edge => edge.source === node.id)
  );
  
  const finalResults = nodeResults.filter(result => 
    finalNodes.some(node => node.id === result.nodeId)
  );
  
  const outputData = finalResults.length > 0 
    ? finalResults.map(result => result.outputData)
    : nodeResults.length > 0 
      ? [nodeResults[nodeResults.length - 1].outputData]
      : null;
  
  return {
    success: errors.length === 0,
    executionTime,
    nodeResults,
    errors,
    logs,
    outputData,
  };
}

// Function to run tests on a workflow
export async function testWorkflow(
  nodes: Node[], 
  edges: Edge[], 
  testCases: Array<{ name: string; input: any; expected: any }>
): Promise<ExecutionResult> {
  const baseResult = await executeWorkflow(nodes, edges);
  
  // Run through each test case
  const testResults: TestResult[] = [];
  
  for (const testCase of testCases) {
    try {
      // Clone the nodes for this test and set input
      const testNodes = nodes.map(node => ({
        ...node,
        data: node.type === 'trigger' 
          ? { ...node.data, input: testCase.input }
          : { ...node.data }
      }));
      
      // Execute the workflow with test data
      const result = await executeWorkflow(testNodes, edges);
      
      // Check if the output matches expected
      const outputMatches = JSON.stringify(result.outputData) === JSON.stringify(testCase.expected);
      
      testResults.push({
        name: testCase.name,
        status: outputMatches ? 'passed' : 'failed',
        expected: testCase.expected,
        actual: result.outputData,
        message: outputMatches ? 
          'Test passed successfully' : 
          'Output does not match expected value'
      });
    } catch (error) {
      testResults.push({
        name: testCase.name,
        status: 'failed',
        expected: testCase.expected,
        actual: null,
        message: error instanceof Error ? error.message : 'Unknown error during test execution'
      });
    }
  }
  
  return {
    ...baseResult,
    testResults
  };
}

// Workflow Executor Component
interface WorkflowExecutorProps {
  onNodeStateChange?: (nodeId: string, state: WorkflowState) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function WorkflowExecutor({ onNodeStateChange, isOpen, onClose }: WorkflowExecutorProps) {
  const { getNodes, getEdges } = useReactFlow();
  
  const [executionState, setExecutionState] = useState<'idle' | 'running' | 'completed' | 'error'>('idle');
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);
  const [currentNodeId, setCurrentNodeId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('execution');
  const [showRealtime, setShowRealtime] = useState(true);
  
  // Execute workflow
  const runExecution = useCallback(async () => {
    setExecutionState('running');
    setExecutionResult(null);
    
    const nodes = getNodes();
    const edges = getEdges();
    
    try {
      const handleNodeExecution = (nodeId: string, status: 'running' | 'success' | 'error') => {
        setCurrentNodeId(nodeId);
        
        // Map execution status to workflow state
        const stateMap: Record<string, WorkflowState> = {
          'running': 'running',
          'success': 'completed',
          'error': 'failed'
        };
        
        // Notify parent component of node state changes
        if (onNodeStateChange && status) {
          onNodeStateChange(nodeId, stateMap[status]);
        }
      };
      
      const result = await executeWorkflow(nodes, edges, handleNodeExecution);
      setExecutionResult(result);
      setExecutionState(result.success ? 'completed' : 'error');
    } catch (error) {
      setExecutionState('error');
      setExecutionResult({
        success: false,
        executionTime: 0,
        nodeResults: [],
        errors: [{
          nodeId: '',
          nodeName: 'Workflow',
          message: error instanceof Error ? error.message : 'Unknown error during execution',
          timestamp: Date.now()
        }],
        logs: [{
          level: 'error',
          message: `Execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          timestamp: Date.now()
        }],
        outputData: null
      });
    }
  }, [getNodes, getEdges, onNodeStateChange]);
  
  // Run tests on workflow
  const runTests = useCallback(async () => {
    setExecutionState('running');
    setActiveTab('testing');
    
    const nodes = getNodes();
    const edges = getEdges();
    
    // Mock test cases - in a real app this would be configured by the user
    const testCases = [
      {
        name: 'Basic functionality',
        input: { test: 'value' },
        expected: { success: true }
      },
      {
        name: 'Edge case handling',
        input: { test: '' },
        expected: { success: true }
      },
      {
        name: 'Error handling',
        input: { error: true },
        expected: { success: false, error: 'Test error' }
      }
    ];
    
    try {
      const result = await testWorkflow(nodes, edges, testCases);
      setExecutionResult(result);
      setExecutionState(result.success ? 'completed' : 'error');
    } catch (error) {
      setExecutionState('error');
      setExecutionResult({
        success: false,
        executionTime: 0,
        nodeResults: [],
        errors: [{
          nodeId: '',
          nodeName: 'Workflow',
          message: error instanceof Error ? error.message : 'Unknown error during testing',
          timestamp: Date.now()
        }],
        logs: [{
          level: 'error',
          message: `Testing failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          timestamp: Date.now()
        }],
        outputData: null,
        testResults: []
      });
    }
  }, [getNodes, getEdges]);
  
  // Reset execution state
  const resetExecution = useCallback(() => {
    setExecutionState('idle');
    setExecutionResult(null);
    setCurrentNodeId(null);
    
    // Reset any node states in the parent component
    const nodes = getNodes();
    if (onNodeStateChange) {
      nodes.forEach(node => {
        onNodeStateChange(node.id, 'idle');
      });
    }
  }, [getNodes, onNodeStateChange]);
  
  // Clean up on close
  useEffect(() => {
    if (!isOpen) {
      resetExecution();
    }
  }, [isOpen, resetExecution]);
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center">
      <div className="w-full max-w-7xl h-[85vh] mx-auto">
        <Card className="border-none shadow-xl h-full flex flex-col">
          <CardHeader className="bg-slate-50 border-b py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {executionState === 'idle' && <Clock className="h-5 w-5 text-slate-500 mr-2" />}
                {executionState === 'running' && <Play className="h-5 w-5 text-blue-500 mr-2" />}
                {executionState === 'completed' && <CheckCircle className="h-5 w-5 text-emerald-500 mr-2" />}
                {executionState === 'error' && <XCircle className="h-5 w-5 text-red-500 mr-2" />}
                
                <CardTitle>Workflow Execution</CardTitle>
              </div>
              
              <div className="flex items-center gap-2">
                {executionState === 'idle' && (
                  <>
                    <Button onClick={runExecution} variant="default">
                      <Play className="h-4 w-4 mr-2" />
                      Run Workflow
                    </Button>
                    <Button onClick={runTests} variant="outline">
                      <Bug className="h-4 w-4 mr-2" />
                      Run Tests
                    </Button>
                  </>
                )}
                
                {executionState === 'running' && (
                  <Button variant="outline" disabled>
                    <Pause className="h-4 w-4 mr-2" />
                    Running...
                  </Button>
                )}
                
                {(executionState === 'completed' || executionState === 'error') && (
                  <Button onClick={resetExecution} variant="outline">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset
                  </Button>
                )}
                
                <Button variant="ghost" onClick={onClose}>
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {executionResult && (
              <div className="flex items-center gap-3 mt-2">
                <Badge variant={executionResult.success ? "success" : "destructive"}>
                  {executionResult.success ? 'Success' : 'Failed'}
                </Badge>
                
                <Badge variant="outline">
                  <Clock className="h-3 w-3 mr-1" />
                  {executionResult.executionTime}ms
                </Badge>
                
                <Badge variant="outline">
                  <Layers className="h-3 w-3 mr-1" />
                  {executionResult.nodeResults.length} Nodes
                </Badge>
                
                {executionResult.errors.length > 0 && (
                  <Badge variant="destructive">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    {executionResult.errors.length} Errors
                  </Badge>
                )}
                
                {executionResult.testResults && (
                  <>
                    <Badge variant="outline" className="bg-blue-50">
                      <Bug className="h-3 w-3 mr-1" />
                      {executionResult.testResults.length} Tests
                    </Badge>
                    
                    <Badge variant="success">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      {executionResult.testResults.filter(t => t.status === 'passed').length} Passed
                    </Badge>
                    
                    {executionResult.testResults.some(t => t.status === 'failed') && (
                      <Badge variant="destructive">
                        <XCircle className="h-3 w-3 mr-1" />
                        {executionResult.testResults.filter(t => t.status === 'failed').length} Failed
                      </Badge>
                    )}
                  </>
                )}
              </div>
            )}
          </CardHeader>
          
          <CardContent className="p-0 flex-1 flex flex-col overflow-hidden">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
              <div className="border-b bg-slate-50">
                <TabsList className="mx-4">
                  <TabsTrigger value="execution" disabled={executionState === 'running'}>
                    <Play className="h-4 w-4 mr-2" />
                    Execution
                  </TabsTrigger>
                  
                  <TabsTrigger value="logs" disabled={executionState === 'running'}>
                    <MessagesSquare className="h-4 w-4 mr-2" />
                    Logs
                  </TabsTrigger>
                  
                  <TabsTrigger value="data" disabled={executionState === 'running'}>
                    <FileJson className="h-4 w-4 mr-2" />
                    Data
                  </TabsTrigger>
                  
                  <TabsTrigger value="testing" disabled={executionState === 'running'}>
                    <Bug className="h-4 w-4 mr-2" />
                    Testing
                  </TabsTrigger>
                </TabsList>
              </div>
              
              <div className="flex-1 overflow-hidden">
                {/* Execution Tab */}
                <TabsContent value="execution" className="h-full flex flex-col">
                  {executionState === 'idle' && (
                    <div className="flex-1 flex flex-col items-center justify-center p-6">
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                        <Play className="h-8 w-8 text-primary" />
                      </div>
                      <h3 className="text-lg font-medium mb-2">Ready to Execute</h3>
                      <p className="text-muted-foreground text-center max-w-md mb-6">
                        Run your workflow to test its execution. You'll be able to see the results, 
                        logs, and any errors that occur during execution.
                      </p>
                      <div className="flex gap-3">
                        <Button onClick={runExecution}>
                          <Play className="h-4 w-4 mr-2" />
                          Run Workflow
                        </Button>
                        <Button variant="outline" onClick={runTests}>
                          <Bug className="h-4 w-4 mr-2" />
                          Run Tests
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {executionState === 'running' && (
                    <div className="flex-1 flex flex-col">
                      <div className="p-4 flex justify-between items-center border-b">
                        <div className="flex items-center">
                          <Play className="h-4 w-4 text-blue-500 mr-2" />
                          <span className="font-medium">Executing Workflow</span>
                        </div>
                        <div className="flex items-center">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8"
                            onClick={() => setShowRealtime(!showRealtime)}
                          >
                            {showRealtime ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            {showRealtime ? 'Hide' : 'Show'} Realtime Logs
                          </Button>
                        </div>
                      </div>
                      
                      {showRealtime && (
                        <ScrollArea className="flex-1">
                          <div className="p-4">
                            {currentNodeId && (
                              <div className="p-4 mb-4 border rounded-lg bg-slate-50">
                                <div className="flex items-center">
                                  <WorkflowStateIndicator state="running" size="sm" />
                                  <span className="ml-2 font-medium">
                                    Currently executing node: {
                                      getNodes().find(n => n.id === currentNodeId)?.data.label || currentNodeId
                                    }
                                  </span>
                                </div>
                              </div>
                            )}
                            
                            {executionResult?.logs.map((log, index) => (
                              <div key={index} className="flex py-1">
                                <div className="w-24 text-xs text-slate-500">
                                  {new Date(log.timestamp).toLocaleTimeString()}
                                </div>
                                <div className="flex-1">
                                  {log.level === 'info' && <Info className="h-4 w-4 text-blue-500 inline mr-2" />}
                                  {log.level === 'warn' && <AlertTriangle className="h-4 w-4 text-amber-500 inline mr-2" />}
                                  {log.level === 'error' && <XCircle className="h-4 w-4 text-red-500 inline mr-2" />}
                                  <span className={`text-sm ${
                                    log.level === 'error' ? 'text-red-600' : 
                                    log.level === 'warn' ? 'text-amber-600' : ''
                                  }`}>
                                    {log.message}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      )}
                    </div>
                  )}
                  
                  {(executionState === 'completed' || executionState === 'error') && executionResult && (
                    <ResizablePanelGroup direction="horizontal" className="h-full">
                      <ResizablePanel defaultSize={50}>
                        <div className="flex flex-col h-full">
                          <div className="p-4 border-b">
                            <h3 className="font-medium">Node Results</h3>
                          </div>
                          <ScrollArea className="flex-1">
                            <div className="p-4 space-y-4">
                              {executionResult.nodeResults.map((result) => (
                                <Card key={result.nodeId} className="overflow-hidden border">
                                  <CardHeader className="py-2 px-4 flex flex-row items-center justify-between bg-slate-50 border-b">
                                    <div className="flex items-center">
                                      {result.status === 'success' && <CheckCircle className="h-4 w-4 text-emerald-500 mr-2" />}
                                      {result.status === 'error' && <XCircle className="h-4 w-4 text-red-500 mr-2" />}
                                      {result.status === 'skipped' && <Clock className="h-4 w-4 text-slate-500 mr-2" />}
                                      <CardTitle className="text-sm font-medium">{result.nodeName}</CardTitle>
                                    </div>
                                    <Badge variant="outline">
                                      {result.executionTime}ms
                                    </Badge>
                                  </CardHeader>
                                  
                                  <CardContent className="p-0">
                                    <Accordion type="single" collapsible defaultValue="output">
                                      <AccordionItem value="output" className="border-0">
                                        <AccordionTrigger className="px-4 py-2 text-sm hover:no-underline">
                                          Output Data
                                        </AccordionTrigger>
                                        <AccordionContent className="p-0">
                                          <div className="bg-slate-50 p-3 border-t border-b font-mono text-xs overflow-x-auto">
                                            <pre>{JSON.stringify(result.outputData, null, 2)}</pre>
                                          </div>
                                        </AccordionContent>
                                      </AccordionItem>
                                      
                                      <AccordionItem value="input" className="border-0">
                                        <AccordionTrigger className="px-4 py-2 text-sm hover:no-underline">
                                          Input Data
                                        </AccordionTrigger>
                                        <AccordionContent className="p-0">
                                          <div className="bg-slate-50 p-3 border-t border-b font-mono text-xs overflow-x-auto">
                                            <pre>{JSON.stringify(result.inputData, null, 2)}</pre>
                                          </div>
                                        </AccordionContent>
                                      </AccordionItem>
                                    </Accordion>
                                    
                                    {result.error && (
                                      <div className="px-4 py-3 border-t bg-red-50 text-red-800 text-sm">
                                        <div className="font-medium">Error:</div>
                                        <div className="mt-1">{result.error}</div>
                                      </div>
                                    )}
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          </ScrollArea>
                        </div>
                      </ResizablePanel>
                      
                      <ResizablePanel defaultSize={50}>
                        <div className="flex flex-col h-full">
                          <div className="p-4 border-b">
                            <h3 className="font-medium">Execution Summary</h3>
                          </div>
                          <ScrollArea className="flex-1">
                            <div className="p-4">
                              <Card className="mb-4">
                                <CardContent className="p-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <h4 className="text-sm font-medium text-muted-foreground mb-1">Status</h4>
                                      <div className="flex items-center">
                                        {executionResult.success ? (
                                          <>
                                            <CheckCircle className="h-4 w-4 text-emerald-500 mr-2" />
                                            <span className="font-medium text-emerald-600">Successful</span>
                                          </>
                                        ) : (
                                          <>
                                            <XCircle className="h-4 w-4 text-red-500 mr-2" />
                                            <span className="font-medium text-red-600">Failed</span>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                    <div>
                                      <h4 className="text-sm font-medium text-muted-foreground mb-1">Execution Time</h4>
                                      <div className="font-medium">{executionResult.executionTime}ms</div>
                                    </div>
                                    <div>
                                      <h4 className="text-sm font-medium text-muted-foreground mb-1">Nodes Executed</h4>
                                      <div className="font-medium">{executionResult.nodeResults.length}</div>
                                    </div>
                                    <div>
                                      <h4 className="text-sm font-medium text-muted-foreground mb-1">Success Rate</h4>
                                      <div className="font-medium">
                                        {Math.round(
                                          (executionResult.nodeResults.filter(r => r.status === 'success').length / 
                                          executionResult.nodeResults.length) * 100
                                        )}%
                                      </div>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                              
                              {executionResult.errors.length > 0 && (
                                <div className="mb-4">
                                  <h3 className="font-medium mb-2">Errors</h3>
                                  {executionResult.errors.map((error, i) => (
                                    <Alert variant="destructive" className="mb-2" key={i}>
                                      <AlertTriangle className="h-4 w-4" />
                                      <AlertTitle>Error in {error.nodeName}</AlertTitle>
                                      <AlertDescription>
                                        {error.message}
                                        {error.details && (
                                          <div className="mt-2 text-xs">
                                            {error.details}
                                          </div>
                                        )}
                                      </AlertDescription>
                                    </Alert>
                                  ))}
                                </div>
                              )}
                              
                              <div>
                                <h3 className="font-medium mb-2">Output Data</h3>
                                <div className="bg-slate-50 p-3 border rounded-md font-mono text-xs overflow-x-auto">
                                  <pre>{JSON.stringify(executionResult.outputData, null, 2)}</pre>
                                </div>
                              </div>
                            </div>
                          </ScrollArea>
                        </div>
                      </ResizablePanel>
                    </ResizablePanelGroup>
                  )}
                </TabsContent>
                
                {/* Logs Tab */}
                <TabsContent value="logs" className="h-full">
                  {executionResult && (
                    <ScrollArea className="h-full">
                      <div className="p-4">
                        {executionResult.logs.map((log, index) => (
                          <div key={index} className="flex py-1.5 border-b last:border-b-0">
                            <div className="w-32 text-xs text-slate-500">
                              {new Date(log.timestamp).toLocaleTimeString()}
                            </div>
                            <div className="w-16">
                              <Badge variant={
                                log.level === 'error' ? 'destructive' : 
                                log.level === 'warn' ? 'outline' : 
                                log.level === 'info' ? 'secondary' : 'outline'
                              } className="text-xs">
                                {log.level}
                              </Badge>
                            </div>
                            <div className="flex-1 ml-2">
                              <div className={`text-sm ${
                                log.level === 'error' ? 'text-red-600' : 
                                log.level === 'warn' ? 'text-amber-600' : ''
                              }`}>
                                {log.message}
                              </div>
                              {log.nodeName && (
                                <div className="text-xs text-muted-foreground mt-0.5">
                                  Node: {log.nodeName}
                                </div>
                              )}
                              {log.data && (
                                <Accordion type="single" collapsible className="mt-1">
                                  <AccordionItem value="data" className="border-0">
                                    <AccordionTrigger className="py-1 text-xs hover:no-underline">
                                      View Details
                                    </AccordionTrigger>
                                    <AccordionContent className="p-0">
                                      <div className="bg-slate-50 p-2 border rounded font-mono text-xs overflow-x-auto">
                                        <pre>{JSON.stringify(log.data, null, 2)}</pre>
                                      </div>
                                    </AccordionContent>
                                  </AccordionItem>
                                </Accordion>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </TabsContent>
                
                {/* Data Tab */}
                <TabsContent value="data" className="h-full">
                  {executionResult && (
                    <ResizablePanelGroup direction="horizontal" className="h-full">
                      <ResizablePanel defaultSize={40}>
                        <div className="flex flex-col h-full">
                          <div className="p-4 border-b">
                            <h3 className="font-medium">Node Data Flow</h3>
                          </div>
                          <ScrollArea className="flex-1">
                            <div className="p-4">
                              <Accordion type="single" collapsible className="space-y-2">
                                {executionResult.nodeResults.map((result) => (
                                  <AccordionItem 
                                    value={result.nodeId} 
                                    key={result.nodeId}
                                    className="border rounded-md overflow-hidden"
                                  >
                                    <AccordionTrigger className="px-4 py-2 hover:no-underline bg-slate-50">
                                      <div className="flex items-center">
                                        {result.status === 'success' && <CheckCircle className="h-4 w-4 text-emerald-500 mr-2" />}
                                        {result.status === 'error' && <XCircle className="h-4 w-4 text-red-500 mr-2" />}
                                        <span>{result.nodeName}</span>
                                      </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="p-0">
                                      <div className="p-4 border-t space-y-3">
                                        <div>
                                          <div className="text-sm font-medium mb-1">Input</div>
                                          <div className="bg-slate-50 p-2 border rounded font-mono text-xs overflow-x-auto">
                                            <pre>{JSON.stringify(result.inputData, null, 2)}</pre>
                                          </div>
                                        </div>
                                        
                                        <div>
                                          <div className="text-sm font-medium mb-1">Output</div>
                                          <div className="bg-slate-50 p-2 border rounded font-mono text-xs overflow-x-auto">
                                            <pre>{JSON.stringify(result.outputData, null, 2)}</pre>
                                          </div>
                                        </div>
                                        
                                        {result.error && (
                                          <div>
                                            <div className="text-sm font-medium text-red-600 mb-1">Error</div>
                                            <div className="bg-red-50 p-2 border border-red-100 rounded text-xs text-red-800">
                                              {result.error}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </AccordionContent>
                                  </AccordionItem>
                                ))}
                              </Accordion>
                            </div>
                          </ScrollArea>
                        </div>
                      </ResizablePanel>
                      
                      <ResizablePanel defaultSize={60}>
                        <div className="flex flex-col h-full">
                          <div className="p-4 border-b">
                            <h3 className="font-medium">Final Output</h3>
                          </div>
                          <ScrollArea className="flex-1">
                            <div className="p-4">
                              <div className="bg-slate-50 p-4 border rounded-md font-mono text-xs overflow-x-auto min-h-[200px]">
                                <pre>{JSON.stringify(executionResult.outputData, null, 2)}</pre>
                              </div>
                            </div>
                          </ScrollArea>
                        </div>
                      </ResizablePanel>
                    </ResizablePanelGroup>
                  )}
                </TabsContent>
                
                {/* Testing Tab */}
                <TabsContent value="testing" className="h-full">
                  {executionResult?.testResults ? (
                    <div className="h-full flex flex-col">
                      <div className="p-4 border-b">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium">Test Results</h3>
                          <div className="flex gap-2">
                            <Badge variant="outline">
                              {executionResult.testResults.length} Tests
                            </Badge>
                            <Badge variant="success">
                              {executionResult.testResults.filter(t => t.status === 'passed').length} Passed
                            </Badge>
                            <Badge variant="destructive">
                              {executionResult.testResults.filter(t => t.status === 'failed').length} Failed
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      <ScrollArea className="flex-1">
                        <div className="p-4 space-y-4">
                          {executionResult.testResults.map((test, index) => (
                            <Card key={index} className={`border-l-4 ${
                              test.status === 'passed' ? 'border-l-emerald-500' : 'border-l-red-500'
                            }`}>
                              <CardHeader className="py-3 px-4">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center">
                                    {test.status === 'passed' ? (
                                      <CheckCircle className="h-4 w-4 text-emerald-500 mr-2" />
                                    ) : (
                                      <XCircle className="h-4 w-4 text-red-500 mr-2" />
                                    )}
                                    <CardTitle className="text-base">{test.name}</CardTitle>
                                  </div>
                                  <Badge variant={test.status === 'passed' ? 'success' : 'destructive'}>
                                    {test.status}
                                  </Badge>
                                </div>
                                {test.message && (
                                  <CardDescription>{test.message}</CardDescription>
                                )}
                              </CardHeader>
                              
                              <CardContent className="px-4 pb-4 pt-0">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <h4 className="text-sm font-medium mb-2">Expected</h4>
                                    <div className="bg-slate-50 p-2 border rounded font-mono text-xs overflow-x-auto">
                                      <pre>{JSON.stringify(test.expected, null, 2)}</pre>
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <h4 className="text-sm font-medium mb-2">Actual</h4>
                                    <div className={`p-2 border rounded font-mono text-xs overflow-x-auto ${
                                      test.status === 'failed' ? 'bg-red-50 border-red-100' : 'bg-slate-50'
                                    }`}>
                                      <pre>{JSON.stringify(test.actual, null, 2)}</pre>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </ScrollArea>
                      
                      <CardFooter className="border-t bg-slate-50 py-3">
                        <Button onClick={runTests} variant="outline">
                          <RotateCcw className="h-4 w-4 mr-2" />
                          Re-run Tests
                        </Button>
                      </CardFooter>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-6">
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                        <Bug className="h-8 w-8 text-primary" />
                      </div>
                      <h3 className="text-lg font-medium mb-2">Test Your Workflow</h3>
                      <p className="text-muted-foreground text-center max-w-md mb-6">
                        Run tests against your workflow to ensure it performs as expected with 
                        different inputs and edge cases.
                      </p>
                      <Button onClick={runTests}>
                        <Bug className="h-4 w-4 mr-2" />
                        Run Tests
                      </Button>
                    </div>
                  )}
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
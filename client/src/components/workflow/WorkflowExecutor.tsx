import React, { useState, useCallback, useRef } from 'react';
import { Node, Edge } from 'reactflow';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { motion } from 'framer-motion';
import { 
  Play, 
  StopCircle, 
  PauseCircle, 
  RotateCcw, 
  RotateCw,
  SkipForward,
  ClipboardList,
  Hourglass,
  RefreshCcw,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { NodeData } from '@/store/useWorkflowStore';
import { WorkflowState } from '@/components/workflow/StateChangeAnimation';
import { WorkflowExecution, ExecutionLog } from '@/types/workflow';
import { v4 as uuidv4 } from 'uuid';
import { InlineWorkflowLoading } from './InlineWorkflowLoading';

interface WorkflowExecutorProps {
  nodes: Node<NodeData>[];
  edges: Edge[];
  onNodeStateChange?: (nodeId: string, state: WorkflowState) => void;
  onExecutionComplete?: (execution: WorkflowExecution) => void;
  onLogAdded?: (log: ExecutionLog) => void;
  className?: string;
}

export const WorkflowExecutor: React.FC<WorkflowExecutorProps> = ({
  nodes,
  edges,
  onNodeStateChange,
  onExecutionComplete,
  onLogAdded,
  className
}) => {
  const [executionState, setExecutionState] = useState<'idle' | 'running' | 'paused' | 'completed' | 'failed'>('idle');
  const [currentNodeId, setCurrentNodeId] = useState<string | null>(null);
  const [logs, setLogs] = useState<ExecutionLog[]>([]);
  const [executionId, setExecutionId] = useState<string>('');
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  
  const [scheduledTime, setScheduledTime] = useState('');
  const [runOnce, setRunOnce] = useState(true);
  const [repeatInterval, setRepeatInterval] = useState('daily');
  
  // Store the executeNode and executeNextNodes functions using refs to avoid circular dependencies
  const executeFunctionsRef = useRef<{
    executeNode: (nodeId: string) => void;
    executeNextNodes: (nodeId: string) => void;
  }>({ executeNode: () => {}, executeNextNodes: () => {} });
  
  // Add a log entry
  const addLog = useCallback((
    nodeId: string, 
    message: string, 
    level: 'info' | 'warn' | 'error' | 'debug' = 'info',
    data?: any
  ) => {
    const log: ExecutionLog = {
      timestamp: new Date().toISOString(),
      nodeId,
      message,
      level,
      data
    };
    
    setLogs(prev => [log, ...prev]);
    
    if (onLogAdded) {
      onLogAdded(log);
    }
    
    return log;
  }, [onLogAdded]);
  
  // Change a node's state
  const changeNodeState = useCallback((nodeId: string, state: WorkflowState) => {
    if (onNodeStateChange) {
      onNodeStateChange(nodeId, state);
    }
  }, [onNodeStateChange]);
  
  // Reset the execution state
  const resetExecution = useCallback(() => {
    setExecutionState('idle');
    setCurrentNodeId(null);
    setLogs([]);
    setExecutionId('');
    setStartTime(null);
    setEndTime(null);
    
    // Reset all nodes to idle state
    nodes.forEach(node => {
      changeNodeState(node.id, 'idle');
    });
  }, [nodes, changeNodeState]);
  
  // Complete the workflow execution
  const completeExecution = useCallback((status: 'completed' | 'failed' | 'canceled', error?: string) => {
    setExecutionState(status === 'completed' ? 'completed' : 'failed');
    setEndTime(new Date());
    
    let logLevel: 'info' | 'error' | 'warn' = 'info';
    let logMessage = 'Workflow execution completed successfully';
    
    if (status === 'failed') {
      logLevel = 'error';
      logMessage = `Workflow execution failed${error ? `: ${error}` : ''}`;
    } else if (status === 'canceled') {
      logLevel = 'warn';
      logMessage = 'Workflow execution stopped manually';
    }
    
    addLog('workflow', logMessage, logLevel);
    
    // Create execution record
    const now = new Date();
    if (startTime && executionId) {
      const execution: WorkflowExecution = {
        id: executionId,
        workflowId: 'current',
        status,
        startTime: startTime.toISOString(),
        endTime: now.toISOString(),
        logs,
        ...(error && { error })
      };
      
      if (onExecutionComplete) {
        onExecutionComplete(execution);
      }
    }
  }, [addLog, executionId, logs, onExecutionComplete, startTime]);
  
  // Initialize the execution functions
  React.useEffect(() => {
    // Execute a specific node
    const executeNode = (nodeId: string) => {
      const node = nodes.find(n => n.id === nodeId);
      if (!node) return;
      
      setCurrentNodeId(nodeId);
      changeNodeState(nodeId, 'starting');
      
      // Start the node
      setTimeout(() => {
        changeNodeState(nodeId, 'running');
        addLog(nodeId, `Executing '${node.data.label || 'Node'}'`);
        
        // Small chance of failure for demo purposes
        const shouldFail = Math.random() < 0.2;
        
        if (shouldFail) {
          setTimeout(() => {
            changeNodeState(nodeId, 'failed');
            addLog(nodeId, `Error executing '${node.data.label || 'Node'}': Operation failed`, 'error');
            
            // Small chance to retry
            const shouldRetry = Math.random() < 0.5;
            
            if (shouldRetry) {
              setTimeout(() => {
                changeNodeState(nodeId, 'retrying');
                addLog(nodeId, `Retrying '${node.data.label || 'Node'}'`, 'warn');
                
                // Retry succeeded
                setTimeout(() => {
                  changeNodeState(nodeId, 'completed');
                  addLog(nodeId, `Completed execution of '${node.data.label || 'Node'}' after retry`);
                  
                  executeFunctionsRef.current.executeNextNodes(nodeId);
                }, 1000);
              }, 800);
            } else {
              // Overall workflow failed
              completeExecution('failed', `Failed at node: ${node.data.label || nodeId}`);
            }
          }, Math.random() * 1500 + 500);
        } else {
          // Success
          setTimeout(() => {
            changeNodeState(nodeId, 'completed');
            addLog(nodeId, `Completed execution of '${node.data.label || 'Node'}'`);
            
            executeFunctionsRef.current.executeNextNodes(nodeId);
          }, Math.random() * 1500 + 500);
        }
      }, 500);
    };
    
    // Find and execute next nodes
    const executeNextNodes = (nodeId: string) => {
      // Find outgoing edges from this node
      const outgoingEdges = edges.filter(e => e.source === nodeId);
      
      if (outgoingEdges.length === 0) {
        // No more nodes, workflow is complete
        completeExecution('completed');
        return;
      }
      
      // Execute each next node (or just one for condition nodes)
      const sourceNode = nodes.find(n => n.id === nodeId);
      const isCondition = sourceNode?.data.nodeType === 'condition' || sourceNode?.data.type === 'condition';
      
      if (isCondition) {
        // For conditions, randomly pick true or false path
        const conditionResult = Math.random() > 0.5;
        addLog(nodeId, `Condition evaluated to: ${conditionResult}`, 'info');
        
        // Find the edge for the condition result
        const nextEdge = outgoingEdges.find(e => {
          if (!e.data?.condition) return true; // No condition specified, always take
          return e.data.condition === (conditionResult ? 'true' : 'false');
        });
        
        if (nextEdge) {
          executeNode(nextEdge.target);
        } else {
          // No matching edge, workflow is complete
          completeExecution('completed');
        }
      } else {
        // For regular nodes, execute all next nodes in parallel
        outgoingEdges.forEach(edge => {
          executeNode(edge.target);
        });
      }
    };
    
    // Store the functions in the ref
    executeFunctionsRef.current = {
      executeNode,
      executeNextNodes
    };
  }, [nodes, edges, changeNodeState, addLog, completeExecution]);
  
  
  // Start or resume execution
  const startExecution = useCallback(() => {
    if (nodes.length === 0) {
      return;
    }
    
    if (executionState === 'idle') {
      // New execution
      const id = uuidv4();
      const now = new Date();
      
      setExecutionId(id);
      setStartTime(now);
      setEndTime(null);
      setExecutionState('running');
      setLogs([]);
      
      addLog('workflow', 'Starting workflow execution', 'info', { id });
      
      // Find the trigger node (first node)
      const triggerNode = nodes.find(n => 
        n.data.nodeType === 'trigger' || 
        n.data.type === 'trigger' ||
        !edges.some(e => e.target === n.id) // node with no incoming edges
      );
      
      if (triggerNode) {
        setCurrentNodeId(triggerNode.id);
        changeNodeState(triggerNode.id, 'starting');
        
        // Simulate trigger node starting
        setTimeout(() => {
          changeNodeState(triggerNode.id, 'running');
          addLog(triggerNode.id, `Starting execution of '${triggerNode.data.label || 'Trigger'}'`);
          
          // After trigger completes, move to next nodes
          setTimeout(() => {
            changeNodeState(triggerNode.id, 'completed');
            addLog(triggerNode.id, `Completed execution of '${triggerNode.data.label || 'Trigger'}'`, 'info', {
              executionTime: 800
            });
            
            executeFunctionsRef.current.executeNextNodes(triggerNode.id);
          }, 800);
        }, 500);
      } else {
        addLog('workflow', 'No trigger node found. Cannot start execution.', 'error');
        setExecutionState('failed');
      }
    } else if (executionState === 'paused') {
      // Resume execution
      setExecutionState('running');
      addLog('workflow', 'Resuming workflow execution', 'info');
      
      // Resume from current node
      if (currentNodeId) {
        const currentNode = nodes.find(n => n.id === currentNodeId);
        if (currentNode) {
          changeNodeState(currentNodeId, 'running');
          addLog(currentNodeId, `Resuming execution of '${currentNode.data.label || 'Node'}'`);
          
          setTimeout(() => {
            changeNodeState(currentNodeId, 'completed');
            addLog(currentNodeId, `Completed execution of '${currentNode.data.label || 'Node'}'`);
            
            executeFunctionsRef.current.executeNextNodes(currentNodeId);
          }, Math.random() * 1000 + 500);
        }
      }
    }
  }, [nodes, edges, executionState, currentNodeId, changeNodeState, addLog]);
  
  // Pause execution
  const pauseExecution = useCallback(() => {
    if (executionState === 'running') {
      setExecutionState('paused');
      addLog('workflow', 'Workflow execution paused', 'info');
      
      if (currentNodeId) {
        changeNodeState(currentNodeId, 'paused');
      }
    }
  }, [executionState, currentNodeId, changeNodeState, addLog]);
  
  // Stop execution
  const stopExecution = useCallback(() => {
    if (executionState === 'running' || executionState === 'paused') {
      completeExecution('canceled');
    }
  }, [executionState, completeExecution]);
  
  // Skip the current node
  const skipNode = useCallback(() => {
    if ((executionState === 'running' || executionState === 'paused') && currentNodeId) {
      changeNodeState(currentNodeId, 'completed');
      addLog(currentNodeId, 'Skipped node execution', 'warn');
      
      executeFunctionsRef.current.executeNextNodes(currentNodeId);
    }
  }, [executionState, currentNodeId, changeNodeState, addLog]);
  
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Play className="mr-2 h-5 w-5 text-primary" />
          Workflow Executor
        </CardTitle>
        <CardDescription>
          Execute and test your workflow
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <Tabs defaultValue="execution">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="execution">Execution</TabsTrigger>
            <TabsTrigger value="scheduling">Scheduling</TabsTrigger>
          </TabsList>
          
          <TabsContent value="execution" className="py-4">
            {nodes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No workflow to execute.</p>
                <p className="text-sm">Create a workflow first before executing.</p>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <Badge variant={
                      executionState === 'idle' ? 'outline' :
                      executionState === 'running' ? 'default' :
                      executionState === 'paused' ? 'secondary' :
                      executionState === 'completed' ? 'success' :
                      'destructive'
                    }>
                      {executionState.charAt(0).toUpperCase() + executionState.slice(1)}
                    </Badge>
                    
                    {executionState === 'running' && (
                      <InlineWorkflowLoading 
                        size="sm" 
                        text="Processing" 
                        variant="processing" 
                        showIcon={true} 
                      />
                    )}
                    
                    {startTime && (
                      <span className="text-xs text-muted-foreground">
                        Started: {startTime.toLocaleTimeString()}
                      </span>
                    )}
                    
                    {endTime && (
                      <span className="text-xs text-muted-foreground">
                        Ended: {endTime.toLocaleTimeString()}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {executionState === 'idle' && (
                      <Button size="sm" onClick={startExecution}>
                        <Play className="h-4 w-4 mr-1" />
                        Run
                      </Button>
                    )}
                    
                    {executionState === 'running' && (
                      <>
                        <Button size="sm" variant="outline" onClick={pauseExecution}>
                          <PauseCircle className="h-4 w-4 mr-1" />
                          Pause
                        </Button>
                        <Button size="sm" variant="outline" onClick={skipNode}>
                          <SkipForward className="h-4 w-4 mr-1" />
                          Skip
                        </Button>
                        <Button size="sm" variant="destructive" onClick={stopExecution}>
                          <StopCircle className="h-4 w-4 mr-1" />
                          Stop
                        </Button>
                      </>
                    )}
                    
                    {executionState === 'paused' && (
                      <>
                        <Button size="sm" onClick={startExecution}>
                          <Play className="h-4 w-4 mr-1" />
                          Resume
                        </Button>
                        <Button size="sm" variant="destructive" onClick={stopExecution}>
                          <StopCircle className="h-4 w-4 mr-1" />
                          Stop
                        </Button>
                      </>
                    )}
                    
                    {(executionState === 'completed' || executionState === 'failed') && (
                      <Button size="sm" variant="outline" onClick={resetExecution}>
                        <RotateCcw className="h-4 w-4 mr-1" />
                        Reset
                      </Button>
                    )}
                  </div>
                </div>
                
                {logs.length > 0 ? (
                  <ScrollArea className="h-[300px] border rounded-md p-2">
                    <div className="space-y-2">
                      {logs.map((log, idx) => (
                        <div 
                          key={idx} 
                          className={`text-sm rounded p-1 
                            ${log.level === 'info' ? 'bg-slate-50' : 
                              log.level === 'warn' ? 'bg-amber-50' : 
                              log.level === 'error' ? 'bg-rose-50' : 
                              'bg-blue-50'}
                          `}
                        >
                          <div className="flex items-start">
                            {log.level === 'info' && <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 mr-2 shrink-0" />}
                            {log.level === 'warn' && <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 mr-2 shrink-0" />}
                            {log.level === 'error' && <AlertTriangle className="h-4 w-4 text-rose-500 mt-0.5 mr-2 shrink-0" />}
                            {log.level === 'debug' && <RefreshCcw className="h-4 w-4 text-blue-500 mt-0.5 mr-2 shrink-0" />}
                            
                            <div className="flex-1">
                              <div className="font-medium">
                                {log.message}
                              </div>
                              <div className="flex justify-between text-xs text-muted-foreground">
                                <span>{log.nodeId === 'workflow' ? 'Workflow' : 
                                  nodes.find(n => n.id === log.nodeId)?.data.label || log.nodeId}</span>
                                <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="flex items-center justify-center border rounded-md p-8">
                    <div className="flex flex-col items-center text-center text-muted-foreground">
                      {executionState === 'running' ? (
                        <>
                          <div className="h-12 w-12 mb-4 relative">
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{
                                duration: 2,
                                ease: "linear",
                                repeat: Infinity
                              }}
                            >
                              <RotateCw className="h-12 w-12 text-blue-500" />
                            </motion.div>
                          </div>
                          <p>Workflow is running...</p>
                          <p className="text-sm">Logs will appear as nodes are executed</p>
                        </>
                      ) : (
                        <>
                          <ClipboardList className="h-12 w-12 mb-2 opacity-50" />
                          <p>No execution logs yet</p>
                          <p className="text-sm">Run the workflow to see execution logs</p>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </TabsContent>
          <TabsContent value="scheduling" className="py-4">
            <div className="space-y-4">
              <div className="flex flex-col space-y-2">
                <h3 className="text-sm font-medium">Schedule Workflow</h3>
                <p className="text-sm text-muted-foreground">
                  Configure when this workflow should run automatically.
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Input 
                    type="datetime-local" 
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="max-w-xs"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">Repeat</Label>
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="once"
                        name="repeat"
                        checked={runOnce}
                        onChange={() => setRunOnce(true)}
                      />
                      <label htmlFor="once" className="text-sm">Run once</label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="repeat"
                        name="repeat"
                        checked={!runOnce}
                        onChange={() => setRunOnce(false)}
                      />
                      <label htmlFor="repeat" className="text-sm">Repeat</label>
                    </div>

                    {!runOnce && (
                      <div className="pl-6 pt-2">
                        <select
                          value={repeatInterval}
                          onChange={(e) => setRepeatInterval(e.target.value)}
                          className="w-full max-w-xs rounded-md border border-input p-2"
                        >
                          <option value="hourly">Hourly</option>
                          <option value="daily">Daily</option>
                          <option value="weekly">Weekly</option>
                          <option value="monthly">Monthly</option>
                        </select>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="pt-4 flex justify-end">
                  <Button type="button" onClick={() => alert('Schedule saved!')}>
                    Save Schedule
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="scheduling" className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="scheduled-time">Scheduled Time</Label>
              <Input 
                id="scheduled-time" 
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Schedule Type</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant={runOnce ? "default" : "outline"}
                  onClick={() => setRunOnce(true)}
                  className="justify-start"
                >
                  <Hourglass className="mr-2 h-4 w-4" />
                  Run Once
                </Button>
                <Button 
                  variant={!runOnce ? "default" : "outline"}
                  onClick={() => setRunOnce(false)}
                  className="justify-start"
                >
                  <RefreshCcw className="mr-2 h-4 w-4" />
                  Recurring
                </Button>
              </div>
            </div>
            
            {!runOnce && (
              <div className="space-y-2">
                <Label>Repeat Interval</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Button 
                    variant={repeatInterval === 'daily' ? "default" : "outline"}
                    onClick={() => setRepeatInterval('daily')}
                    size="sm"
                  >
                    Daily
                  </Button>
                  <Button 
                    variant={repeatInterval === 'weekly' ? "default" : "outline"}
                    onClick={() => setRepeatInterval('weekly')}
                    size="sm"
                  >
                    Weekly
                  </Button>
                  <Button 
                    variant={repeatInterval === 'monthly' ? "default" : "outline"}
                    onClick={() => setRepeatInterval('monthly')}
                    size="sm"
                  >
                    Monthly
                  </Button>
                </div>
              </div>
            )}
            
            <Separator />
            
            <Button
              disabled={nodes.length === 0 || !scheduledTime}
              className="w-full"
              variant="outline"
            >
              <Play className="mr-2 h-4 w-4" />
              {runOnce ? 'Schedule Single Run' : `Schedule ${repeatInterval.charAt(0).toUpperCase() + repeatInterval.slice(1)} Run`}
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default WorkflowExecutor;
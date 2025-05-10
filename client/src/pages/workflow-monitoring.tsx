import React, { useState, useCallback } from 'react';
import { WorkflowExecutor } from '@/components/workflow/WorkflowExecutor';
import { WorkflowControls } from '@/components/workflow/WorkflowControls';
import { PerformanceOptimizer } from '@/components/workflow/PerformanceOptimizer';
import { WorkflowMonitor } from '@/components/workflow/WorkflowMonitor';
import { StateChangeAnimation, WorkflowState } from '@/components/workflow/StateChangeAnimation';
import { useWorkflowStore } from '@/store/useWorkflowStore';
import { WorkflowExecution, ExecutionLog } from '@/types/workflow';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Sample workflow with nodes and edges for demonstration
import { sampleWorkflow } from '@/data/sample-workflows';

const WorkflowMonitoringPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('execution');
  const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
  const [logs, setLogs] = useState<ExecutionLog[]>([]);
  const [nodeStates, setNodeStates] = useState<Record<string, WorkflowState>>({});
  
  const { nodes, edges, setNodes, setEdges } = useWorkflowStore();
  
  // Load sample workflow for demonstration
  const loadSampleWorkflow = useCallback(() => {
    setNodes(sampleWorkflow.nodes);
    setEdges(sampleWorkflow.edges);
    
    // Reset states
    setNodeStates({});
    sampleWorkflow.nodes.forEach(node => {
      handleNodeStateChange(node.id, 'idle');
    });
  }, [setNodes, setEdges]);
  
  // Handle node state changes
  const handleNodeStateChange = useCallback((nodeId: string, state: WorkflowState) => {
    setNodeStates(prev => ({
      ...prev,
      [nodeId]: state
    }));
  }, []);
  
  // Handle new execution
  const handleExecution = useCallback((execution: WorkflowExecution) => {
    setExecutions(prev => [execution, ...prev]);
  }, []);
  
  // Handle new log entry
  const handleLogAdded = useCallback((log: ExecutionLog) => {
    setLogs(prev => [log, ...prev]);
  }, []);
  
  // Handle workflow optimization
  const handleOptimize = useCallback((optimizedNodes: any[]) => {
    setNodes(optimizedNodes);
  }, [setNodes]);
  
  // Clear the current workflow
  const clearWorkflow = useCallback(() => {
    setNodes([]);
    setEdges([]);
    setNodeStates({});
  }, [setNodes, setEdges]);
  
  // Import a workflow from JSON
  const importWorkflow = useCallback((importedNodes: any[], importedEdges: any[]) => {
    setNodes(importedNodes);
    setEdges(importedEdges);
    
    // Reset states
    setNodeStates({});
    importedNodes.forEach(node => {
      handleNodeStateChange(node.id, 'idle');
    });
  }, [setNodes, setEdges, handleNodeStateChange]);
  
  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Workflow Monitoring</h1>
            <p className="text-muted-foreground">
              Monitor, test, and optimize your workflow all in one place
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              onClick={loadSampleWorkflow}
              variant="outline"
            >
              Load Sample Workflow
            </Button>
            
            <WorkflowControls
              nodes={nodes}
              edges={edges}
              onLoad={importWorkflow}
              onClear={clearWorkflow}
            />
          </div>
        </div>
        
        {/* Main content area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - Monitoring and execution */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="execution">Execution</TabsTrigger>
                <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
                <TabsTrigger value="optimization">Optimization</TabsTrigger>
              </TabsList>
              
              <TabsContent value="execution" className="space-y-6 py-4">
                <WorkflowExecutor 
                  nodes={nodes}
                  edges={edges}
                  onNodeStateChange={handleNodeStateChange}
                />
              </TabsContent>
              
              <TabsContent value="monitoring" className="space-y-6 py-4">
                <WorkflowMonitor
                  nodes={nodes}
                  edges={edges}
                  executions={executions}
                  logs={logs}
                />
              </TabsContent>
              
              <TabsContent value="optimization" className="space-y-6 py-4">
                <PerformanceOptimizer
                  nodes={nodes}
                  edges={edges}
                  onOptimize={handleOptimize}
                />
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Right column - Node states and logs */}
          <div className="space-y-6">
            {/* Node states */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Node States</CardTitle>
                <CardDescription>
                  Current state of each node in the workflow
                </CardDescription>
              </CardHeader>
              <CardContent>
                {nodes.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground">
                    <p>No nodes in the workflow yet.</p>
                    <p className="text-sm">Load a sample workflow or create your own to get started.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {nodes.map(node => (
                      <div key={node.id} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center">
                          <StateChangeAnimation 
                            state={nodeStates[node.id] || 'idle'} 
                            size="sm"
                          />
                          <span className="ml-2 font-medium">{node.data.label}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {node.data.type || node.data.nodeType || 'Unknown'}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Recent execution logs */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Recent Activity</CardTitle>
                <CardDescription>
                  Recent logs and execution activity
                </CardDescription>
              </CardHeader>
              <CardContent>
                {logs.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground">
                    <p>No execution logs yet.</p>
                    <p className="text-sm">Run the workflow to see logs and activity.</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                    {logs.slice(0, 20).map((log, idx) => (
                      <div key={idx} className="text-sm border-l-4 pl-2 py-1" 
                        style={{
                          borderLeftColor: 
                            log.level === 'error' ? '#ef4444' : 
                            log.level === 'warn' ? '#f97316' : 
                            log.level === 'debug' ? '#6366f1' : '#10b981'
                        }}
                      >
                        <div className="font-medium">{log.message}</div>
                        <div className="text-xs text-muted-foreground flex justify-between">
                          <span>{log.nodeId}</span>
                          <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkflowMonitoringPage;
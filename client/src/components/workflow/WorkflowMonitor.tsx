import React, { useState, useEffect, useMemo } from 'react';
import { Node, Edge } from 'reactflow';
import { NodeData } from '@/store/useWorkflowStore';
import { ExecutionLog, WorkflowExecution } from '@/types/workflow';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Separator } from '@/components/ui/separator';
import { Activity, AlertCircle, CheckCircle, Clock, BarChart, RefreshCcw, History } from 'lucide-react';
import { WorkflowState } from './StateChangeAnimation';

// Types for monitoring data
interface NodeStatus {
  id: string;
  label: string;
  state: WorkflowState;
  lastExecutionTime?: number;
  successRate: number;
  errorCount: number;
  lastError?: string;
  retryCount: number;
  lastExecuted?: string;
}

interface MonitoringData {
  overallHealth: number;
  executionCount: number;
  lastExecutionTime?: string;
  avgExecutionTime: number;
  successRate: number;
  errorRate: number;
  nodeStatuses: NodeStatus[];
  recentExecutions: Array<{
    id: string;
    timestamp: string;
    status: 'completed' | 'failed' | 'canceled';
    duration: number;
    error?: string;
  }>;
  recentErrors: Array<{
    timestamp: string;
    nodeId: string;
    message: string;
    level: string;
  }>;
}

interface WorkflowMonitorProps {
  nodes: Node<NodeData>[];
  edges: Edge[];
  executions?: WorkflowExecution[];
  logs?: ExecutionLog[];
  className?: string;
}

export const WorkflowMonitor: React.FC<WorkflowMonitorProps> = ({
  nodes,
  edges,
  executions = [],
  logs = [],
  className
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [monitoringData, setMonitoringData] = useState<MonitoringData>({
    overallHealth: 100,
    executionCount: 0,
    avgExecutionTime: 0,
    successRate: 0,
    errorRate: 0,
    nodeStatuses: [],
    recentExecutions: [],
    recentErrors: []
  });
  
  // Process execution and log data to generate monitoring metrics
  useEffect(() => {
    if (executions.length === 0) return;
    
    // Calculate basic metrics
    let totalExecutionTime = 0;
    let successCount = 0;
    
    // Track node-specific metrics
    const nodeMetrics: Record<string, {
      successCount: number;
      errorCount: number;
      totalExecutionTime: number;
      executionCount: number;
      lastState: WorkflowState;
      lastError?: string;
      retryCount: number;
      lastExecuted?: string;
    }> = {};
    
    // Initialize node metrics
    nodes.forEach(node => {
      nodeMetrics[node.id] = {
        successCount: 0,
        errorCount: 0,
        totalExecutionTime: 0,
        executionCount: 0,
        lastState: 'idle',
        retryCount: 0
      };
    });
    
    // Process executions
    const recentExecutions = executions.slice(0, 5).map(execution => {
      const startTime = new Date(execution.startTime).getTime();
      const endTime = execution.endTime 
        ? new Date(execution.endTime).getTime() 
        : Date.now();
      
      const duration = (endTime - startTime) / 1000; // in seconds
      
      if (execution.status === 'completed') {
        successCount++;
      }
      
      totalExecutionTime += duration;
      
      return {
        id: execution.id,
        timestamp: execution.startTime,
        status: execution.status as 'completed' | 'failed' | 'canceled',
        duration,
        error: execution.error
      };
    });
    
    // Process logs to gather node-specific metrics
    const recentErrors: Array<{
      timestamp: string;
      nodeId: string;
      message: string;
      level: string;
    }> = [];
    
    logs.forEach(log => {
      // Skip workflow-level logs
      if (log.nodeId === 'workflow') return;
      
      // Track node state changes
      if (log.message.includes('Starting execution') || 
          log.message.includes('Executing') || 
          log.message.includes('Completed execution') || 
          log.message.includes('Error executing')) {
        
        const nodeId = log.nodeId;
        if (!nodeMetrics[nodeId]) return;
        
        // Track execution count
        if (log.message.includes('Starting execution')) {
          nodeMetrics[nodeId].executionCount++;
          nodeMetrics[nodeId].lastExecuted = log.timestamp;
        }
        
        // Track success/error counts
        if (log.message.includes('Completed execution')) {
          nodeMetrics[nodeId].successCount++;
          nodeMetrics[nodeId].lastState = 'completed';
          
          // Calculate execution time if data available
          if (log.data?.executionTime) {
            nodeMetrics[nodeId].totalExecutionTime += log.data.executionTime;
          }
        } else if (log.message.includes('Error executing')) {
          nodeMetrics[nodeId].errorCount++;
          nodeMetrics[nodeId].lastState = 'failed';
          nodeMetrics[nodeId].lastError = log.message;
        }
      }
      
      // Track retries
      if (log.message.includes('Retrying')) {
        const nodeId = log.nodeId;
        if (nodeMetrics[nodeId]) {
          nodeMetrics[nodeId].retryCount++;
        }
      }
      
      // Collect recent errors
      if (log.level === 'error') {
        recentErrors.push({
          timestamp: log.timestamp,
          nodeId: log.nodeId,
          message: log.message,
          level: log.level
        });
      }
    });
    
    // Calculate derived metrics
    const executionCount = executions.length;
    const avgExecutionTime = executionCount > 0 ? totalExecutionTime / executionCount : 0;
    const successRate = executionCount > 0 ? (successCount / executionCount) * 100 : 0;
    const errorRate = executionCount > 0 ? 100 - successRate : 0;
    
    // Convert node metrics to status objects
    const nodeStatuses = Object.entries(nodeMetrics).map(([id, metrics]) => {
      const node = nodes.find(n => n.id === id);
      const nodeSuccessRate = metrics.executionCount > 0 
        ? (metrics.successCount / metrics.executionCount) * 100 
        : 100;
      
      return {
        id,
        label: node?.data.label || 'Unknown Node',
        state: metrics.lastState,
        lastExecutionTime: metrics.executionCount > 0 
          ? metrics.totalExecutionTime / metrics.executionCount 
          : undefined,
        successRate: nodeSuccessRate,
        errorCount: metrics.errorCount,
        lastError: metrics.lastError,
        retryCount: metrics.retryCount,
        lastExecuted: metrics.lastExecuted
      };
    });
    
    // Calculate overall health based on multiple factors
    // Weighted average of success rate (60%) and node health (40%)
    const nodeHealthScores = nodeStatuses.map(ns => ns.successRate);
    const avgNodeHealth = nodeHealthScores.length > 0 
      ? nodeHealthScores.reduce((a, b) => a + b, 0) / nodeHealthScores.length 
      : 100;
    
    const overallHealth = (successRate * 0.6) + (avgNodeHealth * 0.4);
    
    // Update monitoring data
    setMonitoringData({
      overallHealth,
      executionCount,
      lastExecutionTime: recentExecutions[0]?.timestamp,
      avgExecutionTime,
      successRate,
      errorRate,
      nodeStatuses,
      recentExecutions,
      recentErrors: recentErrors.slice(0, 10) // Keep only the 10 most recent errors
    });
    
  }, [executions, logs, nodes]);
  
  // Determine health status label and color
  const healthStatus = useMemo(() => {
    const health = monitoringData.overallHealth;
    
    if (health >= 90) {
      return { label: 'Excellent', color: 'text-emerald-500' };
    } else if (health >= 75) {
      return { label: 'Good', color: 'text-blue-500' };
    } else if (health >= 50) {
      return { label: 'Fair', color: 'text-amber-500' };
    } else {
      return { label: 'Poor', color: 'text-rose-500' };
    }
  }, [monitoringData.overallHealth]);
  
  // Get a health score color for a progress bar
  const getHealthColor = (health: number) => {
    if (health >= 90) return 'bg-emerald-500';
    if (health >= 75) return 'bg-blue-500';
    if (health >= 50) return 'bg-amber-500';
    return 'bg-rose-500';
  };
  
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Activity className="mr-2 h-5 w-5 text-primary" />
          Workflow Monitoring
        </CardTitle>
        <CardDescription>
          Execution metrics and health monitoring for your workflow
        </CardDescription>
      </CardHeader>
      
      <CardContent className="px-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="nodes">Node Status</TabsTrigger>
            <TabsTrigger value="executions">Recent Executions</TabsTrigger>
            <TabsTrigger value="errors">Errors</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            {/* Health Score */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Workflow Health</h3>
                <span className={`text-sm font-medium ${healthStatus.color}`}>
                  {healthStatus.label} ({Math.round(monitoringData.overallHealth)}%)
                </span>
              </div>
              <Progress 
                value={monitoringData.overallHealth} 
                className={getHealthColor(monitoringData.overallHealth)}
              />
            </div>
            
            {/* Key metrics */}
            <div className="grid grid-cols-2 gap-4">
              <div className="border rounded-lg p-4 space-y-1">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>Average Execution Time</span>
                </div>
                <p className="text-2xl font-bold">
                  {monitoringData.avgExecutionTime.toFixed(2)}s
                </p>
              </div>
              
              <div className="border rounded-lg p-4 space-y-1">
                <div className="flex items-center text-sm text-muted-foreground">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  <span>Success Rate</span>
                </div>
                <p className="text-2xl font-bold">
                  {monitoringData.successRate.toFixed(1)}%
                </p>
              </div>
              
              <div className="border rounded-lg p-4 space-y-1">
                <div className="flex items-center text-sm text-muted-foreground">
                  <History className="h-4 w-4 mr-1" />
                  <span>Total Executions</span>
                </div>
                <p className="text-2xl font-bold">
                  {monitoringData.executionCount}
                </p>
              </div>
              
              <div className="border rounded-lg p-4 space-y-1">
                <div className="flex items-center text-sm text-muted-foreground">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  <span>Error Rate</span>
                </div>
                <p className="text-2xl font-bold">
                  {monitoringData.errorRate.toFixed(1)}%
                </p>
              </div>
            </div>
            
            {/* Last execution */}
            {monitoringData.lastExecutionTime && (
              <div className="border rounded-lg p-4">
                <h3 className="text-sm font-medium mb-2">Last Execution</h3>
                <p className="text-sm text-muted-foreground">
                  {new Date(monitoringData.lastExecutionTime).toLocaleString()}
                </p>
              </div>
            )}
            
            {/* Recent errors preview */}
            {monitoringData.recentErrors.length > 0 && (
              <div className="border rounded-lg p-4">
                <h3 className="text-sm font-medium mb-2">Recent Errors</h3>
                <ul className="space-y-2">
                  {monitoringData.recentErrors.slice(0, 3).map((error, index) => (
                    <li key={index} className="text-sm">
                      <div className="flex items-start">
                        <AlertCircle className="h-4 w-4 text-rose-500 mr-2 mt-0.5 shrink-0" />
                        <div>
                          <p className="font-medium">{error.message}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(error.timestamp).toLocaleString()} • Node: {error.nodeId}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
                {monitoringData.recentErrors.length > 3 && (
                  <p className="text-xs text-muted-foreground mt-2">
                    And {monitoringData.recentErrors.length - 3} more errors...
                  </p>
                )}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="nodes">
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {monitoringData.nodeStatuses.map((nodeStatus) => (
                  <Card key={nodeStatus.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">{nodeStatus.label}</h3>
                        <Badge 
                          variant={
                            nodeStatus.state === 'completed' ? 'success' : 
                            nodeStatus.state === 'failed' ? 'destructive' : 
                            'secondary'
                          }
                        >
                          {nodeStatus.state}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Success Rate:</span>
                          <div className="mt-1">
                            <Progress value={nodeStatus.successRate} className={getHealthColor(nodeStatus.successRate)} />
                          </div>
                        </div>
                        
                        <div>
                          <span className="text-muted-foreground">Error Count:</span>
                          <p className="font-medium">{nodeStatus.errorCount}</p>
                        </div>
                        
                        {nodeStatus.lastExecutionTime !== undefined && (
                          <div>
                            <span className="text-muted-foreground">Avg. Execution Time:</span>
                            <p className="font-medium">{nodeStatus.lastExecutionTime.toFixed(2)}ms</p>
                          </div>
                        )}
                        
                        <div>
                          <span className="text-muted-foreground">Retry Count:</span>
                          <p className="font-medium">{nodeStatus.retryCount}</p>
                        </div>
                      </div>
                      
                      {nodeStatus.lastExecuted && (
                        <div className="mt-2 text-xs text-muted-foreground">
                          Last executed: {new Date(nodeStatus.lastExecuted).toLocaleString()}
                        </div>
                      )}
                      
                      {nodeStatus.lastError && (
                        <div className="mt-2 p-2 bg-rose-50 text-rose-700 text-xs rounded border border-rose-200">
                          {nodeStatus.lastError}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
                
                {monitoringData.nodeStatuses.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No node execution data available yet. Run your workflow to see node metrics.
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="executions">
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {monitoringData.recentExecutions.map((execution) => (
                  <Card key={execution.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <span className="font-medium">Execution {execution.id.substring(0, 8)}</span>
                          <span className="text-muted-foreground text-sm ml-2">
                            {new Date(execution.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <Badge 
                          variant={
                            execution.status === 'completed' ? 'success' : 
                            execution.status === 'failed' ? 'destructive' : 
                            'secondary'
                          }
                        >
                          {execution.status}
                        </Badge>
                      </div>
                      
                      <div className="text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Duration:</span>
                          <span className="font-medium">{execution.duration.toFixed(2)}s</span>
                        </div>
                      </div>
                      
                      {execution.error && (
                        <div className="mt-2 p-2 bg-rose-50 text-rose-700 text-xs rounded border border-rose-200">
                          {execution.error}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
                
                {monitoringData.recentExecutions.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No execution history available yet. Run your workflow to see execution records.
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="errors">
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {monitoringData.recentErrors.map((error, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex items-start">
                        <AlertCircle className="h-4 w-4 text-rose-500 mr-2 mt-0.5 shrink-0" />
                        <div>
                          <div className="flex items-center mb-1">
                            <p className="font-medium">{error.message}</p>
                            <Badge variant="outline" className="ml-2 text-xs">
                              {error.level.toUpperCase()}
                            </Badge>
                          </div>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <span>{new Date(error.timestamp).toLocaleString()}</span>
                            <Separator orientation="vertical" className="mx-2 h-3" />
                            <span>Node: {error.nodeId}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {monitoringData.recentErrors.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No errors recorded. Great job! 🎉
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default WorkflowMonitor;
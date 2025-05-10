import React, { useState, useEffect } from 'react';
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
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Zap, 
  AlertCircle, 
  Clock, 
  BarChart3, 
  CheckCircle, 
  XCircle,
  Layers, 
  PanelLeftOpen, 
  ArrowRightLeft,
  Filter,
  Repeat,
  Search,
  ServerOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { WorkflowStateIndicator } from './StateChangeAnimation';

export type PerformanceIssue = {
  id: string;
  type: 'bottleneck' | 'redundancy' | 'error' | 'inefficiency' | 'latency' | 'memory';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  nodeIds?: string[];
  edgeIds?: string[];
  solution?: {
    title: string;
    description: string;
    action: () => void;
  };
};

export type OptimizationResult = {
  originalMetrics: PerformanceMetrics;
  optimizedMetrics: PerformanceMetrics;
  appliedOptimizations: string[];
  issues: PerformanceIssue[];
  optimizedNodeIds: string[];
};

export type PerformanceMetrics = {
  estimatedExecutionTime: number; // in ms
  memoryUsage: number; // in MB
  apiCallCount: number;
  dataProcessingVolume: number; // in KB
  errorProbability: number; // 0-1
  redundantOperations: number;
};

// Function to analyze workflow and identify performance issues
export function analyzeWorkflowPerformance(nodes: Node[], edges: Edge[]): PerformanceIssue[] {
  const issues: PerformanceIssue[] = [];
  
  // Check for bottlenecks (nodes with multiple incoming edges)
  nodes.forEach(node => {
    const incomingEdges = edges.filter(edge => edge.target === node.id);
    if (incomingEdges.length > 2) {
      issues.push({
        id: `bottleneck-${node.id}`,
        type: 'bottleneck',
        title: 'Potential bottleneck detected',
        description: `Node "${node.data.label}" has ${incomingEdges.length} incoming connections, which may create a processing bottleneck.`,
        severity: incomingEdges.length > 4 ? 'high' : 'medium',
        nodeIds: [node.id],
        edgeIds: incomingEdges.map(e => e.id),
        solution: {
          title: 'Add buffer or batch processing',
          description: 'Consider adding a buffer or batch processing step before this node to smooth out data flow.',
          action: () => console.log('Implement buffer solution')
        }
      });
    }
  });
  
  // Check for redundant operations (similar nodes in sequence)
  const nodeTypes = nodes.map(n => n.type);
  const duplicateTypes = nodeTypes.filter((type, index) => 
    type && nodeTypes.indexOf(type) !== index
  );
  
  if (duplicateTypes.length > 0) {
    const redundantNodes = nodes.filter(n => duplicateTypes.includes(n.type as string));
    if (redundantNodes.length > 0) {
      issues.push({
        id: 'redundancy-operations',
        type: 'redundancy',
        title: 'Redundant operations detected',
        description: 'Multiple nodes of the same type may be performing redundant operations.',
        severity: 'medium',
        nodeIds: redundantNodes.map(n => n.id),
        solution: {
          title: 'Consolidate operations',
          description: 'Consider consolidating similar operations into a single node for better performance.',
          action: () => console.log('Consolidate operations')
        }
      });
    }
  }
  
  // Check for disconnected nodes
  const disconnectedNodes = nodes.filter(node => {
    const nodeConnections = edges.filter(
      edge => edge.source === node.id || edge.target === node.id
    );
    return nodeConnections.length === 0;
  });
  
  if (disconnectedNodes.length > 0) {
    issues.push({
      id: 'disconnected-nodes',
      type: 'error',
      title: 'Disconnected nodes detected',
      description: `${disconnectedNodes.length} nodes are not connected to the workflow, which may cause errors or unexpected behavior.`,
      severity: 'high',
      nodeIds: disconnectedNodes.map(n => n.id),
      solution: {
        title: 'Remove or connect nodes',
        description: 'Either connect these nodes to the workflow or remove them to improve performance.',
        action: () => console.log('Connect or remove nodes')
      }
    });
  }
  
  // Check for potential excessive API calls
  const apiNodes = nodes.filter(n => 
    n.type === 'api' || 
    (n.data?.nodeType === 'integration' && n.data?.integrationType === 'api')
  );
  
  if (apiNodes.length > 3) {
    issues.push({
      id: 'excessive-api-calls',
      type: 'latency',
      title: 'Excessive API calls detected',
      description: `Workflow contains ${apiNodes.length} API call nodes, which may increase latency and rate-limiting issues.`,
      severity: apiNodes.length > 5 ? 'critical' : 'high',
      nodeIds: apiNodes.map(n => n.id),
      solution: {
        title: 'Batch API requests',
        description: 'Consider batching multiple API requests or implementing caching to reduce external calls.',
        action: () => console.log('Batch API requests')
      }
    });
  }
  
  // Check for long execution chains (long sequential paths)
  const pathLengths = findLongestPaths(nodes, edges);
  if (pathLengths > 10) {
    issues.push({
      id: 'long-execution-path',
      type: 'inefficiency',
      title: 'Long execution chain detected',
      description: `Workflow has a long sequential execution path (${pathLengths} nodes), which may increase total execution time.`,
      severity: pathLengths > 15 ? 'high' : 'medium',
      solution: {
        title: 'Parallelize operations',
        description: 'Consider reorganizing the workflow to execute independent operations in parallel.',
        action: () => console.log('Parallelize operations')
      }
    });
  }
  
  // Check for memory-intensive operations
  const dataProcessingNodes = nodes.filter(n => 
    n.type === 'transform' || n.type === 'aggregate' || n.type === 'filter'
  );
  
  if (dataProcessingNodes.length > 4) {
    issues.push({
      id: 'memory-intensive',
      type: 'memory',
      title: 'Memory-intensive workflow detected',
      description: 'Multiple data transformation operations may lead to high memory usage.',
      severity: 'medium',
      nodeIds: dataProcessingNodes.map(n => n.id),
      solution: {
        title: 'Implement streaming processing',
        description: 'Consider using streaming data processing to reduce memory requirements.',
        action: () => console.log('Implement streaming')
      }
    });
  }
  
  return issues;
}

// Helper function to find the longest path in the workflow
function findLongestPaths(nodes: Node[], edges: Edge[]): number {
  // Find starting nodes (no incoming edges)
  const startNodes = nodes.filter(node => 
    !edges.some(edge => edge.target === node.id)
  );
  
  if (startNodes.length === 0) return 0;
  
  // Find the longest path from each start node
  const pathLengths = startNodes.map(startNode => {
    const visited = new Set<string>();
    return findLongestPathFromNode(startNode.id, edges, visited);
  });
  
  return Math.max(...pathLengths);
}

function findLongestPathFromNode(nodeId: string, edges: Edge[], visited: Set<string>): number {
  if (visited.has(nodeId)) return 0;
  visited.add(nodeId);
  
  const outgoingEdges = edges.filter(edge => edge.source === nodeId);
  if (outgoingEdges.length === 0) return 1;
  
  const childPathLengths = outgoingEdges.map(edge => 
    findLongestPathFromNode(edge.target, edges, new Set(visited))
  );
  
  return 1 + Math.max(...childPathLengths, 0);
}

// Function to optimize workflow
export function optimizeWorkflow(nodes: Node[], edges: Edge[]): OptimizationResult {
  // Analyze workflow for issues
  const issues = analyzeWorkflowPerformance(nodes, edges);
  
  // Original performance metrics (simulated)
  const originalMetrics: PerformanceMetrics = {
    estimatedExecutionTime: calculateEstimatedExecutionTime(nodes, edges),
    memoryUsage: calculateEstimatedMemoryUsage(nodes),
    apiCallCount: nodes.filter(n => n.type === 'api').length,
    dataProcessingVolume: calculateDataProcessingVolume(nodes, edges),
    errorProbability: calculateErrorProbability(nodes, edges, issues),
    redundantOperations: issues.filter(i => i.type === 'redundancy').length
  };
  
  // Apply optimizations
  const optimizedNodeIds: string[] = [];
  const appliedOptimizations: string[] = [];
  
  // For each issue, apply a simulated optimization
  issues.forEach(issue => {
    switch (issue.type) {
      case 'bottleneck':
        if (issue.nodeIds) {
          optimizedNodeIds.push(...issue.nodeIds);
          appliedOptimizations.push('Added batch processing to reduce bottlenecks');
        }
        break;
        
      case 'redundancy':
        if (issue.nodeIds) {
          optimizedNodeIds.push(...issue.nodeIds);
          appliedOptimizations.push('Consolidated redundant operations');
        }
        break;
        
      case 'latency':
        if (issue.nodeIds) {
          optimizedNodeIds.push(...issue.nodeIds);
          appliedOptimizations.push('Implemented API request batching');
        }
        break;
        
      case 'inefficiency':
        appliedOptimizations.push('Reorganized workflow for parallelization');
        break;
        
      case 'memory':
        if (issue.nodeIds) {
          optimizedNodeIds.push(...issue.nodeIds);
          appliedOptimizations.push('Implemented streaming data processing');
        }
        break;
        
      case 'error':
        if (issue.nodeIds) {
          optimizedNodeIds.push(...issue.nodeIds);
          appliedOptimizations.push('Fixed disconnected nodes');
        }
        break;
    }
  });
  
  // Optimized metrics (simulated improvement)
  const optimizedMetrics: PerformanceMetrics = {
    estimatedExecutionTime: Math.max(50, originalMetrics.estimatedExecutionTime * 0.7),
    memoryUsage: Math.max(5, originalMetrics.memoryUsage * 0.8),
    apiCallCount: Math.max(1, Math.floor(originalMetrics.apiCallCount * 0.6)),
    dataProcessingVolume: originalMetrics.dataProcessingVolume,
    errorProbability: Math.max(0.01, originalMetrics.errorProbability * 0.5),
    redundantOperations: 0
  };
  
  return {
    originalMetrics,
    optimizedMetrics,
    appliedOptimizations,
    issues,
    optimizedNodeIds
  };
}

// Helper functions to calculate metrics
function calculateEstimatedExecutionTime(nodes: Node[], edges: Edge[]): number {
  // This would be much more sophisticated in a real implementation
  const baseTime = 100; // base ms
  const nodeCount = nodes.length;
  const edgeCount = edges.length;
  const apiNodes = nodes.filter(n => n.type === 'api').length;
  
  // Simplified formula for demo
  return baseTime + (nodeCount * 30) + (edgeCount * 5) + (apiNodes * 200);
}

function calculateEstimatedMemoryUsage(nodes: Node[]): number {
  // Base memory usage in MB
  const baseMem = 10;
  const nodeCount = nodes.length;
  const dataNodes = nodes.filter(n => 
    n.type === 'transform' || n.type === 'aggregate' || n.type === 'data'
  ).length;
  
  // Simplified formula for demo
  return baseMem + (nodeCount * 2) + (dataNodes * 10);
}

function calculateDataProcessingVolume(nodes: Node[], edges: Edge[]): number {
  // Base volume in KB
  const baseVolume = 50;
  const dataNodes = nodes.filter(n => 
    n.type === 'transform' || n.type === 'aggregate' || n.type === 'data'
  ).length;
  
  // Simplified formula for demo
  return baseVolume + (dataNodes * 100);
}

function calculateErrorProbability(nodes: Node[], edges: Edge[], issues: PerformanceIssue[]): number {
  // Base error probability
  const baseProb = 0.01;
  const criticalIssues = issues.filter(i => i.severity === 'critical').length;
  const highIssues = issues.filter(i => i.severity === 'high').length;
  const disconnectedNodes = issues.find(i => i.id === 'disconnected-nodes') ? 0.2 : 0;
  
  // Simplified formula for demo
  return Math.min(0.99, baseProb + (criticalIssues * 0.2) + (highIssues * 0.1) + disconnectedNodes);
}

interface PerformanceOptimizerProps {
  isOpen: boolean;
  onClose: () => void;
  onOptimize: (result: OptimizationResult) => void;
}

// Main component for one-click performance optimization
export function PerformanceOptimizer({ isOpen, onClose, onOptimize }: PerformanceOptimizerProps) {
  const { getNodes, getEdges } = useReactFlow();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null);
  const [step, setStep] = useState<'initial' | 'analyzing' | 'results' | 'applying'>('initial');
  
  // Run workflow analysis
  const runAnalysis = async () => {
    setStep('analyzing');
    setIsAnalyzing(true);
    setProgress(0);
    
    // Simulate analysis progress
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) {
          clearInterval(progressInterval);
          return 95;
        }
        return prev + Math.random() * 10;
      });
    }, 200);
    
    // Simulate analysis time
    setTimeout(() => {
      clearInterval(progressInterval);
      setProgress(100);
      
      const nodes = getNodes();
      const edges = getEdges();
      const result = optimizeWorkflow(nodes, edges);
      
      setOptimizationResult(result);
      setIsAnalyzing(false);
      setStep('results');
    }, 2500);
  };
  
  // Apply optimizations
  const applyOptimizations = () => {
    if (!optimizationResult) return;
    
    setStep('applying');
    setProgress(0);
    
    // Simulate applying optimizations
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) {
          clearInterval(progressInterval);
          return 95;
        }
        return prev + Math.random() * 15;
      });
    }, 150);
    
    setTimeout(() => {
      clearInterval(progressInterval);
      setProgress(100);
      
      // Call the parent component's optimization handler
      onOptimize(optimizationResult);
      
      // Reset and close after a brief delay
      setTimeout(() => {
        setStep('initial');
        onClose();
      }, 1000);
    }, 2000);
  };
  
  // Reset state when dialog is closed
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setStep('initial');
        setOptimizationResult(null);
        setProgress(0);
      }, 300);
    }
  }, [isOpen]);
  
  if (!isOpen) return null;
  
  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-xl mx-auto"
        >
          <Card className="border-none shadow-xl">
            <CardHeader className="bg-slate-50 border-b">
              <div className="flex items-center">
                <Zap className="h-5 w-5 text-primary mr-2" />
                <CardTitle>Workflow Performance Optimizer</CardTitle>
              </div>
              <CardDescription>
                Analyze and optimize your workflow for better performance
              </CardDescription>
            </CardHeader>
            
            <CardContent className="p-6">
              {step === 'initial' && (
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 p-3 rounded-full">
                      <BarChart3 className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">Performance Analysis</h3>
                      <p className="text-muted-foreground text-sm">
                        The optimizer will analyze your workflow for performance issues such as bottlenecks, 
                        redundant operations, and inefficient data flow patterns.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 p-3 rounded-full">
                      <Zap className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">Automated Optimizations</h3>
                      <p className="text-muted-foreground text-sm">
                        After analysis, the optimizer will suggest and apply optimizations to improve 
                        execution time, reduce resource usage, and enhance reliability.
                      </p>
                    </div>
                  </div>
                  
                  <div className="rounded-lg bg-yellow-50 p-4 border border-yellow-100">
                    <div className="flex items-start">
                      <AlertCircle className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-yellow-800">
                        <p className="font-medium">Important Note</p>
                        <p className="mt-1">
                          Optimizations will modify your workflow. It's recommended to save your 
                          current version before proceeding.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {step === 'analyzing' && (
                <div className="space-y-6 py-4">
                  <div className="flex justify-center">
                    <div className="relative w-24 h-24 flex items-center justify-center">
                      <svg className="w-full h-full" viewBox="0 0 100 100">
                        <circle 
                          className="text-slate-100 stroke-current" 
                          strokeWidth="8" 
                          cx="50" 
                          cy="50" 
                          r="40" 
                          fill="none" 
                        />
                        <circle 
                          className="text-primary stroke-current" 
                          strokeWidth="8" 
                          cx="50" 
                          cy="50" 
                          r="40" 
                          fill="none" 
                          strokeLinecap="round" 
                          strokeDasharray={`${2 * Math.PI * 40}`}
                          strokeDashoffset={`${2 * Math.PI * 40 * (1 - progress / 100)}`}
                          style={{
                            transformOrigin: 'center',
                            transform: 'rotate(-90deg)'
                          }}
                        />
                      </svg>
                      <div className="absolute">
                        <span className="text-xl font-medium">{Math.round(progress)}%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <h3 className="text-lg font-medium mb-1">Analyzing Workflow</h3>
                    <p className="text-muted-foreground">
                      Examining nodes, connections, and data flow patterns...
                    </p>
                  </div>
                  
                  <div className="space-y-3 max-w-md mx-auto">
                    <div className="flex items-center">
                      <Search className="h-4 w-4 text-primary mr-2" />
                      <span className="text-sm">Identifying bottlenecks</span>
                    </div>
                    <div className="flex items-center">
                      <Filter className="h-4 w-4 text-primary mr-2" />
                      <span className="text-sm">Checking for redundant operations</span>
                    </div>
                    <div className="flex items-center">
                      <Repeat className="h-4 w-4 text-primary mr-2" />
                      <span className="text-sm">Analyzing execution paths</span>
                    </div>
                    <div className="flex items-center">
                      <ServerOff className="h-4 w-4 text-primary mr-2" />
                      <span className="text-sm">Evaluating API call patterns</span>
                    </div>
                    <div className="flex items-center">
                      <ArrowRightLeft className="h-4 w-4 text-primary mr-2" />
                      <span className="text-sm">Checking data transformations</span>
                    </div>
                  </div>
                </div>
              )}
              
              {step === 'results' && optimizationResult && (
                <div className="space-y-5">
                  <div className="flex items-center justify-center gap-10 py-3">
                    <div className="text-center">
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">Execution Time</h4>
                      <div className="flex items-baseline justify-center">
                        <span className="text-2xl font-semibold">
                          {Math.round(optimizationResult.optimizedMetrics.estimatedExecutionTime)}
                        </span>
                        <span className="text-xs ml-1">ms</span>
                      </div>
                      <div className="text-xs text-emerald-600 mt-1">
                        {Math.round((1 - optimizationResult.optimizedMetrics.estimatedExecutionTime / 
                          optimizationResult.originalMetrics.estimatedExecutionTime) * 100)}% faster
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">Memory Usage</h4>
                      <div className="flex items-baseline justify-center">
                        <span className="text-2xl font-semibold">
                          {Math.round(optimizationResult.optimizedMetrics.memoryUsage)}
                        </span>
                        <span className="text-xs ml-1">MB</span>
                      </div>
                      <div className="text-xs text-emerald-600 mt-1">
                        {Math.round((1 - optimizationResult.optimizedMetrics.memoryUsage / 
                          optimizationResult.originalMetrics.memoryUsage) * 100)}% reduction
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">API Calls</h4>
                      <div className="flex items-baseline justify-center">
                        <span className="text-2xl font-semibold">
                          {optimizationResult.optimizedMetrics.apiCallCount}
                        </span>
                      </div>
                      <div className="text-xs text-emerald-600 mt-1">
                        {Math.round((1 - optimizationResult.optimizedMetrics.apiCallCount / 
                          optimizationResult.originalMetrics.apiCallCount) * 100)}% fewer
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="font-medium mb-2">Optimizations ({optimizationResult.appliedOptimizations.length})</h3>
                    <div className="space-y-2">
                      {optimizationResult.appliedOptimizations.map((opt, i) => (
                        <div key={i} className="flex items-start">
                          <CheckCircle className="h-4 w-4 text-emerald-500 mr-2 mt-0.5" />
                          <span className="text-sm">{opt}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="font-medium mb-2">Issues Addressed ({optimizationResult.issues.length})</h3>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {optimizationResult.issues.map((issue) => (
                        <div key={issue.id} className="flex items-start">
                          <div className="mr-2 mt-0.5">
                            {issue.severity === 'critical' && <AlertCircle className="h-4 w-4 text-red-500" />}
                            {issue.severity === 'high' && <AlertCircle className="h-4 w-4 text-orange-500" />}
                            {issue.severity === 'medium' && <AlertCircle className="h-4 w-4 text-amber-500" />}
                            {issue.severity === 'low' && <AlertCircle className="h-4 w-4 text-blue-500" />}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{issue.title}</p>
                            <p className="text-xs text-muted-foreground">{issue.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              {step === 'applying' && (
                <div className="py-6 text-center">
                  <div className="mb-4">
                    <Progress value={progress} className="h-2 w-64 mx-auto" />
                  </div>
                  
                  <h3 className="font-medium mb-1">Applying Optimizations</h3>
                  <p className="text-sm text-muted-foreground">
                    Implementing performance improvements to your workflow...
                  </p>
                  
                  <div className="mt-4 flex flex-col items-center">
                    <WorkflowStateIndicator 
                      state="running"
                      size="md"
                      showLabel
                    />
                  </div>
                </div>
              )}
            </CardContent>
            
            <CardFooter className="flex justify-between bg-slate-50 border-t">
              <Button variant="outline" onClick={onClose} disabled={step === 'applying'}>
                {step === 'results' ? 'Cancel' : 'Close'}
              </Button>
              
              {step === 'initial' && (
                <Button onClick={runAnalysis}>
                  <Zap className="h-4 w-4 mr-2" />
                  Analyze Workflow
                </Button>
              )}
              
              {step === 'results' && (
                <Button onClick={applyOptimizations}>
                  <Zap className="h-4 w-4 mr-2" />
                  Apply Optimizations
                </Button>
              )}
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
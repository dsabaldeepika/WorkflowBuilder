import React, { useState, useCallback } from 'react';
import { Node, Edge } from 'reactflow';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Progress } from '@/components/ui/progress';
import { 
  Zap, 
  AlertTriangle, 
  FileWarning, 
  Hourglass, 
  Database, 
  BarChart, 
  CheckCircle
} from 'lucide-react';
import { NodeData } from '@/store/useWorkflowStore';
import { PerformanceReport, PerformanceIssue } from '@/types/workflow';

interface PerformanceOptimizerProps {
  nodes: Node<NodeData>[];
  edges: Edge[];
  onOptimize?: (optimizedNodes: Node<NodeData>[]) => void;
  className?: string;
}

export const PerformanceOptimizer: React.FC<PerformanceOptimizerProps> = ({
  nodes,
  edges,
  onOptimize,
  className
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [performanceReport, setPerformanceReport] = useState<PerformanceReport | null>(null);
  const [optimized, setOptimized] = useState(false);
  
  // Generate a performance report
  const analyzeWorkflow = useCallback(() => {
    setIsAnalyzing(true);
    setProgress(0);
    setPerformanceReport(null);
    setOptimized(false);
    
    // Simulate analysis with progress updates
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + Math.random() * 15;
        if (newProgress >= 100) {
          clearInterval(interval);
          
          // Generate a report
          setTimeout(() => {
            const report: PerformanceReport = {
              bottlenecks: generateBottlenecks(),
              redundancies: generateRedundancies(),
              apiCalls: generateApiIssues(),
              executionTime: Math.round(Math.random() * 1000 + 500),
              memoryUsage: Math.round(Math.random() * 200 + 50),
              suggestions: [
                'Combine sequential data transformations into a single step',
                'Cache API responses for frequently accessed data',
                'Use batch operations instead of individual requests',
                'Implement pagination for large data sets',
                'Add appropriate error handling for all integration points'
              ]
            };
            
            setPerformanceReport(report);
            setIsAnalyzing(false);
            setProgress(100);
          }, 500);
          
          return 100;
        }
        return newProgress;
      });
    }, 200);
    
    return () => clearInterval(interval);
  }, [nodes, edges]);
  
  // Simulate optimization of the workflow
  const optimizeWorkflow = useCallback(() => {
    if (!performanceReport) return;
    
    setIsOptimizing(true);
    setProgress(0);
    
    // Simulate optimization with progress updates
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + Math.random() * 20;
        if (newProgress >= 100) {
          clearInterval(interval);
          
          // Make "optimized" copies of nodes
          setTimeout(() => {
            const optimizedNodes = nodes.map(node => {
              // Identify if this node has issues
              const hasBottleneck = performanceReport.bottlenecks.some(b => b.nodeId === node.id);
              const hasRedundancy = performanceReport.redundancies.some(r => r.nodeId === node.id);
              const hasApiIssue = performanceReport.apiCalls.some(a => a.nodeId === node.id);
              
              // If it has issues, create an "optimized" version
              if (hasBottleneck || hasRedundancy || hasApiIssue) {
                return {
                  ...node,
                  data: {
                    ...node.data,
                    optimized: true,
                    label: node.data.label + ' (Optimized)',
                    performance: {
                      before: Math.round(Math.random() * 1000 + 500),
                      after: Math.round(Math.random() * 300 + 50)
                    }
                  }
                };
              }
              
              return node;
            });
            
            if (onOptimize) {
              onOptimize(optimizedNodes);
            }
            
            setIsOptimizing(false);
            setProgress(100);
            setOptimized(true);
          }, 500);
          
          return 100;
        }
        return newProgress;
      });
    }, 200);
    
    return () => clearInterval(interval);
  }, [nodes, performanceReport, onOptimize]);
  
  // Generate random bottlenecks for demo
  const generateBottlenecks = (): PerformanceIssue[] => {
    if (nodes.length === 0) return [];
    
    const bottlenecks: PerformanceIssue[] = [];
    const possibleTypes = [
      'Nested Loop',
      'Unoptimized Data Processing',
      'Long-running Computation',
      'Resource Contention'
    ];
    
    // Choose 1-2 random nodes to have bottlenecks
    const nodeCount = Math.min(nodes.length, Math.floor(Math.random() * 2) + 1);
    const nodeIndices = getRandomIndices(nodes.length, nodeCount);
    
    nodeIndices.forEach(idx => {
      const node = nodes[idx];
      const typeIndex = Math.floor(Math.random() * possibleTypes.length);
      
      bottlenecks.push({
        id: `bottleneck-${node.id}`,
        nodeId: node.id,
        type: possibleTypes[typeIndex],
        severity: ['medium', 'high', 'critical'][Math.floor(Math.random() * 3)] as 'medium' | 'high' | 'critical',
        message: `Performance bottleneck detected in ${node.data.label || 'node'}`,
        suggestion: getSuggestionForIssue(possibleTypes[typeIndex])
      });
    });
    
    return bottlenecks;
  };
  
  // Generate random redundancies for demo
  const generateRedundancies = (): PerformanceIssue[] => {
    if (nodes.length === 0) return [];
    
    const redundancies: PerformanceIssue[] = [];
    const possibleTypes = [
      'Duplicate API Call',
      'Repeated Calculation',
      'Redundant Data Transformation',
      'Unnecessary Validation'
    ];
    
    // Choose 0-2 random nodes to have redundancies
    const nodeCount = Math.min(nodes.length, Math.floor(Math.random() * 3));
    const nodeIndices = getRandomIndices(nodes.length, nodeCount);
    
    nodeIndices.forEach(idx => {
      const node = nodes[idx];
      const typeIndex = Math.floor(Math.random() * possibleTypes.length);
      
      redundancies.push({
        id: `redundancy-${node.id}`,
        nodeId: node.id,
        type: possibleTypes[typeIndex],
        severity: ['low', 'medium'][Math.floor(Math.random() * 2)] as 'low' | 'medium',
        message: `Redundant operation detected in ${node.data.label || 'node'}`,
        suggestion: getSuggestionForIssue(possibleTypes[typeIndex])
      });
    });
    
    return redundancies;
  };
  
  // Generate random API call issues for demo
  const generateApiIssues = (): PerformanceIssue[] => {
    if (nodes.length === 0) return [];
    
    const apiIssues: PerformanceIssue[] = [];
    const possibleTypes = [
      'Sequential API Calls',
      'Missing Pagination',
      'No Response Caching',
      'Large Payload',
      'Missing Rate Limiting'
    ];
    
    // Find nodes that might be API-related
    const apiNodeCandidates = nodes.filter(node => 
      node.data.nodeType === 'action' || 
      node.data.nodeType === 'integration' ||
      node.data.type === 'action' ||
      node.data.type === 'integration'
    );
    
    if (apiNodeCandidates.length === 0) return [];
    
    // Choose up to 2 API nodes to have issues
    const nodeCount = Math.min(apiNodeCandidates.length, Math.floor(Math.random() * 2) + 1);
    const nodeIndices = getRandomIndices(apiNodeCandidates.length, nodeCount);
    
    nodeIndices.forEach(idx => {
      const node = apiNodeCandidates[idx];
      const typeIndex = Math.floor(Math.random() * possibleTypes.length);
      
      apiIssues.push({
        id: `api-${node.id}`,
        nodeId: node.id,
        type: possibleTypes[typeIndex],
        severity: ['medium', 'high'][Math.floor(Math.random() * 2)] as 'medium' | 'high',
        message: `API call optimization opportunity in ${node.data.label || 'node'}`,
        suggestion: getSuggestionForIssue(possibleTypes[typeIndex])
      });
    });
    
    return apiIssues;
  };
  
  // Helper to get random indices without repeats
  const getRandomIndices = (max: number, count: number): number[] => {
    const indices: number[] = [];
    const available = Array.from({ length: max }, (_, i) => i);
    
    for (let i = 0; i < count && available.length > 0; i++) {
      const randomIndex = Math.floor(Math.random() * available.length);
      indices.push(available[randomIndex]);
      available.splice(randomIndex, 1);
    }
    
    return indices;
  };
  
  // Get suggestion based on issue type
  const getSuggestionForIssue = (type: string): string => {
    const suggestions: Record<string, string> = {
      // Bottlenecks
      'Nested Loop': 'Refactor nested loops using map/reduce operations or database joins',
      'Unoptimized Data Processing': 'Use batch processing or streaming to handle large datasets',
      'Long-running Computation': 'Consider breaking computation into smaller steps or using a queue',
      'Resource Contention': 'Implement proper locking or use a resource pool to manage connections',
      
      // Redundancies
      'Duplicate API Call': 'Cache API responses to avoid repeated calls for the same data',
      'Repeated Calculation': 'Cache calculation results or move calculation earlier in the workflow',
      'Redundant Data Transformation': 'Combine multiple transformations into a single step',
      'Unnecessary Validation': 'Remove duplicate validation or move validation earlier in the process',
      
      // API Issues
      'Sequential API Calls': 'Use Promise.all or parallel execution to run API calls concurrently',
      'Missing Pagination': 'Implement pagination to process large datasets in smaller batches',
      'No Response Caching': 'Add caching for frequently accessed data to reduce API calls',
      'Large Payload': 'Request only needed fields or use compression for large data transfers',
      'Missing Rate Limiting': 'Implement rate limiting to avoid API throttling or quota issues'
    };
    
    return suggestions[type] || 'Review and optimize this operation for better performance';
  };
  
  // Get severity badge color
  const getSeverityColor = (severity: string): string => {
    switch (severity) {
      case 'critical':
        return 'destructive';
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
      default:
        return 'outline';
    }
  };
  
  // Render performance issues
  const renderPerformanceIssues = (issues: PerformanceIssue[], title: string, icon: React.ReactNode) => {
    if (issues.length === 0) return null;
    
    return (
      <AccordionItem value={title.toLowerCase()}>
        <AccordionTrigger className="py-2">
          <div className="flex items-center">
            {icon}
            <span className="ml-2">{title}</span>
            <Badge variant="outline" className="ml-2">{issues.length}</Badge>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-3">
            {issues.map(issue => {
              const node = nodes.find(n => n.id === issue.nodeId);
              
              return (
                <div key={issue.id} className="border rounded-md p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium">{node?.data.label || issue.nodeId}</div>
                    <Badge variant={getSeverityColor(issue.severity) as any}>
                      {issue.severity.charAt(0).toUpperCase() + issue.severity.slice(1)}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground mb-2">{issue.type}</div>
                  <div className="text-sm mb-2">{issue.message}</div>
                  <div className="text-sm bg-secondary/30 p-2 rounded">
                    <span className="font-medium">Suggestion:</span> {issue.suggestion}
                  </div>
                </div>
              );
            })}
          </div>
        </AccordionContent>
      </AccordionItem>
    );
  };
  
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Zap className="mr-2 h-5 w-5 text-primary" />
          Performance Optimizer
        </CardTitle>
        <CardDescription>
          Analyze and optimize your workflow for better performance
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {nodes.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No workflow to optimize.</p>
            <p className="text-sm">Create a workflow first before optimizing.</p>
          </div>
        ) : (
          <>
            {!performanceReport ? (
              <Button 
                onClick={analyzeWorkflow}
                disabled={isAnalyzing || nodes.length === 0}
                className="w-full"
              >
                {isAnalyzing ? 'Analyzing...' : 'Analyze Workflow'}
              </Button>
            ) : (
              <div className="flex space-x-2">
                <Button 
                  onClick={analyzeWorkflow}
                  variant="outline"
                  disabled={isAnalyzing || isOptimizing}
                  className="flex-1"
                >
                  Re-Analyze
                </Button>
                <Button 
                  onClick={optimizeWorkflow}
                  disabled={isOptimizing || optimized}
                  className="flex-1"
                >
                  {isOptimizing ? 'Optimizing...' : optimized ? 'Optimized!' : 'Apply Optimizations'}
                </Button>
              </div>
            )}
            
            {(isAnalyzing || isOptimizing) && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>
                    {isAnalyzing ? 'Analyzing workflow...' : 'Applying optimizations...'}
                  </span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="w-full" />
              </div>
            )}
            
            {performanceReport && !isAnalyzing && !isOptimizing && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="border rounded-md p-3 flex flex-col items-center justify-center text-center">
                    <Hourglass className="h-5 w-5 mb-1 text-amber-500" />
                    <div className="text-sm text-muted-foreground">Execution Time</div>
                    <div className="font-medium">{performanceReport.executionTime} ms</div>
                  </div>
                  
                  <div className="border rounded-md p-3 flex flex-col items-center justify-center text-center">
                    <Database className="h-5 w-5 mb-1 text-blue-500" />
                    <div className="text-sm text-muted-foreground">Memory Usage</div>
                    <div className="font-medium">{performanceReport.memoryUsage} MB</div>
                  </div>
                </div>
                
                <div className="border rounded-md p-4">
                  <div className="font-medium mb-2 flex items-center">
                    <BarChart className="h-4 w-4 mr-1" />
                    <span>Performance Analysis</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <AlertTriangle className="h-4 w-4 text-amber-500 mr-1" />
                        <span>Bottlenecks</span>
                      </div>
                      <Badge variant="outline">{performanceReport.bottlenecks.length}</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <FileWarning className="h-4 w-4 text-blue-500 mr-1" />
                        <span>Redundancies</span>
                      </div>
                      <Badge variant="outline">{performanceReport.redundancies.length}</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Database className="h-4 w-4 text-emerald-500 mr-1" />
                        <span>API Optimizations</span>
                      </div>
                      <Badge variant="outline">{performanceReport.apiCalls.length}</Badge>
                    </div>
                  </div>
                </div>
                
                <Accordion type="multiple" defaultValue={['bottlenecks']} className="w-full">
                  {renderPerformanceIssues(
                    performanceReport.bottlenecks,
                    'Bottlenecks',
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                  )}
                  
                  {renderPerformanceIssues(
                    performanceReport.redundancies,
                    'Redundancies',
                    <FileWarning className="h-4 w-4 text-blue-500" />
                  )}
                  
                  {renderPerformanceIssues(
                    performanceReport.apiCalls,
                    'API Optimizations',
                    <Database className="h-4 w-4 text-emerald-500" />
                  )}
                  
                  <AccordionItem value="suggestions">
                    <AccordionTrigger className="py-2">
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                        <span className="ml-2">Recommendations</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <ul className="space-y-2 ml-5 list-disc">
                        {performanceReport.suggestions.map((suggestion, i) => (
                          <li key={i} className="text-sm">{suggestion}</li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
                
                {optimized && (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-md">
                    <div className="flex items-center font-medium">
                      <CheckCircle className="h-4 w-4 text-emerald-500 mr-2" />
                      Optimization Complete
                    </div>
                    <p className="text-sm mt-1">
                      Performance optimizations have been applied to your workflow. 
                      Continue to the execution tab to test the improvements.
                    </p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default PerformanceOptimizer;
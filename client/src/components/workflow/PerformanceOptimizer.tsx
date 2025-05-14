import React, { useState, useCallback } from 'react';
import { Node, Edge } from 'reactflow';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { 
  Zap, 
  AlertTriangle, 
  FileWarning, 
  Hourglass, 
  Database, 
  BarChart, 
  CheckCircle,
  Sparkles
} from 'lucide-react';
import { NodeData } from '@/store/useWorkflowStore';
import { PerformanceReport, PerformanceIssue } from '@/types/workflow';

interface OptimizationSuggestion {
  id: string;
  type: string;
  title: string;
  description: string;
  impactLevel: string;
  nodeIds: string[];
  selected?: boolean;
}

interface AppliedOptimization {
  id: string;
  title: string;
  appliedTo: number;
  type: string;
}

interface PerformanceOptimizerProps {
  nodes: Node<NodeData>[];
  edges: Edge[];
  workflowId?: number;
  onOptimize?: (optimizedNodes: Node<NodeData>[], optimizedEdges: Edge[]) => void;
  className?: string;
}

export const PerformanceOptimizer: React.FC<PerformanceOptimizerProps> = ({
  nodes,
  edges,
  workflowId,
  onOptimize,
  className
}) => {
  const { toast } = useToast();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [performanceReport, setPerformanceReport] = useState<PerformanceReport | null>(null);
  const [optimized, setOptimized] = useState(false);
  const [optimizationSuggestions, setOptimizationSuggestions] = useState<OptimizationSuggestion[]>([]);
  const [appliedOptimizations, setAppliedOptimizations] = useState<AppliedOptimization[]>([]);
  
  // Mutation for applying optimizations via API
  const optimizeMutation = useMutation({
    mutationFn: async (data: { workflowId: number, optimizationIds?: string[] }) => {
      const response = await fetch(`/api/workflows/${data.workflowId}/optimize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          optimizationIds: data.optimizationIds 
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to optimize workflow' }));
        throw new Error(errorData.message || 'Failed to optimize workflow');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Workflow optimized",
        description: `Successfully applied ${data.appliedOptimizations.length} optimizations.`,
        variant: "default",
      });
      
      // Update state with the optimized workflow data
      setAppliedOptimizations(data.appliedOptimizations);
      setOptimized(true);
      setIsOptimizing(false);
      setProgress(100);
      
      // If we have an onOptimize callback, call it with the optimized nodes and edges
      if (onOptimize && data.workflow) {
        onOptimize(data.workflow.nodes, data.workflow.edges);
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Optimization failed",
        description: error.message || "There was an error optimizing the workflow",
        variant: "destructive",
      });
      setIsOptimizing(false);
    }
  });
  
  // Generate a performance report and optimization suggestions
  const analyzeWorkflow = useCallback(() => {
    setIsAnalyzing(true);
    setProgress(0);
    setPerformanceReport(null);
    setOptimized(false);
    setAppliedOptimizations([]);
    
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
            
            // Generate optimization suggestions based on the analysis
            const suggestions: OptimizationSuggestion[] = [];
            
            // Add timeout optimization if there are API calls
            if (report.apiCalls.length > 0) {
              suggestions.push({
                id: 'timeout-optimization',
                type: 'timeout',
                title: 'Increase API timeout thresholds',
                description: 'Add retry logic with increased timeouts for external API calls',
                impactLevel: 'high',
                nodeIds: report.apiCalls.map(issue => issue.nodeId),
                selected: true
              });
            }
            
            // Add parallel execution optimization if multiple API calls
            if (report.apiCalls.length > 1) {
              suggestions.push({
                id: 'parallel-execution',
                type: 'execution',
                title: 'Parallelize API requests',
                description: 'Convert sequential API calls to parallel execution for faster processing',
                impactLevel: 'medium',
                nodeIds: report.apiCalls.map(issue => issue.nodeId),
                selected: true
              });
            }
            
            // Add data transformation optimization if redundancies exist
            if (report.redundancies.length > 0) {
              suggestions.push({
                id: 'data-transformation',
                type: 'data_processing',
                title: 'Optimize data transformations',
                description: 'Combine multiple transformation steps into fewer operations',
                impactLevel: 'medium',
                nodeIds: report.redundancies.map(issue => issue.nodeId),
                selected: true
              });
            }
            
            // Always suggest error handling improvements
            suggestions.push({
              id: 'error-handling',
              type: 'error_handling',
              title: 'Improve error handling',
              description: 'Add comprehensive error handling with fallback options to all nodes',
              impactLevel: 'high',
              nodeIds: nodes.map(node => node.id),
              selected: true
            });
            
            setPerformanceReport(report);
            setOptimizationSuggestions(suggestions);
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
  
  // Toggle selection of an optimization suggestion
  const toggleOptimizationSelection = (id: string) => {
    setOptimizationSuggestions(prev => 
      prev.map(suggestion => 
        suggestion.id === id 
          ? { ...suggestion, selected: !suggestion.selected } 
          : suggestion
      )
    );
  };
  
  // Apply optimizations to the workflow
  const optimizeWorkflow = useCallback(() => {
    if (!optimizationSuggestions.length) return;
    
    setIsOptimizing(true);
    setProgress(0);
    
    // Check if we have a workflowId for API optimization
    if (workflowId) {
      // Get selected optimization IDs
      const selectedOptimizationIds = optimizationSuggestions
        .filter(suggestion => suggestion.selected)
        .map(suggestion => suggestion.id);
      
      // Show progress indicator
      const interval = setInterval(() => {
        setProgress(prev => {
          const newProgress = Math.min(95, prev + Math.random() * 10);
          return newProgress;
        });
      }, 200);
      
      // Call the API to apply optimizations
      optimizeMutation.mutate(
        { 
          workflowId, 
          optimizationIds: selectedOptimizationIds 
        },
        {
          onSettled: () => {
            clearInterval(interval);
          }
        }
      );
      
      return () => clearInterval(interval);
    } 
    // If no workflowId, use the local simulation approach
    else {
      // Simulate optimization with progress updates
      const interval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + Math.random() * 20;
          if (newProgress >= 100) {
            clearInterval(interval);
            
            // Make "optimized" copies of nodes
            setTimeout(() => {
              const optimizedNodes = [...nodes];
              const optimizedEdges = [...edges];
              const appliedOptimizations: AppliedOptimization[] = [];
              
              // Apply selected optimizations
              optimizationSuggestions
                .filter(suggestion => suggestion.selected)
                .forEach(suggestion => {
                  // Apply optimization based on type
                  switch (suggestion.type) {
                    case 'timeout':
                      // Add timeout configurations to relevant nodes
                      suggestion.nodeIds.forEach(nodeId => {
                        const nodeIndex = optimizedNodes.findIndex(n => n.id === nodeId);
                        if (nodeIndex !== -1) {
                          optimizedNodes[nodeIndex] = {
                            ...optimizedNodes[nodeIndex],
                            data: {
                              ...optimizedNodes[nodeIndex].data,
                              optimized: true,
                              label: `${optimizedNodes[nodeIndex].data.label || nodeId} (Optimized)`,
                              // @ts-ignore - Adding custom properties to node data
                              timeoutConfig: {
                                enabled: true,
                                duration: 30000, // 30 seconds
                                retryStrategy: 'exponential',
                                maxRetries: 3
                              }
                            }
                          };
                        }
                      });
                      break;
                      
                    case 'execution':
                      // Mark nodes for parallel execution
                      suggestion.nodeIds.forEach(nodeId => {
                        const nodeIndex = optimizedNodes.findIndex(n => n.id === nodeId);
                        if (nodeIndex !== -1) {
                          optimizedNodes[nodeIndex] = {
                            ...optimizedNodes[nodeIndex],
                            data: {
                              ...optimizedNodes[nodeIndex].data,
                              optimized: true,
                              label: `${optimizedNodes[nodeIndex].data.label || nodeId} (Optimized)`,
                              // @ts-ignore - Adding custom properties to node data
                              executionStrategy: 'parallel'
                            }
                          };
                        }
                      });
                      break;
                      
                    case 'data_processing':
                      // Optimize data transformation nodes
                      suggestion.nodeIds.forEach(nodeId => {
                        const nodeIndex = optimizedNodes.findIndex(n => n.id === nodeId);
                        if (nodeIndex !== -1) {
                          optimizedNodes[nodeIndex] = {
                            ...optimizedNodes[nodeIndex],
                            data: {
                              ...optimizedNodes[nodeIndex].data,
                              optimized: true,
                              label: `${optimizedNodes[nodeIndex].data.label || nodeId} (Optimized)`,
                              // @ts-ignore - Adding custom properties to node data
                              combinedTransformation: true
                            }
                          };
                        }
                      });
                      break;
                      
                    case 'error_handling':
                      // Add error handling to all nodes
                      optimizedNodes.forEach((node, index) => {
                        optimizedNodes[index] = {
                          ...node,
                          data: {
                            ...node.data,
                            optimized: true,
                            label: `${node.data.label || node.id} (Optimized)`,
                            // @ts-ignore - Adding custom properties to node data
                            errorHandling: {
                              enabled: true,
                              retryOnError: true,
                              maxRetries: 2,
                              fallbackValue: null
                            }
                          }
                        };
                      });
                      break;
                  }
                  
                  // Add to applied optimizations list
                  appliedOptimizations.push({
                    id: suggestion.id,
                    title: suggestion.title,
                    appliedTo: suggestion.nodeIds.length,
                    type: suggestion.type
                  });
                });
              
              if (onOptimize) {
                onOptimize(optimizedNodes, optimizedEdges);
              }
              
              setAppliedOptimizations(appliedOptimizations);
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
    }
  }, [
    nodes, 
    edges, 
    workflowId, 
    optimizationSuggestions, 
    optimizeMutation, 
    onOptimize
  ]);
  
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
      'Duplicate API Calls',
      'Redundant Data Transformation',
      'Repeated Calculations',
      'Unnecessary Data Mapping'
    ];
    
    // Choose 1-2 random nodes to have redundancies
    const nodeCount = Math.min(nodes.length, Math.floor(Math.random() * 2) + 1);
    const nodeIndices = getRandomIndices(nodes.length, nodeCount);
    
    nodeIndices.forEach(idx => {
      const node = nodes[idx];
      const typeIndex = Math.floor(Math.random() * possibleTypes.length);
      
      redundancies.push({
        id: `redundancy-${node.id}`,
        nodeId: node.id,
        type: possibleTypes[typeIndex],
        severity: 'medium',
        message: `${possibleTypes[typeIndex]} detected in ${node.data.label || 'node'}`,
        suggestion: getSuggestionForIssue(possibleTypes[typeIndex])
      });
    });
    
    return redundancies;
  };
  
  // Generate random API issues for demo
  const generateApiIssues = (): PerformanceIssue[] => {
    if (nodes.length === 0) return [];
    
    const apiIssues: PerformanceIssue[] = [];
    const possibleTypes = [
      'Slow API Response',
      'No Request Timeout',
      'Sequential API Calls',
      'No Error Handling'
    ];
    
    // Choose 1-3 random nodes to have API issues
    const nodeCount = Math.min(nodes.length, Math.floor(Math.random() * 3) + 1);
    const nodeIndices = getRandomIndices(nodes.length, nodeCount);
    
    nodeIndices.forEach(idx => {
      const node = nodes[idx];
      const typeIndex = Math.floor(Math.random() * possibleTypes.length);
      
      apiIssues.push({
        id: `api-${node.id}`,
        nodeId: node.id,
        type: possibleTypes[typeIndex],
        severity: 'medium',
        message: `${possibleTypes[typeIndex]} issue detected in ${node.data.label || 'node'}`,
        suggestion: getSuggestionForIssue(possibleTypes[typeIndex])
      });
    });
    
    return apiIssues;
  };
  
  // Get suggestion based on issue type
  const getSuggestionForIssue = (issueType: string): string => {
    const suggestions: Record<string, string> = {
      'Nested Loop': 'Optimize loop structure to reduce computational complexity',
      'Unoptimized Data Processing': 'Combine multiple transformation steps into a single operation',
      'Long-running Computation': 'Implement caching or consider using a worker thread',
      'Resource Contention': 'Reduce concurrent resource access or implement resource pooling',
      'Duplicate API Calls': 'Cache API responses to avoid redundant calls',
      'Redundant Data Transformation': 'Consolidate transformation steps to reduce overhead',
      'Repeated Calculations': 'Store calculation results to avoid repeating the same computation',
      'Unnecessary Data Mapping': 'Simplify data mapping by processing only required fields',
      'Slow API Response': 'Implement timeouts and retry logic',
      'No Request Timeout': 'Add an appropriate timeout to prevent workflow blocking',
      'Sequential API Calls': 'Parallelize independent API calls to reduce overall execution time',
      'No Error Handling': 'Add comprehensive error handling with fallback options'
    };
    
    return suggestions[issueType] || 'Optimize implementation to improve performance';
  };
  
  // Generate random indices for selecting nodes
  const getRandomIndices = (max: number, count: number): number[] => {
    const indices: number[] = [];
    while (indices.length < count) {
      const index = Math.floor(Math.random() * max);
      if (!indices.includes(index)) {
        indices.push(index);
      }
    }
    return indices;
  };
  
  // Format impact level with appropriate color
  const getImpactBadge = (impactLevel: string) => {
    switch (impactLevel.toLowerCase()) {
      case 'high':
        return <Badge variant="destructive">High Impact</Badge>;
      case 'medium':
        return <Badge variant="secondary">Medium Impact</Badge>;
      case 'low':
        return <Badge variant="outline">Low Impact</Badge>;
      default:
        return <Badge>{impactLevel}</Badge>;
    }
  };

  return (
    <Card className={className || 'w-full max-w-3xl mx-auto mb-8'}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          One-Click Performance Optimizer
        </CardTitle>
        <CardDescription>
          Analyze and apply automatic optimizations to improve workflow performance
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!isAnalyzing && !performanceReport && optimizationSuggestions.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              Click the button below to analyze your workflow for performance issues and optimization opportunities.
            </p>
            <Button onClick={analyzeWorkflow} className="mx-auto">
              <BarChart className="mr-2 h-4 w-4" />
              Analyze Workflow
            </Button>
          </div>
        )}
        
        {(isAnalyzing || isOptimizing) && (
          <div className="py-4">
            <p className="text-center mb-3 font-medium">
              {isAnalyzing ? 'Analyzing workflow performance...' : 'Applying optimizations...'}
            </p>
            <Progress value={progress} className="h-2 mb-2" />
            <p className="text-xs text-center text-muted-foreground">
              {Math.round(progress)}% complete
            </p>
          </div>
        )}
        
        {performanceReport && !isAnalyzing && !isOptimizing && !optimized && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
              <div className="bg-muted rounded-md p-3 flex-1">
                <p className="text-sm font-medium mb-1">Execution Time</p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">{performanceReport.executionTime}ms</span>
                  <Hourglass className="h-5 w-5 text-amber-500" />
                </div>
              </div>
              <div className="bg-muted rounded-md p-3 flex-1">
                <p className="text-sm font-medium mb-1">Memory Usage</p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">{performanceReport.memoryUsage}MB</span>
                  <Database className="h-5 w-5 text-blue-500" />
                </div>
              </div>
            </div>
            
            {/* Performance Issues Accordion */}
            <Accordion type="single" collapsible className="w-full">
              {performanceReport.bottlenecks.length > 0 && (
                <AccordionItem value="bottlenecks">
                  <AccordionTrigger className="text-left">
                    <div className="flex items-center gap-2">
                      <Badge variant="destructive" className="rounded-sm">
                        {performanceReport.bottlenecks.length}
                      </Badge>
                      <span>Performance Bottlenecks</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="space-y-2">
                      {performanceReport.bottlenecks.map((bottleneck, index) => (
                        <li key={`bottleneck-${index}`} className="bg-muted/50 p-2 rounded-sm">
                          <div className="flex items-start gap-2">
                            <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                            <div>
                              <p className="font-medium text-sm">{bottleneck.message}</p>
                              <p className="text-xs text-muted-foreground">Node: {bottleneck.nodeId}</p>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              )}
              
              {performanceReport.redundancies.length > 0 && (
                <AccordionItem value="redundancies">
                  <AccordionTrigger className="text-left">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="rounded-sm">
                        {performanceReport.redundancies.length}
                      </Badge>
                      <span>Data Processing Redundancies</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="space-y-2">
                      {performanceReport.redundancies.map((redundancy, index) => (
                        <li key={`redundancy-${index}`} className="bg-muted/50 p-2 rounded-sm">
                          <div className="flex items-start gap-2">
                            <FileWarning className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                            <div>
                              <p className="font-medium text-sm">{redundancy.message}</p>
                              <p className="text-xs text-muted-foreground">Node: {redundancy.nodeId}</p>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              )}
              
              {performanceReport.apiCalls.length > 0 && (
                <AccordionItem value="apiCalls">
                  <AccordionTrigger className="text-left">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="rounded-sm">
                        {performanceReport.apiCalls.length}
                      </Badge>
                      <span>API Performance Issues</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="space-y-2">
                      {performanceReport.apiCalls.map((apiIssue, index) => (
                        <li key={`api-${index}`} className="bg-muted/50 p-2 rounded-sm">
                          <div className="flex items-start gap-2">
                            <FileWarning className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                            <div>
                              <p className="font-medium text-sm">{apiIssue.message}</p>
                              <p className="text-xs text-muted-foreground">Node: {apiIssue.nodeId}</p>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              )}
            </Accordion>
            
            {/* Optimization Suggestions */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-4">Recommended Optimizations</h3>
              <div className="space-y-4">
                {optimizationSuggestions.map((suggestion) => (
                  <div key={suggestion.id} className="border rounded-md p-4">
                    <div className="flex items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{suggestion.title}</h4>
                          {getImpactBadge(suggestion.impactLevel)}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{suggestion.description}</p>
                        <p className="text-xs text-muted-foreground">
                          Applies to {suggestion.nodeIds.length} {suggestion.nodeIds.length === 1 ? 'node' : 'nodes'}
                        </p>
                      </div>
                      <div className="pl-4">
                        <Checkbox 
                          id={`opt-${suggestion.id}`}
                          checked={suggestion.selected}
                          onCheckedChange={() => toggleOptimizationSelection(suggestion.id)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="pt-6 text-center">
              <Button 
                onClick={optimizeWorkflow}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Apply Optimizations
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                One-click performance improvement with intelligent optimization
              </p>
            </div>
          </div>
        )}
        
        {optimized && !isOptimizing && (
          <div className="py-4 text-center">
            <CheckCircle className="h-16 w-16 text-primary mx-auto mb-2" />
            <h3 className="text-xl font-semibold mb-1">Workflow Optimized</h3>
            <p className="text-muted-foreground mb-4">
              Your workflow has been successfully optimized for improved performance.
            </p>
            
            {appliedOptimizations.length > 0 && (
              <div className="mb-6 mt-4">
                <h4 className="font-medium mb-3 text-left">Applied Optimizations:</h4>
                <ul className="space-y-2 text-left">
                  {appliedOptimizations.map((optimization) => (
                    <li key={optimization.id} className="bg-muted/50 p-3 rounded-md flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">{optimization.title}</p>
                        <p className="text-xs text-muted-foreground">
                          Applied to {optimization.appliedTo} {optimization.appliedTo === 1 ? 'node' : 'nodes'}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            <Button variant="outline" onClick={analyzeWorkflow}>
              Re-analyze Workflow
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
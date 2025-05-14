import React, { useState, useMemo } from 'react';
import { Node, Edge } from 'reactflow';
import { NodeData } from '@/store/useWorkflowStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Loader2, Zap as ZapIcon } from 'lucide-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

// Types for optimization suggestions and performance reporting
interface OptimizationSuggestion {
  id: string;
  type: string;
  title: string;
  description: string;
  impactLevel: string; // 'high', 'medium', 'low'
  nodeIds: string[];
  selected?: boolean;
}

interface PerformanceReport {
  executionTime: number;
  resourceUsage: number;
  errorRate: number;
  latency: number;
  optimizationSuggestions: OptimizationSuggestion[];
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
  const [selectedOptimizations, setSelectedOptimizations] = useState<string[]>([]);
  const [appliedOptimizations, setAppliedOptimizations] = useState<AppliedOptimization[]>([]);
  const [isAutoOptimize, setIsAutoOptimize] = useState(false);

  // Fetch optimization suggestions from the API
  const { 
    data: performanceReport,
    isLoading: isLoadingReport,
    error: reportError,
    refetch: refetchReport
  } = useQuery<PerformanceReport>({
    queryKey: [`/api/workflows/${workflowId}/optimization-suggestions`],
    enabled: !!workflowId
  });

  // Group optimization suggestions by type for better UX
  const groupedSuggestions = useMemo(() => {
    if (!performanceReport?.optimizationSuggestions) return {};
    
    return performanceReport.optimizationSuggestions.reduce((acc, suggestion) => {
      const type = suggestion.type;
      if (!acc[type]) acc[type] = [];
      acc[type].push(suggestion);
      return acc;
    }, {} as Record<string, OptimizationSuggestion[]>);
  }, [performanceReport]);

  // Apply optimization mutation
  const { mutate: applyOptimization, isPending: isOptimizing } = useMutation({
    mutationFn: async () => {
      if (!workflowId) throw new Error("Workflow ID is required");
      
      const optimizationIds = isAutoOptimize 
        ? performanceReport?.optimizationSuggestions?.map(s => s.id) || []
        : selectedOptimizations;
        
      // Create a proper body string
      const bodyString = JSON.stringify({ optimizationIds });
        
      const response = await fetch(`/api/workflows/${workflowId}/optimize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: bodyString,
        credentials: 'include'
      });
      
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`${response.status}: ${text || response.statusText}`);
      }
      
      return await response.json();
    },
    onSuccess: (data) => {
      // Update UI with optimized workflow data
      if (onOptimize) {
        onOptimize(data.optimizedNodes, data.optimizedEdges);
      }
      
      // Record applied optimizations for display
      const newOptimizations = isAutoOptimize
        ? performanceReport?.optimizationSuggestions.map(s => ({
            id: s.id,
            title: s.title,
            appliedTo: s.nodeIds.length,
            type: s.type
          })) || []
        : selectedOptimizations.map(id => {
            const suggestion = performanceReport?.optimizationSuggestions.find(s => s.id === id);
            return {
              id,
              title: suggestion?.title || "Unknown optimization",
              appliedTo: suggestion?.nodeIds.length || 0,
              type: suggestion?.type || "unknown"
            };
          });
          
      setAppliedOptimizations(prev => [...prev, ...newOptimizations]);
      setSelectedOptimizations([]);
      
      // Update the suggestions after optimization
      refetchReport();
      
      toast({
        title: "Workflow optimized successfully",
        description: `Applied ${newOptimizations.length} optimizations`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Optimization failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  // Toggle a specific optimization
  const toggleOptimization = (id: string) => {
    setSelectedOptimizations(prev => 
      prev.includes(id) 
        ? prev.filter(optId => optId !== id)
        : [...prev, id]
    );
  };
  
  // Get impact level badge color
  const getImpactBadgeColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-800 hover:bg-red-100';
      case 'medium': return 'bg-amber-100 text-amber-800 hover:bg-amber-100';
      case 'low': return 'bg-green-100 text-green-800 hover:bg-green-100';
      default: return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ZapIcon className="h-5 w-5 text-amber-500" />
            Performance Optimizer
          </CardTitle>
          <CardDescription>
            Analyze and optimize your workflow for better performance and resource usage
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingReport ? (
            <div className="flex justify-center items-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-3">Analyzing workflow performance...</span>
            </div>
          ) : reportError ? (
            <div className="text-center p-4 text-destructive">
              Failed to analyze workflow: {reportError instanceof Error ? reportError.message : 'Unknown error'}
            </div>
          ) : performanceReport?.optimizationSuggestions?.length === 0 ? (
            <div className="text-center p-8">
              <p className="text-lg font-medium">No optimization suggestions found</p>
              <p className="text-muted-foreground">Your workflow is already performing optimally!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* One-click optimization toggle */}
              <div className="flex items-center space-x-2 mb-4 p-3 border rounded-md bg-muted/30">
                <Checkbox 
                  id="auto-optimize" 
                  checked={isAutoOptimize}
                  onCheckedChange={() => setIsAutoOptimize(!isAutoOptimize)}
                />
                <label
                  htmlFor="auto-optimize"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  One-click optimization (Apply all suggestions automatically)
                </label>
              </div>
              
              {/* Performance metrics */}
              {performanceReport && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="border rounded-md p-3 text-center">
                    <div className="text-sm text-muted-foreground">Execution Time</div>
                    <div className="text-xl font-semibold">{performanceReport.executionTime}ms</div>
                  </div>
                  <div className="border rounded-md p-3 text-center">
                    <div className="text-sm text-muted-foreground">Resource Usage</div>
                    <div className="text-xl font-semibold">{performanceReport.resourceUsage}%</div>
                  </div>
                  <div className="border rounded-md p-3 text-center">
                    <div className="text-sm text-muted-foreground">Error Rate</div>
                    <div className="text-xl font-semibold">{performanceReport.errorRate}%</div>
                  </div>
                  <div className="border rounded-md p-3 text-center">
                    <div className="text-sm text-muted-foreground">Latency</div>
                    <div className="text-xl font-semibold">{performanceReport.latency}ms</div>
                  </div>
                </div>
              )}
              
              {/* Optimization suggestions by type */}
              {!isAutoOptimize && Object.entries(groupedSuggestions).map(([type, suggestions]) => (
                <div key={type} className="mb-6">
                  <h3 className="text-lg font-semibold mb-3 capitalize">{type} Optimizations</h3>
                  <div className="space-y-3">
                    {suggestions.map((suggestion) => (
                      <div
                        key={suggestion.id}
                        className="flex items-start space-x-3 p-4 border rounded-md hover:bg-accent/10 transition-colors"
                      >
                        <Checkbox 
                          id={suggestion.id} 
                          checked={selectedOptimizations.includes(suggestion.id)}
                          onCheckedChange={() => toggleOptimization(suggestion.id)}
                        />
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center justify-between">
                            <label
                              htmlFor={suggestion.id}
                              className="text-sm font-medium leading-none cursor-pointer"
                            >
                              {suggestion.title}
                            </label>
                            <Badge 
                              variant="outline" 
                              className={getImpactBadgeColor(suggestion.impactLevel)}
                            >
                              {suggestion.impactLevel} impact
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{suggestion.description}</p>
                          <div className="text-xs text-muted-foreground mt-1">
                            Applies to {suggestion.nodeIds.length} node{suggestion.nodeIds.length !== 1 ? 's' : ''}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            variant="secondary" 
            onClick={() => refetchReport()}
            disabled={isLoadingReport || isOptimizing}
          >
            Re-analyze
          </Button>
          <Button
            onClick={() => applyOptimization()}
            disabled={
              isLoadingReport || 
              isOptimizing || 
              (!isAutoOptimize && selectedOptimizations.length === 0) || 
              !performanceReport?.optimizationSuggestions?.length
            }
          >
            {isOptimizing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Optimizing...
              </>
            ) : (
              <>
                {isAutoOptimize ? 'Apply All Optimizations' : `Apply ${selectedOptimizations.length} Optimization${selectedOptimizations.length !== 1 ? 's' : ''}`}
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
      
      {/* Display applied optimizations */}
      {appliedOptimizations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <ZapIcon className="h-5 w-5 text-primary" />
              Applied Optimizations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {appliedOptimizations.map((opt) => (
                <div key={opt.id} className="flex justify-between items-center p-3 border rounded-md">
                  <div>
                    <div className="font-medium">{opt.title}</div>
                    <div className="text-sm text-muted-foreground capitalize">{opt.type}</div>
                  </div>
                  <Badge variant="outline">Applied to {opt.appliedTo} node{opt.appliedTo !== 1 ? 's' : ''}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
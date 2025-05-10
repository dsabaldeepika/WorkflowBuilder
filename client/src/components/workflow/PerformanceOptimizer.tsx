import React, { useState } from 'react';
import { Node, Edge } from 'reactflow';
import { NodeData } from '@/store/useWorkflowStore';
import { PerformanceReport, PerformanceIssue } from '@/types/workflow';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Zap, ArrowUpRight, AlertTriangle, Clock, Database, Cloud, X, Check, RotateCcw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

// Function to check for bottlenecks
function findBottlenecks(nodes: Node<NodeData>[], edges: Edge[]): PerformanceIssue[] {
  const bottlenecks: PerformanceIssue[] = [];
  
  // Check for nodes with multiple outgoing connections (fan-out)
  const nodeOutgoingConnections = edges.reduce((acc, edge) => {
    acc[edge.source] = (acc[edge.source] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  // Check for nodes with multiple incoming connections (fan-in)
  const nodeIncomingConnections = edges.reduce((acc, edge) => {
    acc[edge.target] = (acc[edge.target] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  // Analyze nodes for bottlenecks
  nodes.forEach(node => {
    const outgoing = nodeOutgoingConnections[node.id] || 0;
    const incoming = nodeIncomingConnections[node.id] || 0;
    
    // High fan-in nodes (many inputs) can be bottlenecks
    if (incoming > 3) {
      bottlenecks.push({
        id: `bottleneck-${node.id}-fan-in`,
        nodeId: node.id,
        type: 'fan-in',
        severity: incoming > 5 ? 'high' : 'medium',
        message: `Node "${node.data.label}" has ${incoming} incoming connections, which may create a bottleneck.`,
        suggestion: 'Consider adding a queue or splitting this into multiple nodes.'
      });
    }
    
    // Nodes with both high fan-in and fan-out can be critical bottlenecks
    if (incoming > 2 && outgoing > 2) {
      bottlenecks.push({
        id: `bottleneck-${node.id}-hub`,
        nodeId: node.id,
        type: 'hub-node',
        severity: 'high',
        message: `Node "${node.data.label}" is a hub with ${incoming} inputs and ${outgoing} outputs.`,
        suggestion: 'Consider breaking this into multiple specialized nodes.'
      });
    }
    
    // Check if there are integration or API nodes that might be slow
    if (node.type === 'integration' || node.data.nodeType === 'integration') {
      bottlenecks.push({
        id: `bottleneck-${node.id}-integration`,
        nodeId: node.id,
        type: 'external-service',
        severity: 'medium',
        message: `Integration node "${node.data.label}" may slow down workflow execution.`,
        suggestion: 'Add caching or implement retry logic to improve reliability.'
      });
    }
  });
  
  return bottlenecks;
}

// Function to check for redundancies
function findRedundancies(nodes: Node<NodeData>[], edges: Edge[]): PerformanceIssue[] {
  const redundancies: PerformanceIssue[] = [];
  
  // Track node types to identify duplicates
  const nodeTypeMap: Record<string, Node<NodeData>[]> = {};
  
  // Group nodes by type/purpose
  nodes.forEach(node => {
    const nodeType = node.type || 'default';
    if (!nodeTypeMap[nodeType]) {
      nodeTypeMap[nodeType] = [];
    }
    nodeTypeMap[nodeType].push(node);
  });
  
  // Check for potentially redundant nodes of the same type
  Object.entries(nodeTypeMap).forEach(([type, typeNodes]) => {
    if (typeNodes.length > 1) {
      // Look for nodes that might be doing similar things
      for (let i = 0; i < typeNodes.length; i++) {
        for (let j = i + 1; j < typeNodes.length; j++) {
          const node1 = typeNodes[i];
          const node2 = typeNodes[j];
          
          // Check for similar labels or descriptions
          const label1 = node1.data.label?.toLowerCase() || '';
          const label2 = node2.data.label?.toLowerCase() || '';
          
          if (label1 && label2 && (
            label1.includes(label2) || 
            label2.includes(label1) ||
            levenshteinDistance(label1, label2) < 5
          )) {
            redundancies.push({
              id: `redundancy-${node1.id}-${node2.id}`,
              nodeId: node1.id,
              type: 'similar-nodes',
              severity: 'medium',
              message: `Nodes "${node1.data.label}" and "${node2.data.label}" appear to have similar functionality.`,
              suggestion: 'Consider consolidating these nodes to reduce complexity.'
            });
          }
        }
      }
    }
  });
  
  // Check for nodes not connected to anything (orphans)
  nodes.forEach(node => {
    const hasIncoming = edges.some(edge => edge.target === node.id);
    const hasOutgoing = edges.some(edge => edge.source === node.id);
    
    if (!hasIncoming && !hasOutgoing) {
      redundancies.push({
        id: `redundancy-${node.id}-orphan`,
        nodeId: node.id,
        type: 'orphaned-node',
        severity: 'high',
        message: `Node "${node.data.label}" is not connected to any other node.`,
        suggestion: 'Remove this node or connect it to the workflow.'
      });
    }
  });
  
  return redundancies;
}

// Function to check for API call optimizations
function findAPICallIssues(nodes: Node<NodeData>[]): PerformanceIssue[] {
  const apiIssues: PerformanceIssue[] = [];
  
  // Find nodes that are likely to make API calls
  const apiNodes = nodes.filter(node => 
    node.type === 'integration' || 
    node.data.nodeType === 'integration' ||
    (node.data.label && (
      node.data.label.includes('API') || 
      node.data.label.includes('Http') || 
      node.data.label.includes('Request')
    ))
  );
  
  // Check for API rate limiting issues
  if (apiNodes.length > 3) {
    apiIssues.push({
      id: 'api-rate-limit',
      nodeId: '',
      type: 'rate-limit',
      severity: 'medium',
      message: `Workflow contains ${apiNodes.length} potential API calls which may trigger rate limits.`,
      suggestion: 'Add delays between calls or implement batching where possible.'
    });
  }
  
  // Check individual API nodes
  apiNodes.forEach(node => {
    apiIssues.push({
      id: `api-${node.id}`,
      nodeId: node.id,
      type: 'external-call',
      severity: 'low',
      message: `Node "${node.data.label}" makes external API calls.`,
      suggestion: 'Consider adding caching or error handling to improve reliability.'
    });
  });
  
  return apiIssues;
}

// Helper function to calculate Levenshtein distance (string similarity)
function levenshteinDistance(str1: string, str2: string): number {
  const track = Array(str2.length + 1).fill(null).map(() => 
    Array(str1.length + 1).fill(null));
  
  for (let i = 0; i <= str1.length; i += 1) {
    track[0][i] = i;
  }
  
  for (let j = 0; j <= str2.length; j += 1) {
    track[j][0] = j;
  }
  
  for (let j = 1; j <= str2.length; j += 1) {
    for (let i = 1; i <= str1.length; i += 1) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      track[j][i] = Math.min(
        track[j][i - 1] + 1, // deletion
        track[j - 1][i] + 1, // insertion
        track[j - 1][i - 1] + indicator, // substitution
      );
    }
  }
  
  return track[str2.length][str1.length];
}

// Main function to analyze workflow performance
export function analyzeWorkflowPerformance(
  nodes: Node<NodeData>[], 
  edges: Edge[]
): PerformanceReport {
  // Find various issues
  const bottlenecks = findBottlenecks(nodes, edges);
  const redundancies = findRedundancies(nodes, edges);
  const apiCalls = findAPICallIssues(nodes);
  
  // Calculate a rough execution time estimate
  // This is highly simplified - real execution time would depend on many factors
  const nodeTimeEstimates: Record<string, number> = {
    'trigger': 50,
    'action': 100,
    'condition': 20,
    'data': 30,
    'integration': 500, // External APIs are typically the slowest
    'agent': 300
  };
  
  let totalTime = 0;
  // Sum up estimated time for each node
  nodes.forEach(node => {
    const nodeType = node.type || 'default';
    totalTime += nodeTimeEstimates[nodeType as keyof typeof nodeTimeEstimates] || 100;
  });
  
  // Add overhead for connections
  totalTime += edges.length * 10;
  
  // Add penalty for each bottleneck
  totalTime += bottlenecks.reduce((acc, issue) => {
    return acc + (issue.severity === 'high' ? 300 : 
                 issue.severity === 'medium' ? 150 : 50);
  }, 0);
  
  // Generate suggestions based on findings
  const suggestions: string[] = [];
  
  if (bottlenecks.length > 0) {
    suggestions.push('Address identified bottlenecks to improve workflow throughput.');
  }
  
  if (redundancies.length > 0) {
    suggestions.push('Remove redundant nodes to simplify the workflow and reduce execution time.');
  }
  
  if (apiCalls.length > 0) {
    suggestions.push('Implement caching and error handling for external API calls.');
  }
  
  if (edges.length > nodes.length * 1.5) {
    suggestions.push('Consider simplifying the workflow structure by reducing the number of connections.');
  }
  
  return {
    bottlenecks,
    redundancies,
    apiCalls,
    executionTime: totalTime,
    memoryUsage: (nodes.length * 5) + (edges.length * 2), // Very rough estimate
    suggestions: suggestions.length > 0 ? suggestions : ['No significant optimization opportunities identified.']
  };
}

// Function to optimize workflow by setting optimized flag on fixed nodes
export function optimizeWorkflow(
  nodes: Node<NodeData>[], 
  edges: Edge[],
  report: PerformanceReport
): { nodes: Node<NodeData>[]; optimizationSummary: string } {
  // Create a map of nodeIds to be optimized
  const nodeIdsToOptimize = new Set<string>();
  
  // Add all nodes with issues to the optimization set
  [...report.bottlenecks, ...report.redundancies, ...report.apiCalls].forEach(issue => {
    if (issue.nodeId) {
      nodeIdsToOptimize.add(issue.nodeId);
    }
  });
  
  // Apply optimizations
  const optimizedNodes = nodes.map(node => {
    if (nodeIdsToOptimize.has(node.id)) {
      // Create a deep copy of the node data to avoid mutation issues
      return {
        ...node,
        data: {
          ...node.data,
          optimized: true
        }
      };
    }
    return node;
  });
  
  // Build a summary of changes made
  const totalOptimizations = nodeIdsToOptimize.size;
  
  return {
    nodes: optimizedNodes,
    optimizationSummary: `Optimized ${totalOptimizations} node${totalOptimizations !== 1 ? 's' : ''} to improve workflow performance.`
  };
}

// This component lets users analyze and optimize their workflow
export const PerformanceOptimizer: React.FC<{
  nodes: Node<NodeData>[];
  edges: Edge[];
  onOptimize: (optimizedNodes: Node<NodeData>[]) => void;
}> = ({ nodes, edges, onOptimize }) => {
  const [report, setReport] = useState<PerformanceReport | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  
  // Function to analyze the workflow
  const handleAnalyze = () => {
    setIsAnalyzing(true);
    // Small timeout to show the loading state
    setTimeout(() => {
      try {
        const performanceReport = analyzeWorkflowPerformance(nodes, edges);
        setReport(performanceReport);
        setIsAnalyzing(false);
      } catch (error) {
        console.error('Error analyzing workflow:', error);
        toast({
          title: 'Analysis Failed',
          description: 'Could not analyze the workflow. Please try again.',
          variant: 'destructive',
        });
        setIsAnalyzing(false);
      }
    }, 1000);
  };
  
  // Function to optimize the workflow
  const handleOptimize = () => {
    if (!report) return;
    
    setIsOptimizing(true);
    setTimeout(() => {
      try {
        const { nodes: optimizedNodes, optimizationSummary } = optimizeWorkflow(nodes, edges, report);
        onOptimize(optimizedNodes);
        setIsOptimizing(false);
        setReport(null);
        
        toast({
          title: 'Workflow Optimized',
          description: optimizationSummary,
          variant: 'success',
        });
      } catch (error) {
        console.error('Error optimizing workflow:', error);
        toast({
          title: 'Optimization Failed',
          description: 'Could not optimize the workflow. Please try again.',
          variant: 'destructive',
        });
        setIsOptimizing(false);
      }
    }, 1000);
  };
  
  // Render the severity badge for an issue
  const renderSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <Badge variant="destructive">Critical</Badge>;
      case 'high':
        return <Badge variant="destructive">High</Badge>;
      case 'medium':
        return <Badge>Medium</Badge>;
      default:
        return <Badge variant="outline">Low</Badge>;
    }
  };
  
  // Render a list of issues
  const renderIssueList = (issues: PerformanceIssue[]) => {
    if (issues.length === 0) {
      return (
        <div className="flex items-center justify-center p-6 text-muted-foreground">
          No issues detected
        </div>
      );
    }
    
    return (
      <ScrollArea className="h-[300px]">
        <div className="space-y-3 p-1">
          {issues.map(issue => (
            <Card key={issue.id} className="overflow-hidden border-l-4" style={{ 
              borderLeftColor: 
                issue.severity === 'critical' ? '#f43f5e' : 
                issue.severity === 'high' ? '#ef4444' : 
                issue.severity === 'medium' ? '#f97316' : 
                '#94a3b8'
            }}>
              <CardHeader className="p-3 pb-1">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">
                    {issue.nodeId ? `Node Issue` : 'Workflow Issue'}
                  </CardTitle>
                  {renderSeverityBadge(issue.severity)}
                </div>
                <CardDescription className="text-xs line-clamp-2">
                  {issue.message}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="flex items-start space-x-2 text-xs">
                  <ArrowUpRight className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                  <p className="text-emerald-700">{issue.suggestion}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    );
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl flex items-center">
              <Zap className="mr-2 h-5 w-5 text-yellow-500" />
              Performance Optimizer
            </CardTitle>
            <CardDescription>
              Analyze and optimize your workflow for maximum efficiency
            </CardDescription>
          </div>
          
          {!report && (
            <Button 
              onClick={handleAnalyze} 
              disabled={isAnalyzing || nodes.length === 0}
              className="bg-gradient-to-r from-indigo-500 to-violet-500 text-white"
            >
              {isAnalyzing ? 'Analyzing...' : 'Analyze Workflow'}
            </Button>
          )}
          
          {report && (
            <Button 
              variant="outline" 
              onClick={() => setReport(null)}
              className="border-slate-300"
            >
              <RotateCcw className="mr-1 h-4 w-4" />
              New Analysis
            </Button>
          )}
        </div>
      </CardHeader>
      
      {report && (
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <Card className="p-4 bg-slate-50">
                <div className="flex items-center gap-3">
                  <Clock className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Estimated Execution</p>
                    <p className="text-2xl font-bold">
                      {report.executionTime < 1000 
                        ? `${report.executionTime}ms` 
                        : `${(report.executionTime / 1000).toFixed(1)}s`}
                    </p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-4 bg-slate-50">
                <div className="flex items-center gap-3">
                  <Database className="h-8 w-8 text-emerald-500" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Memory Usage</p>
                    <p className="text-2xl font-bold">{report.memoryUsage}MB</p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-4 bg-slate-50">
                <div className="flex items-center gap-3">
                  <Cloud className="h-8 w-8 text-purple-500" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">API Calls</p>
                    <p className="text-2xl font-bold">{report.apiCalls.length}</p>
                  </div>
                </div>
              </Card>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Performance Score</h3>
              <div className="space-y-1">
                <Progress 
                  value={100 - Math.min(100, (report.bottlenecks.length * 10 + report.redundancies.length * 5))} 
                  className="h-3" 
                />
                <p className="text-xs text-muted-foreground text-right">
                  {report.bottlenecks.length + report.redundancies.length} issues found
                </p>
              </div>
            </div>
            
            <Tabs defaultValue="bottlenecks">
              <TabsList className="grid grid-cols-3">
                <TabsTrigger value="bottlenecks" className="flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Bottlenecks ({report.bottlenecks.length})
                </TabsTrigger>
                <TabsTrigger value="redundancies" className="flex items-center gap-1">
                  <X className="h-3 w-3" />
                  Redundancies ({report.redundancies.length})
                </TabsTrigger>
                <TabsTrigger value="api-calls" className="flex items-center gap-1">
                  <Cloud className="h-3 w-3" />
                  API Calls ({report.apiCalls.length})
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="bottlenecks">
                {renderIssueList(report.bottlenecks)}
              </TabsContent>
              
              <TabsContent value="redundancies">
                {renderIssueList(report.redundancies)}
              </TabsContent>
              
              <TabsContent value="api-calls">
                {renderIssueList(report.apiCalls)}
              </TabsContent>
            </Tabs>
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Suggestions</h3>
              <Card className="p-4 bg-slate-50">
                <ul className="space-y-2">
                  {report.suggestions.map((suggestion, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-emerald-500 mt-0.5" />
                      <span>{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          </div>
        </CardContent>
      )}
      
      {report && (
        <CardFooter className="flex justify-end space-x-2 bg-slate-50 border-t">
          <Button 
            variant="outline" 
            onClick={() => setReport(null)}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleOptimize}
            disabled={isOptimizing || (report.bottlenecks.length === 0 && report.redundancies.length === 0 && report.apiCalls.length === 0)}
            className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white"
          >
            {isOptimizing ? 'Optimizing...' : 'Apply Optimizations'}
          </Button>
        </CardFooter>
      )}
      
      {!report && !isAnalyzing && (
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <Zap className="h-12 w-12 text-muted-foreground/40 mb-4" />
            <p className="text-muted-foreground">
              Click "Analyze Workflow" to check for performance issues and optimization opportunities.
            </p>
          </div>
        </CardContent>
      )}
      
      {isAnalyzing && !report && (
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="animate-pulse">
              <Zap className="h-16 w-16 text-yellow-500" />
            </div>
            <p className="mt-4 text-muted-foreground">Analyzing workflow performance...</p>
            <Progress value={65} className="max-w-xs mt-4" />
          </div>
        </CardContent>
      )}
    </Card>
  );
};
import React, { useState, useEffect } from 'react';
import { 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  RefreshCw, 
  XCircle, 
  Search,
  Calendar,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { apiRequest } from '@/lib/queryClient';

// Error types and categories from the backend
enum ErrorCategory {
  CONNECTION = 'connection',
  AUTHENTICATION = 'auth',
  VALIDATION = 'validation',
  TIMEOUT = 'timeout',
  RATE_LIMIT = 'rate_limit',
  DATA_PROCESSING = 'data',
  SYSTEM = 'system',
  UNKNOWN = 'unknown'
}

// Color mapping for error categories
const categoryColors: Record<ErrorCategory, { bg: string, text: string, border: string }> = {
  [ErrorCategory.CONNECTION]: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
  [ErrorCategory.AUTHENTICATION]: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' },
  [ErrorCategory.VALIDATION]: { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-200' },
  [ErrorCategory.TIMEOUT]: { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-200' },
  [ErrorCategory.RATE_LIMIT]: { bg: 'bg-indigo-100', text: 'text-indigo-800', border: 'border-indigo-200' },
  [ErrorCategory.DATA_PROCESSING]: { bg: 'bg-cyan-100', text: 'text-cyan-800', border: 'border-cyan-200' },
  [ErrorCategory.SYSTEM]: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },
  [ErrorCategory.UNKNOWN]: { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200' }
};

// Mock data for workflows
const mockWorkflows = [
  { id: 1, name: 'CRM Lead Processing', status: 'healthy', successRate: 98, lastRun: '2025-05-10T10:30:00Z' },
  { id: 2, name: 'Invoice Generation', status: 'degraded', successRate: 85, lastRun: '2025-05-10T08:15:00Z' },
  { id: 3, name: 'Social Media Publishing', status: 'error', successRate: 62, lastRun: '2025-05-09T22:45:00Z' },
  { id: 4, name: 'Customer Support Ticketing', status: 'healthy', successRate: 100, lastRun: '2025-05-10T12:00:00Z' },
  { id: 5, name: 'Inventory Sync', status: 'warning', successRate: 91, lastRun: '2025-05-10T09:20:00Z' },
];

// Mock data for error logs
const mockErrorLogs = [
  {
    id: '1',
    timestamp: '2025-05-10T08:16:23Z',
    message: 'Connection timeout when connecting to payment API',
    category: ErrorCategory.CONNECTION,
    workflowId: 2,
    workflowName: 'Invoice Generation',
    nodeId: 'node-123',
    nodeName: 'Process Payment',
    attempt: 3,
    suggestion: 'Check API endpoint configuration or contact the payment provider.',
    retryable: true
  },
  {
    id: '2',
    timestamp: '2025-05-09T22:50:12Z',
    message: 'Authentication failed for Twitter API',
    category: ErrorCategory.AUTHENTICATION,
    workflowId: 3,
    workflowName: 'Social Media Publishing',
    nodeId: 'node-456',
    nodeName: 'Publish to Twitter',
    attempt: 1,
    suggestion: 'Verify API credentials and permissions.',
    retryable: false
  },
  {
    id: '3',
    timestamp: '2025-05-10T09:22:45Z',
    message: 'Invalid data format in inventory feed',
    category: ErrorCategory.VALIDATION,
    workflowId: 5,
    workflowName: 'Inventory Sync',
    nodeId: 'node-789',
    nodeName: 'Parse Inventory Feed',
    attempt: 1,
    suggestion: 'Check the data schema and ensure it matches expected format.',
    retryable: false
  },
  {
    id: '4',
    timestamp: '2025-05-09T23:01:05Z',
    message: 'Rate limit exceeded for Instagram API',
    category: ErrorCategory.RATE_LIMIT,
    workflowId: 3,
    workflowName: 'Social Media Publishing',
    nodeId: 'node-012',
    nodeName: 'Publish to Instagram',
    attempt: 2,
    suggestion: 'Consider implementing delay between API calls or upgrading API tier.',
    retryable: true
  },
  {
    id: '5',
    timestamp: '2025-05-10T09:21:33Z',
    message: 'Database error when retrieving product data',
    category: ErrorCategory.SYSTEM,
    workflowId: 5,
    workflowName: 'Inventory Sync',
    nodeId: 'node-345',
    nodeName: 'Fetch Products',
    attempt: 3,
    suggestion: 'Check database connection and permissions.',
    retryable: true
  }
];

// Helper functions
const getStatusIcon = (status: string) => {
  switch (status) {
    case 'healthy':
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case 'degraded':
      return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    case 'warning':
      return <AlertCircle className="h-5 w-5 text-orange-500" />;
    case 'error':
      return <XCircle className="h-5 w-5 text-red-500" />;
    default:
      return <Clock className="h-5 w-5 text-gray-500" />;
  }
};

const getSuccessRateColor = (rate: number) => {
  if (rate >= 95) return 'bg-green-500';
  if (rate >= 80) return 'bg-yellow-500';
  if (rate >= 60) return 'bg-orange-500';
  return 'bg-red-500';
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Main component
export default function WorkflowMonitoring() {
  const [timeframe, setTimeframe] = useState<'hour' | 'day' | 'week' | 'month'>('day');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(false);
  const [errorLogs, setErrorLogs] = useState(mockErrorLogs);
  const [workflows, setWorkflows] = useState(mockWorkflows);
  
  // Filter error logs based on search query
  const filteredErrorLogs = errorLogs.filter(log => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      log.message.toLowerCase().includes(query) ||
      log.workflowName.toLowerCase().includes(query) ||
      log.nodeName.toLowerCase().includes(query) ||
      log.category.toLowerCase().includes(query)
    );
  });
  
  // Group error logs by category for the overview stats
  const errorsByCategory = errorLogs.reduce((acc, log) => {
    acc[log.category] = (acc[log.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  // Calculate error statistics
  const totalErrors = errorLogs.length;
  const retryableErrors = errorLogs.filter(log => log.retryable).length;
  const topFailingWorkflow = Object.entries(
    errorLogs.reduce((acc, log) => {
      acc[log.workflowName] = (acc[log.workflowName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).sort((a, b) => b[1] - a[1])[0];
  
  // Simulate fetching error logs
  const fetchErrorLogs = async () => {
    setIsLoading(true);
    try {
      // This would typically be an API call
      // const response = await apiRequest(`/api/monitoring/errors?timeframe=${timeframe}`);
      // setErrorLogs(response.errors);
      
      // Simulating API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setErrorLogs(mockErrorLogs);
    } catch (error) {
      console.error('Failed to fetch error logs', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Refresh data when timeframe changes
  useEffect(() => {
    fetchErrorLogs();
  }, [timeframe]);
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Workflow Monitoring Dashboard</h1>
        <div className="flex items-center space-x-4">
          <Select value={timeframe} onValueChange={(value: any) => setTimeframe(value)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hour">Last Hour</SelectItem>
              <SelectItem value="day">Last 24 Hours</SelectItem>
              <SelectItem value="week">Last 7 Days</SelectItem>
              <SelectItem value="month">Last 30 Days</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={fetchErrorLogs} variant="outline" size="icon" disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-3 w-[400px]">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="errors">Error Logs</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          {/* Health stats cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">Total Errors</CardTitle>
                <CardDescription>Last {timeframe === 'hour' ? 'hour' : timeframe === 'day' ? '24 hours' : timeframe === 'week' ? '7 days' : '30 days'}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{totalErrors}</div>
                <div className="mt-2 text-sm">
                  <span className="text-muted-foreground">{retryableErrors} retryable</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">Error Categories</CardTitle>
                <CardDescription>Distribution by type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(errorsByCategory).slice(0, 3).map(([category, count]) => (
                    <div key={category} className="flex justify-between items-center">
                      <Badge className={`${categoryColors[category as ErrorCategory]?.bg} ${categoryColors[category as ErrorCategory]?.text}`}>
                        {category}
                      </Badge>
                      <span className="text-sm font-medium">{count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">Top Failing Workflow</CardTitle>
                <CardDescription>Most errors in this period</CardDescription>
              </CardHeader>
              <CardContent>
                {topFailingWorkflow ? (
                  <>
                    <div className="text-lg font-semibold">{topFailingWorkflow[0]}</div>
                    <div className="mt-1 text-sm">
                      <span className="text-muted-foreground">{topFailingWorkflow[1]} errors</span>
                    </div>
                  </>
                ) : (
                  <div className="text-muted-foreground">No errors recorded</div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Recent errors */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Errors</CardTitle>
              <CardDescription>Latest workflow failures</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {errorLogs.slice(0, 3).map(log => (
                <div key={log.id} className="p-3 border rounded-md hover:bg-gray-50 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-md ${categoryColors[log.category]?.bg}`}>
                      <AlertCircle className={`h-5 w-5 ${categoryColors[log.category]?.text}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <h3 className="font-medium">{log.message}</h3>
                        <span className="text-xs text-gray-500">{formatDate(log.timestamp)}</span>
                      </div>
                      <div className="mt-1 text-sm text-gray-600">
                        {log.workflowName} <ArrowRight className="inline h-3 w-3" /> {log.nodeName}
                      </div>
                      {log.suggestion && (
                        <div className="mt-2 text-sm p-2 bg-amber-50 text-amber-800 rounded-sm">
                          <span className="font-medium">Suggestion:</span> {log.suggestion}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
            <CardFooter>
              <Button variant="ghost" onClick={() => setActiveTab('errors')}>
                View all errors <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="workflows" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Workflow Health</CardTitle>
              <CardDescription>Status of all active workflows</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {workflows.map(workflow => (
                  <div key={workflow.id} className="border rounded-md p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(workflow.status)}
                        <div>
                          <h3 className="font-medium">{workflow.name}</h3>
                          <div className="text-sm text-gray-500">
                            Last run: {formatDate(workflow.lastRun)}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <div className="text-sm mb-1">Success rate: {workflow.successRate}%</div>
                        <div className="w-32">
                          <Progress value={workflow.successRate} className={getSuccessRateColor(workflow.successRate)} />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="errors" className="space-y-4">
          <div className="flex justify-between mb-4">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Search errors..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Error Logs</CardTitle>
              <CardDescription>
                {filteredErrorLogs.length} errors found in the {timeframe === 'hour' ? 'last hour' : timeframe === 'day' ? 'last 24 hours' : timeframe === 'week' ? 'last 7 days' : 'last 30 days'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredErrorLogs.length > 0 ? (
                  filteredErrorLogs.map(log => (
                    <div key={log.id} className={`border rounded-md p-4 ${categoryColors[log.category]?.border}`}>
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-md ${categoryColors[log.category]?.bg}`}>
                          <AlertCircle className={`h-5 w-5 ${categoryColors[log.category]?.text}`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between flex-wrap">
                            <h3 className="font-medium">{log.message}</h3>
                            <div className="text-sm text-gray-500">
                              <Calendar className="inline h-3 w-3 mr-1" />
                              {formatDate(log.timestamp)}
                              {log.attempt > 1 && (
                                <Badge variant="outline" className="ml-2">
                                  Attempt {log.attempt}
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          <div className="mt-2 flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600">
                            <div className="flex items-center">
                              <span className="font-medium mr-1">Workflow:</span>
                              {log.workflowName}
                            </div>
                            
                            <div className="flex items-center">
                              <span className="font-medium mr-1">Node:</span>
                              {log.nodeName}
                            </div>
                            
                            <div className="flex items-center">
                              <span className="font-medium mr-1">Category:</span>
                              <Badge className={`${categoryColors[log.category]?.bg} ${categoryColors[log.category]?.text}`}>
                                {log.category}
                              </Badge>
                            </div>
                            
                            <div className="flex items-center">
                              <span className="font-medium mr-1">Retryable:</span>
                              {log.retryable ? (
                                <Badge variant="outline" className="bg-green-50 border-green-200 text-green-700">Yes</Badge>
                              ) : (
                                <Badge variant="outline" className="bg-red-50 border-red-200 text-red-700">No</Badge>
                              )}
                            </div>
                          </div>
                          
                          {log.suggestion && (
                            <div className="mt-3 text-sm p-3 bg-amber-50 text-amber-800 rounded-md">
                              <span className="font-medium">Suggestion:</span> {log.suggestion}
                            </div>
                          )}
                          
                          <div className="mt-3">
                            <Button variant="outline" size="sm">
                              <ExternalLink className="h-3 w-3 mr-1" />
                              View Execution Details
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    <XCircle className="h-10 w-10 mx-auto mb-2 opacity-30" />
                    <p>No errors found.</p>
                    {searchQuery && (
                      <p className="text-sm mt-1">Try adjusting your search query.</p>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
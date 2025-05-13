import React, { useState, useEffect } from 'react';
import { 
  Activity, AlertCircle, CheckCircle, Clock, FilterX, Search,
  RefreshCw, Zap, BarChart3, PieChart, TrendingUp, Users, Workflow 
} from 'lucide-react';
import { apiRequest } from "@/lib/queryClient";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Health dashboard data interface
interface HealthData {
  successful: number;
  failed: number;
  retried: number;
  totalRuns: number;
  averageExecutionTime: number;
  mostFrequentErrors: { message: string; count: number }[];
  nodePerfData: { name: string; avgTime: number; errorRate: number }[];
  performanceHistory: { date: string; executionTime: number; errorRate: number }[];
  lastUpdate: string;
  optimizationSuggestions?: { title: string; description: string }[];
}

// Default initial data structure
const defaultData: HealthData = {
  successful: 0,
  failed: 0,
  retried: 0,
  totalRuns: 0,
  averageExecutionTime: 0,
  mostFrequentErrors: [],
  nodePerfData: [],
  performanceHistory: [],
  lastUpdate: new Date().toLocaleTimeString(),
};

const WorkflowHealthDashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState<string>("7d");
  const [status, setStatus] = useState<string>("all");
  const [userId, setUserId] = useState<string>("");
  const [workflowId, setWorkflowId] = useState<string>("");
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [data, setData] = useState<HealthData>(defaultData);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch health monitoring data from API
  const fetchHealthData = async () => {
    try {
      setIsRefreshing(true);
      setError(null);
      
      // Build query parameters
      const params = new URLSearchParams();
      if (timeRange) params.append('timeRange', timeRange);
      if (status) params.append('status', status);
      if (userId) params.append('userId', userId);
      if (workflowId) params.append('workflowId', workflowId);
      
      const queryString = params.toString();
      const url = `/api/health-monitoring-data${queryString ? `?${queryString}` : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const healthData = await response.json();
      
      if (!healthData || !healthData.summary) {
        throw new Error("Invalid data format received from server");
      }
      
      // Map API response to our data structure
      setData({
        successful: healthData.summary.successfulRuns || 0,
        failed: healthData.summary.failedRuns || 0,
        totalRuns: healthData.summary.totalRuns || 0,
        averageExecutionTime: healthData.summary.averageExecutionTime || 0,
        retried: healthData.summary.retriedRuns || 0,
        mostFrequentErrors: healthData.errorBreakdown 
          ? Object.entries(healthData.errorBreakdown).map(([message, count]) => ({ 
              message, 
              count: count as number 
            }))
          : [],
        nodePerfData: healthData.nodePerformance 
          ? healthData.nodePerformance.map((item: any) => ({
              name: item.nodeName || item.name,
              avgTime: item.averageExecutionTime || 0,
              errorRate: 100 - (item.successRate || 0)
            }))
          : [],
        performanceHistory: healthData.performanceHistory || [],
        lastUpdate: new Date().toLocaleTimeString(),
        optimizationSuggestions: healthData.optimizationSuggestions || []
      });
      
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching health data:", error);
      setError("Failed to load monitoring data. Please try again.");
      
      // Initialize with empty data if this is the first load
      if (isLoading) {
        setData(defaultData);
        setIsLoading(false);
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchHealthData();
  }, [timeRange, status]);
  
  // Refresh button handler
  const handleRefresh = () => {
    fetchHealthData();
  };
  
  // Filter reset handler
  const resetFilters = () => {
    setTimeRange("7d");
    setStatus("all");
    setUserId("");
    setWorkflowId("");
  };

  const getStatusColor = (successRate: number) => {
    if (successRate >= 98) return "bg-green-500";
    if (successRate >= 90) return "bg-yellow-500";
    return "bg-red-500";
  };

  const successRate = Math.round((data.successful / data.totalRuns) * 100);
  
  return (
    <div className="p-4 space-y-4 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Workflow Health Dashboard</h1>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>
      
      {/* Filters section */}
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-md">Filters</CardTitle>
          <CardDescription>Refine dashboard data with these filters</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="timeRange">Time Range</Label>
              <Select 
                value={timeRange} 
                onValueChange={(value) => setTimeRange(value)}
              >
                <SelectTrigger id="timeRange" className="w-full">
                  <SelectValue placeholder="Select range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24h">Last 24 Hours</SelectItem>
                  <SelectItem value="7d">Last 7 Days</SelectItem>
                  <SelectItem value="30d">Last 30 Days</SelectItem>
                  <SelectItem value="90d">Last 90 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select 
                value={status} 
                onValueChange={(value) => setStatus(value)}
              >
                <SelectTrigger id="status" className="w-full">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Executions</SelectItem>
                  <SelectItem value="success">Successful Only</SelectItem>
                  <SelectItem value="failed">Failed Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="userId">User ID (Optional)</Label>
              <div className="flex">
                <Input 
                  id="userId" 
                  value={userId} 
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="Filter by user ID" 
                  className="w-full"
                />
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="ml-1"
                  onClick={() => setUserId("")}
                  disabled={!userId}
                >
                  <Users className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="workflowId">Workflow ID (Optional)</Label>
              <div className="flex">
                <Input 
                  id="workflowId" 
                  value={workflowId} 
                  onChange={(e) => setWorkflowId(e.target.value)}
                  placeholder="Filter by workflow ID" 
                  className="w-full"
                />
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="ml-1"
                  onClick={() => setWorkflowId("")}
                  disabled={!workflowId}
                >
                  <Workflow className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end mt-4">
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={resetFilters}
            >
              <FilterX className="h-4 w-4" />
              Reset Filters
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Status indicator */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md mb-4 flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          {error}
        </div>
      )}
      
      {isLoading && (
        <div className="flex justify-center items-center p-20">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      )}

      {/* Status Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className={`rounded-full w-3 h-3 ${getStatusColor(successRate)} mr-2`} />
              <div className="text-2xl font-bold">{successRate}%</div>
            </div>
            <Progress className="mt-2" value={successRate} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Executions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Activity className="h-5 w-5 text-gray-400 mr-2" />
              <div className="text-2xl font-bold">{data.totalRuns}</div>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {data.successful} successful / {data.failed} failed
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Avg. Execution Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-gray-400 mr-2" />
              <div className="text-2xl font-bold">{data.averageExecutionTime}s</div>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Across all successful executions
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Retry Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <RefreshCw className="h-5 w-5 text-gray-400 mr-2" />
              <div className="text-2xl font-bold">{Math.round((data.retried / data.totalRuns) * 100)}%</div>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {data.retried} runs needed retries
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analysis */}
      <Tabs defaultValue="errors">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="errors">Error Analysis</TabsTrigger>
          <TabsTrigger value="nodes">Node Performance</TabsTrigger>
          <TabsTrigger value="history">Performance History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="errors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Most Frequent Errors</CardTitle>
              <CardDescription>Common issues affecting workflow reliability</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.mostFrequentErrors.map((error, index) => (
                  <div key={index} className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
                    <div>
                      <div className="font-medium">{error.message}</div>
                      <div className="text-sm text-gray-500">Occurred {error.count} times</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">View Full Error Log</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="nodes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Node Performance</CardTitle>
              <CardDescription>Performance metrics for individual workflow nodes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {data.nodePerfData.map((node, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="font-medium">{node.name}</div>
                      <Badge variant={node.errorRate > 5 ? "destructive" : "outline"}>
                        {node.errorRate}% errors
                      </Badge>
                    </div>
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>Avg. execution: {node.avgTime}s</span>
                      <span>Health: {node.errorRate < 3 ? "Good" : node.errorRate < 8 ? "Fair" : "Poor"}</span>
                    </div>
                    <Progress value={100 - node.errorRate} 
                      className={node.errorRate < 3 ? "bg-gray-100" : node.errorRate < 8 ? "bg-yellow-100" : "bg-red-100"} />
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">View Detailed Node Metrics</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance History</CardTitle>
              <CardDescription>Execution time and error rate trends</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <div className="text-center text-gray-500 italic">
                Interactive charts would be displayed here showing:
                <ul className="list-disc list-inside text-left mt-4">
                  <li>Execution time trends over the selected time period</li>
                  <li>Error rate changes over time</li>
                  <li>Success/failure ratio changes</li>
                </ul>
                <div className="mt-4 flex justify-center gap-4">
                  <Button variant="outline" size="sm">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Bar Chart
                  </Button>
                  <Button variant="outline" size="sm">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Line Chart
                  </Button>
                  <Button variant="outline" size="sm">
                    <PieChart className="h-4 w-4 mr-2" />
                    Pie Chart
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter className="text-xs text-gray-500">
              Last updated: {data.lastUpdate}
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Recommendations */}
      {!isLoading && data.totalRuns > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="h-5 w-5 text-blue-500 mr-2" />
              Optimization Recommendations
            </CardTitle>
            <CardDescription>Data-driven suggestions to improve workflow performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.optimizationSuggestions && data.optimizationSuggestions.length > 0 ? (
                data.optimizationSuggestions.map((suggestion, index) => (
                  <div key={index} className="p-3 bg-blue-50 border border-blue-100 rounded-md">
                    <div className="font-medium text-blue-700">{suggestion.title}</div>
                    <div className="text-sm text-blue-600 mt-1">
                      {suggestion.description}
                    </div>
                  </div>
                ))
              ) : (
                <>
                  {data.nodePerfData.filter(node => node.errorRate > 5).length > 0 && (
                    <div className="p-3 bg-blue-50 border border-blue-100 rounded-md">
                      <div className="font-medium text-blue-700">Configure retry policies for high-error nodes</div>
                      <div className="text-sm text-blue-600 mt-1">
                        {data.nodePerfData.filter(node => node.errorRate > 5).map(node => node.name).join(', ')} 
                        {data.nodePerfData.filter(node => node.errorRate > 5).length === 1 ? ' has' : ' have'} high failure rates. 
                        Adding exponential backoff retry logic could improve reliability.
                      </div>
                    </div>
                  )}
                  
                  {data.averageExecutionTime > 2 && (
                    <div className="p-3 bg-blue-50 border border-blue-100 rounded-md">
                      <div className="font-medium text-blue-700">Consider performance optimizations</div>
                      <div className="text-sm text-blue-600 mt-1">
                        Average execution time ({data.averageExecutionTime.toFixed(1)}s) is higher than recommended. 
                        Consider parallel execution or optimizing the slowest nodes.
                      </div>
                    </div>
                  )}
                  
                  {data.mostFrequentErrors.length > 0 && (
                    <div className="p-3 bg-blue-50 border border-blue-100 rounded-md">
                      <div className="font-medium text-blue-700">Address frequent errors</div>
                      <div className="text-sm text-blue-600 mt-1">
                        Most common error: "{data.mostFrequentErrors[0]?.message}" occurred {' '}
                        {data.mostFrequentErrors[0]?.count} times. Consider implementing specific error handling.
                      </div>
                    </div>
                  )}
                </>
              )}
              
              {data.optimizationSuggestions?.length === 0 && 
                data.nodePerfData.filter(node => node.errorRate > 5).length === 0 && 
                data.averageExecutionTime <= 2 && 
                data.mostFrequentErrors.length === 0 && (
                <div className="p-3 bg-green-50 border border-green-100 text-green-700 rounded-md">
                  <div className="font-medium">Your workflows are running efficiently!</div>
                  <div className="text-sm mt-1">
                    No optimization recommendations at this time. Continue monitoring for future improvements.
                  </div>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full">Apply Recommended Optimizations</Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
};

export default WorkflowHealthDashboard;
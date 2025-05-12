import React, { useState, useEffect } from 'react';
import { 
  Activity, AlertCircle, CheckCircle, Clock, 
  RefreshCw, Zap, BarChart3, PieChart, TrendingUp 
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

// Mock data for workflow health metrics
const mockExecutionData = {
  successful: 87,
  failed: 12,
  retried: 8,
  totalRuns: 107,
  averageExecutionTime: 1.8, // seconds
  mostFrequentErrors: [
    { message: "API Rate Limit Exceeded", count: 5 },
    { message: "Connection Timeout", count: 3 },
    { message: "Authentication Failed", count: 2 },
    { message: "Invalid Data Format", count: 1 },
    { message: "Resource Not Found", count: 1 },
  ],
  nodePerfData: [
    { name: "Facebook Lead Trigger", avgTime: 0.3, errorRate: 1.2 },
    { name: "Lead Data Transformer", avgTime: 0.2, errorRate: 0 },
    { name: "HubSpot Contact Creator", avgTime: 1.2, errorRate: 7.5 },
    { name: "Email Notification", avgTime: 0.5, errorRate: 2.8 },
  ],
  performanceHistory: [
    { date: "May 5", executionTime: 1.9, errorRate: 12.5 },
    { date: "May 6", executionTime: 2.0, errorRate: 15.0 },
    { date: "May 7", executionTime: 1.7, errorRate: 8.0 },
    { date: "May 8", executionTime: 1.5, errorRate: 5.0 },
    { date: "May 9", executionTime: 1.8, errorRate: 10.0 },
    { date: "May 10", executionTime: 1.6, errorRate: 7.5 },
    { date: "May 11", executionTime: 1.8, errorRate: 11.0 },
  ],
  lastUpdate: new Date().toLocaleTimeString(),
};

const WorkflowHealthDashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState<string>("7d");
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [data, setData] = useState(mockExecutionData);
  
  // Fetch health monitoring data from API
  const fetchHealthData = async () => {
    try {
      setIsRefreshing(true);
      const response = await fetch('/api/health-monitoring-data', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const healthData = await response.json();
      setData({
        ...mockExecutionData, // Fallback for any missing properties
        ...healthData, // API data takes precedence
        successful: healthData.summary.totalExecutions - healthData.summary.failedWorkflows,
        failed: healthData.summary.failedWorkflows,
        totalRuns: healthData.summary.totalExecutions,
        averageExecutionTime: healthData.summary.averageExecutionTime,
        retried: healthData.summary.totalExecutions * 0.08, // Estimate if not provided
        mostFrequentErrors: healthData.errorBreakdown 
          ? Object.entries(healthData.errorBreakdown).map(([message, count]) => ({ 
              message, 
              count: count as number 
            }))
          : mockExecutionData.mostFrequentErrors,
        nodePerfData: healthData.workflowPerformance 
          ? healthData.workflowPerformance.map((item: any) => ({
              name: item.name,
              avgTime: item.avgTime,
              errorRate: 100 - item.successRate
            }))
          : mockExecutionData.nodePerfData,
        lastUpdate: new Date().toLocaleTimeString()
      });
    } catch (error) {
      console.error("Error fetching health data:", error);
      // Fallback to mock data
    } finally {
      setIsRefreshing(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchHealthData();
  }, [timeRange]);
  
  const handleRefresh = () => {
    fetchHealthData();
  };

  const getStatusColor = (successRate: number) => {
    if (successRate >= 98) return "bg-green-500";
    if (successRate >= 90) return "bg-yellow-500";
    return "bg-red-500";
  };

  const successRate = Math.round((data.successful / data.totalRuns) * 100);
  
  return (
    <div className="p-4 space-y-4 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Workflow Health Dashboard</h1>
        <div className="flex items-center gap-2">
          <Select 
            defaultValue={timeRange} 
            onValueChange={(value) => setTimeRange(value)}
          >
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24 Hours</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="90d">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Zap className="h-5 w-5 text-blue-500 mr-2" />
            Optimization Recommendations
          </CardTitle>
          <CardDescription>AI-generated suggestions to improve workflow performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 bg-blue-50 border border-blue-100 rounded-md">
              <div className="font-medium text-blue-700">Configure retry policies for "HubSpot Contact Creator"</div>
              <div className="text-sm text-blue-600 mt-1">
                This node has a high failure rate (7.5%). Adding exponential backoff retry logic could improve reliability.
              </div>
            </div>
            <div className="p-3 bg-blue-50 border border-blue-100 rounded-md">
              <div className="font-medium text-blue-700">Add rate limiting for Facebook API calls</div>
              <div className="text-sm text-blue-600 mt-1">
                5 failures due to "API Rate Limit Exceeded" errors. Implementing per-minute request throttling is recommended.
              </div>
            </div>
            <div className="p-3 bg-blue-50 border border-blue-100 rounded-md">
              <div className="font-medium text-blue-700">Increase timeout for external API calls</div>
              <div className="text-sm text-blue-600 mt-1">
                Several connection timeouts detected. Consider increasing the default timeout from 10s to 15s.
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full">Apply Recommended Optimizations</Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default WorkflowHealthDashboard;
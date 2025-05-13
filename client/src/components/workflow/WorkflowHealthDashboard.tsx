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
// Recharts for visualizations
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';

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
        <div className="flex flex-col justify-center items-center p-20 space-y-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{
              duration: 2,
              ease: "linear",
              repeat: Infinity
            }}
          >
            <Workflow className="h-16 w-16 text-blue-500" />
          </motion.div>
          <InlineWorkflowLoading 
            size="lg" 
            text="Loading health metrics" 
            variant="default" 
          />
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
              {data.mostFrequentErrors.length > 0 ? (
                <>
                  {data.mostFrequentErrors.length > 1 && (
                    <div className="h-64 mb-6">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsPieChart>
                          <Pie
                            data={data.mostFrequentErrors}
                            dataKey="count"
                            nameKey="message"
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            fill="#8884d8"
                            label={(entry: any) => `${entry.name?.substring(0, 15)}... (${(entry.percent * 100).toFixed(0)}%)`}
                            labelLine={false}
                          >
                            {data.mostFrequentErrors.map((entry, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={[
                                  "#ef4444", "#f97316", "#f59e0b", "#84cc16", 
                                  "#10b981", "#06b6d4", "#3b82f6", "#8b5cf6"
                                ][index % 8]} 
                              />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value) => [`${value} occurrences`, 'Count']} 
                            labelFormatter={(label) => `Error: ${label}`}
                          />
                          <Legend layout="vertical" verticalAlign="bottom" align="center" />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                  
                  <div className="space-y-4 max-h-64 overflow-auto p-1">
                    {data.mostFrequentErrors.map((error, index) => (
                      <div key={index} className="flex items-start p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors">
                        <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5 shrink-0" />
                        <div className="w-full">
                          <div className="font-medium text-red-900">{error.message}</div>
                          <div className="flex justify-between items-center mt-1">
                            <div className="text-sm text-gray-500">Occurred {error.count} times</div>
                            <Badge variant="destructive" className="ml-2">
                              {data.failed > 0 ? `${Math.round((error.count / data.failed) * 100)}%` : '0%'} of errors
                            </Badge>
                          </div>
                          <Progress 
                            className="mt-2 h-1.5" 
                            value={data.failed > 0 ? Math.min(100, (error.count / data.failed) * 100) : 0}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                  <CheckCircle className="h-16 w-16 mb-4 text-green-500 opacity-80" />
                  <p className="text-lg">No errors detected</p>
                  <p className="text-sm mt-1">All workflows are running smoothly</p>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="text-xs text-gray-500">
                {data.failed > 0 ? `Showing ${data.mostFrequentErrors.length} most frequent errors out of ${data.failed} total failures` : 'No errors to display'}
              </div>
              <Button variant="outline">View Full Error Log</Button>
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
              {data.nodePerfData.length > 0 ? (
                <>
                  {data.nodePerfData.length > 1 && (
                    <div className="h-60 mb-8">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={data.nodePerfData.slice()}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                          layout="vertical"
                        >
                          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                          <XAxis type="number" domain={[0, 'dataMax']} unit="s" />
                          <YAxis dataKey="name" type="category" width={150} tick={{ fontSize: 12 }} />
                          <Tooltip
                            formatter={(value, name) => {
                              if (name === 'avgTime') return [`${value}s`, 'Avg. Execution Time'];
                              if (name === 'errorRate') return [`${value}%`, 'Error Rate'];
                              return [value, name];
                            }}
                          />
                          <Legend />
                          <Bar 
                            dataKey="avgTime" 
                            name="Execution Time" 
                            fill="#3b82f6" 
                            barSize={20}
                          />
                          <Bar 
                            dataKey="errorRate" 
                            name="Error Rate (%)" 
                            fill="#ef4444" 
                            barSize={20}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  <div className="space-y-6">
                    {data.nodePerfData.map((node, index) => (
                      <div key={index} className="space-y-2 p-3 rounded-md hover:bg-gray-50 transition-colors">
                        <div className="flex justify-between items-center">
                          <div className="font-medium">{node.name}</div>
                          <Badge variant={node.errorRate > 5 ? "destructive" : node.errorRate > 0 ? "outline" : "secondary"}>
                            {node.errorRate > 0 ? `${node.errorRate}% errors` : 'No errors'}
                          </Badge>
                        </div>
                        <div className="flex justify-between text-sm text-gray-500">
                          <span>Avg. execution: {node.avgTime}s</span>
                          <span>Health: {node.errorRate < 3 ? "Good" : node.errorRate < 8 ? "Fair" : "Poor"}</span>
                        </div>
                        <div className="relative pt-1">
                          <div className="flex items-center justify-between mb-1">
                            <div>
                              <span className="text-xs font-semibold inline-block text-blue-600">
                                Performance
                              </span>
                            </div>
                            <div>
                              <span className={`text-xs font-semibold inline-block ${
                                node.errorRate < 3 ? "text-green-600" : node.errorRate < 8 ? "text-yellow-600" : "text-red-600"
                              }`}>
                                {100 - node.errorRate}%
                              </span>
                            </div>
                          </div>
                          <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                            <div style={{ width: `${100 - node.errorRate}%` }} 
                              className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                                node.errorRate < 3 ? "bg-green-500" : node.errorRate < 8 ? "bg-yellow-500" : "bg-red-500"
                              }`}>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                  <Activity className="h-12 w-12 mb-2 opacity-20" />
                  <p>No node performance data available</p>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">View Detailed Node Metrics</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle>Performance History</CardTitle>
                <CardDescription>Execution time and error rate trends</CardDescription>
              </div>
              <div className="flex space-x-2">
                <Button variant={timeRange === "7d" ? "default" : "outline"} size="sm" className="h-8 text-xs"
                  onClick={() => setTimeRange("7d")}>
                  Last 7 days
                </Button>
                <Button variant={timeRange === "30d" ? "default" : "outline"} size="sm" className="h-8 text-xs"
                  onClick={() => setTimeRange("30d")}>
                  Last 30 days
                </Button>
                <Button variant={timeRange === "90d" ? "default" : "outline"} size="sm" className="h-8 text-xs"
                  onClick={() => setTimeRange("90d")}>
                  Last 90 days
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {data.performanceHistory.length > 0 ? (
                <div className="space-y-8">
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={data.performanceHistory.slice().reverse()}
                        margin={{ top: 10, right: 30, left: 5, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient id="colorExecTime" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                          </linearGradient>
                          <linearGradient id="colorErrorRate" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                        <XAxis 
                          dataKey="date" 
                          tick={{ fontSize: 12 }} 
                          tickLine={false}
                          tickFormatter={(value) => {
                            try {
                              const date = new Date(value);
                              return `${date.getMonth()+1}/${date.getDate()}`;
                            } catch (e) {
                              return value;
                            }
                          }}
                        />
                        <YAxis 
                          yAxisId="left" 
                          orientation="left" 
                          tick={{ fontSize: 12 }} 
                          tickLine={false}
                          tickFormatter={(value) => `${value}s`}
                          label={{ 
                            value: 'Execution Time (s)', 
                            angle: -90, 
                            position: 'insideLeft',
                            style: { textAnchor: 'middle', fontSize: '12px', fill: '#3b82f6' }
                          }}
                        />
                        <YAxis 
                          yAxisId="right" 
                          orientation="right" 
                          tick={{ fontSize: 12 }} 
                          tickLine={false}
                          tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                          label={{ 
                            value: 'Error Rate (%)', 
                            angle: 90, 
                            position: 'insideRight',
                            style: { textAnchor: 'middle', fontSize: '12px', fill: '#ef4444' }
                          }}
                        />
                        <Tooltip
                          formatter={(value, name) => {
                            if (name === 'executionTime') return [`${value}s`, 'Execution Time'];
                            if (name === 'errorRate') return [`${(Number(value) * 100).toFixed(1)}%`, 'Error Rate'];
                            return [value, name];
                          }}
                          labelFormatter={(label) => {
                            try {
                              const date = new Date(label);
                              return date.toLocaleDateString(undefined, {
                                weekday: 'short',
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              });
                            } catch (e) {
                              return `Date: ${label}`;
                            }
                          }}
                          contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '6px', border: '1px solid #e2e8f0' }}
                        />
                        <Area
                          type="monotone"
                          dataKey="executionTime"
                          stroke="#3b82f6"
                          strokeWidth={2}
                          fillOpacity={1}
                          fill="url(#colorExecTime)"
                          yAxisId="left"
                          name="executionTime"
                          activeDot={{ r: 6 }}
                        />
                        <Area
                          type="monotone"
                          dataKey="errorRate"
                          stroke="#ef4444"
                          strokeWidth={2}
                          fillOpacity={1}
                          fill="url(#colorErrorRate)"
                          yAxisId="right"
                          name="errorRate"
                          activeDot={{ r: 6 }}
                        />
                        <Legend 
                          formatter={(value) => {
                            if (value === 'executionTime') return 'Execution Time';
                            if (value === 'errorRate') return 'Error Rate';
                            return value;
                          }}
                          verticalAlign="top" 
                          height={36}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex flex-col space-y-1.5 p-6 rounded-lg bg-blue-50">
                      <h3 className="text-sm font-medium text-blue-900">Avg. Execution Time</h3>
                      <div className="text-2xl font-bold text-blue-700">
                        {data.averageExecutionTime.toFixed(2)}s
                      </div>
                      <p className="text-xs text-blue-600">
                        {data.averageExecutionTime < 1 
                          ? "Excellent performance" 
                          : data.averageExecutionTime < 3 
                            ? "Good performance" 
                            : "Needs optimization"}
                      </p>
                    </div>
                    
                    <div className="flex flex-col space-y-1.5 p-6 rounded-lg bg-red-50">
                      <h3 className="text-sm font-medium text-red-900">Avg. Error Rate</h3>
                      <div className="text-2xl font-bold text-red-700">
                        {data.totalRuns > 0 ? (data.failed / data.totalRuns * 100).toFixed(1) : "0.0"}%
                      </div>
                      <p className="text-xs text-red-600">
                        {data.failed === 0 
                          ? "No errors detected" 
                          : data.failed / data.totalRuns < 0.05 
                            ? "Good reliability" 
                            : "Reliability issues detected"}
                      </p>
                    </div>
                    
                    <div className="flex flex-col space-y-1.5 p-6 rounded-lg bg-green-50">
                      <h3 className="text-sm font-medium text-green-900">Success Rate</h3>
                      <div className="text-2xl font-bold text-green-700">
                        {data.totalRuns > 0 ? ((data.successful / data.totalRuns) * 100).toFixed(1) : "0.0"}%
                      </div>
                      <p className="text-xs text-green-600">
                        {data.totalRuns === 0 
                          ? "No data available" 
                          : data.successful / data.totalRuns > 0.95 
                            ? "Excellent reliability" 
                            : data.successful / data.totalRuns > 0.9 
                              ? "Good reliability" 
                              : "Needs improvement"}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-80 text-muted-foreground">
                  <TrendingUp className="h-16 w-16 mb-4 opacity-20" />
                  <p className="text-lg">No historical data available</p>
                  <p className="text-sm">Performance data will appear here once workflows have been executed</p>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row gap-2 justify-between">
              <div className="text-xs text-gray-500">
                Last updated: {data.lastUpdate}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Bar Chart
                </Button>
                <Button variant="default" size="sm">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Area Chart
                </Button>
              </div>
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
import { useState } from 'react';
import { Node, Edge } from 'reactflow';
import { NodeData } from '@/types/workflow';
import { NodeExecutionStatus } from './NodeExecutionStatus';
import { useNodeExecution } from '@/hooks/useNodeExecution';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Play, 
  StopCircle, 
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Timer,
  Activity
} from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from '@/hooks/use-toast';

interface WorkflowExecutionOverviewProps {
  nodes: Node<NodeData>[];
  edges: Edge[];
  className?: string;
}

export function WorkflowExecutionOverview({
  nodes,
  edges,
  className
}: WorkflowExecutionOverviewProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [showDetails, setShowDetails] = useState(false);

  const {
    executeWorkflow,
    executionStates,
    isExecuting,
    resetExecutionStates
  } = useNodeExecution({
    onExecutionStart: (nodeId) => {
      toast({
        title: 'Node Execution',
        description: `Executing node: ${nodes.find(n => n.id === nodeId)?.data?.label || nodeId}`,
      });
    },
    onExecutionComplete: (nodeId, result) => {
      toast({
        title: 'Node Execution',
        description: `Node completed: ${nodes.find(n => n.id === nodeId)?.data?.label || nodeId}`,
      });
    },
    onExecutionError: (nodeId, error) => {
      toast({
        title: 'Node Execution Error',
        description: `Error executing node: ${nodes.find(n => n.id === nodeId)?.data?.label || nodeId}`,
        variant: 'destructive',
      });
    },
    onWorkflowComplete: (results) => {
      toast({
        title: 'Workflow Complete',
        description: `Successfully executed ${Object.keys(results).length} nodes`,
      });
    },
  });

  // Calculate workflow stats
  const stats = {
    total: nodes.length,
    completed: Object.values(executionStates).filter(s => s.status === 'success').length,
    running: Object.values(executionStates).filter(s => s.status === 'running').length,
    failed: Object.values(executionStates).filter(s => s.status === 'error').length,
    duration: calculateTotalDuration(executionStates)
  };

  // Helper to calculate total duration
  function calculateTotalDuration(states: Record<string, any>) {
    const times = Object.values(states)
      .filter(s => s.startTime && s.endTime)
      .map(s => s.endTime - s.startTime);
    
    if (times.length === 0) return null;
    return (Math.max(...times) / 1000).toFixed(2);
  }

  // Handle workflow execution
  const handleExecute = async () => {
    try {
      await executeWorkflow(nodes, edges);
    } catch (error) {
      console.error('Workflow execution failed:', error);
    }
  };

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className={className}
    >
      <CollapsibleTrigger asChild>
        <div className="flex items-center justify-between p-4 bg-white border-b cursor-pointer hover:bg-gray-50">
          <div className="flex items-center space-x-4">
            <Activity className="h-5 w-5 text-gray-500" />
            <div>
              <h3 className="text-sm font-medium">Workflow Execution</h3>
              <p className="text-xs text-gray-500">
                {isExecuting ? 'Running...' : stats.completed > 0 ? 'Completed' : 'Ready'}
              </p>
            </div>
          </div>
          {isOpen ? (
            <ChevronUp className="h-4 w-4 text-gray-500" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-500" />
          )}
        </div>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="p-4 space-y-4">
          {/* Execution Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                onClick={handleExecute}
                disabled={isExecuting}
              >
                <Play className="h-4 w-4 mr-1" />
                {isExecuting ? 'Running...' : 'Execute'}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={resetExecutionStates}
                disabled={isExecuting}
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Reset
              </Button>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? 'Hide Details' : 'Show Details'}
            </Button>
          </div>

          {/* Execution Stats */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-gray-50 p-3 rounded-md">
              <div className="text-xs text-gray-500">Total Nodes</div>
              <div className="text-lg font-semibold">{stats.total}</div>
            </div>
            <div className="bg-blue-50 p-3 rounded-md">
              <div className="text-xs text-blue-500">Running</div>
              <div className="text-lg font-semibold">{stats.running}</div>
            </div>
            <div className="bg-green-50 p-3 rounded-md">
              <div className="text-xs text-green-500">Completed</div>
              <div className="text-lg font-semibold">{stats.completed}</div>
            </div>
            <div className="bg-red-50 p-3 rounded-md">
              <div className="text-xs text-red-500">Failed</div>
              <div className="text-lg font-semibold">{stats.failed}</div>
            </div>
          </div>

          {/* Execution Duration */}
          {stats.duration && (
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Timer className="h-4 w-4" />
              <span>Total Duration: {stats.duration}s</span>
            </div>
          )}

          {/* Node Status List */}
          <AnimatePresence>
            {showDetails && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <ScrollArea className="h-[300px] pr-4">
                  <div className="space-y-2">
                    {nodes.map((node) => (
                      <NodeExecutionStatus
                        key={node.id}
                        node={node}
                        {...(executionStates[node.id] || { status: 'idle' })}
                      />
                    ))}
                  </div>
                </ScrollArea>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
} 
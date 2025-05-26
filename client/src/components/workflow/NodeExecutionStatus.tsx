import { motion } from 'framer-motion';
import { Node } from 'reactflow';
import { NodeData } from '@/types/workflow';
import { Loader2, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NodeExecutionStatusProps {
  node: Node<NodeData>;
  status: 'idle' | 'running' | 'success' | 'error';
  result?: any;
  error?: Error;
  startTime?: number;
  endTime?: number;
  className?: string;
}

export function NodeExecutionStatus({
  node,
  status,
  result,
  error,
  startTime,
  endTime,
  className
}: NodeExecutionStatusProps) {
  // Calculate execution duration
  const duration = startTime && endTime ? ((endTime - startTime) / 1000).toFixed(2) : null;

  // Get status color
  const getStatusColor = () => {
    switch (status) {
      case 'running':
        return 'text-blue-500';
      case 'success':
        return 'text-green-500';
      case 'error':
        return 'text-red-500';
      default:
        return 'text-gray-400';
    }
  };

  // Get status icon
  const StatusIcon = () => {
    switch (status) {
      case 'running':
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'success':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'error':
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className={cn(
        'flex items-center space-x-2 rounded-md border p-2',
        status === 'error' ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-white',
        className
      )}
    >
      {/* Status Icon */}
      <div className={cn('flex-shrink-0', getStatusColor())}>
        <StatusIcon />
      </div>

      {/* Status Details */}
      <div className="flex-grow min-w-0">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-900 truncate">
            {node.data?.label || 'Unknown Node'}
          </span>
          {duration && (
            <span className="text-xs text-gray-500">
              {duration}s
            </span>
          )}
        </div>

        {/* Status Message */}
        <div className="text-xs text-gray-500 truncate">
          {status === 'running' && 'Executing...'}
          {status === 'success' && (
            typeof result === 'object' 
              ? 'Completed successfully'
              : String(result)
          )}
          {status === 'error' && (
            <span className="text-red-600">
              {error?.message || 'Execution failed'}
            </span>
          )}
          {status === 'idle' && 'Waiting to execute'}
        </div>
      </div>

      {/* Execution Progress */}
      {status === 'running' && (
        <motion.div
          className="absolute bottom-0 left-0 h-0.5 bg-blue-500"
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'linear'
          }}
        />
      )}
    </motion.div>
  );
} 
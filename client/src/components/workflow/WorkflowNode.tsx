import React, { useState } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { NodeData } from '@/store/useWorkflowStore';
import { WorkflowStateIndicator } from './StateChangeAnimation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Zap,
  MoreHorizontal,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

export default function WorkflowNode({ 
  data, 
  selected, 
  id 
}: NodeProps<NodeData>) {
  const { label, description, state = 'idle', optimized = false } = data;
  const [showSourceTooltip, setShowSourceTooltip] = useState(false);
  const [showTargetTooltip, setShowTargetTooltip] = useState(false);
  
  // Get icon dynamically if specified
  const getIcon = () => {
    if (!data.icon) return null;
    
    // Placeholder to render an icon
    return null;
  };
  
  // Helper to get connection status message
  const getConnectionStatusMessage = (type: 'source' | 'target') => {
    const status = type === 'source' ? data.sourceConnectionStatus : data.targetConnectionStatus;
    
    if (!data.connectionValidated) {
      return "Connection not validated";
    }
    
    if (status === 'success') {
      return type === 'source' 
        ? "Output connection validated successfully" 
        : "Input connection validated successfully";
    }
    
    if (status === 'error') {
      return type === 'source' 
        ? "Output connection has validation errors" 
        : "Input connection has validation errors";
    }
    
    if (status === 'pending') {
      return "Connection validation in progress...";
    }
    
    return type === 'source' ? "Output connection" : "Input connection";
  };
  
  return (
    <div className={`
      workflow-node
      ${selected ? 'ring-2 ring-primary' : ''}
      ${optimized ? 'optimized-node' : ''}
    `}>
      <Card className="min-w-[220px] shadow-md border-none">
        <CardHeader className="py-3 px-4 flex flex-row items-center justify-between bg-card">
          <div className="flex items-center gap-2">
            {getIcon()}
            <CardTitle className="text-base m-0 font-medium">
              {label}
            </CardTitle>
          </div>
          
          <div className="flex items-center">
            {optimized && (
              <Badge variant="outline" className="mr-2 bg-emerald-50 text-emerald-700 border-emerald-200">
                Optimized
              </Badge>
            )}
            
            <WorkflowStateIndicator
              state={state}
              size="sm"
            />
          </div>
        </CardHeader>
        
        <CardContent className="px-4 py-3 text-sm">
          <p className="text-muted-foreground text-xs mb-2">{description || 'Generic workflow node'}</p>
          
          <div className="flex justify-between items-center">
            <div className="text-xs">
              {data.nodeType && (
                <Badge variant="outline" className="mr-1">
                  {data.nodeType}
                </Badge>
              )}
            </div>
            
            {/* Removed "Run it" option per user request */}
            {/* Node operations will be handled at workflow level instead */}
          </div>
        </CardContent>
      </Card>
      
      {/* Handles for connections with visual status indicators */}
      <TooltipProvider>
        <Tooltip open={showTargetTooltip}>
          <TooltipTrigger asChild>
            <div 
              className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center"
              onMouseEnter={() => setShowTargetTooltip(true)}
              onMouseLeave={() => setShowTargetTooltip(false)}
            >
              <Handle
                type="target"
                position={Position.Top}
                className={`w-3 h-3 rounded-full border-2 transition-colors duration-300 ${
                  data.targetConnectionStatus === 'error' 
                    ? 'bg-red-500 border-red-300 animate-pulse' 
                    : data.targetConnectionStatus === 'success' 
                      ? 'bg-green-500 border-green-300' 
                      : 'bg-slate-400 border-white'
                }`}
              />
              {data.targetConnectionStatus && (
                <div className="absolute top-0 left-full ml-2 w-4 h-4 pointer-events-none">
                  {data.targetConnectionStatus === 'success' ? (
                    <CheckCircle className="h-3 w-3 text-green-500" />
                  ) : data.targetConnectionStatus === 'error' ? (
                    <XCircle className="h-3 w-3 text-red-500" />
                  ) : null}
                </div>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent side="top" className="z-50">
            <div className="flex flex-col gap-1">
              <div className="flex gap-2 items-center">
                <ArrowDown className="h-3 w-3" />
                <span className="text-xs font-medium">Input Connection</span>
              </div>
              <div className="text-xs text-slate-500">
                {getConnectionStatusMessage('target')}
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <TooltipProvider>
        <Tooltip open={showSourceTooltip}>
          <TooltipTrigger asChild>
            <div 
              className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-6 h-6 flex items-center justify-center"
              onMouseEnter={() => setShowSourceTooltip(true)}
              onMouseLeave={() => setShowSourceTooltip(false)}
            >
              <Handle
                type="source"
                position={Position.Bottom}
                className={`w-3 h-3 rounded-full border-2 transition-colors duration-300 ${
                  data.sourceConnectionStatus === 'error' 
                    ? 'bg-red-500 border-red-300 animate-pulse' 
                    : data.sourceConnectionStatus === 'success' 
                      ? 'bg-green-500 border-green-300' 
                      : 'bg-slate-400 border-white'
                }`}
              />
              {data.sourceConnectionStatus && (
                <div className="absolute bottom-0 left-full ml-2 w-4 h-4 pointer-events-none">
                  {data.sourceConnectionStatus === 'success' ? (
                    <CheckCircle className="h-3 w-3 text-green-500" />
                  ) : data.sourceConnectionStatus === 'error' ? (
                    <XCircle className="h-3 w-3 text-red-500" />
                  ) : null}
                </div>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="z-50">
            <div className="flex flex-col gap-1">
              <div className="flex gap-2 items-center">
                <ArrowUp className="h-3 w-3" />
                <span className="text-xs font-medium">Output Connection</span>
              </div>
              <div className="text-xs text-slate-500">
                {getConnectionStatusMessage('source')}
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
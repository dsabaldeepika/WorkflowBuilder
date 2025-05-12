import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { NodeData } from '@/store/useWorkflowStore';
import { WorkflowStateIndicator } from './StateChangeAnimation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Zap,
  MoreHorizontal
} from 'lucide-react';

export default function WorkflowNode({ 
  data, 
  selected, 
  id 
}: NodeProps<NodeData>) {
  const { label, description, state = 'idle', optimized = false } = data;
  
  // Get icon dynamically if specified
  const getIcon = () => {
    if (!data.icon) return null;
    
    // Placeholder to render an icon
    return null;
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
      
      {/* Handles for connections */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 rounded-full bg-slate-400 border-2 border-white"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 rounded-full bg-slate-400 border-2 border-white"
      />
    </div>
  );
}
import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { NodeData } from '@/store/useWorkflowStore';
import { WorkflowStateIndicator } from './StateChangeAnimation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { NodeContextMenu } from './NodeContextMenu';
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
  const { 
    label, 
    description, 
    state = 'idle', 
    optimized = false,
    // Color customization options
    backgroundColor, 
    borderColor,
    color,
    colorLabel,
    theme = 'default'
  } = data;
  
  // Get icon dynamically if specified
  const getIcon = () => {
    if (!data.icon) return null;
    
    // Placeholder to render an icon
    return null;
  };

  // Define styles for custom colors
  const cardStyle = {
    backgroundColor: backgroundColor || undefined,
    borderColor: borderColor || undefined,
    ...(borderColor ? { borderWidth: '1px', borderStyle: 'solid' } : {})
  };

  const headerStyle = {
    backgroundColor: backgroundColor ? backgroundColor : undefined,
    color: color || undefined
  };

  const contentStyle = {
    backgroundColor: backgroundColor ? backgroundColor : undefined,
    color: color || undefined
  };

  return (
    <NodeContextMenu nodeId={id}>
      <div className={`
        workflow-node
        ${selected ? 'ring-2 ring-primary' : ''}
        ${optimized ? 'optimized-node' : ''}
      `}>
        <Card 
          className={`min-w-[220px] shadow-md ${borderColor ? '' : 'border-none'}`}
          style={cardStyle}
        >
          <CardHeader 
            className="py-3 px-4 flex flex-row items-center justify-between" 
            style={headerStyle}
          >
            <div className="flex items-center gap-2">
              {getIcon()}
              <CardTitle 
                className="text-base m-0 font-medium"
                style={{ color: color || undefined }}
              >
                {label}
              </CardTitle>
            </div>
            
            <div className="flex items-center">
              {colorLabel && (
                <Badge 
                  variant="outline" 
                  className="mr-2 text-[10px] px-1.5 py-0 h-4"
                  style={{
                    backgroundColor: backgroundColor ? `${backgroundColor}99` : undefined,
                    borderColor: borderColor || undefined,
                    color: color || undefined
                  }}
                >
                  {colorLabel}
                </Badge>
              )}
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
          
          <CardContent 
            className="px-4 py-3 text-sm"
            style={contentStyle}
          >
            <p 
              className="text-xs mb-2"
              style={{ color: color ? `${color}99` : undefined }}
            >
              {description || 'Generic workflow node'}
            </p>
            
            <div className="flex justify-between items-center">
              <div className="text-xs">
                {data.nodeType && (
                  <Badge 
                    variant="outline" 
                    className="mr-1"
                    style={{
                      backgroundColor: backgroundColor ? `${backgroundColor}80` : undefined,
                      borderColor: borderColor || undefined,
                      color: color || undefined
                    }}
                  >
                    {data.nodeType}
                  </Badge>
                )}
              </div>
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
    </NodeContextMenu>
  );
}
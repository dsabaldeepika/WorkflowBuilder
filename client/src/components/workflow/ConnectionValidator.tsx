import React, { useCallback, useMemo } from 'react';
import { EdgeProps, getBezierPath, EdgeText } from 'reactflow';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ConnectionValidation } from '@/types/workflow';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const connectionRules = {
  // Define which node types can be connected to which node types
  'trigger': ['action', 'condition', 'integration'],
  'action': ['action', 'condition', 'integration', 'data', 'agent'],
  'condition': ['action', 'condition', 'integration', 'data', 'agent'],
  'data': ['action', 'condition', 'integration', 'data'],
  'integration': ['action', 'condition', 'integration', 'data', 'agent'],
  'agent': ['action', 'condition', 'integration', 'data'],
  'default': ['action', 'condition', 'integration', 'data', 'agent']
};

// The function that validates a connection
export const validateConnection = (
  sourceNodeType: string, 
  targetNodeType: string
): ConnectionValidation => {
  // Get allowed connections for source node type
  const allowedTargets = connectionRules[sourceNodeType as keyof typeof connectionRules] || connectionRules.default;
  
  const isValid = allowedTargets.includes(targetNodeType);
  
  let message = isValid 
    ? 'Connection valid'
    : `Cannot connect ${sourceNodeType} node to ${targetNodeType} node`;
  
  return {
    isValid,
    message,
    source: sourceNodeType,
    target: targetNodeType
  };
};

// Edge component that shows validation feedback
export const ValidatedEdge = ({
  id,
  source,
  target,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  selected,
  style = {},
  markerEnd,
  data
}: EdgeProps) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  // Memoized validation state
  const validation = useMemo(() => {
    // Default to valid
    if (!data || !data.sourceNodeType || !data.targetNodeType) {
      return { isValid: true, message: 'Connection valid' };
    }
    
    return validateConnection(data.sourceNodeType, data.targetNodeType);
  }, [data]);
  
  // Path styles based on validation and selection
  const pathStyles = useMemo(() => {
    if (!validation.isValid) {
      return {
        stroke: '#f43f5e', // rose-500
        strokeWidth: selected ? 3 : 2,
        strokeDasharray: '5,5',
      };
    }
    
    if (selected) {
      return {
        stroke: '#06b6d4', // cyan-500
        strokeWidth: 3,
      };
    }
    
    // Default style
    return {
      stroke: '#94a3b8', // slate-400
      strokeWidth: 2,
    };
  }, [validation.isValid, selected]);

  return (
    <>
      <path
        id={id}
        className="react-flow__edge-path"
        d={edgePath}
        style={{ ...style, ...pathStyles }}
        markerEnd={markerEnd}
      />
      
      {/* Only show validations when edge is selected or invalid */}
      {(selected || !validation.isValid) && (
        <EdgeText
          x={labelX}
          y={labelY}
          label={
            <div className={cn(
              "px-2 py-1 rounded-md shadow-sm",
              validation.isValid ? "bg-white/95" : "bg-white/95"
            )}>
              <Badge variant={validation.isValid ? "success" : "destructive"} className="flex items-center gap-1 whitespace-nowrap">
                {validation.isValid ? (
                  <>
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Valid Connection</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-3 h-3" />
                    <span>Invalid Connection</span>
                  </>
                )}
              </Badge>
              
              {!validation.isValid && (
                <p className="text-xs text-rose-600 mt-1">
                  {validation.message}
                </p>
              )}
            </div>
          }
          labelStyle={{ fill: 'white' }}
          labelShowBg={false}
        />
      )}
    </>
  );
};

// Edge with a fix button for invalid connections
export const FixableEdge = ({
  id,
  source,
  target,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  selected,
  style = {},
  markerEnd,
  data,
  onFix,
}: EdgeProps & { onFix?: (edgeId: string) => void }) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  // Validation state
  const validation = useMemo(() => {
    if (!data || !data.sourceNodeType || !data.targetNodeType) {
      return { isValid: true, message: 'Connection valid' };
    }
    
    return validateConnection(data.sourceNodeType, data.targetNodeType);
  }, [data]);
  
  // Handle fix button click
  const handleFixClick = useCallback(() => {
    if (onFix) {
      onFix(id);
    }
  }, [id, onFix]);

  // Path styles based on validation and selection
  const pathStyles = useMemo(() => {
    if (!validation.isValid) {
      return {
        stroke: '#f43f5e', // rose-500
        strokeWidth: selected ? 3 : 2,
        strokeDasharray: '5,5',
      };
    }
    
    if (selected) {
      return {
        stroke: '#06b6d4', // cyan-500
        strokeWidth: 3,
      };
    }
    
    // Default style
    return {
      stroke: '#94a3b8', // slate-400
      strokeWidth: 2,
    };
  }, [validation.isValid, selected]);

  return (
    <>
      <path
        id={id}
        className="react-flow__edge-path"
        d={edgePath}
        style={{ ...style, ...pathStyles }}
        markerEnd={markerEnd}
      />
      
      {!validation.isValid && (
        <EdgeText
          x={labelX}
          y={labelY}
          label={
            <div className="px-3 py-2 rounded-md bg-white/95 shadow-sm">
              <Badge variant="destructive" className="flex items-center gap-1 whitespace-nowrap">
                <AlertTriangle className="w-3 h-3" />
                <span>Invalid Connection</span>
              </Badge>
              
              <p className="text-xs text-rose-600 mt-1">
                {validation.message}
              </p>
              
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full mt-2 text-xs" 
                onClick={handleFixClick}
              >
                Fix Connection
              </Button>
            </div>
          }
          labelStyle={{ fill: 'white' }}
          labelShowBg={false}
        />
      )}
    </>
  );
};
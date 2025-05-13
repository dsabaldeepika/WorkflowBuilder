import React, { useState, useEffect, useMemo } from 'react';
import { Node, Edge, EdgeProps, getBezierPath } from 'reactflow';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { NodeData } from '@/store/useWorkflowStore';
import { ConnectionValidation } from '@/types/workflow';

// Custom edge component for validated connections
export const ValidatedEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data,
  markerEnd,
}: EdgeProps) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  // Use different colors based on validation status or condition type
  const getEdgeColor = () => {
    if (data?.invalid) return '#ef4444'; // Red for invalid connections
    if (data?.condition === 'true') return '#22c55e'; // Green for true conditions
    if (data?.condition === 'false') return '#f97316'; // Orange for false conditions
    return '#94a3b8'; // Default edge color
  };

  return (
    <>
      <path
        id={id}
        style={{
          ...style,
          strokeWidth: 2,
          stroke: getEdgeColor(),
        }}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={markerEnd}
      />
      {data?.condition && (
        <text
          x={labelX}
          y={labelY}
          className="text-xs fill-current"
          dominantBaseline="middle"
          textAnchor="middle"
          style={{
            fontSize: '10px',
            fontWeight: 'bold',
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        >
          {data.condition.charAt(0).toUpperCase() + data.condition.slice(1)}
        </text>
      )}
    </>
  );
};

interface ConnectionValidatorProps {
  nodes: Node<NodeData>[];
  edges: Edge[];
  onValidationComplete?: (validations: ConnectionValidation[]) => void;
  className?: string;
}

export const ConnectionValidator: React.FC<ConnectionValidatorProps> = ({
  nodes,
  edges,
  onValidationComplete,
  className
}) => {
  const [validations, setValidations] = useState<ConnectionValidation[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [validationComplete, setValidationComplete] = useState(false);

  // Perform validation when requested
  const validateConnections = () => {
    setIsValidating(true);
    setValidationComplete(false);
    setValidations([]);
    
    // Short delay to show loading state
    setTimeout(() => {
      const newValidations = edges.map(edge => {
        const sourceNode = nodes.find(n => n.id === edge.source);
        const targetNode = nodes.find(n => n.id === edge.target);
        
        if (!sourceNode || !targetNode) {
          return {
            isValid: false,
            message: 'Connected node does not exist',
            source: edge.source,
            target: edge.target
          };
        }
        
        // Check if source node is a trigger and has multiple outgoing connections
        if (sourceNode.data.nodeType === 'trigger' || sourceNode.data.type === 'trigger') {
          const outgoingEdges = edges.filter(e => e.source === sourceNode.id);
          if (outgoingEdges.length > 1) {
            return {
              isValid: false,
              message: 'Trigger nodes should have only one outgoing connection',
              source: edge.source,
              target: edge.target
            };
          }
        }
        
        // Check if source is a condition and the edge has no condition data
        if ((sourceNode.data.nodeType === 'condition' || sourceNode.data.type === 'condition') && 
            !edge.data?.condition) {
          return {
            isValid: false,
            message: 'Condition nodes require condition values on connections',
            source: edge.source,
            target: edge.target
          };
        }
        
        // Check for compatible data types (basic implementation)
        // In a real scenario, we'd check output fields of source against input fields of target
        if (sourceNode.data.outputFields && targetNode.data.inputFields) {
          // This is just a placeholder for real type checking logic
          const hasIncompatibleTypes = false; 
          
          if (hasIncompatibleTypes) {
            return {
              isValid: false,
              message: 'Incompatible data types between connected nodes',
              source: edge.source,
              target: edge.target
            };
          }
        }
        
        // Pass validation
        return {
          isValid: true,
          source: edge.source,
          target: edge.target
        };
      });
      
      setValidations(newValidations);
      setIsValidating(false);
      setValidationComplete(true);
      
      if (onValidationComplete) {
        onValidationComplete(newValidations);
      }
    }, 1000);
  };
  
  // Calculate validation stats
  const validCount = validations.filter(v => v.isValid).length;
  const invalidCount = validations.length - validCount;
  const hasErrors = invalidCount > 0;
  
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <AlertTriangle className="mr-2 h-5 w-5 text-primary" />
          Connection Validator
        </CardTitle>
        <CardDescription>
          Validate connections between workflow nodes
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {edges.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No connections to validate.</p>
            <p className="text-sm">Add connections between nodes first.</p>
          </div>
        ) : (
          <>
            <Button 
              onClick={validateConnections} 
              disabled={isValidating || edges.length === 0}
              className="w-full"
            >
              {isValidating ? 'Validating...' : 'Validate Connections'}
            </Button>
            
            {validationComplete && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">{validations.length} Connection{validations.length !== 1 ? 's' : ''}</Badge>
                    <Badge variant={hasErrors ? 'destructive' : 'success'}>
                      {hasErrors ? `${invalidCount} Issue${invalidCount !== 1 ? 's' : ''}` : 'All Valid'}
                    </Badge>
                  </div>
                </div>
                
                {validations.map((validation, index) => {
                  const sourceNode = nodes.find(n => n.id === validation.source);
                  const targetNode = nodes.find(n => n.id === validation.target);
                  
                  return (
                    <Alert key={index} variant={validation.isValid ? 'default' : 'destructive'}>
                      <div className="flex items-start">
                        {validation.isValid ? (
                          <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 mr-2" />
                        ) : (
                          <XCircle className="h-4 w-4 text-rose-500 mt-0.5 mr-2" />
                        )}
                        <div>
                          <AlertTitle>
                            {sourceNode?.data.label || validation.source} → {targetNode?.data.label || validation.target}
                          </AlertTitle>
                          <AlertDescription>
                            {validation.isValid
                              ? 'Connection is valid'
                              : validation.message || 'Connection has validation issues'}
                          </AlertDescription>
                        </div>
                      </div>
                    </Alert>
                  );
                })}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ConnectionValidator;
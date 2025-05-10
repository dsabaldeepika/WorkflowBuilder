import React, { useState, useEffect } from 'react';
import { Edge, Node, NodeProps, Connection, useReactFlow } from 'reactflow';
import { AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';

export type NodeType = 'trigger' | 'action' | 'condition' | 'data' | 'integration';
export type Port = 'input' | 'output';
export type DataType = 'string' | 'number' | 'boolean' | 'object' | 'array' | 'any';
export type ValidationStatus = 'valid' | 'invalid' | 'warning' | 'checking';

export interface PortSchema {
  id: string;
  type: Port;
  dataType: DataType;
  required?: boolean;
  allowedConnections?: NodeType[];
  validationRules?: ValidationRule[];
}

export interface ValidationRule {
  type: 'dataType' | 'format' | 'range' | 'custom';
  validate: (sourceValue: any, targetValue: any) => { isValid: boolean; message?: string };
}

// Default validation rules
export const defaultValidationRules = {
  dataType: (sourceDataType: DataType, targetDataType: DataType): ValidationRule => ({
    type: 'dataType',
    validate: () => {
      if (sourceDataType === 'any' || targetDataType === 'any') {
        return { isValid: true };
      }
      if (sourceDataType === targetDataType) {
        return { isValid: true };
      }
      if (sourceDataType === 'number' && targetDataType === 'string') {
        return { isValid: true, message: 'Number will be converted to string' };
      }
      return { 
        isValid: false, 
        message: `Type mismatch: Cannot connect ${sourceDataType} to ${targetDataType}` 
      };
    }
  }),
  
  required: (): ValidationRule => ({
    type: 'format',
    validate: (source, target) => {
      if (target && target.required && !source) {
        return { isValid: false, message: 'Required field cannot be connected to empty source' };
      }
      return { isValid: true };
    }
  }),
  
  nodeTypeCompatibility: (allowedTypes: NodeType[] = []): ValidationRule => ({
    type: 'custom',
    validate: (sourceNode, targetNode) => {
      if (allowedTypes.length === 0 || allowedTypes.includes(targetNode.type as NodeType)) {
        return { isValid: true };
      }
      return { 
        isValid: false, 
        message: `Invalid connection: ${sourceNode.type} cannot connect to ${targetNode.type}` 
      };
    }
  })
};

// Connection validation hook
export function useConnectionValidator() {
  const { getNode, getEdges, setEdges } = useReactFlow();
  const [validationResults, setValidationResults] = useState<Record<string, {
    status: ValidationStatus;
    message?: string;
    edgeId: string;
  }>>({});
  
  // Validate all connections
  const validateConnections = () => {
    const edges = getEdges();
    const newResults: Record<string, any> = {};
    
    edges.forEach(edge => {
      const sourceNode = getNode(edge.source);
      const targetNode = getNode(edge.target);
      
      if (!sourceNode || !targetNode) return;
      
      const result = validateConnection(sourceNode, targetNode, edge.sourceHandle, edge.targetHandle);
      newResults[edge.id] = {
        status: result.isValid ? 'valid' : 'invalid',
        message: result.message,
        edgeId: edge.id
      };
    });
    
    setValidationResults(newResults);
    return newResults;
  };
  
  // Validate a single connection
  const validateConnection = (
    sourceNode: Node, 
    targetNode: Node, 
    sourceHandleId?: string | null, 
    targetHandleId?: string | null
  ) => {
    // Get node data with port schemas
    const sourceData = sourceNode.data;
    const targetData = targetNode.data;
    
    // Find the specific port schemas
    const sourcePort = sourceData.ports?.find((p: PortSchema) => 
      p.id === sourceHandleId && p.type === 'output'
    );
    
    const targetPort = targetData.ports?.find((p: PortSchema) => 
      p.id === targetHandleId && p.type === 'input'
    );
    
    // If port schemas are not defined, allow the connection
    if (!sourcePort || !targetPort) {
      return { isValid: true };
    }
    
    // Check data type compatibility
    const dataTypeRule = defaultValidationRules.dataType(sourcePort.dataType, targetPort.dataType);
    const dataTypeResult = dataTypeRule.validate(sourceData, targetData);
    
    if (!dataTypeResult.isValid) {
      return dataTypeResult;
    }
    
    // Check required fields
    if (targetPort.required) {
      const requiredRule = defaultValidationRules.required();
      const requiredResult = requiredRule.validate(sourceData, targetData);
      
      if (!requiredResult.isValid) {
        return requiredResult;
      }
    }
    
    // Check node type compatibility
    if (targetPort.allowedConnections && targetPort.allowedConnections.length > 0) {
      const nodeTypeRule = defaultValidationRules.nodeTypeCompatibility(targetPort.allowedConnections);
      const nodeTypeResult = nodeTypeRule.validate(sourceNode, targetNode);
      
      if (!nodeTypeResult.isValid) {
        return nodeTypeResult;
      }
    }
    
    // Run custom validation rules if defined
    if (targetPort.validationRules && targetPort.validationRules.length > 0) {
      for (const rule of targetPort.validationRules) {
        const result = rule.validate(sourceData, targetData);
        if (!result.isValid) {
          return result;
        }
      }
    }
    
    return { isValid: true };
  };
  
  // Check if a connection can be created
  const isValidConnection = (connection: Connection): boolean => {
    const { source, target, sourceHandle, targetHandle } = connection;
    
    if (!source || !target) return false;
    
    const sourceNode = getNode(source);
    const targetNode = getNode(target);
    
    if (!sourceNode || !targetNode) return false;
    
    const result = validateConnection(sourceNode, targetNode, sourceHandle, targetHandle);
    return result.isValid;
  };
  
  return {
    validateConnections,
    validateConnection,
    isValidConnection,
    validationResults,
  };
}

// Custom edge component with validation indicator
export function ValidatedEdge({ id, source, target, sourceX, sourceY, targetX, targetY, style = {} }) {
  const [isValid, setIsValid] = useState<ValidationStatus>('checking');
  const [message, setMessage] = useState<string | undefined>();
  const { validateConnection, validationResults } = useConnectionValidator();
  const { getNode } = useReactFlow();
  
  useEffect(() => {
    // Check if we have validation results for this edge
    if (validationResults[id]) {
      setIsValid(validationResults[id].status);
      setMessage(validationResults[id].message);
      return;
    }
    
    // Otherwise, validate it now
    const sourceNode = getNode(source);
    const targetNode = getNode(target);
    
    if (sourceNode && targetNode) {
      const result = validateConnection(sourceNode, targetNode);
      setIsValid(result.isValid ? 'valid' : 'invalid');
      setMessage(result.message);
    }
  }, [id, source, target, validateConnection, getNode, validationResults]);
  
  // Calculate edge path
  const edgePath = `M ${sourceX} ${sourceY} C ${sourceX + 50} ${sourceY}, ${targetX - 50} ${targetY}, ${targetX} ${targetY}`;
  
  return (
    <g>
      <path
        id={id}
        className={`react-flow__edge-path transition-all duration-300 ${
          isValid === 'valid' ? 'stroke-emerald-500' : 
          isValid === 'invalid' ? 'stroke-red-500' : 
          isValid === 'warning' ? 'stroke-amber-500' : 'stroke-slate-300'
        }`}
        d={edgePath}
        strokeWidth={2}
        markerEnd="url(#react-flow__arrowhead)"
        style={style}
      />
      
      {/* Validation indicator */}
      {isValid !== 'checking' && (
        <foreignObject
          width={20}
          height={20}
          x={(sourceX + targetX) / 2 - 10}
          y={(sourceY + targetY) / 2 - 10}
          requiredExtensions="http://www.w3.org/1999/xhtml"
        >
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="rounded-full bg-white w-5 h-5 flex items-center justify-center shadow-sm border">
                  {isValid === 'valid' && <CheckCircle className="w-4 h-4 text-emerald-500" />}
                  {isValid === 'invalid' && <XCircle className="w-4 h-4 text-red-500" />}
                  {isValid === 'warning' && <AlertCircle className="w-4 h-4 text-amber-500" />}
                </div>
              </TooltipTrigger>
              <TooltipContent side="top">
                {isValid === 'valid' ? 
                  'Valid connection' : 
                  message || 'Invalid connection'
                }
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </foreignObject>
      )}
    </g>
  );
}

// Connection validator component that runs validation on all edges
export function ConnectionValidatorControl() {
  const { validateConnections, validationResults } = useConnectionValidator();
  const [showResults, setShowResults] = useState(false);
  
  const validCount = Object.values(validationResults).filter(r => r.status === 'valid').length;
  const invalidCount = Object.values(validationResults).filter(r => r.status === 'invalid').length;
  const warningCount = Object.values(validationResults).filter(r => r.status === 'warning').length;
  
  return (
    <div className="absolute bottom-4 right-4 z-10">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.button
              className={`flex items-center justify-center w-10 h-10 rounded-full shadow-md ${
                invalidCount > 0 ? 'bg-red-500 text-white' :
                warningCount > 0 ? 'bg-amber-500 text-white' : 
                'bg-emerald-500 text-white'
              }`}
              onClick={() => {
                validateConnections();
                setShowResults(!showResults);
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {invalidCount > 0 ? 
                <XCircle className="w-5 h-5" /> : 
                warningCount > 0 ? 
                  <AlertCircle className="w-5 h-5" /> : 
                  <CheckCircle className="w-5 h-5" />
              }
            </motion.button>
          </TooltipTrigger>
          <TooltipContent side="left">
            {invalidCount > 0 ? 
              `${invalidCount} invalid connections` : 
              warningCount > 0 ? 
                `${warningCount} warnings` : 
                'All connections are valid'
            }
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <AnimatePresence>
        {showResults && (
          <motion.div
            className="absolute bottom-12 right-0 w-72 bg-white rounded-lg shadow-lg overflow-hidden"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            <div className="p-3 border-b bg-slate-50">
              <h3 className="font-medium">Connection Validation</h3>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {Object.entries(validationResults).length > 0 ? (
                Object.entries(validationResults).map(([edgeId, result]) => (
                  <div key={edgeId} className="p-2 border-b last:border-0 flex items-center">
                    <div className="mr-2">
                      {result.status === 'valid' && <CheckCircle className="w-4 h-4 text-emerald-500" />}
                      {result.status === 'invalid' && <XCircle className="w-4 h-4 text-red-500" />}
                      {result.status === 'warning' && <AlertCircle className="w-4 h-4 text-amber-500" />}
                    </div>
                    <div className="flex-1 text-sm">
                      <p className={`${result.status === 'invalid' ? 'text-red-600' : 'text-slate-700'}`}>
                        {result.message || (result.status === 'valid' ? 'Valid connection' : 'Invalid connection')}
                      </p>
                      <p className="text-xs text-slate-500">Edge: {edgeId}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-sm text-slate-500">
                  No connections to validate
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
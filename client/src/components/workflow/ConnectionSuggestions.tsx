import React, { useState, useEffect } from 'react';
import { Node, Edge, useReactFlow, Position } from 'reactflow';
import { motion, AnimatePresence } from 'framer-motion';
import { NodeData } from '@/store/useWorkflowStore';
import { Zap, ArrowRightCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NodeCompatibility {
  sourceType: string;
  targetType: string;
  compatibility: number; // 0-100 score
  suggestion: string;
}

// Node type compatibility matrix
// This defines which node types work well together
const nodeCompatibilityRules: NodeCompatibility[] = [
  // Trigger to Action connections
  { sourceType: 'trigger', targetType: 'action', compatibility: 95, suggestion: 'Triggers naturally connect to actions' },
  { sourceType: 'webhook', targetType: 'api', compatibility: 90, suggestion: 'Webhooks work perfectly with API calls' },
  { sourceType: 'schedule', targetType: 'email', compatibility: 85, suggestion: 'Scheduled email sending is a common pattern' },
  
  // Action to Action connections
  { sourceType: 'api', targetType: 'transformer', compatibility: 80, suggestion: 'Transform API responses before the next step' },
  { sourceType: 'transformer', targetType: 'action', compatibility: 75, suggestion: 'Use transformed data in your next action' },
  { sourceType: 'action', targetType: 'action', compatibility: 70, suggestion: 'Chain multiple actions together for complex workflows' },
  
  // Conditional flows
  { sourceType: 'condition', targetType: 'action', compatibility: 85, suggestion: 'Trigger actions based on specific conditions' },
  { sourceType: 'filter', targetType: 'action', compatibility: 80, suggestion: 'Filter data before passing to the next action' },
  { sourceType: 'action', targetType: 'condition', compatibility: 75, suggestion: 'Evaluate conditions after actions complete' },
  
  // AI nodes
  { sourceType: 'action', targetType: 'openai', compatibility: 85, suggestion: 'Process data with AI' },
  { sourceType: 'openai', targetType: 'action', compatibility: 80, suggestion: 'Take action based on AI processing' },
  
  // Data processing
  { sourceType: 'api', targetType: 'filter', compatibility: 75, suggestion: 'Filter API responses before proceeding' },
  { sourceType: 'api', targetType: 'code', compatibility: 85, suggestion: 'Process API responses with custom code' },
  { sourceType: 'code', targetType: 'action', compatibility: 80, suggestion: 'Execute actions with processed data' },
  
  // Fallback for any connection
  { sourceType: '*', targetType: '*', compatibility: 50, suggestion: 'These nodes can be connected but might need configuration' },
];

// Path animation variants
const pathVariants = {
  initial: {
    opacity: 0,
    pathLength: 0,
    strokeDasharray: [0, 1],
  },
  animate: {
    opacity: 1,
    pathLength: 1,
    strokeDasharray: [1, 0],
    transition: {
      duration: 0.8,
      ease: "easeInOut",
    },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.3 }
  }
};

// Pulse animation for nodes
const pulseVariants = {
  pulse: {
    scale: [1, 1.05, 1],
    opacity: [0.7, 1, 0.7],
    boxShadow: [
      "0 0 0 0 rgba(59, 130, 246, 0.4)",
      "0 0 0 10px rgba(59, 130, 246, 0)",
      "0 0 0 0 rgba(59, 130, 246, 0)"
    ],
    transition: {
      duration: 2,
      repeat: Infinity,
      repeatType: "loop" as const
    }
  }
};

interface ConnectionSuggestionsProps {
  nodes: Node<NodeData>[];
  edges: Edge[];
  selectedNodeId: string | null;
  onConnect: (sourceId: string, targetId: string) => void;
}

const ConnectionSuggestions: React.FC<ConnectionSuggestionsProps> = ({
  nodes,
  edges,
  selectedNodeId,
  onConnect
}) => {
  const [suggestions, setSuggestions] = useState<{
    sourceId: string;
    targetId: string;
    compatibility: number;
    suggestion: string;
    path: string;
  }[]>([]);
  const { project } = useReactFlow();

  // Generate connection suggestions when a node is selected
  useEffect(() => {
    if (!selectedNodeId) {
      setSuggestions([]);
      return;
    }

    const selectedNode = nodes.find(node => node.id === selectedNodeId);
    if (!selectedNode) return;

    const existingConnectionIds = edges.map(edge => `${edge.source}-${edge.target}`);
    const compatibleNodes: {
      sourceId: string;
      targetId: string;
      compatibility: number;
      suggestion: string;
      path: string;
    }[] = [];

    // Calculate path for potential connections with an arc
    const calculatePath = (sourceNode: Node, targetNode: Node) => {
      // Get source and target positions on the screen
      const sourcePosition = {
        x: sourceNode.position.x + (sourceNode.width || 150) / 2,
        y: sourceNode.position.y + (sourceNode.height || 80)
      };
      
      const targetPosition = {
        x: targetNode.position.x + (targetNode.width || 150) / 2,
        y: targetNode.position.y
      };
      
      // Calculate control points for a bezier curve
      const dx = targetPosition.x - sourcePosition.x;
      const dy = targetPosition.y - sourcePosition.y;
      const midX = sourcePosition.x + dx / 2;
      const midY = sourcePosition.y + dy / 2;
      
      // Create an arc with bezier curve
      return `M${sourcePosition.x},${sourcePosition.y} C${sourcePosition.x},${sourcePosition.y + 50} ${targetPosition.x},${targetPosition.y - 50} ${targetPosition.x},${targetPosition.y}`;
    };

    // Function to get node type for compatibility checking
    const getNodeType = (node: Node<NodeData>) => {
      return node.data.nodeType || 
             node.data.type || 
             (node.type === 'trigger' ? 'trigger' : 'action');
    };

    // Generate suggestions for connections FROM the selected node
    if (getNodeType(selectedNode) !== 'output') {
      nodes.forEach(targetNode => {
        // Skip self-connections, already connected pairs, and output nodes connecting to other nodes
        if (targetNode.id === selectedNodeId || 
            existingConnectionIds.includes(`${selectedNodeId}-${targetNode.id}`) ||
            getNodeType(targetNode) === 'trigger') {
          return;
        }
        
        const sourceType = getNodeType(selectedNode);
        const targetType = getNodeType(targetNode);
        
        // Find the compatibility rule for this combination
        let rule = nodeCompatibilityRules.find(
          r => (r.sourceType === sourceType && r.targetType === targetType) ||
               (r.sourceType === sourceType && r.targetType === '*') ||
               (r.sourceType === '*' && r.targetType === targetType)
        );
        
        // If no specific rule found, use the fallback rule
        if (!rule) {
          rule = nodeCompatibilityRules.find(r => r.sourceType === '*' && r.targetType === '*')!;
        }
        
        if (rule && rule.compatibility > 50) { // Only suggest connections above a certain threshold
          compatibleNodes.push({
            sourceId: selectedNodeId,
            targetId: targetNode.id,
            compatibility: rule.compatibility,
            suggestion: rule.suggestion,
            path: calculatePath(selectedNode, targetNode)
          });
        }
      });
    }
    
    // Generate suggestions for connections TO the selected node
    if (getNodeType(selectedNode) !== 'trigger') {
      nodes.forEach(sourceNode => {
        // Skip self-connections, already connected pairs, and output nodes
        if (sourceNode.id === selectedNodeId || 
            existingConnectionIds.includes(`${sourceNode.id}-${selectedNodeId}`) ||
            getNodeType(sourceNode) === 'output') {
          return;
        }
        
        const sourceType = getNodeType(sourceNode);
        const targetType = getNodeType(selectedNode);
        
        // Find the compatibility rule for this combination
        let rule = nodeCompatibilityRules.find(
          r => (r.sourceType === sourceType && r.targetType === targetType) ||
               (r.sourceType === sourceType && r.targetType === '*') ||
               (r.sourceType === '*' && r.targetType === targetType)
        );
        
        // If no specific rule found, use the fallback rule
        if (!rule) {
          rule = nodeCompatibilityRules.find(r => r.sourceType === '*' && r.targetType === '*')!;
        }
        
        if (rule && rule.compatibility > 60) { // Only suggest connections above a certain threshold
          compatibleNodes.push({
            sourceId: sourceNode.id,
            targetId: selectedNodeId,
            compatibility: rule.compatibility,
            suggestion: rule.suggestion,
            path: calculatePath(sourceNode, selectedNode)
          });
        }
      });
    }

    // Sort by compatibility (highest first) and limit suggestions
    const sortedSuggestions = compatibleNodes
      .sort((a, b) => b.compatibility - a.compatibility)
      .slice(0, 3); // Limit to top 3 suggestions to avoid visual clutter
    
    setSuggestions(sortedSuggestions);
  }, [selectedNodeId, nodes, edges, project]);

  // Color gradient based on compatibility score
  const getPathColor = (compatibility: number) => {
    if (compatibility >= 90) return '#10b981'; // Emerald-500 - Very high compatibility
    if (compatibility >= 75) return '#3b82f6'; // Blue-500 - High compatibility
    if (compatibility >= 60) return '#f59e0b'; // Amber-500 - Medium compatibility
    return '#94a3b8'; // Slate-400 - Basic compatibility
  };

  // Handle the connect action when a suggestion is clicked
  const handleConnectNodes = (sourceId: string, targetId: string) => {
    onConnect(sourceId, targetId);
    // Remove this suggestion once connected
    setSuggestions(suggestions.filter(
      s => !(s.sourceId === sourceId && s.targetId === targetId)
    ));
  };

  return (
    <div className="connection-suggestions">
      <AnimatePresence>
        {suggestions.map((suggestion, index) => {
          const sourceNode = nodes.find(node => node.id === suggestion.sourceId);
          const targetNode = nodes.find(node => node.id === suggestion.targetId);
          
          if (!sourceNode || !targetNode) return null;
          
          return (
            <React.Fragment key={`${suggestion.sourceId}-${suggestion.targetId}`}>
              {/* Animated path */}
              <motion.path
                d={suggestion.path}
                initial="initial"
                animate="animate"
                exit="exit"
                variants={pathVariants}
                style={{
                  stroke: getPathColor(suggestion.compatibility),
                  strokeWidth: 2,
                  fill: 'none',
                  strokeDasharray: 5,
                  strokeLinecap: 'round',
                  pointerEvents: 'none',
                  zIndex: 1000,
                }}
              />
              
              {/* Animated button at midpoint of the path */}
              <motion.foreignObject
                initial={{ opacity: 0, scale: 0 }}
                animate={{ 
                  opacity: 1, 
                  scale: 1,
                  transition: { 
                    delay: 0.5, 
                    duration: 0.3,
                    type: 'spring',
                    stiffness: 300,
                    damping: 20
                  }
                }}
                exit={{ opacity: 0, scale: 0 }}
                style={{
                  width: 100,
                  height: 100,
                  overflow: 'visible',
                  // Position this at the midpoint of the curve
                  transform: 'translate(-50%, -50%)',
                  // This is a rough approximation - in a full implementation you'd
                  // calculate the actual midpoint of the bezier curve
                  x: (sourceNode.position.x + targetNode.position.x) / 2 + (sourceNode.width || 150) / 4,
                  y: (sourceNode.position.y + targetNode.position.y) / 2
                }}
              >
                <div className="flex flex-col items-center justify-center h-full">
                  <Button
                    size="sm"
                    variant="outline"
                    className="px-2 py-1 text-xs font-medium rounded-full bg-white shadow-md hover:shadow-lg transition-shadow"
                    onClick={() => handleConnectNodes(suggestion.sourceId, suggestion.targetId)}
                  >
                    <ArrowRightCircle className="h-3.5 w-3.5 mr-1" />
                    <span>Connect</span>
                  </Button>
                  <div className="text-xs bg-white px-2 py-1 rounded-full mt-1 shadow text-center max-w-[150px] truncate text-muted-foreground">
                    {suggestion.suggestion}
                  </div>
                </div>
              </motion.foreignObject>
              
              {/* Pulse effect on source node */}
              <motion.div
                style={{
                  position: 'absolute',
                  top: sourceNode.position.y - 4,
                  left: sourceNode.position.x - 4,
                  width: (sourceNode.width || 150) + 8,
                  height: (sourceNode.height || 80) + 8,
                  borderRadius: '0.375rem',
                  pointerEvents: 'none',
                  zIndex: -1,
                }}
                variants={pulseVariants}
                animate="pulse"
              />
              
              {/* Pulse effect on target node */}
              <motion.div
                style={{
                  position: 'absolute',
                  top: targetNode.position.y - 4,
                  left: targetNode.position.x - 4,
                  width: (targetNode.width || 150) + 8,
                  height: (targetNode.height || 80) + 8,
                  borderRadius: '0.375rem',
                  pointerEvents: 'none',
                  zIndex: -1,
                }}
                variants={pulseVariants}
                animate="pulse"
              />
            </React.Fragment>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default ConnectionSuggestions;
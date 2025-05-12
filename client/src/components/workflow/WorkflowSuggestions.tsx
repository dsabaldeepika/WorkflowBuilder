import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Lightbulb, ChevronLeft, ChevronRight, PlusCircle, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Node, Edge } from 'reactflow';
import { NodeData } from '@/store/useWorkflowStore';
import { NodeCategory } from '@/types/workflow';

interface Suggestion {
  id: string;
  title: string;
  description: string;
  action: string;
  image?: string;
  priority: 'low' | 'medium' | 'high';
  nodeType?: string;
}

interface WorkflowSuggestionsProps {
  nodes: Node<NodeData>[];
  edges: Edge[];
  onAddNode?: (nodeType: string) => void;
  onConnect?: (source: string, target: string) => void;
  onDismiss?: (suggestionId: string) => void;
}

const WorkflowSuggestions: React.FC<WorkflowSuggestionsProps> = ({ 
  nodes, 
  edges, 
  onAddNode,
  onConnect,
  onDismiss 
}) => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [currentSuggestionIndex, setCurrentSuggestionIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  
  // Generate contextual suggestions based on the current workflow state
  useEffect(() => {
    // Only show suggestions if we have at least one node
    if (nodes.length === 0) return;
    
    const newSuggestions: Suggestion[] = [];
    
    // Suggestion for workflow with no edges
    if (nodes.length > 1 && edges.length === 0) {
      newSuggestions.push({
        id: 'connect-nodes',
        title: 'Connect Your Nodes',
        description: 'Your workflow needs connections between nodes to function. Try connecting nodes to establish the process flow.',
        action: 'Connect nodes',
        priority: 'high',
      });
    }
    
    // Suggestion for ending a workflow without an output action
    const hasOutput = nodes.some(node => 
      node.data.nodeType === 'output' || 
      node.data.type === 'output' || 
      // Since 'output' is not in NodeCategory, check if it's a messaging or action node
      // which are common output actions
      node.data.category === 'messaging' || 
      (node.data.type && node.data.type.includes('output'))
    );
    
    if (nodes.length > 0 && !hasOutput) {
      newSuggestions.push({
        id: 'add-output',
        title: 'Add an Output Action',
        description: 'Your workflow doesn\'t have an output action. Consider adding one like "Send Email" or "Update Record".',
        action: 'Add output',
        nodeType: 'output',
        priority: 'medium',
      });
    }
    
    // Suggestion for adding error handling
    const hasErrorHandling = edges.some(edge => edge.data?.errorHandler === true);
    
    if (nodes.length > 2 && !hasErrorHandling) {
      newSuggestions.push({
        id: 'add-error-handling',
        title: 'Add Error Handling',
        description: 'This workflow has no error handling paths. Add alternate paths for failures to make your workflow more robust.',
        action: 'Learn more',
        priority: 'medium',
      });
    }
    
    // Suggestion based on specific node types
    const hasTrigger = nodes.some(node => 
      node.data.nodeType === 'trigger' || 
      node.data.type === 'trigger' || 
      node.data.category === 'trigger'
    );
    
    if (nodes.length > 0 && !hasTrigger) {
      newSuggestions.push({
        id: 'add-trigger',
        title: 'Add a Trigger',
        description: 'Your workflow needs a starting trigger to initiate the process automatically.',
        action: 'Add trigger',
        nodeType: 'trigger',
        priority: 'high',
      });
    }
    
    // Suggestion for complex workflows
    if (nodes.length > 5) {
      newSuggestions.push({
        id: 'consider-templates',
        title: 'Consider Using Templates',
        description: 'Your workflow is getting complex. Check out our pre-built templates for common patterns.',
        action: 'View templates',
        priority: 'low',
      });
    }
    
    // Set the suggestions and make the component visible if we have any
    if (newSuggestions.length > 0) {
      setSuggestions(newSuggestions);
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [nodes, edges]);
  
  const currentSuggestion = suggestions[currentSuggestionIndex];
  
  // Handle actions based on suggestion type
  const handleAction = () => {
    if (!currentSuggestion) return;
    
    if (currentSuggestion.nodeType && onAddNode) {
      onAddNode(currentSuggestion.nodeType);
    } else if (currentSuggestion.id === 'connect-nodes' && nodes.length >= 2) {
      // Suggest connecting the first two nodes as a starting point
      onConnect && onConnect(nodes[0].id, nodes[1].id);
    }
    
    // Always dismiss the suggestion after taking action
    handleDismiss();
  };
  
  const handleDismiss = () => {
    if (!currentSuggestion) return;
    onDismiss && onDismiss(currentSuggestion.id);
    
    // If we have more suggestions, show the next one, otherwise hide
    if (currentSuggestionIndex < suggestions.length - 1) {
      setCurrentSuggestionIndex(currentSuggestionIndex + 1);
    } else {
      setIsVisible(false);
    }
  };
  
  const navigateSuggestion = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && currentSuggestionIndex > 0) {
      setCurrentSuggestionIndex(currentSuggestionIndex - 1);
    } else if (direction === 'next' && currentSuggestionIndex < suggestions.length - 1) {
      setCurrentSuggestionIndex(currentSuggestionIndex + 1);
    }
  };
  
  // Don't render if there are no suggestions or the component is hidden
  if (!isVisible || suggestions.length === 0) return null;
  
  // Get the appropriate color based on priority
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-yellow-50 border-yellow-200';
      case 'medium':
        return 'bg-blue-50 border-blue-200';
      case 'low':
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };
  
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
          className="absolute bottom-8 right-8 z-50 max-w-md w-full shadow-lg"
        >
          <Card className={`${getPriorityColor(currentSuggestion.priority)} border`}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center">
                  <Lightbulb className="h-5 w-5 text-yellow-500 mr-2" />
                  <span className="font-bold">{currentSuggestion.title}</span>
                </div>
                <Button variant="ghost" size="icon" onClick={handleDismiss} className="h-7 w-7">
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <p className="text-sm text-gray-600 mb-4">{currentSuggestion.description}</p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  {suggestions.length > 1 && (
                    <>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => navigateSuggestion('prev')}
                        disabled={currentSuggestionIndex === 0}
                        className="h-7 w-7"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span className="text-xs text-gray-500">
                        {currentSuggestionIndex + 1} / {suggestions.length}
                      </span>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => navigateSuggestion('next')}
                        disabled={currentSuggestionIndex === suggestions.length - 1}
                        className="h-7 w-7"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
                
                <Button 
                  size="sm" 
                  onClick={handleAction}
                  className="flex items-center gap-1"
                >
                  {currentSuggestion.nodeType && <PlusCircle className="h-4 w-4" />}
                  {!currentSuggestion.nodeType && <ArrowRight className="h-4 w-4" />}
                  {currentSuggestion.action}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WorkflowSuggestions;
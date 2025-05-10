import React, { useState, useCallback } from 'react';
import { useReactFlow } from 'reactflow';
import { Button } from '@/components/ui/button';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { ConnectionValidatorControl } from './ConnectionValidator';
import { PerformanceOptimizer, OptimizationResult } from './PerformanceOptimizer';
import { WorkflowExecutor } from './WorkflowExecutor';
import { WorkflowState } from './StateChangeAnimation';
import {
  Play,
  Zap,
  CheckCircle2,
  Wrench,
  AlertCircle,
  FileJson,
  Download,
  Upload,
  Save
} from 'lucide-react';
import { motion } from 'framer-motion';

interface WorkflowControlsProps {
  onNodeStateChange?: (nodeId: string, state: WorkflowState) => void;
  onSave?: () => void;
  onExport?: () => void;
  onImport?: () => void;
}

export function WorkflowControls({ onNodeStateChange, onSave, onExport, onImport }: WorkflowControlsProps) {
  const [showOptimizer, setShowOptimizer] = useState(false);
  const [showExecutor, setShowExecutor] = useState(false);
  const [optimizationApplied, setOptimizationApplied] = useState(false);
  const { getNodes, setNodes, getEdges, setEdges } = useReactFlow();
  
  // Handle optimization result
  const handleOptimize = useCallback((result: OptimizationResult) => {
    // Get current nodes
    const nodes = getNodes();
    
    // Apply visual changes to optimized nodes
    const updatedNodes = nodes.map(node => {
      if (result.optimizedNodeIds.includes(node.id)) {
        return {
          ...node,
          data: {
            ...node.data,
            optimized: true
          },
          // Add a visual indicator for optimized nodes
          className: 'optimized-node'
        };
      }
      return node;
    });
    
    // Update nodes in the flow
    setNodes(updatedNodes);
    setOptimizationApplied(true);
  }, [getNodes, setNodes]);
  
  return (
    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
      <div className="bg-white rounded-full shadow-lg p-1 flex items-center gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.button
                className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center"
                onClick={() => setShowExecutor(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Play className="h-5 w-5" />
              </motion.button>
            </TooltipTrigger>
            <TooltipContent side="top">
              Execute Workflow
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.button
                className="w-10 h-10 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 flex items-center justify-center"
                onClick={() => setShowOptimizer(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Zap className="h-5 w-5" />
              </motion.button>
            </TooltipTrigger>
            <TooltipContent side="top">
              Optimize Performance
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        {onSave && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.button
                  className="w-10 h-10 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 flex items-center justify-center"
                  onClick={onSave}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Save className="h-5 w-5" />
                </motion.button>
              </TooltipTrigger>
              <TooltipContent side="top">
                Save Workflow
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        
        {onExport && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.button
                  className="w-10 h-10 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 flex items-center justify-center"
                  onClick={onExport}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Download className="h-5 w-5" />
                </motion.button>
              </TooltipTrigger>
              <TooltipContent side="top">
                Export Workflow
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        
        {onImport && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.button
                  className="w-10 h-10 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 flex items-center justify-center"
                  onClick={onImport}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Upload className="h-5 w-5" />
                </motion.button>
              </TooltipTrigger>
              <TooltipContent side="top">
                Import Workflow
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        
        {optimizationApplied && (
          <div className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full flex items-center text-sm">
            <CheckCircle2 className="h-4 w-4 mr-1" />
            Optimized
          </div>
        )}
      </div>
      
      {/* Connection validator control - positioned separately */}
      <ConnectionValidatorControl />
      
      {/* Modals */}
      <PerformanceOptimizer 
        isOpen={showOptimizer} 
        onClose={() => setShowOptimizer(false)}
        onOptimize={handleOptimize}
      />
      
      <WorkflowExecutor
        isOpen={showExecutor}
        onClose={() => setShowExecutor(false)}
        onNodeStateChange={onNodeStateChange}
      />
    </div>
  );
}

// Utility function to handle JSON file upload
export function uploadJSONFile(onUpload: (data: any) => void) {
  // Create a file input element
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = '.json';
  fileInput.style.display = 'none';
  document.body.appendChild(fileInput);
  
  // Set up file change handler
  fileInput.onchange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const jsonData = JSON.parse(e.target?.result as string);
          onUpload(jsonData);
        } catch (error) {
          console.error('Error parsing JSON file:', error);
          alert('Invalid JSON file format');
        }
      };
      reader.readAsText(file);
    }
    
    // Clean up
    document.body.removeChild(fileInput);
  };
  
  // Trigger file dialog
  fileInput.click();
}

// Utility function to download JSON data as a file
export function downloadJSONFile(data: any, filename: string = 'workflow.json') {
  try {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  } catch (error) {
    console.error('Error downloading JSON file:', error);
    alert('Failed to download workflow');
  }
}
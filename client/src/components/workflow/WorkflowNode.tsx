import React, { useCallback } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { PlusButton } from "./PlusButton";
import { useWorkflowStore } from "@/store/useWorkflowStore";
import { Badge } from "@/components/ui/badge";
import { Clock, Zap, Settings, RefreshCw, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";

export function WorkflowNode({ data, id }: NodeProps) {
  const { openNodePicker, removeNode } = useWorkflowStore();
  
  const handleAddNextNode = useCallback(() => {
    openNodePicker();
  }, [openNodePicker]);

  const handleEditNode = useCallback(() => {
    // TODO: Implement edit functionality
    console.log('Edit node:', id);
  }, [id]);

  const handleDeleteNode = useCallback(() => {
    removeNode(id);
  }, [id, removeNode]);

  const AppIcon = data.app.icon;
  const ModuleIcon = data.module.icon;

  // Helper to show formatted schedule information
  const getScheduleLabel = () => {
    if (!data.config?.scheduleFrequency) return null;
    
    switch (data.config.scheduleFrequency) {
      case 'once':
        return 'Run once';
      case 'hourly':
        return 'Run hourly';
      case 'daily':
        return 'Run daily';
      case 'weekly':
        return 'Run weekly';
      case 'custom':
        return `Every ${data.config.customInterval} ${data.config.intervalUnit}`;
      default:
        return null;
    }
  };

  const scheduleLabel = getScheduleLabel();

  return (
    <div className="relative flex items-center group">
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 border-2 border-white bg-primary"
      />
      
      <div className="bg-white rounded-md border border-gray-200 shadow-sm p-4 flex flex-col w-56 hover:border-primary hover:shadow transition-all duration-200">
        {/* Node header */}
        <div className="flex items-center mb-3">
          <div className={`h-10 w-10 bg-${data.app.iconBg}-100 text-${data.app.iconColor}-600 rounded-md flex items-center justify-center mr-3`}>
            <span className="flex items-center justify-center">
              <AppIcon size={20} />
            </span>
          </div>
          
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-800">
              {data.app.label}
            </span>
            <Badge variant={data.module.type === 'trigger' ? 'secondary' : 'outline'} className="mt-1 text-xs">
              {data.module.type === 'trigger' ? (
                <Zap className="h-3 w-3 mr-1" />
              ) : (
                <Settings className="h-3 w-3 mr-1" />
              )}
              {data.module.type === 'trigger' ? 'Trigger' : 'Action'}
            </Badge>
          </div>
        </div>
        
        {/* Module name with pill */}
        <div className="flex items-center bg-gray-50 p-2 rounded-md mb-2">
          <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center mr-2">
            {React.createElement(ModuleIcon, { size: 14 })}
          </div>
          <span className="text-xs font-medium text-gray-800">
            {data.module.label}
          </span>
        </div>
        
        {/* Schedule information for trigger nodes */}
        {data.module.type === 'trigger' && scheduleLabel && (
          <div className="flex items-center mt-1 text-xs text-gray-500">
            <Clock className="h-3 w-3 mr-1" />
            {scheduleLabel}
          </div>
        )}
        
        {/* Node controls (visible on hover) */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6 text-gray-400 hover:text-gray-700"
            onClick={handleEditNode}
          >
            <Edit size={14} />
          </Button>
        </div>
      </div>
      
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 border-2 border-white bg-primary"
      />
      
      {/* Small red plus button */}
      <div className="ml-4">
        <PlusButton 
          onClick={handleAddNextNode} 
          size="small" 
          color="destructive" 
        />
      </div>
    </div>
  );
}

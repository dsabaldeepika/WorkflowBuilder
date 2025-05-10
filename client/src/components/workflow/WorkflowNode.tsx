import { Handle, Position, NodeProps } from "reactflow";
import { PlusButton } from "./PlusButton";
import { useWorkflowStore } from "@/store/useWorkflowStore";
import { useCallback } from "react";

export function WorkflowNode({ data, id }: NodeProps) {
  const { openNodePicker } = useWorkflowStore();
  
  const handleAddNextNode = useCallback(() => {
    openNodePicker();
  }, [openNodePicker]);

  const AppIcon = data.app.icon;
  const ModuleIcon = data.module.icon;

  return (
    <div className="relative flex items-center">
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 border-2 border-white bg-primary"
      />
      
      <div className="bg-white rounded-md border border-gray-200 shadow-sm p-4 flex flex-col items-center w-48">
        <div className={`h-12 w-12 bg-${data.app.iconBg}-100 text-${data.app.iconColor}-600 rounded-md flex items-center justify-center mb-2`}>
          <span className="flex items-center justify-center text-xl">
            <AppIcon size={24} />
          </span>
        </div>
        <span className="text-sm font-medium text-gray-800">
          {data.app.label}
        </span>
        <span className="text-xs text-gray-500">
          {data.module.label}
        </span>
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

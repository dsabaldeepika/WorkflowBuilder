import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface PlusButtonProps {
  onClick: () => void;
  size?: "small" | "large";
  color?: "primary" | "destructive";
}

export function PlusButton({ 
  onClick, 
  size = "large", 
  color = "primary" 
}: PlusButtonProps) {
  const sizeClasses = size === "large" 
    ? "w-16 h-16 text-xl" 
    : "w-8 h-8 text-xs";
  
  const colorClasses = color === "primary" 
    ? "bg-white border-2 border-primary text-primary hover:bg-blue-50" 
    : "bg-red-500 text-white hover:bg-red-600";
  
  return (
    <Button
      onClick={onClick}
      className={`rounded-full ${sizeClasses} ${colorClasses} shadow-md flex items-center justify-center p-0`}
      variant="ghost"
    >
      <Plus className={size === "large" ? "h-6 w-6" : "h-4 w-4"} />
    </Button>
  );
}

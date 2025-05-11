import React from 'react';
import { PlusCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface EmptyWorkflowPlaceholderProps {
  onAddNodeClick: () => void;
}

export const EmptyWorkflowPlaceholder: React.FC<EmptyWorkflowPlaceholderProps> = ({
  onAddNodeClick
}) => {
  return (
    <div className="h-full w-full flex items-center justify-center">
      <motion.div 
        className="cursor-pointer"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        whileHover={{ scale: 1.1 }}
        onClick={onAddNodeClick}
      >
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full blur-lg opacity-30"></div>
          <div className="relative bg-background border-2 border-primary rounded-full p-8 flex flex-col items-center justify-center shadow-xl hover:shadow-2xl transition-all duration-300">
            <PlusCircle className="h-16 w-16 text-primary mb-2" />
            <h3 className="text-lg font-semibold text-center mb-1">Add First Node</h3>
            <p className="text-sm text-muted-foreground text-center max-w-[200px]">
              Start building your workflow by adding the first node
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default EmptyWorkflowPlaceholder;
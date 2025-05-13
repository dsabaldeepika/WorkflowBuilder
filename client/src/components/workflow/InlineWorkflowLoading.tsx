import React from 'react';
import { motion } from 'framer-motion';
import { Workflow, Zap, Database, AlertCircle, CheckCircle } from 'lucide-react';

interface InlineWorkflowLoadingProps {
  text?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'error' | 'processing';
  showIcon?: boolean;
}

export const InlineWorkflowLoading: React.FC<InlineWorkflowLoadingProps> = ({
  text = "Processing workflow...",
  size = 'md',
  variant = 'default',
  showIcon = true
}) => {
  const sizeClasses = {
    sm: 'text-xs h-6',
    md: 'text-sm h-8',
    lg: 'text-base h-10'
  };
  
  const iconSize = {
    sm: 14,
    md: 18,
    lg: 22
  };
  
  const getIcon = () => {
    switch (variant) {
      case 'success':
        return <CheckCircle size={iconSize[size]} className="text-green-500" />;
      case 'error':
        return <AlertCircle size={iconSize[size]} className="text-red-500" />;
      case 'processing':
        return <Database size={iconSize[size]} className="text-amber-500" />;
      default:
        return <Workflow size={iconSize[size]} className="text-blue-500" />;
    }
  };
  
  return (
    <div className={`flex items-center rounded-full bg-gray-100 px-3 ${sizeClasses[size]}`}>
      {showIcon && (
        <div className="flex-shrink-0 mr-2">
          {variant === 'success' || variant === 'error' ? (
            getIcon()
          ) : (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ 
                duration: 1.5, 
                ease: "linear", 
                repeat: Infinity 
              }}
            >
              {getIcon()}
            </motion.div>
          )}
        </div>
      )}
      
      <div className="flex items-center overflow-hidden">
        <span className="truncate">{text}</span>
        
        {(variant !== 'success' && variant !== 'error') && (
          <motion.div
            className="ml-1 flex space-x-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.span
              animate={{ opacity: [0, 1, 0] }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity,
                repeatType: "loop",
                times: [0, 0.5, 1],
                delay: 0
              }}
            >
              .
            </motion.span>
            <motion.span
              animate={{ opacity: [0, 1, 0] }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity,
                repeatType: "loop",
                times: [0, 0.5, 1],
                delay: 0.2
              }}
            >
              .
            </motion.span>
            <motion.span
              animate={{ opacity: [0, 1, 0] }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity,
                repeatType: "loop",
                times: [0, 0.5, 1],
                delay: 0.4
              }}
            >
              .
            </motion.span>
          </motion.div>
        )}
      </div>
      
      {variant === 'default' && (
        <motion.div 
          className="ml-2 flex-shrink-0"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ 
            duration: 1.5, 
            repeat: Infinity,
            repeatType: "reverse"
          }}
        >
          <Zap size={iconSize[size]} className="text-yellow-500" />
        </motion.div>
      )}
    </div>
  );
};

export default InlineWorkflowLoading;
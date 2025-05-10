import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  PlayCircle, 
  PauseCircle, 
  AlertCircle, 
  RefreshCcw,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export type WorkflowState = 'idle' | 'starting' | 'running' | 'completed' | 'failed' | 'paused' | 'retrying';

// Configuration for each workflow state
export const stateConfig = {
  idle: {
    icon: Clock,
    color: 'text-slate-400',
    bgColor: 'bg-slate-100',
    borderColor: 'border-slate-200',
    label: 'Idle',
    description: 'Waiting to start'
  },
  starting: {
    icon: PlayCircle,
    color: 'text-blue-500',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-200',
    label: 'Starting',
    description: 'Initializing workflow'
  },
  running: {
    icon: Loader2,
    color: 'text-blue-500',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-200',
    label: 'Running',
    description: 'Workflow in progress',
    animate: true
  },
  completed: {
    icon: CheckCircle,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-100',
    borderColor: 'border-emerald-200',
    label: 'Completed',
    description: 'Successfully completed'
  },
  failed: {
    icon: XCircle,
    color: 'text-rose-500',
    bgColor: 'bg-rose-100',
    borderColor: 'border-rose-200',
    label: 'Failed',
    description: 'Error encountered'
  },
  paused: {
    icon: PauseCircle,
    color: 'text-amber-500',
    bgColor: 'bg-amber-100',
    borderColor: 'border-amber-200',
    label: 'Paused',
    description: 'Execution paused'
  },
  retrying: {
    icon: RefreshCcw,
    color: 'text-purple-500',
    bgColor: 'bg-purple-100',
    borderColor: 'border-purple-200',
    label: 'Retrying',
    description: 'Attempting again after failure',
    animate: true
  }
};

interface WorkflowStateIndicatorProps {
  state: WorkflowState;
  previousState?: WorkflowState;
  size?: 'sm' | 'md' | 'lg';
  animate?: boolean;
  showLabel?: boolean;
  className?: string;
}

export const WorkflowStateIndicator: React.FC<WorkflowStateIndicatorProps> = ({ 
  state, 
  previousState,
  size = 'md',
  animate = true,
  showLabel = false,
  className 
}) => {
  const config = stateConfig[state];
  const Icon = config.icon;
  
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };
  
  return (
    <div className={cn("flex items-center", className)}>
      <motion.div
        initial={{ scale: previousState ? 0.8 : 1, opacity: previousState ? 0 : 1 }}
        animate={{ scale: 1, opacity: 1 }}
        className={cn(
          "rounded-full p-1 flex items-center justify-center",
          config.bgColor,
          size === 'sm' ? 'p-0.5' : size === 'lg' ? 'p-1.5' : 'p-1'
        )}
      >
        <Icon 
          className={cn(
            sizeClasses[size],
            config.color,
            (config.animate && animate) && "animate-spin"
          )} 
        />
      </motion.div>
      
      {showLabel && (
        <span className={cn(
          "ml-2 font-medium",
          size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-base' : 'text-sm',
          config.color
        )}>
          {config.label}
        </span>
      )}
    </div>
  );
};

interface StateChangeAnimationProps {
  state: WorkflowState;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export const StateChangeAnimation: React.FC<StateChangeAnimationProps> = ({
  state,
  size = 'md',
  showLabel = false,
  className
}) => {
  const [previousState, setPreviousState] = useState<WorkflowState | undefined>(undefined);
  const [currentState, setCurrentState] = useState<WorkflowState>(state);
  
  useEffect(() => {
    if (state !== currentState) {
      setPreviousState(currentState);
      setCurrentState(state);
    }
  }, [state, currentState]);
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentState}
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 10, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className={className}
      >
        <WorkflowStateIndicator 
          state={currentState}
          previousState={previousState}
          size={size}
          showLabel={showLabel}
        />
      </motion.div>
    </AnimatePresence>
  );
};

interface WorkflowStateProgressBarProps {
  state: WorkflowState;
  progress?: number;
  className?: string;
}

export const WorkflowStateProgressBar: React.FC<WorkflowStateProgressBarProps> = ({
  state,
  progress = 0,
  className
}) => {
  const config = stateConfig[state];
  
  return (
    <div className={cn("space-y-1", className)}>
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <StateChangeAnimation state={state} size="sm" />
          <span className="ml-2 text-sm font-medium">{config.label}</span>
        </div>
        <span className="text-xs text-muted-foreground">{Math.round(progress)}%</span>
      </div>
      
      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
        <motion.div 
          className={cn("h-full rounded-full", config.bgColor)}
          initial={{ width: '0%' }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
    </div>
  );
};

interface WorkflowStateBadgeProps {
  state: WorkflowState;
  className?: string;
}

export const WorkflowStateBadge: React.FC<WorkflowStateBadgeProps> = ({
  state,
  className
}) => {
  const badgeVariant = useMemo(() => {
    switch (state) {
      case 'completed':
        return 'success';
      case 'failed':
        return 'destructive';
      case 'running':
      case 'starting':
        return 'default';
      case 'paused':
      case 'retrying':
        return 'secondary';
      default:
        return 'outline';
    }
  }, [state]);
  
  return (
    <Badge variant={badgeVariant as any} className={className}>
      <StateChangeAnimation state={state} size="sm" />
      <span className="ml-1">{stateConfig[state].label}</span>
    </Badge>
  );
};

export default StateChangeAnimation;
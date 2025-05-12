import React, { useState, useEffect, useMemo, useCallback, createContext, useContext } from 'react';
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

// Context for workflow state management
interface WorkflowStateContextType {
  state: WorkflowState;
  history: WorkflowState[];
  setState: (state: WorkflowState) => void;
  resetState: () => void;
}

const WorkflowStateContext = createContext<WorkflowStateContextType | undefined>(undefined);

// Hook to use workflow state within components
export const useWorkflowState = () => {
  const context = useContext(WorkflowStateContext);
  if (context === undefined) {
    throw new Error('useWorkflowState must be used within a WorkflowStateProvider');
  }
  return context;
};

// Provider component for workflow state
export const WorkflowStateProvider: React.FC<{ 
  children: React.ReactNode,
  initialState?: WorkflowState 
}> = ({ 
  children, 
  initialState = 'idle'
}) => {
  const [state, setCurrentState] = useState<WorkflowState>(initialState);
  const [history, setHistory] = useState<WorkflowState[]>([initialState]);
  
  const setState = useCallback((newState: WorkflowState) => {
    setCurrentState(newState);
    setHistory(prev => [...prev, newState]);
  }, []);
  
  const resetState = useCallback(() => {
    setCurrentState('idle');
    setHistory(['idle']);
  }, []);
  
  return (
    <WorkflowStateContext.Provider value={{ state, history, setState, resetState }}>
      {children}
    </WorkflowStateContext.Provider>
  );
};

// Transition component to visualize state changes
export const WorkflowStateTransition: React.FC<{ className?: string }> = ({ className }) => {
  const { state, history } = useWorkflowState();
  
  return (
    <div className={cn("space-y-2", className)}>
      <StateChangeAnimation state={state} showLabel />
      <div className="text-xs text-muted-foreground">
        {history.length > 1 && (
          <span>Previous: {stateConfig[history[history.length - 2]].label}</span>
        )}
      </div>
    </div>
  );
};

// History component to show state transition history
export const WorkflowStateHistory: React.FC<{ className?: string }> = ({ className }) => {
  const { history } = useWorkflowState();
  
  return (
    <div className={cn("space-y-2", className)}>
      <h3 className="text-sm font-medium">Workflow History</h3>
      <div className="space-y-1">
        {history.map((state, index) => (
          <div key={index} className="flex items-center text-xs">
            <span className="text-muted-foreground w-10">{index + 1}.</span>
            <WorkflowStateIndicator state={state} size="sm" showLabel />
          </div>
        ))}
      </div>
    </div>
  );
};

export type WorkflowState = 'idle' | 'starting' | 'running' | 'completed' | 'failed' | 'paused' | 'retrying' | 'waiting';

// Configuration for each workflow state
export const stateConfig = {
  idle: {
    icon: Clock,
    color: 'text-slate-400',
    bgColor: 'bg-slate-100',
    borderColor: 'border-slate-200',
    label: 'Idle',
    description: 'Waiting to start',
    shouldAnimate: false
  },
  waiting: {
    icon: AlertCircle,
    color: 'text-orange-500',
    bgColor: 'bg-orange-100',
    borderColor: 'border-orange-200',
    label: 'Requires Setup',
    description: 'Configuration needed',
    shouldAnimate: false
  },
  starting: {
    icon: PlayCircle,
    color: 'text-blue-500',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-200',
    label: 'Starting',
    description: 'Initializing workflow',
    shouldAnimate: false
  },
  running: {
    icon: Loader2,
    color: 'text-blue-500',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-200',
    shouldAnimate: true,
    label: 'Running',
    description: 'Workflow in progress'
  },
  completed: {
    icon: CheckCircle,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-100',
    borderColor: 'border-emerald-200',
    label: 'Completed',
    description: 'Successfully completed',
    shouldAnimate: false
  },
  failed: {
    icon: XCircle,
    color: 'text-rose-500',
    bgColor: 'bg-rose-100',
    borderColor: 'border-rose-200',
    label: 'Failed',
    description: 'Error encountered',
    shouldAnimate: false
  },
  paused: {
    icon: PauseCircle,
    color: 'text-amber-500',
    bgColor: 'bg-amber-100',
    borderColor: 'border-amber-200',
    label: 'Paused',
    description: 'Execution paused',
    shouldAnimate: false
  },
  retrying: {
    icon: RefreshCcw,
    color: 'text-purple-500',
    bgColor: 'bg-purple-100',
    borderColor: 'border-purple-200',
    label: 'Retrying',
    description: 'Attempting again after failure',
    shouldAnimate: true
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
            (config.shouldAnimate && animate) && "animate-spin"
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
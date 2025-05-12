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
            (animate && (state === 'running' || state === 'retrying')) && "animate-spin"
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
  const [prevProgress, setPrevProgress] = useState(progress);
  const [isIncreasing, setIsIncreasing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  
  useEffect(() => {
    // Detect if progress increased significantly
    if (progress > prevProgress + 5) {
      setIsIncreasing(true);
      const timer = setTimeout(() => setIsIncreasing(false), 800);
      return () => clearTimeout(timer);
    }
    
    // Detect completion
    if (progress >= 100 && prevProgress < 100) {
      setIsCompleted(true);
      const timer = setTimeout(() => setIsCompleted(false), 1500);
      return () => clearTimeout(timer);
    }
    
    setPrevProgress(progress);
  }, [progress, prevProgress]);
  
  // Add animation pulse for the percentage text when significant increases happen
  const percentageAnimation = isIncreasing 
    ? { scale: [1, 1.2, 1], color: ["#64748b", config.color.replace("text-", "#"), "#64748b"] } 
    : {};
    
  // Particles effect for completed progress bar
  const CompletionEffect = () => {
    if (!isCompleted) return null;
    
    return (
      <motion.div 
        className="absolute inset-0"
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 1.5 }}
      >
        {/* Generate multiple particle effects */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className={cn(
              "absolute top-1/2 h-1 w-1 rounded-full",
              config.bgColor
            )}
            initial={{ 
              x: `${50 + (Math.random() * 40)}%`, 
              y: 0,
              opacity: 1,
              scale: 1
            }}
            animate={{ 
              x: `${50 + (Math.random() * 80 - 40)}%`, 
              y: Math.random() > 0.5 ? -20 : 20,
              opacity: 0,
              scale: 0
            }}
            transition={{ 
              duration: 0.8 + Math.random() * 0.5, 
              ease: "easeOut" 
            }}
          />
        ))}
      </motion.div>
    );
  };
  
  return (
    <div className={cn("space-y-1", className)}>
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <StateChangeAnimation state={state} size="sm" />
          <span className={cn(
            "ml-2 text-sm font-medium transition-colors",
            config.color
          )}>
            {config.label}
          </span>
        </div>
        <motion.span 
          className={cn(
            "text-xs text-muted-foreground transition-all",
            progress === 100 && "font-medium text-emerald-500"
          )}
          animate={percentageAnimation}
          transition={{ duration: 0.5 }}
        >
          {Math.round(progress)}%
        </motion.span>
      </div>
      
      <div className="relative h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        {/* Animated loading pulse for active progress */}
        {(state === 'running' || state === 'retrying') && progress < 100 && (
          <motion.div 
            className={cn(
              "absolute h-full w-full",
              config.bgColor,
              "opacity-30"
            )}
            animate={{ 
              x: ['-100%', '100%'],
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 1.5,
              ease: "linear"
            }}
          />
        )}
        
        {/* Main progress bar */}
        <motion.div 
          className={cn(
            "h-full rounded-full relative z-10", 
            config.bgColor,
            progress === 100 && "shadow-glow"
          )}
          initial={{ width: '0%' }}
          animate={{ width: `${progress}%` }}
          transition={{ 
            type: "spring",
            stiffness: 300,
            damping: 30,
            mass: 1
          }}
        >
          {/* Completion particles effect */}
          <CompletionEffect />
        </motion.div>
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
  const [prevState, setPrevState] = useState<WorkflowState | undefined>(undefined);
  
  useEffect(() => {
    // Track state changes to animate transitions
    if (prevState !== state) {
      setPrevState(prevState);
    }
  }, [state, prevState]);
  
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
        return 'warning';
      case 'retrying':
        return 'secondary';
      case 'waiting':
        return 'outline';
      default:
        return 'outline';
    }
  }, [state]);
  
  // Define animation based on state transitions
  const getBadgeAnimation = () => {
    // No animation on first render
    if (!prevState) return {};
    
    // Success transition
    if (state === 'completed' && prevState === 'running') {
      return { 
        scale: [1, 1.05, 1],
        backgroundColor: ['#4338ca', '#10b981', '#10b981'],
        transition: { duration: 0.5 }
      };
    }
    
    // Failure transition
    if (state === 'failed') {
      return { 
        x: [0, -2, 2, -2, 0],
        transition: { duration: 0.4 }
      };
    }
    
    return {};
  };
  
  return (
    <motion.div
      animate={getBadgeAnimation()}
      className="inline-flex"
    >
      <Badge 
        variant={badgeVariant as any} 
        className={cn(
          "transition-all duration-300 flex items-center gap-1 px-2.5 py-0.5",
          (state === 'running' || state === 'retrying') && "animate-pulse-subtle",
          className
        )}
      >
        <StateChangeAnimation state={state} size="sm" />
        <span className="ml-1 whitespace-nowrap">{stateConfig[state].label}</span>
      </Badge>
    </motion.div>
  );
};

export default StateChangeAnimation;
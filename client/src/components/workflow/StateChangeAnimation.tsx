import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Circle, 
  Clock, 
  PlayCircle, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  PauseCircle, 
  AlertCircle 
} from 'lucide-react';

// Type definitions for workflow states
export type WorkflowState = 'idle' | 'starting' | 'running' | 'completed' | 'failed' | 'paused' | 'retrying';

// Define colors and icons for each state
const stateConfig = {
  idle: {
    icon: Clock,
    color: 'text-slate-400',
    bgColor: 'bg-slate-100',
    pulseColor: 'bg-slate-200',
    label: 'Idle',
  },
  starting: {
    icon: PlayCircle,
    color: 'text-blue-500',
    bgColor: 'bg-blue-100',
    pulseColor: 'bg-blue-200',
    label: 'Starting',
  },
  running: {
    icon: RefreshCw,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    pulseColor: 'bg-blue-200',
    label: 'Running',
    animation: 'animate-spin-slow',
  },
  completed: {
    icon: CheckCircle2,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-100',
    pulseColor: 'bg-emerald-200',
    label: 'Completed',
  },
  failed: {
    icon: XCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    pulseColor: 'bg-red-200',
    label: 'Failed',
  },
  paused: {
    icon: PauseCircle,
    color: 'text-amber-600',
    bgColor: 'bg-amber-100',
    pulseColor: 'bg-amber-200',
    label: 'Paused',
  },
  retrying: {
    icon: AlertCircle,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    pulseColor: 'bg-purple-200',
    label: 'Retrying',
    animation: 'animate-pulse',
  },
};

// Size configurations
const sizeConfig = {
  sm: {
    icon: 'h-4 w-4',
    container: 'h-6 w-6',
    pulse: '-inset-1',
    label: 'text-xs',
  },
  md: {
    icon: 'h-6 w-6',
    container: 'h-10 w-10',
    pulse: '-inset-1.5',
    label: 'text-sm',
  },
  lg: {
    icon: 'h-8 w-8',
    container: 'h-14 w-14',
    pulse: '-inset-2',
    label: 'text-base',
  },
};

interface WorkflowStateIndicatorProps {
  state: WorkflowState;
  previousState?: WorkflowState;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  animate?: boolean;
}

/**
 * WorkflowStateIndicator Component
 * 
 * Displays a visual representation of a workflow state with animations for state transitions
 */
export function WorkflowStateIndicator({
  state,
  previousState,
  size = 'md',
  showLabel = false,
  animate = true,
}: WorkflowStateIndicatorProps) {
  const config = stateConfig[state];
  const sizeClasses = sizeConfig[size];
  
  // Determine if we should show a transition animation
  const shouldAnimate = animate && previousState && previousState !== state;
  
  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        {/* Background pulse for active states */}
        {['running', 'retrying', 'starting'].includes(state) && animate && (
          <motion.div 
            className={`absolute ${sizeClasses.pulse} ${config.pulseColor} rounded-full animate-pulse-ring`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          />
        )}
        
        <AnimatePresence mode="wait">
          <motion.div
            key={state}
            className={`${sizeClasses.container} relative flex items-center justify-center rounded-full ${config.bgColor}`}
            initial={shouldAnimate ? { opacity: 0, scale: 0.8 } : false}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
          >
            {/* Icon with optional animation */}
            <config.icon className={`${sizeClasses.icon} ${config.color} ${config.animation ? config.animation : ''}`} />
          </motion.div>
        </AnimatePresence>
      </div>
      
      {showLabel && (
        <span className={`mt-1 font-medium ${config.color} ${sizeClasses.label}`}>
          {config.label}
        </span>
      )}
    </div>
  );
}

/**
 * Custom hook to manage workflow state with animation support
 */
export function useWorkflowState(initialState: WorkflowState = 'idle') {
  const [currentState, setCurrentState] = useState<WorkflowState>(initialState);
  const [previousState, setPreviousState] = useState<WorkflowState | undefined>(undefined);
  
  const changeState = (newState: WorkflowState) => {
    if (newState !== currentState) {
      setPreviousState(currentState);
      setCurrentState(newState);
    }
  };
  
  return { currentState, previousState, changeState };
}

/**
 * WorkflowStateTransition Component
 * 
 * Visualizes a transition between two workflow states with an animated arrow
 */
export function WorkflowStateTransition({
  fromState,
  toState,
  onClick,
  size = 'md',
}: {
  fromState: WorkflowState;
  toState: WorkflowState;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
}) {
  return (
    <div 
      className="flex items-center gap-2 cursor-pointer"
      onClick={onClick}
    >
      <WorkflowStateIndicator state={fromState} size={size} animate={false} />
      
      <motion.div 
        className="text-slate-400"
        initial={{ x: -5, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        whileHover={{ scale: 1.2 }}
      >
        →
      </motion.div>
      
      <WorkflowStateIndicator state={toState} size={size} animate={false} />
    </div>
  );
}

/**
 * WorkflowStateProgressBar Component
 * 
 * Displays a progress bar for workflow operations with state-based colors
 */
export function WorkflowStateProgressBar({
  state,
  progress,
  showLabel = true,
}: {
  state: WorkflowState;
  progress: number; // 0-100
  showLabel?: boolean;
}) {
  // Limit progress value between 0-100
  const clampedProgress = Math.min(100, Math.max(0, progress));
  const config = stateConfig[state];
  
  return (
    <div className="w-full space-y-1">
      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
        <motion.div 
          className={`h-full rounded-full ${state === 'failed' ? 'bg-red-500' : 'bg-blue-500'}`}
          initial={{ width: '0%' }}
          animate={{ width: `${clampedProgress}%` }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />
      </div>
      
      {showLabel && (
        <div className="flex justify-between text-xs">
          <span className={config.color}>{config.label}</span>
          <span className="text-slate-600 font-medium">{clampedProgress}%</span>
        </div>
      )}
    </div>
  );
}

/**
 * WorkflowStateHistory Component
 * 
 * Shows a timeline of workflow state changes
 */
export function WorkflowStateHistory({
  states,
  currentStateIndex,
}: {
  states: { state: WorkflowState; timestamp: string }[];
  currentStateIndex: number;
}) {
  return (
    <div className="space-y-3">
      {states.map((item, index) => (
        <div 
          key={index}
          className={`flex items-center gap-3 p-2 rounded-md ${index === currentStateIndex ? 'bg-slate-50 border' : ''}`}
        >
          <WorkflowStateIndicator 
            state={item.state} 
            size="sm" 
            animate={index === currentStateIndex}
          />
          <div className="flex-1">
            <div className="font-medium text-sm">{stateConfig[item.state].label}</div>
            <div className="text-xs text-slate-500">{item.timestamp}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
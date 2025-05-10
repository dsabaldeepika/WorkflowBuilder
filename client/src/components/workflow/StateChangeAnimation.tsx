import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  RefreshCw, 
  PlayCircle,
  XCircle,
  Pause,
  Hourglass
} from 'lucide-react';

export type WorkflowState = 
  | 'idle'
  | 'starting'
  | 'running'
  | 'paused'
  | 'completed'
  | 'failed'
  | 'retrying';

interface StateChangeAnimationProps {
  previousState?: WorkflowState;
  currentState: WorkflowState;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  onAnimationComplete?: () => void;
}

/**
 * StateChangeAnimation Component
 * 
 * A micro-animation component that visualizes workflow state transitions.
 * This component provides visual feedback when a workflow changes state,
 * improving the user experience by making state changes more noticeable.
 */
export function StateChangeAnimation({
  previousState,
  currentState,
  size = 'md',
  showLabel = true,
  onAnimationComplete
}: StateChangeAnimationProps) {
  const [showAnimation, setShowAnimation] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);
  
  // Trigger animation when state changes
  useEffect(() => {
    if (previousState !== currentState) {
      setShowAnimation(true);
      setAnimationComplete(false);
    }
  }, [previousState, currentState]);
  
  // Determine icon size based on the size prop
  const iconSize = {
    sm: 16,
    md: 24,
    lg: 32
  }[size];
  
  // Get appropriate icon and color for each state
  const getStateDetails = (state: WorkflowState) => {
    switch (state) {
      case 'idle':
        return { 
          icon: <Clock size={iconSize} />, 
          color: 'text-slate-400',
          bgColor: 'bg-slate-100',
          label: 'Idle'
        };
      case 'starting':
        return { 
          icon: <PlayCircle size={iconSize} />, 
          color: 'text-blue-500',
          bgColor: 'bg-blue-50',
          label: 'Starting'
        };
      case 'running':
        return { 
          icon: <RefreshCw size={iconSize} className="animate-spin-slow" />, 
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          label: 'Running'
        };
      case 'paused':
        return { 
          icon: <Pause size={iconSize} />, 
          color: 'text-amber-500',
          bgColor: 'bg-amber-50',
          label: 'Paused'
        };
      case 'completed':
        return { 
          icon: <CheckCircle2 size={iconSize} />, 
          color: 'text-emerald-600',
          bgColor: 'bg-emerald-50',
          label: 'Completed'
        };
      case 'failed':
        return { 
          icon: <XCircle size={iconSize} />, 
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          label: 'Failed'
        };
      case 'retrying':
        return { 
          icon: <Hourglass size={iconSize} className="animate-pulse" />, 
          color: 'text-amber-600',
          bgColor: 'bg-amber-50',
          label: 'Retrying'
        };
      default:
        return { 
          icon: <Clock size={iconSize} />, 
          color: 'text-slate-400',
          bgColor: 'bg-slate-100',
          label: 'Unknown'
        };
    }
  };
  
  const details = getStateDetails(currentState);

  const handleAnimationComplete = () => {
    setAnimationComplete(true);
    setShowAnimation(false);
    onAnimationComplete?.();
  };
  
  // Basic animation for state change
  const containerVariants = {
    hidden: { 
      opacity: 0,
      scale: 0.8 
    },
    visible: { 
      opacity: 1,
      scale: 1,
      transition: { 
        duration: 0.3,
        ease: "easeOut"
      }
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      transition: {
        duration: 0.2
      }
    }
  };

  // Pulse effect animation variants
  const pulseVariants = {
    initial: { 
      scale: 1,
      opacity: 0.7 
    },
    pulse: { 
      scale: [1, 1.2, 1],
      opacity: [0.7, 1, 0.7],
      transition: { 
        duration: 1.5,
        repeat: 1,
        ease: "easeInOut"
      }
    }
  };
  
  return (
    <div className="inline-flex items-center">
      <AnimatePresence>
        {showAnimation ? (
          <motion.div
            key="animation"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={containerVariants}
            onAnimationComplete={handleAnimationComplete}
            className="relative"
          >
            <motion.div
              className={`rounded-full p-1 ${details.bgColor}`}
              initial="initial"
              animate="pulse"
              variants={pulseVariants}
            >
              <div className={`${details.color}`}>
                {details.icon}
              </div>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="static"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`rounded-full p-1 ${details.bgColor}`}
          >
            <div className={`${details.color}`}>
              {details.icon}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {showLabel && (
        <span className={`ml-2 text-sm font-medium ${details.color}`}>
          {details.label}
        </span>
      )}
    </div>
  );
}

/**
 * This hook handles the workflow state transition with history.
 * It automatically triggers micro-animations when the state changes.
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
  
  return { 
    currentState, 
    previousState, 
    changeState 
  };
}

/**
 * Primary UI component that combines workflow state indicator with animation
 */
export function WorkflowStateIndicator({
  state,
  previousState,
  size = 'md',
  className = '',
  animate = true
}: {
  state: WorkflowState;
  previousState?: WorkflowState;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  animate?: boolean;
}) {
  return (
    <div className={`inline-flex items-center ${className}`}>
      {animate ? (
        <StateChangeAnimation
          currentState={state}
          previousState={previousState}
          size={size}
          showLabel={true}
        />
      ) : (
        <StaticStateIndicator state={state} size={size} />
      )}
    </div>
  );
}

/**
 * Static state indicator without animations
 */
function StaticStateIndicator({
  state,
  size = 'md'
}: {
  state: WorkflowState;
  size?: 'sm' | 'md' | 'lg';
}) {
  const iconSize = {
    sm: 16,
    md: 24,
    lg: 32
  }[size];
  
  const getStateDetails = (state: WorkflowState) => {
    switch (state) {
      case 'idle':
        return { 
          icon: <Clock size={iconSize} />, 
          color: 'text-slate-400',
          bgColor: 'bg-slate-100',
          label: 'Idle'
        };
      case 'starting':
        return { 
          icon: <PlayCircle size={iconSize} />, 
          color: 'text-blue-500',
          bgColor: 'bg-blue-50',
          label: 'Starting'
        };
      case 'running':
        return { 
          icon: <RefreshCw size={iconSize} className="animate-spin-slow" />, 
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          label: 'Running'
        };
      case 'paused':
        return { 
          icon: <Pause size={iconSize} />, 
          color: 'text-amber-500',
          bgColor: 'bg-amber-50',
          label: 'Paused'
        };
      case 'completed':
        return { 
          icon: <CheckCircle2 size={iconSize} />, 
          color: 'text-emerald-600',
          bgColor: 'bg-emerald-50',
          label: 'Completed'
        };
      case 'failed':
        return { 
          icon: <XCircle size={iconSize} />, 
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          label: 'Failed'
        };
      case 'retrying':
        return { 
          icon: <Hourglass size={iconSize} className="animate-pulse" />, 
          color: 'text-amber-600',
          bgColor: 'bg-amber-50',
          label: 'Retrying'
        };
      default:
        return { 
          icon: <Clock size={iconSize} />, 
          color: 'text-slate-400',
          bgColor: 'bg-slate-100',
          label: 'Unknown'
        };
    }
  };
  
  const details = getStateDetails(state);
  
  return (
    <>
      <div className={`rounded-full p-1 ${details.bgColor}`}>
        <div className={`${details.color}`}>
          {details.icon}
        </div>
      </div>
      <span className={`ml-2 text-sm font-medium ${details.color}`}>
        {details.label}
      </span>
    </>
  );
}
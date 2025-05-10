import React, { useState } from 'react';
import { 
  WorkflowStateIndicator, 
  WorkflowState, 
  useWorkflowState 
} from './StateChangeAnimation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';

/**
 * WorkflowStateDemo Component
 * 
 * This component demonstrates the micro-animations used for workflow state changes.
 * It provides a UI to trigger different state transitions and shows both the current
 * and previous states with animated transitions.
 */
export default function WorkflowStateDemo() {
  const { currentState, previousState, changeState } = useWorkflowState('idle');
  
  // Demo cards to show different transition examples
  const statesList: WorkflowState[] = [
    'idle',
    'starting',
    'running',
    'paused',
    'completed',
    'failed',
    'retrying'
  ];
  
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Current Workflow State</CardTitle>
            <CardDescription>
              Demonstrates state transition animations. Click the buttons below to change states.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-20 bg-slate-50 rounded-md">
              <WorkflowStateIndicator 
                state={currentState} 
                previousState={previousState} 
                size="lg"
                animate={true}
              />
            </div>
            
            <div className="mt-4 text-sm text-muted-foreground">
              <div><strong>Current state:</strong> {currentState}</div>
              <div><strong>Previous state:</strong> {previousState || 'none'}</div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-wrap gap-2">
            {statesList.map((state) => (
              <Button
                key={state}
                size="sm"
                variant={currentState === state ? "default" : "outline"}
                onClick={() => changeState(state)}
              >
                {state.charAt(0).toUpperCase() + state.slice(1)}
              </Button>
            ))}
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>State Indicators</CardTitle>
            <CardDescription>
              All available workflow state indicators with their respective styles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {statesList.map((state) => (
                <div 
                  key={state} 
                  className="flex items-center p-2 rounded-md hover:bg-slate-50 transition-colors"
                >
                  <WorkflowStateIndicator state={state} size="md" animate={false} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Workflow State Transition Animation</CardTitle>
          <CardDescription>
            Animated workflow sequence showing a typical lifecycle
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AutomaticWorkflowSequence />
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Automatically cycles through a typical workflow state sequence
 */
function AutomaticWorkflowSequence() {
  // The sequence of states to cycle through
  const sequence: WorkflowState[] = [
    'idle',
    'starting',
    'running',
    'completed'
  ];
  
  const errorSequence: WorkflowState[] = [
    'idle',
    'starting',
    'running',
    'failed',
    'retrying',
    'running',
    'completed'
  ];
  
  const [activeSequence, setActiveSequence] = useState<'success' | 'error'>('success');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentState, setCurrentState] = useState<WorkflowState>('idle');
  const [previousState, setPreviousState] = useState<WorkflowState | undefined>(undefined);
  
  // Reset and start the animation sequence
  const startSequence = () => {
    setCurrentIndex(0);
    setCurrentState('idle');
    setPreviousState(undefined);
    setIsPlaying(true);
    
    // Start the sequence animation
    const currentSequence = activeSequence === 'success' ? sequence : errorSequence;
    animateSequence(currentSequence, 0);
  };
  
  // Recursive function to animate through the sequence
  const animateSequence = (stateSequence: WorkflowState[], index: number) => {
    if (index >= stateSequence.length || !isPlaying) return;
    
    // Update the state with animation
    setTimeout(() => {
      setPreviousState(currentState);
      setCurrentState(stateSequence[index]);
      setCurrentIndex(index);
      
      // Continue to the next state after a delay
      setTimeout(() => {
        animateSequence(stateSequence, index + 1);
      }, 2000); // 2 second delay between state changes
    }, 300); // Small initial delay
  };
  
  const getCurrentSequence = () => {
    return activeSequence === 'success' ? sequence : errorSequence;
  };
  
  return (
    <div className="space-y-6">
      <div className="bg-slate-50 p-6 rounded-lg">
        <div className="flex flex-col items-center space-y-8">
          {/* Flow visualization */}
          <div className="flex items-center justify-center space-x-4 w-full">
            {getCurrentSequence().map((state, idx) => (
              <React.Fragment key={idx}>
                <div className="relative">
                  <div 
                    className={`h-12 w-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                      idx === currentIndex 
                        ? 'border-primary bg-primary/10 scale-110' 
                        : idx < currentIndex 
                          ? 'border-green-500 bg-green-50' 
                          : 'border-gray-200 bg-white'
                    }`}
                  >
                    {idx === currentIndex && (
                      <motion.div
                        className="absolute -inset-1 rounded-full border border-primary/30"
                        animate={{
                          scale: [1, 1.1, 1],
                          opacity: [0.5, 1, 0.5]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      />
                    )}
                    <span className="text-sm font-medium">
                      {idx + 1}
                    </span>
                  </div>
                  <div className="absolute -bottom-6 whitespace-nowrap text-xs font-medium opacity-80">
                    {state}
                  </div>
                </div>
                
                {idx < getCurrentSequence().length - 1 && (
                  <div 
                    className={`h-1 w-8 transition-colors duration-300 ${
                      idx < currentIndex ? 'bg-green-500' : 'bg-gray-200'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
          
          {/* Current state with animation */}
          <div className="mt-8 text-center">
            <WorkflowStateIndicator 
              state={currentState} 
              previousState={previousState} 
              size="lg"
              animate={true}
              className="mb-2"
            />
            
            <p className="text-sm text-muted-foreground mt-2">
              {isPlaying 
                ? "Workflow is being processed..." 
                : "Click 'Start Sequence' to see the state transitions"}
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-center space-x-4">
        <div className="flex items-center space-x-2 mr-6">
          <Button
            variant={activeSequence === 'success' ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setActiveSequence('success');
              setIsPlaying(false);
              setCurrentState('idle');
              setCurrentIndex(0);
            }}
          >
            Success Flow
          </Button>
          <Button
            variant={activeSequence === 'error' ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setActiveSequence('error');
              setIsPlaying(false);
              setCurrentState('idle');
              setCurrentIndex(0);
            }}
          >
            Error/Retry Flow
          </Button>
        </div>
        
        <Button 
          onClick={startSequence} 
          disabled={isPlaying}
        >
          {isPlaying ? 'Running...' : 'Start Sequence'}
        </Button>
        
        {isPlaying && (
          <Button 
            variant="outline" 
            onClick={() => setIsPlaying(false)}
          >
            Stop
          </Button>
        )}
      </div>
    </div>
  );
}
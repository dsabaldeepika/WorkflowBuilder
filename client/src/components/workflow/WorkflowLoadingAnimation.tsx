import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Zap, RotateCw, ArrowRight, CheckCircle, Server, Database, Workflow } from 'lucide-react';

interface WorkflowLoadingAnimationProps {
  isLoading: boolean;
  loadingText?: string;
  onComplete?: () => void;
  showStages?: boolean;
  stageDelay?: number;
}

const stages = [
  { 
    icon: Server, 
    text: "Initializing workflow engine...",
    color: "#3b82f6" // blue-500
  },
  { 
    icon: Database, 
    text: "Connecting to data sources...",
    color: "#8b5cf6" // violet-500
  },
  { 
    icon: Workflow, 
    text: "Processing workflow nodes...",
    color: "#ec4899" // pink-500
  },
  { 
    icon: Zap, 
    text: "Executing automation steps...",
    color: "#f59e0b" // amber-500
  },
  { 
    icon: CheckCircle, 
    text: "Finalizing workflow...",
    color: "#10b981" // emerald-500
  }
];

export const WorkflowLoadingAnimation: React.FC<WorkflowLoadingAnimationProps> = ({
  isLoading,
  loadingText = "Processing your workflow",
  onComplete,
  showStages = true,
  stageDelay = 1500
}) => {
  const [activeStage, setActiveStage] = useState(0);
  const [particleCount] = useState(15);
  const [particles, setParticles] = useState<Array<{id: number, x: number, y: number, size: number, delay: number}>>([]);
  
  // Setup particles
  useEffect(() => {
    if (isLoading) {
      const newParticles = Array.from({ length: particleCount }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 8 + 2,
        delay: Math.random() * 5
      }));
      setParticles(newParticles);
    }
  }, [isLoading, particleCount]);
  
  // Progress through stages
  useEffect(() => {
    if (!isLoading || !showStages) return;
    
    if (activeStage < stages.length - 1) {
      const timer = setTimeout(() => {
        setActiveStage(prev => prev + 1);
      }, stageDelay);
      
      return () => clearTimeout(timer);
    } else if (onComplete) {
      const timer = setTimeout(() => {
        onComplete();
      }, stageDelay);
      
      return () => clearTimeout(timer);
    }
  }, [isLoading, activeStage, showStages, stageDelay, onComplete]);
  
  if (!isLoading) return null;
  
  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center overflow-hidden"
      >
        <div className="w-full max-w-md bg-white rounded-lg shadow-xl overflow-hidden">
          {/* Particle animation container */}
          <div className="relative h-32 bg-gradient-to-r from-blue-500 to-purple-600 overflow-hidden">
            {/* Moving particles */}
            {particles.map(particle => (
              <motion.div
                key={particle.id}
                className="absolute rounded-full bg-white opacity-60"
                initial={{ 
                  x: `${particle.x}%`, 
                  y: `${particle.y}%`,
                  width: 0,
                  height: 0
                }}
                animate={{ 
                  x: [
                    `${particle.x}%`, 
                    `${(particle.x + 20) % 100}%`, 
                    `${(particle.x - 10) % 100}%`,
                    `${particle.x}%`
                  ],
                  y: [
                    `${particle.y}%`, 
                    `${(particle.y - 30) % 100}%`,
                    `${(particle.y + 10) % 100}%`,
                    `${particle.y}%`
                  ],
                  width: [`${particle.size}px`, `${particle.size * 1.5}px`, `${particle.size}px`],
                  height: [`${particle.size}px`, `${particle.size * 1.5}px`, `${particle.size}px`],
                  opacity: [0.6, 0.8, 0.4, 0.6]
                }}
                transition={{ 
                  duration: 8 + particle.delay,
                  ease: "easeInOut",
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              />
            ))}
            
            {/* Center workflow icon */}
            <motion.div 
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
              animate={{ 
                rotate: [0, 360],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                duration: 4,
                ease: "easeInOut",
                repeat: Infinity,
                repeatType: "reverse"
              }}
            >
              <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center shadow-lg">
                <Workflow className="h-10 w-10 text-blue-600" />
              </div>
              
              {/* Orbiting element */}
              <motion.div
                className="absolute"
                animate={{
                  rotate: 360
                }}
                transition={{
                  duration: 3,
                  ease: "linear",
                  repeat: Infinity
                }}
                style={{
                  width: "100px",
                  height: "100px",
                }}
              >
                <motion.div
                  className="absolute -top-3 -right-3 bg-amber-500 rounded-full p-1 shadow-md"
                >
                  <Zap className="h-5 w-5 text-white" />
                </motion.div>
              </motion.div>
              
              {/* Another orbiting element */}
              <motion.div
                className="absolute"
                animate={{
                  rotate: -360
                }}
                transition={{
                  duration: 4,
                  ease: "linear",
                  repeat: Infinity
                }}
                style={{
                  width: "120px",
                  height: "120px",
                }}
              >
                <motion.div
                  className="absolute top-0 left-0 bg-emerald-500 rounded-full p-1 shadow-md"
                >
                  <Sparkles className="h-5 w-5 text-white" />
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
          
          {/* Text content */}
          <div className="p-6">
            <h3 className="text-xl font-semibold text-center mb-4">{loadingText}</h3>
            
            {showStages && (
              <div className="space-y-3">
                {stages.map((stage, index) => (
                  <div key={index} className="flex items-center">
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ 
                        scale: index <= activeStage ? 1 : 0,
                        opacity: index <= activeStage ? 1 : 0,
                      }}
                      className="flex-shrink-0 mr-3"
                    >
                      {index < activeStage ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : index === activeStage ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ 
                            duration: 1.5,
                            ease: "linear",
                            repeat: Infinity
                          }}
                        >
                          <RotateCw className="h-5 w-5" style={{ color: stage.color }} />
                        </motion.div>
                      ) : (
                        <ArrowRight className="h-5 w-5 text-gray-400" />
                      )}
                    </motion.div>
                    
                    <motion.div
                      className="flex items-center"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ 
                        opacity: index <= activeStage ? 1 : 0.5,
                        x: 0
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      <span className={index <= activeStage ? 'font-medium' : 'text-gray-500'}>
                        {stage.text}
                      </span>
                    </motion.div>
                  </div>
                ))}
              </div>
            )}
            
            {!showStages && (
              <div className="flex justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ 
                    duration: 1.5,
                    ease: "linear",
                    repeat: Infinity
                  }}
                >
                  <RotateCw className="h-6 w-6 text-blue-500" />
                </motion.div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default WorkflowLoadingAnimation;
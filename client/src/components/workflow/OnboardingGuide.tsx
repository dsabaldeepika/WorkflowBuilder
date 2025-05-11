import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, HelpCircle, X } from 'lucide-react';
import type { OnboardingStep } from './WorkflowOnboarding';

interface OnboardingGuideProps {
  steps: OnboardingStep[];
  currentStepIndex: number;
  onDismiss: () => void;
  onCompleteStep: (index: number) => void;
}

const OnboardingGuide: React.FC<OnboardingGuideProps> = ({
  steps,
  currentStepIndex,
  onDismiss,
  onCompleteStep,
}) => {
  const currentStep = steps[currentStepIndex];
  
  if (!currentStep) return null;
  
  return (
    <div className="absolute bottom-6 right-6 z-50">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
        >
          <Card className="w-[350px] border-primary/20 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">
                    {currentStepIndex + 1}
                  </div>
                  <h3 className="text-base font-medium">{currentStep.title}</h3>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={onDismiss}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {currentStep.description}
              </p>
            </CardContent>
            <CardFooter className="flex justify-between border-t bg-muted/50 p-2">
              <div className="flex items-center text-xs text-muted-foreground">
                <HelpCircle className="mr-1 h-3 w-3" />
                <span>Step {currentStepIndex + 1} of {steps.length}</span>
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="text-xs"
                onClick={() => onCompleteStep(currentStepIndex)}
              >
                <CheckCircle2 className="mr-1 h-3 w-3" />
                Mark as done
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default OnboardingGuide;
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { X, Clock } from 'lucide-react';

export type ScheduleFrequency = 'once' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'custom';

export interface ScheduleOptions {
  enabled: boolean;
  frequency: ScheduleFrequency;
  customInterval?: string;
}

interface TriggerScheduleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  schedule: ScheduleOptions;
  onScheduleChange: (schedule: ScheduleOptions) => void;
  onAddToWorkflow: () => void;
}

const TriggerScheduleDialog: React.FC<TriggerScheduleDialogProps> = ({
  isOpen,
  onClose,
  schedule,
  onScheduleChange,
  onAddToWorkflow,
}) => {
  const handleFrequencyChange = (frequency: ScheduleFrequency) => {
    onScheduleChange({ ...schedule, frequency, enabled: true });
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>Configure Trigger Schedule</DialogTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        
        <div className="py-4">
          <div className="bg-sky-50 p-4 mb-4 rounded-md">
            <div className="flex items-start">
              <Clock className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
              <p className="text-sm text-blue-700">
                Choose how often this trigger should run. You can change this later in the workflow settings.
              </p>
            </div>
          </div>
          
          <RadioGroup 
            value={schedule.frequency} 
            onValueChange={(value) => handleFrequencyChange(value as ScheduleFrequency)}
            className="space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="once" id="run-once" />
              <Label htmlFor="run-once">Run once</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="hourly" id="run-hourly" />
              <Label htmlFor="run-hourly">Run hourly</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="daily" id="run-daily" />
              <Label htmlFor="run-daily">Run daily</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="weekly" id="run-weekly" />
              <Label htmlFor="run-weekly">Run weekly</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="custom" id="run-custom" />
              <Label htmlFor="run-custom">Custom interval</Label>
            </div>
          </RadioGroup>
        </div>
        
        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={onClose}>
            Back
          </Button>
          <Button onClick={onAddToWorkflow}>
            Add to Workflow
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TriggerScheduleDialog;
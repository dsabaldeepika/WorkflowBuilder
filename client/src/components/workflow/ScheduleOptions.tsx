import React, { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Clock, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';

export type ScheduleFrequency = 'once' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'custom';

export interface ScheduleOptions {
  enabled: boolean;
  frequency: ScheduleFrequency;
  startDate?: Date;
  startTime?: string;
  customCron?: string;
  runCount: number;
  lastRun?: Date;
}

interface ScheduleOptionsProps {
  schedule: ScheduleOptions;
  onScheduleChange: (schedule: ScheduleOptions) => void;
  subscriptionTier: string;
  maxRunsPerMonth: number;
  currentRunCount: number;
}

const ScheduleOptions: React.FC<ScheduleOptionsProps> = ({
  schedule,
  onScheduleChange,
  subscriptionTier,
  maxRunsPerMonth,
  currentRunCount
}) => {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  
  const handleToggleEnabled = (enabled: boolean) => {
    onScheduleChange({ ...schedule, enabled });
  };
  
  const handleFrequencyChange = (frequency: ScheduleFrequency) => {
    onScheduleChange({ ...schedule, frequency });
  };
  
  const handleDateChange = (date: Date | undefined) => {
    onScheduleChange({ ...schedule, startDate: date });
    setIsCalendarOpen(false);
  };
  
  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onScheduleChange({ ...schedule, startTime: e.target.value });
  };
  
  const handleCronChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onScheduleChange({ ...schedule, customCron: e.target.value });
  };
  
  const getEstimatedRunsPerMonth = () => {
    switch (schedule.frequency) {
      case 'once': return 1;
      case 'hourly': return 24 * 30; // ~30 days in a month
      case 'daily': return 30;
      case 'weekly': return 4;
      case 'monthly': return 1;
      case 'custom': return 10; // Just an estimate, could be any number
      default: return 0;
    }
  };
  
  const estimatedRuns = getEstimatedRunsPerMonth();
  const isExceedingLimit = estimatedRuns + currentRunCount > maxRunsPerMonth;
  
  const remainingRuns = Math.max(0, maxRunsPerMonth - currentRunCount);
  
  const getHumanReadableSchedule = () => {
    if (!schedule.enabled) return 'No schedule set';
    
    let base = '';
    switch (schedule.frequency) {
      case 'once':
        base = 'Runs once';
        break;
      case 'hourly':
        base = 'Runs every hour';
        break;
      case 'daily':
        base = 'Runs daily';
        break;
      case 'weekly':
        base = 'Runs weekly';
        break;
      case 'monthly':
        base = 'Runs monthly';
        break;
      case 'custom':
        base = `Custom schedule: ${schedule.customCron || 'Not set'}`;
        break;
    }
    
    if (schedule.startDate) {
      base += ` starting on ${format(schedule.startDate, 'PPP')}`;
    }
    
    if (schedule.startTime) {
      base += ` at ${schedule.startTime}`;
    }
    
    return base;
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle>Schedule Workflow</CardTitle>
          <Switch 
            checked={schedule.enabled} 
            onCheckedChange={handleToggleEnabled}
          />
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {schedule.enabled && (
          <>
            <div className="space-y-2">
              <Label htmlFor="frequency">Run Frequency</Label>
              <Select 
                value={schedule.frequency} 
                onValueChange={(value: ScheduleFrequency) => handleFrequencyChange(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="once">Run Once</SelectItem>
                  <SelectItem value="hourly">Hourly</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="custom">Custom (Advanced)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="date">Start Date</Label>
                <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !schedule.startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {schedule.startDate ? format(schedule.startDate, 'PPP') : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={schedule.startDate}
                      onSelect={handleDateChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="time">Start Time</Label>
                <div className="flex items-center">
                  <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="time"
                    id="time"
                    value={schedule.startTime || ''}
                    onChange={handleTimeChange}
                  />
                </div>
              </div>
            </div>
            
            {schedule.frequency === 'custom' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="cron">Custom Cron Expression</Label>
                  <a 
                    href="https://crontab.guru/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline"
                  >
                    Help
                  </a>
                </div>
                <Input
                  id="cron"
                  placeholder="*/5 * * * *"
                  value={schedule.customCron || ''}
                  onChange={handleCronChange}
                />
                <p className="text-xs text-muted-foreground">
                  Example: */5 * * * * (runs every 5 minutes)
                </p>
              </div>
            )}
            
            <div className="flex justify-between items-center border-t pt-3 mt-2">
              <div>
                <p className="text-sm font-medium">Usage</p>
                <p className="text-xs text-muted-foreground">
                  {currentRunCount} of {maxRunsPerMonth} runs used this month
                </p>
              </div>
              <Badge variant={isExceedingLimit ? "destructive" : "outline"}>
                {isExceedingLimit ? "Limit Exceeded" : `${remainingRuns} Runs Remaining`}
              </Badge>
            </div>
            
            {isExceedingLimit && (
              <div className="flex items-start gap-2 p-2 rounded-md bg-destructive/10 text-destructive">
                <AlertCircle className="h-4 w-4 mt-0.5" />
                <p className="text-xs">
                  This schedule exceeds your limit of {maxRunsPerMonth} runs per month. 
                  Consider upgrading your plan or reducing the frequency.
                </p>
              </div>
            )}
          </>
        )}
        
        {!schedule.enabled && (
          <div className="py-4 text-center text-muted-foreground">
            <p>Enable scheduling to run this workflow automatically</p>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex flex-col items-start pt-0">
        <p className="text-xs text-muted-foreground mb-1">
          {schedule.enabled ? getHumanReadableSchedule() : ''}
        </p>
        <p className="text-xs text-muted-foreground">
          <strong>Current Plan:</strong> {subscriptionTier} ({maxRunsPerMonth} runs/month)
        </p>
      </CardFooter>
    </Card>
  );
};

export default ScheduleOptions;
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { DemoRequestForm } from '@/components/forms/DemoRequestForm';
import { Calendar } from 'lucide-react';

interface DemoRequestDialogProps {
  trigger?: React.ReactNode;
  buttonClassName?: string;
}

export function DemoRequestDialog({ 
  trigger, 
  buttonClassName 
}: DemoRequestDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button 
            variant="outline" 
            size="sm"
            className={buttonClassName}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Schedule Demo
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">Schedule Your Personalized Demo</DialogTitle>
          <DialogDescription className="text-center text-base mx-auto max-w-lg">
            Let's find a time to walk you through PumpFlux's capabilities and show you how it can transform your workflow automation.
          </DialogDescription>
        </DialogHeader>
        
        <DemoRequestForm />
      </DialogContent>
    </Dialog>
  );
}
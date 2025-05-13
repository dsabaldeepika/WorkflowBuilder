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
import { Tag } from 'lucide-react';
import { TemplateRequestForm } from '@/components/forms/TemplateRequestForm';

interface TemplateRequestDialogProps {
  trigger?: React.ReactNode;
  buttonClassName?: string;
}

export function TemplateRequestDialog({ 
  trigger, 
  buttonClassName 
}: TemplateRequestDialogProps) {
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
            <Tag className="h-4 w-4 mr-2" />
            Request Template
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Request a Template</DialogTitle>
          <DialogDescription>
            Tell us about the workflow template you'd like us to create
          </DialogDescription>
        </DialogHeader>
        
        <TemplateRequestForm />
      </DialogContent>
    </Dialog>
  );
}
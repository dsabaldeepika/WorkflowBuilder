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
import { ExternalLink } from 'lucide-react';
import { ContactForm } from '@/components/forms/ContactForm';

interface ContactFormDialogProps {
  trigger?: React.ReactNode;
  buttonClassName?: string;
}

export function ContactFormDialog({ 
  trigger, 
  buttonClassName 
}: ContactFormDialogProps) {
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
            <ExternalLink className="h-4 w-4 mr-2" />
            Contact Us
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Contact Us</DialogTitle>
          <DialogDescription>
            Send us a message and we'll get back to you as soon as possible.
          </DialogDescription>
        </DialogHeader>
        
        <ContactForm />
      </DialogContent>
    </Dialog>
  );
}
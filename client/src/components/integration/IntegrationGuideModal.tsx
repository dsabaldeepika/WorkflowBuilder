import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import IntegrationGuideContent from './IntegrationGuideContent';

interface IntegrationGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  templateName: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

const IntegrationGuideModal: React.FC<IntegrationGuideModalProps> = ({
  isOpen,
  onClose,
  templateName,
  category,
  difficulty
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Integration Guide</DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <DialogDescription>
            Comprehensive guide to maximize your results with this template
          </DialogDescription>
        </DialogHeader>
        
        <IntegrationGuideContent 
          templateName={templateName}
          category={category}
          difficulty={difficulty}
        />
        
        <DialogFooter className="mt-6">
          <Button onClick={onClose}>Close Guide</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default IntegrationGuideModal;
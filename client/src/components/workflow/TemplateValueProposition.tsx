import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BookOpen, User, Clock, TrendingUp, BrainCircuit, Coins } from 'lucide-react';

interface TemplateValuePropositionProps {
  category: string;
  difficulty: string;
  popularity: number;
  onViewIntegrationGuide: () => void;
}

const TemplateValueProposition: React.FC<TemplateValuePropositionProps> = ({
  category,
  difficulty,
  popularity,
  onViewIntegrationGuide
}) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'intermediate':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'advanced':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };
  
  // Calculate time savings based on difficulty
  const getTimeSavings = () => {
    switch (difficulty) {
      case 'beginner':
        return '5-10 hours';
      case 'intermediate':
        return '15-25 hours';
      case 'advanced':
        return '30-50+ hours';
      default:
        return '10-20 hours';
    }
  };
  
  // Calculate monetary value based on difficulty
  const getMonetaryValue = () => {
    switch (difficulty) {
      case 'beginner':
        return '$500 - $1,000';
      case 'intermediate':
        return '$1,500 - $2,500';
      case 'advanced':
        return '$3,000 - $5,000+';
      default:
        return '$1,000 - $2,000';
    }
  };
  
  // ROI calculations
  const getROI = () => {
    switch (difficulty) {
      case 'beginner':
        return '200-300%';
      case 'intermediate':
        return '300-500%';
      case 'advanced':
        return '500-800%';
      default:
        return '300-400%';
    }
  };
  
  const getCommonUseCases = (category: string) => {
    switch (category.toLowerCase()) {
      case 'crm':
        return ['Lead qualification', 'Customer onboarding', 'Follow-up automation'];
      case 'marketing':
        return ['Campaign automation', 'Audience segmentation', 'Performance reporting'];
      case 'ecommerce':
        return ['Order processing', 'Inventory management', 'Customer communications'];
      default:
        return ['Process automation', 'Data integration', 'Workflow optimization'];
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Template Value Proposition</span>
          <Badge variant="outline" className={getDifficultyColor(difficulty)}>
            {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-muted-foreground">
            <User className="h-4 w-4" />
            <span>Used by {popularity} professionals</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Updated for 2025</span>
          </div>
        </div>
        
        <Alert variant="default" className="bg-primary/5 border-primary/20">
          <TrendingUp className="h-4 w-4" />
          <AlertDescription>
            This template provides significant time and cost savings compared to building from scratch.
          </AlertDescription>
        </Alert>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center border-b pb-2">
            <span className="font-medium">Development Time Saved</span>
            <span className="font-bold">{getTimeSavings()}</span>
          </div>
          
          <div className="flex justify-between items-center border-b pb-2">
            <span className="font-medium">Estimated Value</span>
            <span className="font-bold">{getMonetaryValue()}</span>
          </div>
          
          <div className="flex justify-between items-center border-b pb-2">
            <span className="font-medium">Expected ROI</span>
            <span className="font-bold text-green-600">{getROI()}</span>
          </div>
          
          <div className="flex justify-between items-center border-b pb-2">
            <span className="font-medium">Integration Complexity</span>
            <div className="flex items-center">
              <div className="flex">
                {Array.from({ length: difficulty === 'beginner' ? 1 : difficulty === 'intermediate' ? 2 : 3 }).map((_, i) => (
                  <div 
                    key={i} 
                    className="w-2 h-4 bg-primary ml-1"
                  />
                ))}
                {Array.from({ length: difficulty === 'beginner' ? 2 : difficulty === 'intermediate' ? 1 : 0 }).map((_, i) => (
                  <div 
                    key={i} 
                    className="w-2 h-4 bg-muted ml-1"
                  />
                ))}
              </div>
              <span className="ml-2 text-sm">{difficulty === 'beginner' ? 'Low' : difficulty === 'intermediate' ? 'Medium' : 'High'}</span>
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="text-sm font-medium mb-2 flex items-center">
            <BrainCircuit className="mr-1.5 h-4 w-4 text-primary" />
            Common Use Cases
          </h3>
          <ul className="space-y-1">
            {getCommonUseCases(category).map((useCase, index) => (
              <li key={index} className="text-sm flex items-center">
                <div className="h-1.5 w-1.5 rounded-full bg-primary mr-2" />
                {useCase}
              </li>
            ))}
          </ul>
        </div>
        
        <div>
          <h3 className="text-sm font-medium mb-2 flex items-center">
            <Coins className="mr-1.5 h-4 w-4 text-primary" />
            Monetization Potential
          </h3>
          <p className="text-sm text-muted-foreground">
            {difficulty === 'beginner' 
              ? 'Great for creating value-added services with minimal complexity.' 
              : difficulty === 'intermediate'
                ? 'Ideal for creating specialized solution packages for clients.'
                : 'Perfect for building premium enterprise-grade offerings.'}
          </p>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          variant="outline" 
          onClick={onViewIntegrationGuide}
          className="w-full"
        >
          <BookOpen className="mr-2 h-4 w-4" />
          View Integration Guide
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TemplateValueProposition;
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, BookOpen, ChevronRight, ArrowRight } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface IntegrationGuidePromptProps {
  templateName: string;
  category: string;
  onOpenGuide: () => void;
  onContinue: () => void;
}

const IntegrationGuidePrompt: React.FC<IntegrationGuidePromptProps> = ({
  templateName,
  category,
  onOpenGuide,
  onContinue
}) => {
  return (
    <div className="max-w-3xl mx-auto">
      <Card className="border-primary/20 bg-primary/5 shadow-lg">
        <CardHeader>
          <div className="flex items-center text-amber-500 gap-2 mb-2">
            <AlertTriangle className="h-5 w-5" />
            <span className="text-sm font-medium">Recommendation</span>
          </div>
          <CardTitle className="text-2xl">Get the most out of this template</CardTitle>
          <CardDescription className="text-base">
            We've created a detailed integration guide to help you implement this {category} template successfully.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            Our data shows that <span className="font-semibold">87% of users who read the integration guide</span> implemented their workflow successfully on the first try.
          </p>
          
          <div className="bg-background rounded-md p-4 border">
            <h3 className="font-medium mb-2 flex items-center">
              <BookOpen className="mr-2 h-4 w-4 text-primary" />
              What's in the integration guide?
            </h3>
            <ul className="space-y-2">
              <li className="flex items-start">
                <ChevronRight className="h-4 w-4 mr-1 text-primary flex-shrink-0 mt-1" />
                <span>Step-by-step implementation instructions customized for {category} workflows</span>
              </li>
              <li className="flex items-start">
                <ChevronRight className="h-4 w-4 mr-1 text-primary flex-shrink-0 mt-1" />
                <span>Best practices and common pitfalls to avoid</span>
              </li>
              <li className="flex items-start">
                <ChevronRight className="h-4 w-4 mr-1 text-primary flex-shrink-0 mt-1" />
                <span>2025 monetization strategies to maximize ROI</span>
              </li>
              <li className="flex items-start">
                <ChevronRight className="h-4 w-4 mr-1 text-primary flex-shrink-0 mt-1" />
                <span>Maintenance recommendations and optimization tips</span>
              </li>
            </ul>
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              The guide takes about 3-5 minutes to review
            </div>
            <div className="flex items-center text-sm text-primary">
              <BookOpen className="h-4 w-4 mr-1" />
              <span>Recommended reading</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={onContinue}
          >
            Skip for now
          </Button>
          <Button 
            onClick={onOpenGuide}
            className="gap-1"
          >
            <BookOpen className="h-4 w-4" />
            Read Integration Guide
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default IntegrationGuidePrompt;
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, BookOpen, Tag, Calendar, Award, Bookmark, BarChart, FastForward, Clock } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { Link } from 'wouter';
import TemplateValueProposition from './TemplateValueProposition';
import IntegrationGuidePrompt from '../integration/IntegrationGuidePrompt';
import IntegrationGuideModal from '../integration/IntegrationGuideModal';

interface EnhancedTemplateDetailProps {
  template: {
    id: number;
    name: string;
    description: string;
    category: string;
    tags: string[];
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    popularity: number;
    imageUrl?: string;
    createdBy?: string;
    createdAt: Date;
  };
  onUseTemplate: (templateId: number) => void;
}

const EnhancedTemplateDetail: React.FC<EnhancedTemplateDetailProps> = ({
  template,
  onUseTemplate
}) => {
  const [showIntegrationPrompt, setShowIntegrationPrompt] = useState(false);
  const [showIntegrationGuide, setShowIntegrationGuide] = useState(false);
  
  const handleUseTemplateClick = () => {
    setShowIntegrationPrompt(true);
  };
  
  const handleOpenIntegrationGuide = () => {
    setShowIntegrationPrompt(false);
    setShowIntegrationGuide(true);
  };
  
  const handleContinueToTemplate = () => {
    setShowIntegrationPrompt(false);
    onUseTemplate(template.id);
  };
  
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
  
  if (showIntegrationPrompt) {
    return (
      <IntegrationGuidePrompt
        templateName={template.name}
        category={template.category}
        onOpenGuide={handleOpenIntegrationGuide}
        onContinue={handleContinueToTemplate}
      />
    );
  }
  
  return (
    <>
      <IntegrationGuideModal
        isOpen={showIntegrationGuide}
        onClose={() => setShowIntegrationGuide(false)}
        templateName={template.name}
        category={template.category}
        difficulty={template.difficulty}
      />
    
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <Badge variant="outline" className={getDifficultyColor(template.difficulty)}>
                  {template.difficulty.charAt(0).toUpperCase() + template.difficulty.slice(1)}
                </Badge>
                <Badge variant="outline" className="bg-primary/10">
                  <BookOpen className="mr-1 h-3 w-3" /> Integration Guide Available
                </Badge>
              </div>
              <CardTitle className="text-2xl">{template.name}</CardTitle>
              <CardDescription className="text-base">{template.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Category:</span>
                  <span>{template.category}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Created:</span>
                  <span>{format(new Date(template.createdAt), 'MMM d, yyyy')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Created by:</span>
                  <span>{template.createdBy || 'PumpFlux Team'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Bookmark className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Used by:</span>
                  <span>{template.popularity} users</span>
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div className="space-y-4">
                <h3 className="font-medium">Why Use This Template?</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-start gap-2">
                    <div className="mt-0.5 bg-primary/10 p-1.5 rounded-full">
                      <FastForward size={16} />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">Accelerate Setup</h4>
                      <p className="text-sm text-muted-foreground">Save 20+ hours in configuration time</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="mt-0.5 bg-primary/10 p-1.5 rounded-full">
                      <BarChart size={16} />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">Proven Design</h4>
                      <p className="text-sm text-muted-foreground">Based on best practices from top performers</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="mt-0.5 bg-primary/10 p-1.5 rounded-full">
                      <Award size={16} />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">Pre-optimized</h4>
                      <p className="text-sm text-muted-foreground">Includes performance improvements</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="mt-0.5 bg-primary/10 p-1.5 rounded-full">
                      <Clock size={16} />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">Fast Time to Value</h4>
                      <p className="text-sm text-muted-foreground">Start seeing results in days, not months</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {template.tags && template.tags.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-medium mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {template.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary">{tag}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col space-y-3 sm:flex-row sm:space-x-3 sm:space-y-0 pt-0">
              <Button 
                onClick={handleUseTemplateClick} 
                className="w-full sm:w-auto"
              >
                Use Template
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowIntegrationGuide(true)}
                className="w-full sm:w-auto"
              >
                <BookOpen className="mr-2 h-4 w-4" />
                View Integration Guide
              </Button>
            </CardFooter>
          </Card>
          
          {template.imageUrl && (
            <Card>
              <CardHeader>
                <CardTitle>Template Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <img
                  src={template.imageUrl}
                  alt={`${template.name} Preview`}
                  className="w-full rounded-md border"
                />
              </CardContent>
            </Card>
          )}
        </div>
        
        <div className="space-y-6">
          <TemplateValueProposition
            category={template.category}
            difficulty={template.difficulty}
            popularity={template.popularity}
            onViewIntegrationGuide={() => setShowIntegrationGuide(true)}
          />
          
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                variant="outline" 
                onClick={handleUseTemplateClick}
                className="w-full justify-start"
              >
                <ArrowRight className="mr-2 h-4 w-4" />
                Use This Template
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowIntegrationGuide(true)}
                className="w-full justify-start"
              >
                <BookOpen className="mr-2 h-4 w-4" />
                View Integration Guide
              </Button>
              <Link href="/inspiration-gallery">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                >
                  <Bookmark className="mr-2 h-4 w-4" />
                  Browse All Templates
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default EnhancedTemplateDetail;
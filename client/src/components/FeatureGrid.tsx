import React from 'react';
import { ChevronDown, ChevronUp, HelpCircle, Zap, Share2, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface FeatureItem {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
}

interface FeatureGridProps {
  expanded?: boolean;
  onToggleExpanded?: () => void;
}

const features: FeatureItem[] = [
  {
    id: 'tooltips',
    name: 'Contextual help tooltips for new users',
    icon: <HelpCircle className="h-4 w-4 mr-2" />,
    description: 'Hover-activated help guides that provide context-sensitive information for beginners.'
  },
  {
    id: 'templates',
    name: 'Quick start templates library',
    icon: <Zap className="h-4 w-4 mr-2" />,
    description: 'Pre-built workflow templates to jumpstart your automation projects.'
  },
  {
    id: 'tutorials',
    name: 'Animated node connection tutorials',
    icon: <Share2 className="h-4 w-4 mr-2" />,
    description: 'Interactive guides showing how to create proper connections between workflow nodes.'
  },
  {
    id: 'sharing',
    name: 'One-click workflow share and export',
    icon: <Share2 className="h-4 w-4 mr-2" />,
    description: 'Easily share or export your workflows with a single button click.'
  },
  {
    id: 'performance',
    name: 'Workflow performance visualization dashboard',
    icon: <Activity className="h-4 w-4 mr-2" />,
    description: 'Visualize and analyze the performance metrics of your workflows.'
  }
];

export function FeatureGrid({ expanded = true, onToggleExpanded }: FeatureGridProps) {
  return (
    <div className="flex flex-col space-y-2 w-full max-w-3xl mx-auto py-2 bg-white/5 backdrop-blur-sm rounded-lg">
      {expanded && (
        <div className="flex flex-wrap gap-2 mb-2">
          {features.map((feature) => (
            <TooltipProvider key={feature.id} delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="flex items-center text-sm font-medium"
                    onClick={() => {
                      // Handle feature activation logic here
                      console.log(`Activating feature: ${feature.name}`);
                    }}
                  >
                    {feature.icon}
                    {feature.name}
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>{feature.description}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
      )}
      
      <div className="flex justify-center">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onToggleExpanded}
          className="text-xs flex items-center text-gray-600 hover:text-gray-900"
        >
          {expanded ? (
            <>
              <ChevronUp className="h-3 w-3 mr-1" />
              Show less
            </>
          ) : (
            <>
              <ChevronDown className="h-3 w-3 mr-1" />
              Show more
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

export default FeatureGrid;
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, DollarSign, TrendingUp, Clock, CheckCircle2, BadgeDollarSign, Zap, Star } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';

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
  
  // Get monetization benefits based on category
  const getCategoryBenefits = (category: string) => {
    const benefitsMap = {
      'CRM': {
        roi: '347%',
        timeToValue: '2-4 weeks',
        costReduction: '22%',
        productivity: '28%',
        keyBenefit: 'Increase customer retention by up to 28% with personalized automation',
        keyMetric: 'Average 22% reduction in customer acquisition costs',
        advancedFeature: 'AI-powered customer journey mapping with predictive next actions',
      },
      'Marketing': {
        roi: '419%',
        timeToValue: '1-3 weeks',
        costReduction: '31%',
        productivity: '34%',
        keyBenefit: 'Boost conversion rates up to 34% with real-time personalization',
        keyMetric: 'Average 31% reduction in ad spend waste',
        advancedFeature: 'Cross-channel attribution with privacy-first tracking',
      },
      'Sales': {
        roi: '392%',
        timeToValue: '2-5 weeks',
        costReduction: '26%',
        productivity: '40%',
        keyBenefit: 'Close deals 40% faster with intelligent pipeline automation',
        keyMetric: 'Average 26% increase in sales rep productivity',
        advancedFeature: 'AI-driven lead scoring with buying intent prediction',
      },
      'Data Processing': {
        roi: '512%',
        timeToValue: '3-6 weeks',
        costReduction: '40%',
        productivity: '85%',
        keyBenefit: 'Process unstructured data 85% faster with AI extraction',
        keyMetric: 'Average 40% reduction in data processing costs',
        advancedFeature: 'Real-time data enrichment with compliance verification',
      },
      'Social Media': {
        roi: '320%',
        timeToValue: '1-2 weeks',
        costReduction: '27%',
        productivity: '47%',
        keyBenefit: 'Increase engagement by 47% with AI-optimized posting schedules',
        keyMetric: 'Generate 3.2x ROI on social campaigns with targeted automation',
        advancedFeature: 'Trending content detection with viral potential prediction',
      },
      'Productivity': {
        roi: '289%',
        timeToValue: '1-3 weeks',
        costReduction: '32%',
        productivity: '23%',
        keyBenefit: 'Reclaim 23% of work hours through intelligent task automation',
        keyMetric: 'Reduce operational costs by 32% with streamlined processes',
        advancedFeature: 'Team coordination flows that reduce meeting time by 61%',
      },
      'default': {
        roi: '350%',
        timeToValue: '2-4 weeks',
        costReduction: '30%',
        productivity: '35%',
        keyBenefit: 'Achieve 35%+ efficiency gains with properly configured workflows',
        keyMetric: 'Reduce implementation costs by 40% with guided setup',
        advancedFeature: 'Advanced optimization techniques that 87% of competitors miss',
      }
    };
    
    return benefitsMap[category as keyof typeof benefitsMap] || benefitsMap.default;
  };
  
  const getImplementationTips = (difficulty: string) => {
    const tipsMap = {
      'beginner': [
        'Follow the step-by-step integration guide for optimal setup',
        'Start with the basic configuration before adding customizations',
        'Use the included test data to validate your implementation',
      ],
      'intermediate': [
        'Implement the error handling recommendations for production reliability',
        'Configure the advanced data mapping rules for complete integration',
        'Consider the scaling recommendations for enterprise-level usage',
      ],
      'advanced': [
        'Leverage the custom extension points for maximum flexibility',
        'Implement the distributed transaction handling for system reliability',
        'Use the provided performance optimization techniques for high-volume processing',
      ],
      'default': [
        'Follow the step-by-step integration guide for optimal setup',
        'Start with the basic configuration before adding customizations',
        'Use the included test data to validate your implementation',
      ],
    };
    
    return tipsMap[difficulty as keyof typeof tipsMap] || tipsMap.default;
  };
  
  const benefits = getCategoryBenefits(category);
  const implementationTips = getImplementationTips(difficulty);
  
  return (
    <div className="space-y-6">
      <Card className="border-green-200 dark:border-green-900">
        <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">2025 Business Value</CardTitle>
            <Badge variant="outline" className="bg-white/80 dark:bg-black/30">ROI Calculator</Badge>
          </div>
          <CardDescription>Projected outcomes based on real-world implementations</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <div className="flex flex-col items-center p-3 bg-muted/30 rounded-lg text-center">
              <BarChart className="h-5 w-5 text-green-600 dark:text-green-400 mb-1" />
              <div className="text-2xl font-bold">{benefits.roi}</div>
              <div className="text-xs text-muted-foreground">Average ROI</div>
            </div>
            <div className="flex flex-col items-center p-3 bg-muted/30 rounded-lg text-center">
              <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400 mb-1" />
              <div className="text-2xl font-bold">{benefits.productivity}</div>
              <div className="text-xs text-muted-foreground">Productivity Gain</div>
            </div>
            <div className="flex flex-col items-center p-3 bg-muted/30 rounded-lg text-center">
              <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400 mb-1" />
              <div className="text-2xl font-bold">{benefits.costReduction}</div>
              <div className="text-xs text-muted-foreground">Cost Reduction</div>
            </div>
            <div className="flex flex-col items-center p-3 bg-muted/30 rounded-lg text-center">
              <Clock className="h-5 w-5 text-green-600 dark:text-green-400 mb-1" />
              <div className="text-xl font-bold">{benefits.timeToValue}</div>
              <div className="text-xs text-muted-foreground">Time to Value</div>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-medium">Key Benefit</div>
                <div className="text-sm">{benefits.keyBenefit}</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <BadgeDollarSign className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-medium">Financial Impact</div>
                <div className="text-sm">{benefits.keyMetric}</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Zap className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-medium">Advanced Capability</div>
                <div className="text-sm">{benefits.advancedFeature}</div>
              </div>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={onViewIntegrationGuide}
                  >
                    View Complete Value Guide
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Access detailed ROI calculator and case studies</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardContent>
      </Card>
      
      <Card className="border-blue-200 dark:border-blue-900">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">Implementation Success Tips</CardTitle>
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              <span className="text-sm font-medium">{popularity} users</span>
            </div>
          </div>
          <CardDescription>Expert recommendations for optimal results</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <ul className="space-y-3">
            {implementationTips.map((tip, index) => (
              <li key={index} className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <span>{tip}</span>
              </li>
            ))}
          </ul>
          
          <div className="mt-4 pt-4 border-t">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={onViewIntegrationGuide}
                  >
                    View Integration Guide
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Comprehensive guide with step-by-step instructions</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TemplateValueProposition;
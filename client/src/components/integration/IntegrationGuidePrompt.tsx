import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, TrendingUp, BookOpen, Layers, Award, BadgeDollarSign } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
  const [showFullBenefits, setShowFullBenefits] = useState(false);

  // 2025 Monetization Benefits by Category
  const getBenefitsByCategory = (category: string) => {
    const benefits = {
      'CRM': [
        { icon: <TrendingUp size={18} />, text: 'Increase customer retention by up to 28% with personalized automation' },
        { icon: <BookOpen size={18} />, text: 'Access best practices for modern CRM personalization that top brands use' },
        { icon: <BadgeDollarSign size={18} />, text: 'Reduce CAC by 22% through automated nurturing sequences' },
        { icon: <Award size={18} />, text: 'Turn data silos into revenue opportunities with cross-system intelligence' },
        { icon: <Layers size={18} />, text: 'Save 18+ development hours with pre-built AI touchpoint optimization' }
      ],
      'Marketing': [
        { icon: <TrendingUp size={18} />, text: 'Boost conversion rates up to 34% with real-time personalization' },
        { icon: <BookOpen size={18} />, text: 'Learn cutting-edge cross-channel attribution techniques' },
        { icon: <BadgeDollarSign size={18} />, text: 'Reduce ad spend waste by 31% with AI-driven audience targeting' },
        { icon: <Award size={18} />, text: 'Implement privacy-first tracking that outperforms cookies by 42%' },
        { icon: <Layers size={18} />, text: 'Save $3,800+ on MarTech tools with integrated solutions' }
      ],
      'Sales': [
        { icon: <TrendingUp size={18} />, text: 'Close deals 40% faster with intelligent pipeline automation' },
        { icon: <BookOpen size={18} />, text: 'Access winning sales playbooks from industry leaders' },
        { icon: <BadgeDollarSign size={18} />, text: 'Increase sales rep productivity by 26% through workflow optimization' },
        { icon: <Award size={18} />, text: 'Leverage buying intent signals that most competitors miss' },
        { icon: <Layers size={18} />, text: 'Generate 52% more qualified prospects with multi-touch sequences' }
      ],
      'Data Processing': [
        { icon: <TrendingUp size={18} />, text: 'Process unstructured data 85% faster with AI extraction' },
        { icon: <BookOpen size={18} />, text: 'Learn ethical data enrichment techniques compliant with 2025 regulations' },
        { icon: <BadgeDollarSign size={18} />, text: 'Cut data processing costs by 40% with optimized workflows' },
        { icon: <Award size={18} />, text: 'Implement advanced data verification that reduces errors by 78%' },
        { icon: <Layers size={18} />, text: 'Unlock hidden value in your existing data with intelligence mining' }
      ],
      'Social Media': [
        { icon: <TrendingUp size={18} />, text: 'Increase engagement by 47% with AI-optimized posting schedules' },
        { icon: <BookOpen size={18} />, text: 'Access platform-specific growth strategies updated for 2025 algorithms' },
        { icon: <BadgeDollarSign size={18} />, text: 'Generate 3.2x ROI on social campaigns with targeted automation' },
        { icon: <Award size={18} />, text: 'Implement trending content detection that predicts viral potential' },
        { icon: <Layers size={18} />, text: 'Save 15+ hours per week with comprehensive social workflow integration' }
      ],
      'Productivity': [
        { icon: <TrendingUp size={18} />, text: 'Reclaim 23% of work hours through intelligent task automation' },
        { icon: <BookOpen size={18} />, text: 'Learn the latest deep work techniques enhanced by workflow automation' },
        { icon: <BadgeDollarSign size={18} />, text: 'Reduce operational costs by 32% with streamlined processes' },
        { icon: <Award size={18} />, text: 'Implement team coordination flows that reduce meeting time by 61%' },
        { icon: <Layers size={18} />, text: 'Save $4,200+ annually per employee with optimized workflows' }
      ],
      // Default for any other category
      'default': [
        { icon: <TrendingUp size={18} />, text: 'Achieve 35%+ efficiency gains with properly configured workflows' },
        { icon: <BookOpen size={18} />, text: 'Access integration best practices from industry leaders' },
        { icon: <BadgeDollarSign size={18} />, text: 'Reduce implementation costs by 40% with guided setup' },
        { icon: <Award size={18} />, text: 'Learn advanced techniques that 87% of competitors miss' },
        { icon: <Layers size={18} />, text: 'Save 20+ development hours with optimization tricks' }
      ]
    };
    
    return benefits[category as keyof typeof benefits] || benefits.default;
  };

  const benefits = getBenefitsByCategory(category);
  
  return (
    <Card className="w-full max-w-4xl mx-auto border-2 border-primary/20 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10">
        <div className="flex items-center gap-2 mb-2">
          <Lightbulb className="h-6 w-6 text-primary" />
          <Badge variant="outline" className="bg-background/80">2025 Integration Insights</Badge>
        </div>
        <CardTitle>Maximize Your Results with {templateName}</CardTitle>
        <CardDescription className="text-lg">
          Users who review the integration guide before implementation see 3.4x better outcomes.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex flex-col gap-3">
            {benefits.slice(0, showFullBenefits ? benefits.length : 3).map((benefit, index) => (
              <div key={index} className="flex items-start gap-2">
                <div className="mt-0.5 bg-primary/10 p-1.5 rounded-full">
                  {benefit.icon}
                </div>
                <p className="text-sm">{benefit.text}</p>
              </div>
            ))}
          </div>
          
          {!showFullBenefits && benefits.length > 3 && (
            <Button 
              variant="ghost" 
              className="text-sm w-full mt-2" 
              onClick={() => setShowFullBenefits(true)}
            >
              Show {benefits.length - 3} more benefits
            </Button>
          )}

          <div className="mt-4 p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              2025 Integration Guide Includes:
            </h4>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <li className="flex items-center gap-2">✓ Updated API authentication methods</li>
              <li className="flex items-center gap-2">✓ Real-world revenue impact examples</li>
              <li className="flex items-center gap-2">✓ Data privacy compliance checklist</li>
              <li className="flex items-center gap-2">✓ Performance optimization techniques</li>
              <li className="flex items-center gap-2">✓ Error handling best practices</li>
              <li className="flex items-center gap-2">✓ Custom configuration opportunities</li>
            </ul>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row gap-3 bg-muted/30 py-4">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                onClick={onOpenGuide} 
                className="w-full sm:w-auto"
                variant="default"
              >
                <BookOpen className="h-4 w-4 mr-2" />
                View Integration Guide
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Recommended for best results</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <Button 
          onClick={onContinue} 
          variant="outline" 
          className="w-full sm:w-auto"
        >
          Continue to Template
        </Button>
      </CardFooter>
    </Card>
  );
}

export default IntegrationGuidePrompt;
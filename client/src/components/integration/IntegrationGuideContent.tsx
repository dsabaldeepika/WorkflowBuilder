import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { CheckCircle2, Code, FileCode, Link, Lock, BarChart, Shield, Zap, Gem, FileText, BookOpen, CheckCheck, AlertCircle, Repeat, Fingerprint, Globe, Database, DollarSign } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface IntegrationGuideContentProps {
  templateName: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

const IntegrationGuideContent: React.FC<IntegrationGuideContentProps> = ({
  templateName,
  category,
  difficulty
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Content sections based on the template category
  const getCategorySpecificContent = (category: string) => {
    const contentMap = {
      'CRM': {
        headline: 'Supercharge your customer relationships',
        apiSection: (
          <>
            <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
              <FileCode size={20} /> CRM API Integration Details
            </h3>
            <p className="mb-4">This template connects with popular CRM systems like Salesforce, HubSpot, Pipedrive and custom CRM solutions via their REST APIs.</p>
            
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="salesforce">
                <AccordionTrigger className="text-left">Salesforce API Configuration</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    <p>For Salesforce integration, you'll need:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>API version: <code>v59.0</code> (2025 Winter release) or newer</li>
                      <li>OAuth 2.0 JWT bearer flow (recommended for seamless refresh)</li>
                      <li>Permission scopes: <code>api</code>, <code>chatter_api</code>, <code>custom_permissions</code>, <code>wave_api</code></li>
                    </ul>
                    
                    <div className="bg-muted p-3 rounded-md mt-3">
                      <code className="text-xs">
                        {`// Example JWT bearer token request\n`}
                        {`const jwt = require('jsonwebtoken');\n`}
                        {`const payload = {\n`}
                        {`  iss: process.env.SALESFORCE_CLIENT_ID,\n`}
                        {`  sub: user.email,\n`}
                        {`  aud: "https://login.salesforce.com",\n`}
                        {`  exp: Math.floor(Date.now() / 1000) + 60 * 3\n`}
                        {`};\n`}
                        {`\n`}
                        {`const token = jwt.sign(\n`}
                        {`  payload,\n`}
                        {`  process.env.SALESFORCE_PRIVATE_KEY,\n`}
                        {`  { algorithm: 'RS256' }\n`}
                        {`);`}
                      </code>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="hubspot">
                <AccordionTrigger className="text-left">HubSpot API Configuration</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    <p>For HubSpot integration, you'll need:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Private App access tokens (now supports multiple scopes)</li>
                      <li>OAuth scopes: <code>crm.objects.contacts.read</code>, <code>crm.objects.contacts.write</code>, <code>crm.objects.deals.read</code>, <code>crm.objects.deals.write</code></li>
                      <li>HubSpot API version: <code>v4</code> (2024) or newer</li>
                    </ul>
                    
                    <div className="flex items-center gap-2 mt-3 bg-amber-50 dark:bg-amber-950/20 p-3 rounded-md">
                      <AlertCircle className="h-5 w-5 text-amber-500" />
                      <p className="text-sm">HubSpot's new rate limiting system (2025) uses dynamic quotas based on account tier. Enterprise accounts receive 1M+ daily requests.</p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </>
        ),
        monetizationSection: (
          <>
            <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
              <DollarSign size={20} /> CRM Monetization Opportunities
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <Card className="border border-green-200 dark:border-green-900">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Customer Retention Boost</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-2">Increase customer retention by automating personalized follow-ups based on interaction data:</p>
                  <ul className="text-sm list-disc pl-5 space-y-1">
                    <li>Automated sentiment analysis triggers appropriate responses</li>
                    <li>Intelligent escalation to human agents when needed</li>
                    <li>Multi-channel engagement coordination</li>
                  </ul>
                  <div className="mt-3 flex items-center gap-1.5 text-green-600 dark:text-green-400 text-sm font-medium">
                    <TrendingUp className="h-4 w-4" />
                    <span>+28% average retention increase</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border border-blue-200 dark:border-blue-900">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">CAC Reduction System</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-2">Reduce customer acquisition costs through optimized nurturing sequences:</p>
                  <ul className="text-sm list-disc pl-5 space-y-1">
                    <li>AI-powered lead scoring and prioritization</li>
                    <li>Automated multi-touch attribution modeling</li>
                    <li>Channel effectiveness analysis</li>
                  </ul>
                  <div className="mt-3 flex items-center gap-1.5 text-blue-600 dark:text-blue-400 text-sm font-medium">
                    <BarChart className="h-4 w-4" />
                    <span>22% average CAC reduction</span>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <h4 className="font-medium mb-2">Premium CRM Integration Add-Ons</h4>
            <div className="space-y-3 mb-4">
              <div className="flex items-start gap-3 p-3 border rounded-lg">
                <div className="bg-primary/10 p-2 rounded-full">
                  <Gem className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h5 className="font-medium mb-0.5">Unified Customer 360° View</h5>
                  <p className="text-sm">Create a comprehensive customer profile by integrating data from 15+ touchpoints including website behavior, purchase history, support tickets, social engagement.</p>
                  <div className="mt-1 flex justify-between items-center">
                    <Badge variant="outline" className="text-xs bg-background">Premium Feature</Badge>
                    <span className="text-sm font-medium">$249/mo</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 border rounded-lg">
                <div className="bg-primary/10 p-2 rounded-full">
                  <Zap className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h5 className="font-medium mb-0.5">Predictive Lifetime Value Engine</h5>
                  <p className="text-sm">Forecast customer value and churn probability with 94% accuracy using advanced ML models that analyze behavior patterns.</p>
                  <div className="mt-1 flex justify-between items-center">
                    <Badge variant="outline" className="text-xs bg-background">Premium Feature</Badge>
                    <span className="text-sm font-medium">$199/mo</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        ),
        complianceSection: (
          <>
            <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
              <Shield size={20} /> CRM Compliance Considerations
            </h3>
            <p className="mb-3">Ensure your CRM integration complies with the latest regulations:</p>
            
            <div className="space-y-3">
              <div className="p-3 border rounded-lg">
                <h4 className="font-medium flex items-center gap-1.5 mb-1">
                  <Fingerprint className="h-4 w-4" />
                  Data Privacy Requirements
                </h4>
                <ul className="text-sm space-y-1.5">
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Enable data minimization filters to collect only necessary information</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Implement automatic data expiration rules to comply with retention limits</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Configure right-to-be-forgotten workflows that cascade across integrated systems</span>
                  </li>
                </ul>
              </div>
              
              <div className="p-3 border rounded-lg">
                <h4 className="font-medium flex items-center gap-1.5 mb-1">
                  <Globe className="h-4 w-4" />
                  Regional Considerations
                </h4>
                <ul className="text-sm space-y-1.5">
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>EU: GDPR compliance with unified consent management (inc. 2024 AI Act provisions)</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>US: CCPA/CPRA compliance with automated SAR response workflows</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Global: Data localization options for restricted jurisdictions</span>
                  </li>
                </ul>
              </div>
            </div>
          </>
        ),
      },
      // Add other categories as needed
      'default': {
        headline: 'Streamline your workflow processes',
        apiSection: (
          <>
            <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
              <FileCode size={20} /> API Integration Details
            </h3>
            <p className="mb-4">This template connects with various services through their APIs. You'll need to configure the appropriate credentials based on the systems you're integrating with.</p>
            
            <div className="bg-muted p-3 rounded-md">
              <h4 className="font-medium mb-2">Required API Access</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li>REST API endpoints with OAuth 2.0 authentication</li>
                <li>Appropriate scopes for read/write operations</li>
                <li>Rate limit considerations for production usage</li>
              </ul>
            </div>
          </>
        ),
        monetizationSection: (
          <>
            <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
              <DollarSign size={20} /> Monetization Opportunities
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <Card className="border border-green-200 dark:border-green-900">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Efficiency Improvement</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-2">Increase operational efficiency through automation:</p>
                  <ul className="text-sm list-disc pl-5 space-y-1">
                    <li>Eliminate manual data entry and processing</li>
                    <li>Reduce human error in repetitive tasks</li>
                    <li>Scale operations without adding headcount</li>
                  </ul>
                  <div className="mt-3 flex items-center gap-1.5 text-green-600 dark:text-green-400 text-sm font-medium">
                    <BarChart className="h-4 w-4" />
                    <span>35%+ average efficiency gain</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border border-blue-200 dark:border-blue-900">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Cost Reduction</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-2">Lower operational costs through streamlined processes:</p>
                  <ul className="text-sm list-disc pl-5 space-y-1">
                    <li>Reduced manual processing time</li>
                    <li>Faster time-to-completion for key workflows</li>
                    <li>Lower error rate and rework requirements</li>
                  </ul>
                  <div className="mt-3 flex items-center gap-1.5 text-blue-600 dark:text-blue-400 text-sm font-medium">
                    <TrendingUp className="h-4 w-4" />
                    <span>40% average cost reduction</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        ),
        complianceSection: (
          <>
            <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
              <Shield size={20} /> Compliance Considerations
            </h3>
            <p className="mb-3">Ensure your integration complies with relevant regulations:</p>
            
            <div className="space-y-3">
              <div className="p-3 border rounded-lg">
                <h4 className="font-medium flex items-center gap-1.5 mb-1">
                  <Lock className="h-4 w-4" />
                  Security Requirements
                </h4>
                <ul className="text-sm space-y-1.5">
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Implement proper authentication and authorization</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Encrypt data in transit and at rest</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Monitor and log access to sensitive data</span>
                  </li>
                </ul>
              </div>
            </div>
          </>
        ),
      }
    };
    
    return contentMap[category as keyof typeof contentMap] || contentMap.default;
  };
  
  const getImplementationStepsByDifficulty = (difficulty: string) => {
    const steps = {
      'beginner': [
        { title: 'Connect your account', description: 'Configure API credentials and authenticate with the platform' },
        { title: 'Select data sources', description: 'Choose which data sources to integrate with the workflow' },
        { title: 'Configure triggers', description: 'Set up events that will initiate the workflow' },
        { title: 'Test the workflow', description: 'Run a test to ensure everything works as expected' },
        { title: 'Activate the workflow', description: 'Enable the workflow in your production environment' }
      ],
      'intermediate': [
        { title: 'Set up authentication', description: 'Configure OAuth 2.0 credentials and scopes for secure access' },
        { title: 'Define data mapping rules', description: 'Create field mappings between integrated systems' },
        { title: 'Configure conditional logic', description: 'Set up branching paths based on workflow conditions' },
        { title: 'Implement error handling', description: 'Add retry logic and failure notifications' },
        { title: 'Configure monitoring', description: 'Set up logging and alerts for workflow performance' },
        { title: 'Test edge cases', description: 'Verify behavior with unusual or boundary input values' },
        { title: 'Deploy to production', description: 'Migrate from staging to production environment' }
      ],
      'advanced': [
        { title: 'Configure multi-endpoint authentication', description: 'Set up secure authentication across multiple services' },
        { title: 'Define complex data transformation rules', description: 'Implement transformations, filtering, and enrichment' },
        { title: 'Create dynamic routing logic', description: 'Build adaptive workflows that route based on real-time conditions' },
        { title: 'Implement idempotency handling', description: 'Ensure workflow can safely retry operations without duplication' },
        { title: 'Configure distributed transaction handling', description: 'Manage operations across multiple systems with rollback capability' },
        { title: 'Set up comprehensive monitoring', description: 'Configure detailed logs, metrics, and alerts' },
        { title: 'Implement custom rate limiting', description: 'Add throttling logic to respect API constraints' },
        { title: 'Develop custom extension points', description: 'Create hooks for future customization' },
        { title: 'Establish CI/CD pipeline', description: 'Set up continuous integration and deployment for workflow changes' }
      ]
    };
    
    return steps[difficulty as keyof typeof steps] || steps.beginner;
  };

  const contentData = getCategorySpecificContent(category);
  const implementationSteps = getImplementationStepsByDifficulty(difficulty);
  
  return (
    <div className="bg-background p-6 rounded-lg border max-w-5xl mx-auto">
      <div className="flex items-center gap-2 mb-2">
        <BookOpen className="h-6 w-6 text-primary" />
        <Badge variant="outline">Integration Guide</Badge>
      </div>
      <h2 className="text-2xl font-bold mb-1">{templateName}</h2>
      <p className="text-muted-foreground mb-6">{contentData.headline}</p>
      
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="overflow-x-auto pb-2">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="implementation">Implementation</TabsTrigger>
            <TabsTrigger value="integration">API Integration</TabsTrigger>
            <TabsTrigger value="monetization">Monetization (2025)</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
            <TabsTrigger value="examples">Examples</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="overview" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>About This Template</CardTitle>
              <CardDescription>Key information about this workflow template</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h3 className="font-medium">Template Details</h3>
                  <div className="grid grid-cols-2 gap-y-2 text-sm">
                    <div className="text-muted-foreground">Category:</div>
                    <div>{category}</div>
                    <div className="text-muted-foreground">Difficulty:</div>
                    <div className="capitalize">{difficulty}</div>
                    <div className="text-muted-foreground">Last Updated:</div>
                    <div>March 15, 2025</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-medium">Integration Details</h3>
                  <div className="grid grid-cols-2 gap-y-2 text-sm">
                    <div className="text-muted-foreground">Auth Method:</div>
                    <div>OAuth 2.0 / API Key</div>
                    <div className="text-muted-foreground">Data Format:</div>
                    <div>JSON / XML</div>
                    <div className="text-muted-foreground">Update Frequency:</div>
                    <div>Real-time / Scheduled</div>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="font-medium mb-2">Key Benefits</h3>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCheck className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span>Automates repetitive tasks and processes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCheck className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span>Reduces manual errors by 94%</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCheck className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span>Saves 15+ hours per week for teams</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCheck className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span>Improves data consistency across systems</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCheck className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span>Enables real-time insights and reporting</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCheck className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span>Scales with your business needs</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-medium mb-2">Business Impact</h3>
                <p className="text-sm">Companies implementing this workflow template report:</p>
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="flex flex-col items-center p-3 bg-background rounded-lg text-center">
                    <BarChart className="h-8 w-8 text-primary mb-1" />
                    <span className="text-2xl font-bold">35%</span>
                    <span className="text-sm text-muted-foreground">Productivity Increase</span>
                  </div>
                  <div className="flex flex-col items-center p-3 bg-background rounded-lg text-center">
                    <TrendingUp className="h-8 w-8 text-primary mb-1" />
                    <span className="text-2xl font-bold">42%</span>
                    <span className="text-sm text-muted-foreground">Cost Reduction</span>
                  </div>
                  <div className="flex flex-col items-center p-3 bg-background rounded-lg text-center">
                    <Repeat className="h-8 w-8 text-primary mb-1" />
                    <span className="text-2xl font-bold">59%</span>
                    <span className="text-sm text-muted-foreground">Faster Time to Value</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Prerequisites</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium">API Access</p>
                      <p className="text-sm text-muted-foreground">Admin-level API access to required systems</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Authentication Credentials</p>
                      <p className="text-sm text-muted-foreground">OAuth tokens or API keys with appropriate permissions</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Data Mapping</p>
                      <p className="text-sm text-muted-foreground">Understanding of field mappings between systems</p>
                    </div>
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Recommended Tools</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <Link className="h-5 w-5 text-blue-500 mt-0.5" />
                    <div>
                      <p className="font-medium">API Testing Tools</p>
                      <p className="text-sm text-muted-foreground">Postman, Insomnia, or similar for API validation</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <Database className="h-5 w-5 text-blue-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Data Transformation</p>
                      <p className="text-sm text-muted-foreground">Tools for mapping and transforming data between systems</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <Code className="h-5 w-5 text-blue-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Monitoring Solutions</p>
                      <p className="text-sm text-muted-foreground">Tools to track workflow execution and performance</p>
                    </div>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="implementation" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Implementation Steps</CardTitle>
              <CardDescription>Follow these steps to implement the template in your environment</CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="space-y-6 mt-2">
                {implementationSteps.map((step, index) => (
                  <li key={index} className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-medium text-lg">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="font-medium text-lg">{step.title}</h3>
                      <p className="text-muted-foreground">{step.description}</p>
                    </div>
                  </li>
                ))}
              </ol>
              
              <div className="mt-8 bg-muted p-4 rounded-lg">
                <h3 className="font-medium mb-2 flex items-center gap-2">
                  <FileText className="h-5 w-5" /> Additional Implementation Resources
                </h3>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span>Detailed implementation guide (PDF)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span>Configuration checklist</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span>Troubleshooting reference</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="integration" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>API Integration</CardTitle>
              <CardDescription>Technical details for integrating with external systems</CardDescription>
            </CardHeader>
            <CardContent>
              {contentData.apiSection}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="monetization" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>2025 Monetization Opportunities</CardTitle>
              <CardDescription>Discover how this template can drive business value and revenue</CardDescription>
            </CardHeader>
            <CardContent>
              {contentData.monetizationSection}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="compliance" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Compliance & Security</CardTitle>
              <CardDescription>Regulatory and security considerations for implementation</CardDescription>
            </CardHeader>
            <CardContent>
              {contentData.complianceSection}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="examples" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Success Stories & Examples</CardTitle>
              <CardDescription>Real-world implementations and outcomes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="bg-muted p-4 rounded-lg">
                  <h3 className="font-medium mb-1">Enterprise Manufacturing Company</h3>
                  <p className="text-sm mb-3">Implemented this workflow to streamline their customer relationship management process.</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="font-medium">Challenge:</div>
                    <div>Manual data entry across systems causing delays and errors</div>
                    <div className="font-medium">Solution:</div>
                    <div>Automated data flow between CRM, ERP, and support systems</div>
                    <div className="font-medium">Result:</div>
                    <div>41% increase in team productivity, 28% reduction in errors</div>
                  </div>
                </div>
                
                <div className="bg-muted p-4 rounded-lg">
                  <h3 className="font-medium mb-1">SaaS Technology Provider</h3>
                  <p className="text-sm mb-3">Used this template to optimize their customer onboarding process.</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="font-medium">Challenge:</div>
                    <div>Inconsistent onboarding experience and slow time-to-value</div>
                    <div className="font-medium">Solution:</div>
                    <div>Automated welcome sequences, training enrollment, and setup verification</div>
                    <div className="font-medium">Result:</div>
                    <div>63% faster onboarding, 37% increase in initial product adoption</div>
                  </div>
                </div>
                
                <div className="bg-muted p-4 rounded-lg">
                  <h3 className="font-medium mb-1">Financial Services Firm</h3>
                  <p className="text-sm mb-3">Deployed this template to enhance customer data management.</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="font-medium">Challenge:</div>
                    <div>Data silos preventing unified customer view</div>
                    <div className="font-medium">Solution:</div>
                    <div>Integrated data flows with compliance controls</div>
                    <div className="font-medium">Result:</div>
                    <div>52% improvement in cross-sell opportunities, full regulatory compliance</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="mt-6 text-center">
        <Button 
          variant="default"
          size="lg"
          className="gap-2"
          onClick={() => setActiveTab('implementation')}
        >
          <CheckCheck className="h-4 w-4" />
          Continue to Implementation Guide
        </Button>
      </div>
    </div>
  );
};

export default IntegrationGuideContent;
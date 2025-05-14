import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { BadgeCheck, AlertTriangle, BookOpen, ChevronRight, FileClock, TrendingUp, BarChart, ArrowRightLeft, Eye, Zap, BookMarked } from 'lucide-react';

interface IntegrationGuideContentProps {
  templateName: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

// Helper function to get guide content based on template category
const getGuideContent = (category: string) => {
  switch (category.toLowerCase()) {
    case 'crm':
      return {
        overview: 'This CRM workflow automates lead tracking and customer interactions, streamlining your sales process.',
        requirements: [
          'API access to your CRM system',
          'Email account for notifications',
          'Customer data source (spreadsheet or database)'
        ],
        monetization: [
          'Offer premium features for advanced lead scoring and segmentation',
          'Create customized workflow templates for specific industries',
          'Provide analytics dashboards for enhanced sales intelligence',
          'Develop add-on services for data enrichment and validation'
        ],
        implementation: [
          'Connect your CRM API using the authentication credentials',
          'Configure data mapping for your specific customer fields',
          'Set up notification rules for important events',
          'Test the workflow with a sample customer record'
        ]
      };
    case 'marketing':
      return {
        overview: 'This marketing automation workflow helps manage campaigns across multiple channels with consistent messaging and timing.',
        requirements: [
          'Access to your marketing platforms (email, social, ads)',
          'Content assets organized and ready for distribution',
          'Target audience segments identified'
        ],
        monetization: [
          'Develop subscription tiers based on campaign volume and frequency',
          'Offer premium audience targeting and personalization features',
          'Create specialized content optimization services',
          'Provide performance reporting and analytics packages'
        ],
        implementation: [
          'Connect each marketing platform using their respective APIs',
          'Set up content templates for each channel',
          'Configure scheduling and triggering logic',
          'Implement tracking parameters for performance measurement'
        ]
      };
    case 'ecommerce':
      return {
        overview: 'This eCommerce workflow automates order processing, inventory updates, and customer communications.',
        requirements: [
          'API access to your eCommerce platform',
          'Inventory management system credentials',
          'Payment processor integration'
        ],
        monetization: [
          'Create tiered pricing based on order volume and transaction amount',
          'Offer premium features for inventory forecasting and optimization',
          'Develop add-on services for customer retention and upselling',
          'Provide advanced analytics and business intelligence tools'
        ],
        implementation: [
          'Connect your store API with authentication credentials',
          'Configure order status mapping and notifications',
          'Set up inventory threshold alerts',
          'Test the workflow with sample orders'
        ]
      };
    default:
      return {
        overview: 'This workflow automates key processes to save time and improve consistency in your operations.',
        requirements: [
          'API credentials for connected services',
          'Data sources properly formatted',
          'Clear understanding of your workflow goals'
        ],
        monetization: [
          'Implement tiered pricing based on usage volume and features',
          'Offer premium support and customization services',
          'Develop industry-specific template packages',
          'Create data enrichment and analytics add-ons'
        ],
        implementation: [
          'Connect necessary services using API credentials',
          'Configure data mappings between systems',
          'Set up appropriate triggers and conditions',
          'Test thoroughly with sample data before going live'
        ]
      };
  }
};

const IntegrationGuideContent: React.FC<IntegrationGuideContentProps> = ({
  templateName,
  category,
  difficulty
}) => {
  const content = getGuideContent(category);
  
  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="implementation">Implementation Guide</TabsTrigger>
        <TabsTrigger value="monetization">Monetization Strategies</TabsTrigger>
        <TabsTrigger value="best-practices">Best Practices</TabsTrigger>
      </TabsList>
      
      <ScrollArea className="h-[600px] rounded-md border p-4 mt-4">
        <TabsContent value="overview" className="space-y-6">
          <div className="flex items-center space-x-2">
            <BadgeCheck className="h-5 w-5 text-green-500" />
            <h2 className="text-xl font-semibold">Template Overview: {templateName}</h2>
          </div>
          
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Before you begin</AlertTitle>
            <AlertDescription>
              This guide helps you maximize value from this {difficulty} level {category} template. Read it carefully before implementation.
            </AlertDescription>
          </Alert>
          
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5 text-primary" />
                  Key Benefits
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p>This {category} template provides the following benefits:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Automates repetitive tasks saving 5-10 hours per week</li>
                  <li>Standardizes processes for consistent results</li>
                  <li>Reduces manual errors by up to 95%</li>
                  <li>Provides real-time visibility into workflow operations</li>
                  <li>Scales easily as your business grows</li>
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="mr-2 h-5 w-5 text-primary" />
                  What This Template Does
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">{content.overview}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="border rounded p-4">
                    <h3 className="font-medium mb-2 flex items-center">
                      <FileClock className="mr-2 h-4 w-4 text-primary" />
                      Automation Benefits
                    </h3>
                    <ul className="text-sm space-y-1">
                      <li className="flex items-center">
                        <ChevronRight className="h-3 w-3 mr-1 text-primary" />
                        Reduces manual work by 70%
                      </li>
                      <li className="flex items-center">
                        <ChevronRight className="h-3 w-3 mr-1 text-primary" />
                        Provides consistent results every time
                      </li>
                      <li className="flex items-center">
                        <ChevronRight className="h-3 w-3 mr-1 text-primary" />
                        Runs 24/7 without human intervention
                      </li>
                    </ul>
                  </div>
                  
                  <div className="border rounded p-4">
                    <h3 className="font-medium mb-2 flex items-center">
                      <BarChart className="mr-2 h-4 w-4 text-primary" />
                      Business Impact
                    </h3>
                    <ul className="text-sm space-y-1">
                      <li className="flex items-center">
                        <ChevronRight className="h-3 w-3 mr-1 text-primary" />
                        Improves response times by 85%
                      </li>
                      <li className="flex items-center">
                        <ChevronRight className="h-3 w-3 mr-1 text-primary" />
                        Increases data accuracy to 99%
                      </li>
                      <li className="flex items-center">
                        <ChevronRight className="h-3 w-3 mr-1 text-primary" />
                        Enables scaling without adding staff
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookMarked className="mr-2 h-5 w-5 text-primary" />
                  Requirements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-2">To successfully implement this template, you'll need:</p>
                <ul className="list-disc pl-5 space-y-1">
                  {content.requirements.map((req, index) => (
                    <li key={index}>{req}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="implementation" className="space-y-6">
          <div className="flex items-center space-x-2">
            <Zap className="h-5 w-5 text-blue-500" />
            <h2 className="text-xl font-semibold">Implementation Guide</h2>
          </div>
          
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Important Note</AlertTitle>
            <AlertDescription>
              Follow these steps in order. Each step builds on the previous one for a successful implementation.
            </AlertDescription>
          </Alert>
          
          <Card>
            <CardHeader>
              <CardTitle>Step-by-Step Implementation</CardTitle>
              <CardDescription>
                Follow this guide to implement your {category} workflow correctly
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {content.implementation.map((step, index) => (
                <div key={index} className="border-l-2 border-primary pl-4 py-2">
                  <div className="font-medium flex items-center">
                    <div className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center mr-2 text-xs">
                      {index + 1}
                    </div>
                    Step {index + 1}
                  </div>
                  <p className="text-sm mt-1">{step}</p>
                </div>
              ))}
              
              <Separator className="my-6" />
              
              <div className="rounded-md bg-muted p-4">
                <h3 className="font-medium mb-2">Testing Your Implementation</h3>
                <ol className="list-decimal pl-5 space-y-1 text-sm">
                  <li>Create a test data set that represents your actual data</li>
                  <li>Run the workflow in test mode to verify each step</li>
                  <li>Check outputs and ensure they match expected results</li>
                  <li>Verify notifications and alerts are working properly</li>
                  <li>Test error handling by introducing invalid data</li>
                </ol>
              </div>
              
              <div className="rounded-md bg-muted p-4 mt-4">
                <h3 className="font-medium mb-2">Common Implementation Challenges</h3>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start">
                    <AlertTriangle className="h-4 w-4 mr-2 mt-0.5 text-amber-500" />
                    <div>
                      <span className="font-medium">API Connection Issues</span>
                      <p>Ensure API keys are valid and have the correct permissions</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <AlertTriangle className="h-4 w-4 mr-2 mt-0.5 text-amber-500" />
                    <div>
                      <span className="font-medium">Data Mapping Problems</span>
                      <p>Verify field names match exactly between systems</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <AlertTriangle className="h-4 w-4 mr-2 mt-0.5 text-amber-500" />
                    <div>
                      <span className="font-medium">Rate Limiting</span>
                      <p>Add delay steps if hitting API rate limits</p>
                    </div>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="monetization" className="space-y-6">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-green-500" />
            <h2 className="text-xl font-semibold">Monetization Strategies (2025)</h2>
          </div>
          
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Monetization Focus</AlertTitle>
            <AlertDescription>
              These strategies are designed to help you generate revenue from this template implementation based on current market trends.
            </AlertDescription>
          </Alert>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Direct Revenue Models</CardTitle>
                <CardDescription>Primary ways to generate income</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-medium flex items-center">
                    <ArrowRightLeft className="h-4 w-4 mr-2 text-primary" />
                    Tiered Service Levels
                  </h3>
                  <p className="text-sm">
                    Create subscription tiers with different feature sets and volume limits, allowing customers to start small and upgrade as they grow.
                  </p>
                  <ul className="text-sm pl-5 list-disc space-y-1">
                    <li>Basic: Core automation with limited volume</li>
                    <li>Professional: Advanced features and higher limits</li>
                    <li>Enterprise: Custom solutions with dedicated support</li>
                  </ul>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <h3 className="font-medium flex items-center">
                    <Eye className="h-4 w-4 mr-2 text-primary" />
                    Value-Based Pricing
                  </h3>
                  <p className="text-sm">
                    Price based on the measurable value delivered rather than cost, typically as a percentage of savings or revenue generated.
                  </p>
                  <ul className="text-sm pl-5 list-disc space-y-1">
                    <li>3-5% of cost savings realized</li>
                    <li>1-2% of increased revenue generated</li>
                    <li>Fixed fee per successful transaction</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Premium Add-ons</CardTitle>
                <CardDescription>Enhancement opportunities</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {content.monetization.map((strategy, index) => (
                  <div key={index} className="border-l-2 border-primary/50 pl-3 py-1">
                    <p className="text-sm">{strategy}</p>
                  </div>
                ))}
                
                <Separator className="my-2" />
                
                <div className="bg-muted p-3 rounded-md">
                  <h3 className="font-medium text-sm mb-2">2025 Market Trends</h3>
                  <ul className="text-xs space-y-1.5">
                    <li className="flex items-start">
                      <ChevronRight className="h-3 w-3 mr-1 text-primary flex-shrink-0 mt-0.5" />
                      <span>AI-enhanced data processing and predictive analytics are commanding premium prices</span>
                    </li>
                    <li className="flex items-start">
                      <ChevronRight className="h-3 w-3 mr-1 text-primary flex-shrink-0 mt-0.5" />
                      <span>Integrated multi-platform solutions that provide unified dashboards are highly valued</span>
                    </li>
                    <li className="flex items-start">
                      <ChevronRight className="h-3 w-3 mr-1 text-primary flex-shrink-0 mt-0.5" />
                      <span>Custom workflow templates for specific industries have excellent conversion rates</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Implementation Service Packages</CardTitle>
              <CardDescription>
                Create service offerings to help clients implement this template
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="border rounded-md p-4">
                  <h3 className="font-medium">Starter Package</h3>
                  <div className="text-2xl font-bold my-2">$750</div>
                  <ul className="text-sm space-y-1 text-left pl-4 list-disc my-4">
                    <li>Basic template setup</li>
                    <li>Single integration</li>
                    <li>1 hour of training</li>
                    <li>Email support for 30 days</li>
                  </ul>
                  <Button variant="outline" className="w-full">View Details</Button>
                </div>
                
                <div className="border rounded-md p-4 border-primary bg-primary/5">
                  <h3 className="font-medium">Professional Package</h3>
                  <div className="text-2xl font-bold my-2">$1,950</div>
                  <ul className="text-sm space-y-1 text-left pl-4 list-disc my-4">
                    <li>Custom implementation</li>
                    <li>Up to 3 integrations</li>
                    <li>4 hours of training</li>
                    <li>Priority support for 90 days</li>
                    <li>Custom reporting setup</li>
                  </ul>
                  <Button className="w-full">View Details</Button>
                </div>
                
                <div className="border rounded-md p-4">
                  <h3 className="font-medium">Enterprise Package</h3>
                  <div className="text-2xl font-bold my-2">$4,500+</div>
                  <ul className="text-sm space-y-1 text-left pl-4 list-disc my-4">
                    <li>Full enterprise deployment</li>
                    <li>Unlimited integrations</li>
                    <li>Dedicated implementation manager</li>
                    <li>8 hours of training</li>
                    <li>Premium support for 1 year</li>
                    <li>Custom development available</li>
                  </ul>
                  <Button variant="outline" className="w-full">Contact Sales</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="best-practices" className="space-y-6">
          <div className="flex items-center space-x-2">
            <BadgeCheck className="h-5 w-5 text-blue-500" />
            <h2 className="text-xl font-semibold">Best Practices</h2>
          </div>
          
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Important</AlertTitle>
            <AlertDescription>
              Following these best practices will ensure optimal performance and reliability of your workflow.
            </AlertDescription>
          </Alert>
          
          <Card>
            <CardHeader>
              <CardTitle>Workflow Efficiency</CardTitle>
              <CardDescription>
                Optimize your workflow for better performance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-medium">Data Management</h3>
                <ul className="pl-5 list-disc space-y-1 text-sm">
                  <li>Only process the data fields you actually need</li>
                  <li>Use batch processing for large data sets when possible</li>
                  <li>Implement caching strategies for frequently accessed data</li>
                  <li>Include data validation at critical entry points</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-medium">Error Handling</h3>
                <ul className="pl-5 list-disc space-y-1 text-sm">
                  <li>Implement comprehensive error catching</li>
                  <li>Create fallback paths for critical processes</li>
                  <li>Set up alerts for workflow failures</li>
                  <li>Log detailed error information for troubleshooting</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-medium">Performance Optimization</h3>
                <ul className="pl-5 list-disc space-y-1 text-sm">
                  <li>Schedule resource-intensive operations during off-peak hours</li>
                  <li>Break complex workflows into smaller, manageable sub-workflows</li>
                  <li>Use parallel processing where appropriate</li>
                  <li>Implement timeout handling for external API calls</li>
                </ul>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                Download Performance Optimization Guide
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Maintenance & Monitoring</CardTitle>
              <CardDescription>
                Keep your workflow running smoothly
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-medium">Regular Maintenance</h3>
                <ul className="pl-5 list-disc space-y-1 text-sm">
                  <li>Schedule monthly reviews of workflow performance</li>
                  <li>Update API connections when vendors make changes</li>
                  <li>Clean up old execution logs and temporary data</li>
                  <li>Verify scheduled triggers are running as expected</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-medium">Monitoring Best Practices</h3>
                <ul className="pl-5 list-disc space-y-1 text-sm">
                  <li>Set up dashboards to monitor key workflow metrics</li>
                  <li>Create alerts for abnormal execution patterns</li>
                  <li>Track execution times to identify performance degradation</li>
                  <li>Monitor API rate limit usage to prevent throttling</li>
                </ul>
              </div>
              
              <div className="border p-4 rounded-md bg-muted mt-4">
                <h3 className="font-medium mb-2">Recommended Monitoring Schedule</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="font-medium">Daily</h4>
                    <ul className="pl-5 list-disc">
                      <li>Check for failed executions</li>
                      <li>Verify critical data processing</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium">Weekly</h4>
                    <ul className="pl-5 list-disc">
                      <li>Review performance metrics</li>
                      <li>Check for warning signs</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium">Monthly</h4>
                    <ul className="pl-5 list-disc">
                      <li>Full workflow audit</li>
                      <li>Update documentation</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium">Quarterly</h4>
                    <ul className="pl-5 list-disc">
                      <li>Comprehensive review</li>
                      <li>Optimization updates</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </ScrollArea>
    </Tabs>
  );
};

export default IntegrationGuideContent;
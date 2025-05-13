import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import FlowingBackground from '@/components/auth/FlowingBackground';
import { Loader2, CheckCircle, ChevronRight, AlertCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { API_ENDPOINTS, ROUTES, SubscriptionTier } from '@shared/config';

const steps = [
  { id: 'pricing', title: 'Choose a Plan' },
  { id: 'signup', title: 'Create Account' },
  { id: 'workspace', title: 'Setup Workspace' },
];

export default function Signup() {
  const { isAuthenticated, isLoading, login } = useAuth();
  const [location, navigate] = useLocation();
  const [currentStep, setCurrentStep] = useState('pricing');
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");
  const [activeTab, setActiveTab] = useState<"all" | "templates" | "usage">("all");
  
  // Get all subscription plans
  const { data: plans, isLoading: plansLoading } = useQuery({
    queryKey: [API_ENDPOINTS.subscriptions.plans],
    queryFn: async () => {
      return await apiRequest(API_ENDPOINTS.subscriptions.plans);
    }
  });
  
  // Redirect to dashboard if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);
  
  // Handle Replit Auth login
  const handleLogin = () => {
    login();
  };

  // Calculate discount percentage for yearly billing
  const calculateYearlyDiscount = (monthly: number, yearly: number) => {
    if (monthly === 0) return 0;
    const monthlyTotal = monthly * 12;
    const savings = monthlyTotal - yearly;
    return Math.round((savings / monthlyTotal) * 100);
  };

  // Function to format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: amount % 1 === 0 ? 0 : 2
    }).format(amount);
  };
  
  // Handle plan selection
  const handlePlanSelect = (plan: any) => {
    setSelectedPlan(plan);
    setCurrentStep('signup');
  };

  // Proceed with account creation after selecting a plan
  const continueToAccountSetup = () => {
    setCurrentStep('signup');
  };
  
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-x-hidden bg-background">
      <FlowingBackground />
      
      <div className="container px-4 sm:px-6 py-8 z-10">
        {/* Progress Steps */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center">
                  <div 
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      step.id === currentStep 
                        ? 'bg-primary text-primary-foreground' 
                        : index < steps.findIndex(s => s.id === currentStep)
                        ? 'bg-primary/20 text-primary' 
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {index < steps.findIndex(s => s.id === currentStep) ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </div>
                  <span className={`mt-2 text-sm font-medium ${
                    step.id === currentStep ? 'text-primary' : 'text-muted-foreground'
                  }`}>
                    {step.title}
                  </span>
                </div>
                
                {index < steps.length - 1 && (
                  <div className={`h-[2px] flex-1 mx-2 ${
                    index < steps.findIndex(s => s.id === currentStep) 
                      ? 'bg-primary/60' 
                      : 'bg-muted'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
        
        {/* Pricing Step */}
        {currentStep === 'pricing' && (
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <div className="relative">
                <div className="absolute -top-24 left-1/2 transform -translate-x-1/2 w-[800px] h-[300px] bg-gradient-to-r from-primary/20 via-pink-500/20 to-purple-500/20 rounded-full blur-3xl opacity-50 -z-10"></div>
                <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                  Choose Your Plan
                </h1>
              </div>
              <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
                Start with our free plan and upgrade as you grow. All plans come with a 14-day trial.
              </p>
              
              {/* Value proposition badges */}
              <div className="flex flex-wrap justify-center gap-3 mt-6 mb-8">
                <Badge variant="secondary" className="py-1.5 px-4 text-sm bg-primary/10 text-primary border-primary/20">
                  No credit card required for free plan
                </Badge>
                <Badge variant="secondary" className="py-1.5 px-4 text-sm bg-green-100 text-green-800 border-green-200">
                  14-day money back guarantee
                </Badge>
                <Badge variant="secondary" className="py-1.5 px-4 text-sm bg-blue-100 text-blue-800 border-blue-200">
                  Cancel anytime
                </Badge>
              </div>
              
              <div className="flex items-center justify-center flex-wrap gap-4 mt-10 bg-muted/50 w-fit mx-auto rounded-full px-2 py-2">
                <Label htmlFor="billing-toggle" className={`px-4 py-2 ${!billingPeriod || billingPeriod === "monthly" ? "font-medium bg-white rounded-full shadow-sm" : "text-muted-foreground"}`}>
                  Monthly
                </Label>
                <Switch
                  id="billing-toggle"
                  className="mx-2"
                  checked={billingPeriod === "yearly"}
                  onCheckedChange={(checked) => setBillingPeriod(checked ? "yearly" : "monthly")}
                />
                <Label htmlFor="billing-toggle" className={`px-4 py-2 ${billingPeriod === "yearly" ? "font-medium bg-white rounded-full shadow-sm" : "text-muted-foreground"}`}>
                  Yearly
                  <Badge variant="outline" className="ml-2 font-normal border-green-500 text-green-600">
                    Save up to 20%
                  </Badge>
                </Label>
              </div>
            </div>
            
            {plansLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full" />
              </div>
            ) : (
              <>
                {/* Free Plan Highlight */}
                {plans?.find((plan: any) => plan.tier === SubscriptionTier.FREE) && (
                  <div className="max-w-4xl mx-auto mb-12 bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-xl border border-purple-100 shadow-sm">
                    <div className="flex flex-col md:flex-row gap-6 items-center">
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-purple-800">Start for free, no credit card required</h3>
                        <p className="text-purple-700 mt-2">
                          Try PumpFlux with our Free plan and upgrade when you're ready. Get started in just 60 seconds.
                        </p>
                        <ul className="mt-4 space-y-2">
                          <li className="flex items-center text-sm text-purple-900">
                            <CheckCircle className="h-4 w-4 text-purple-600 mr-2" />
                            <span>Up to 3 workflows</span>
                          </li>
                          <li className="flex items-center text-sm text-purple-900">
                            <CheckCircle className="h-4 w-4 text-purple-600 mr-2" />
                            <span>100 runs per month</span>
                          </li>
                          <li className="flex items-center text-sm text-purple-900">
                            <CheckCircle className="h-4 w-4 text-purple-600 mr-2" />
                            <span>Access to 5 basic templates</span>
                          </li>
                        </ul>
                      </div>
                      <div>
                        <Button
                          size="lg"
                          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-6 px-8"
                          onClick={() => handlePlanSelect(plans.find((plan: any) => plan.tier === SubscriptionTier.FREE))}
                        >
                          Get Started for Free <ChevronRight className="ml-2 h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {plans?.filter((plan: any) => plan.tier !== SubscriptionTier.FREE).map((plan: any) => {
                    const discount = calculateYearlyDiscount(plan.priceMonthly, plan.priceYearly);
                    const price = billingPeriod === "yearly" ? plan.priceYearly : plan.priceMonthly;
                    const isPro = plan.tier === 'pro';
                    
                    return (
                      <Card 
                        key={plan.id} 
                        className={`flex flex-col relative group transition-all duration-300 hover:shadow-xl ${
                          isPro ? 'border-purple-400/50' : ''
                        }`}
                      >
                        {isPro && (
                          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-violet-600 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                            Most Popular
                          </div>
                        )}
                        
                        <CardHeader className={`${isPro ? 'bg-gradient-to-br from-purple-50 to-indigo-50 border-b border-purple-100' : ''}`}>
                          <CardTitle className={`text-2xl ${isPro ? 'text-purple-700' : ''}`}>{plan.name}</CardTitle>
                          <CardDescription className="mt-1">{plan.description}</CardDescription>
                        </CardHeader>
                        
                        <CardContent className="flex-grow pt-6">
                          <div className="mb-6">
                            <div className="flex items-baseline">
                              <p className={`text-4xl font-bold ${isPro ? 'text-purple-600' : ''}`}>
                                {formatCurrency(price)}
                              </p>
                              <span className="text-sm font-normal text-muted-foreground ml-1">
                                {plan.tier !== SubscriptionTier.FREE && ` / ${billingPeriod === "yearly" ? "year" : "month"}`}
                              </span>
                            </div>
                            {billingPeriod === "yearly" && plan.tier !== SubscriptionTier.FREE && discount > 0 && (
                              <div className="flex items-center mt-1">
                                <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                                  Save {discount}%
                                </Badge>
                              </div>
                            )}
                          </div>
                          
                          <div className="mb-4">
                            <h4 className="text-sm font-medium text-muted-foreground mb-2">
                              Plan includes:
                            </h4>
                            <ul className="space-y-3">
                              {plan.features?.slice(0, 5).map((feature: string, index: number) => (
                                <li key={index} className="flex items-start">
                                  <CheckCircle className={`h-5 w-5 ${isPro ? 'text-purple-500' : 'text-green-500'} mr-2 shrink-0 mt-0.5`} />
                                  <span className="text-sm">{feature}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </CardContent>
                        
                        <CardFooter className="pt-2 pb-6">
                          <Button 
                            className={`w-full py-6 ${
                              isPro ? 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700' : ''
                            }`}
                            onClick={() => handlePlanSelect(plan)}
                          >
                            Choose {plan.name}
                          </Button>
                        </CardFooter>
                      </Card>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}
        
        {/* Signup Step */}
        {currentStep === 'signup' && (
          <div className="max-w-5xl mx-auto">
            <div className="grid w-full grid-cols-1 lg:grid-cols-2 gap-8 shadow-xl rounded-xl overflow-hidden bg-card border border-border/50">
              {/* Hero section */}
              <div className="hidden lg:flex flex-col p-10 bg-gradient-to-br from-primary/90 to-primary-foreground text-primary-foreground">
                <div className="flex-grow">
                  {selectedPlan && (
                    <div className="mb-8">
                      <Badge className="bg-white/20 text-white border-white/10 mb-2">Selected Plan</Badge>
                      <h2 className="text-2xl font-bold">{selectedPlan.name}</h2>
                      <div className="mt-2 flex items-baseline">
                        <span className="text-xl font-bold">
                          {formatCurrency(billingPeriod === "yearly" ? selectedPlan.priceYearly : selectedPlan.priceMonthly)}
                        </span>
                        <span className="text-sm opacity-80 ml-1">
                          {selectedPlan.tier !== SubscriptionTier.FREE && ` / ${billingPeriod === "yearly" ? "year" : "month"}`}
                        </span>
                      </div>
                      
                      <ul className="mt-4 space-y-2">
                        <li className="flex items-center text-sm">
                          <CheckCircle className="h-4 w-4 mr-2 text-white/70" />
                          <span>Up to {selectedPlan.maxWorkflows} workflows</span>
                        </li>
                        <li className="flex items-center text-sm">
                          <CheckCircle className="h-4 w-4 mr-2 text-white/70" />
                          <span>{selectedPlan.maxExecutionsPerMonth.toLocaleString()} runs per month</span>
                        </li>
                      </ul>
                      
                      <Button 
                        variant="link" 
                        className="text-white px-0 mt-4" 
                        onClick={() => setCurrentStep('pricing')}
                      >
                        Change plan
                      </Button>
                    </div>
                  )}
                </div>
                
                <div className="mt-auto">
                  <h1 className="text-4xl font-bold tracking-tight mb-4">
                    Create Your Account
                  </h1>
                  <p className="text-xl opacity-90 mb-6">
                    Join thousands of businesses automating their workflows with PumpFlux.
                  </p>
                </div>
              </div>
              
              {/* Auth form */}
              <div className="p-6 md:p-10 flex flex-col items-center justify-center">
                <div className="lg:hidden mb-6 text-center">
                  <h1 className="text-3xl font-bold tracking-tight mb-2">
                    Create Your Account
                  </h1>
                  <p className="text-muted-foreground mb-4">
                    Join thousands of businesses automating their workflows.
                  </p>
                  
                  {selectedPlan && (
                    <div className="mt-4 mb-6 p-4 rounded-lg bg-muted border border-border/50">
                      <div className="flex justify-between items-center">
                        <div>
                          <Badge className="mb-1">{selectedPlan.name} Plan</Badge>
                          <div className="flex items-baseline">
                            <span className="text-lg font-bold">
                              {formatCurrency(billingPeriod === "yearly" ? selectedPlan.priceYearly : selectedPlan.priceMonthly)}
                            </span>
                            <span className="text-xs text-muted-foreground ml-1">
                              {selectedPlan.tier !== SubscriptionTier.FREE && ` / ${billingPeriod === "yearly" ? "year" : "month"}`}
                            </span>
                          </div>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setCurrentStep('pricing')}
                        >
                          Change
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
                
                <Card className="w-full max-w-md border-0 shadow-none">
                  <CardContent className="space-y-6 pt-6">
                    <div className="space-y-2">
                      <h3 className="text-center font-medium">Sign in to get started</h3>
                      <p className="text-center text-sm text-muted-foreground">
                        Use your Replit account to continue
                      </p>
                    </div>
                    
                    <Button 
                      size="lg"
                      className="w-full py-6 text-lg" 
                      onClick={handleLogin}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Signing in...
                        </>
                      ) : "Sign in with Replit"}
                    </Button>
                    
                    <div className="text-center text-sm text-muted-foreground">
                      By continuing, you agree to PumpFlux's Terms of Service and Privacy Policy.
                    </div>
                    
                    <div className="flex items-center gap-2 p-4 rounded-lg bg-blue-50 text-blue-800 border border-blue-100">
                      <AlertCircle className="h-5 w-5 text-blue-500 shrink-0" />
                      <p className="text-sm">
                        Your free trial of the {selectedPlan?.name || "selected"} plan starts after you create your account. No credit card required for free plan.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
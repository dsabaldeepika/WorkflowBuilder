import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { CheckCircle2, X, AlertTriangle, CheckCircle } from "lucide-react";
import { useLocation } from "wouter";
import { SubscriptionTier } from "@/../../shared/schema";
import { API_ENDPOINTS, ROUTES } from "@/../../shared/config";

type SubscriptionPlan = {
  id: number;
  name: string;
  tier: string;
  description: string;
  priceMonthly: number;
  priceYearly: number;
  stripePriceIdMonthly: string;
  stripePriceIdYearly: string;
  maxWorkflows: number;
  maxWorkspaces: number;
  maxExecutionsPerMonth: number;
  maxTeamMembers: number;
  hasAdvancedIntegrations: boolean;
  hasAiFeatures: boolean;
  hasCustomBranding: boolean;
  hasPrioritySuppport: boolean;
  features: string[];
  isActive: boolean;
};

export default function PricingPage() {
  const { user } = useAuth();
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [loading, setLoading] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "templates" | "usage">("all");
  const { toast } = useToast();
  const [, navigate] = useLocation();

  // Get user subscription info if logged in
  const { data: subscription } = useQuery({
    queryKey: [API_ENDPOINTS.subscriptions.current],
    queryFn: async () => {
      try {
        return await apiRequest(API_ENDPOINTS.subscriptions.current);
      } catch (error) {
        // Return free tier as default if there's an error
        return { tier: SubscriptionTier.FREE, status: "inactive" };
      }
    },
    enabled: !!user
  });

  // Get all subscription plans
  const { data: plans, isLoading: plansLoading } = useQuery({
    queryKey: [API_ENDPOINTS.subscriptions.plans],
    queryFn: async () => {
      return await apiRequest(API_ENDPOINTS.subscriptions.plans);
    }
  });

  const startCheckout = async (plan: SubscriptionPlan) => {
    // If user is not logged in, redirect to signup with the plan selection
    if (!user) {
      // Store selected plan in session storage for the signup page
      sessionStorage.setItem('selectedPlanId', plan.id.toString());
      sessionStorage.setItem('selectedBillingPeriod', billingPeriod);
      
      // Navigate to signup page
      navigate(ROUTES.signup);
      return;
    }

    // If plan is free, no need for checkout
    if (plan.tier === SubscriptionTier.FREE) {
      toast({
        title: "Free plan selected",
        description: "You're now on the free plan",
        variant: "default"
      });
      return;
    }

    setLoading(plan.id);
    
    try {
      const priceId = billingPeriod === "yearly" ? plan.stripePriceIdYearly : plan.stripePriceIdMonthly;
      
      const data = await apiRequest(
        API_ENDPOINTS.subscriptions.createSubscription, 
        {
          method: 'POST',
          body: JSON.stringify({
            planId: plan.id,
            priceId,
            billingPeriod
          }),
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      toast({
        title: "Checkout failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(null);
    }
  };

  const handlePlanClick = (plan: SubscriptionPlan) => {
    // If current subscription tier is the same as the selected plan, do nothing
    if (subscription?.tier === plan.tier) {
      toast({
        title: "Already subscribed",
        description: `You are already on the ${plan.name} plan.`,
        variant: "default"
      });
      return;
    }
    
    setSelectedPlan(plan);
    setConfirmDialogOpen(true);
  };

  const confirmPlanChange = () => {
    if (selectedPlan) {
      startCheckout(selectedPlan);
      setConfirmDialogOpen(false);
    }
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

  // Handler for specialty package types that aren't in the database yet
  const handleSpecialtyPackage = (packageName: string) => {
    toast({
      title: `${packageName} Package Selected`,
      description: "This special pricing option will be available soon!",
      variant: "default"
    });
  };

  const userTier = subscription?.tier || SubscriptionTier.FREE;

  return (
    <div className="container mx-auto py-10 px-4 md:px-6">
      {/* Gradient Header Section */}
      <div className="text-center mb-16">
        <div className="relative">
          <div className="absolute -top-24 left-1/2 transform -translate-x-1/2 w-[800px] h-[300px] bg-gradient-to-r from-primary/20 via-pink-500/20 to-purple-500/20 rounded-full blur-3xl opacity-50 -z-10"></div>
          <h1 className="text-5xl font-bold tracking-tight mb-4 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Flexible Pricing for Every Business
          </h1>
        </div>
        <p className="text-muted-foreground text-xl max-w-3xl mx-auto">
          Choose the plan that fits your workflow needs. Scale as you grow with our flexible pricing options.
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

      {/* Plan type tabs for different use cases */}
      <div className="mb-10">
        <div className="flex justify-center mb-8">
          <div className="inline-flex p-1 bg-muted/50 rounded-lg">
            <button 
              className={`px-6 py-2 text-sm font-medium rounded-md transition-all duration-200 ${activeTab === 'all' ? 'bg-white shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={() => setActiveTab('all')}
            >
              All Plans
            </button>
            <button 
              className={`px-6 py-2 text-sm font-medium rounded-md transition-all duration-200 ${activeTab === 'templates' ? 'bg-white shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={() => setActiveTab('templates')}
            >
              By Templates
            </button>
            <button 
              className={`px-6 py-2 text-sm font-medium rounded-md transition-all duration-200 ${activeTab === 'usage' ? 'bg-white shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={() => setActiveTab('usage')}
            >
              By Usage
            </button>
          </div>
        </div>
        
        {/* Tab descriptions */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          {activeTab === 'all' && (
            <p className="text-muted-foreground">Compare all our standard plans with features, pricing, and limits.</p>
          )}
          {activeTab === 'templates' && (
            <p className="text-muted-foreground">Choose a plan based on how many workflow templates you need access to. Perfect for businesses that need specific automation solutions.</p>
          )}
          {activeTab === 'usage' && (
            <p className="text-muted-foreground">Select a plan based on your monthly workflow execution volume. Ideal for businesses with varying automation needs throughout the month.</p>
          )}
        </div>
      </div>

      {plansLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      ) : (
        <>
          {/* Standard pricing plans */}
          {activeTab === 'all' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {plans?.map((plan: SubscriptionPlan) => {
                const discount = calculateYearlyDiscount(plan.priceMonthly, plan.priceYearly);
                const price = billingPeriod === "yearly" ? plan.priceYearly : plan.priceMonthly;
                const isCurrentPlan = userTier === plan.tier;
                const isPro = plan.tier === 'pro';
                
                return (
                  <Card 
                    key={plan.id} 
                    className={`flex flex-col relative group transition-all duration-300 hover:shadow-xl ${
                      isCurrentPlan ? 'border-primary ring-2 ring-primary/20' : 
                      isPro ? 'border-purple-400/50' : ''
                    }`}
                  >
                    {isPro && (
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-violet-600 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                        Most Popular
                      </div>
                    )}
                    
                    <CardHeader className={`${isPro ? 'bg-gradient-to-br from-purple-50 to-indigo-50 border-b border-purple-100' : ''}`}>
                      {isCurrentPlan && (
                        <Badge className="w-fit mb-2 bg-primary/10 text-primary border-primary/20" variant="secondary">Current Plan</Badge>
                      )}
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
                            <span className="text-sm text-muted-foreground ml-2">
                              vs monthly
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">
                          Plan includes:
                        </h4>
                        <ul className="space-y-3">
                          {plan.features?.map((feature, index) => (
                            <li key={index} className="flex items-start">
                              <CheckCircle className={`h-5 w-5 ${isPro ? 'text-purple-500' : 'text-green-500'} mr-2 shrink-0 mt-0.5`} />
                              <span className="text-sm">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="pt-3 pb-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm">Templates</span>
                          <span className="font-medium">{plan.tier === SubscriptionTier.FREE ? '5' : 
                                                plan.tier === SubscriptionTier.BASIC ? '20' : 
                                                plan.tier === SubscriptionTier.PRO ? 'All' : 'Custom'}</span>
                        </div>
                        
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm">Max workflows</span>
                          <span className="font-medium">{plan.maxWorkflows}</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Executions/month</span>
                          <span className="font-medium">{plan.maxExecutionsPerMonth.toLocaleString()}</span>
                        </div>
                      </div>
                    </CardContent>
                    
                    <CardFooter className="pt-2 pb-6">
                      <Button 
                        className={`w-full py-6 ${
                          isPro ? 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700' : ''
                        }`}
                        variant={isCurrentPlan ? "outline" : isPro ? "default" : "default"}
                        disabled={loading === plan.id || isCurrentPlan}
                        onClick={() => handlePlanClick(plan)}
                      >
                        {loading === plan.id ? (
                          <>
                            <span className="animate-spin mr-2">&#9696;</span>
                            Processing...
                          </>
                        ) : isCurrentPlan ? (
                          "Current Plan"
                        ) : (
                          `Choose ${plan.name}`
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}
          
          {/* Template-based pricing */}
          {activeTab === 'templates' && (
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Basic Templates Package */}
                <Card className="flex flex-col relative hover:shadow-xl transition-all">
                  <CardHeader>
                    <CardTitle className="text-2xl">Essential Templates</CardTitle>
                    <CardDescription>Get started with key automations</CardDescription>
                  </CardHeader>
                  
                  <CardContent className="flex-grow">
                    <div className="mb-6">
                      <div className="flex items-baseline">
                        <p className="text-4xl font-bold">
                          {formatCurrency(billingPeriod === "yearly" ? 249 : 29)}
                        </p>
                        <span className="text-sm font-normal text-muted-foreground ml-1">
                          / {billingPeriod === "yearly" ? "year" : "month"}
                        </span>
                      </div>
                      {billingPeriod === "yearly" && (
                        <div className="flex items-center mt-1">
                          <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                            Save 28%
                          </Badge>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-4">
                      <div className="bg-muted/40 p-4 rounded-lg">
                        <h3 className="font-medium mb-2">10 Premium Templates</h3>
                        <p className="text-sm text-muted-foreground">Choose from CRM, Marketing, or Operations categories</p>
                      </div>
                      
                      <ul className="space-y-3">
                        <li className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                          <span className="text-sm">10 active workflows</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                          <span className="text-sm">Up to 5,000 executions/month</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                          <span className="text-sm">Email support</span>
                        </li>
                      </ul>
                    </div>
                  </CardContent>
                  
                  <CardFooter className="pt-2 pb-6">
                    <Button className="w-full py-6">
                      Choose Templates Pack
                    </Button>
                  </CardFooter>
                </Card>
                
                {/* Pro Templates Package */}
                <Card className="flex flex-col relative hover:shadow-xl transition-all border-purple-400/50 shadow-md">
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-violet-600 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </div>
                  
                  <CardHeader className="bg-gradient-to-br from-purple-50 to-indigo-50 border-b border-purple-100">
                    <CardTitle className="text-2xl text-purple-700">Business Templates</CardTitle>
                    <CardDescription>Comprehensive automation suite</CardDescription>
                  </CardHeader>
                  
                  <CardContent className="flex-grow pt-6">
                    <div className="mb-6">
                      <div className="flex items-baseline">
                        <p className="text-4xl font-bold text-purple-600">
                          {formatCurrency(billingPeriod === "yearly" ? 499 : 59)}
                        </p>
                        <span className="text-sm font-normal text-muted-foreground ml-1">
                          / {billingPeriod === "yearly" ? "year" : "month"}
                        </span>
                      </div>
                      {billingPeriod === "yearly" && (
                        <div className="flex items-center mt-1">
                          <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                            Save 30%
                          </Badge>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-4">
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <h3 className="font-medium mb-2 text-purple-700">30 Premium Templates</h3>
                        <p className="text-sm text-purple-700/70">Full access to all categories and premium integrations</p>
                      </div>
                      
                      <ul className="space-y-3">
                        <li className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-purple-500 mr-2 shrink-0 mt-0.5" />
                          <span className="text-sm">25 active workflows</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-purple-500 mr-2 shrink-0 mt-0.5" />
                          <span className="text-sm">Up to 15,000 executions/month</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-purple-500 mr-2 shrink-0 mt-0.5" />
                          <span className="text-sm">Advanced integrations</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-purple-500 mr-2 shrink-0 mt-0.5" />
                          <span className="text-sm">Priority email support</span>
                        </li>
                      </ul>
                    </div>
                  </CardContent>
                  
                  <CardFooter className="pt-2 pb-6">
                    <Button className="w-full py-6 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700">
                      Choose Templates Pack
                    </Button>
                  </CardFooter>
                </Card>
                
                {/* Enterprise Templates Package */}
                <Card className="flex flex-col relative hover:shadow-xl transition-all">
                  <CardHeader>
                    <CardTitle className="text-2xl">Enterprise Templates</CardTitle>
                    <CardDescription>Custom solutions for large teams</CardDescription>
                  </CardHeader>
                  
                  <CardContent className="flex-grow">
                    <div className="mb-6">
                      <div className="flex items-baseline">
                        <p className="text-4xl font-bold">
                          {formatCurrency(billingPeriod === "yearly" ? 999 : 119)}
                        </p>
                        <span className="text-sm font-normal text-muted-foreground ml-1">
                          / {billingPeriod === "yearly" ? "year" : "month"}
                        </span>
                      </div>
                      {billingPeriod === "yearly" && (
                        <div className="flex items-center mt-1">
                          <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                            Save 30%
                          </Badge>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h3 className="font-medium mb-2 text-blue-700">Unlimited Templates</h3>
                        <p className="text-sm text-blue-700/70">Full library + custom template development</p>
                      </div>
                      
                      <ul className="space-y-3">
                        <li className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-blue-500 mr-2 shrink-0 mt-0.5" />
                          <span className="text-sm">Unlimited workflows</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-blue-500 mr-2 shrink-0 mt-0.5" />
                          <span className="text-sm">Up to 50,000 executions/month</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-blue-500 mr-2 shrink-0 mt-0.5" />
                          <span className="text-sm">Custom template development</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-blue-500 mr-2 shrink-0 mt-0.5" />
                          <span className="text-sm">Dedicated account manager</span>
                        </li>
                      </ul>
                    </div>
                  </CardContent>
                  
                  <CardFooter className="pt-2 pb-6">
                    <Button className="w-full py-6">
                      Choose Templates Pack
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
          )}
          
          {/* Usage-based pricing */}
          {activeTab === 'usage' && (
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Light Usage Plan */}
                <Card className="flex flex-col relative hover:shadow-xl transition-all">
                  <CardHeader>
                    <CardTitle className="text-2xl">Light Usage</CardTitle>
                    <CardDescription>For occasional automation needs</CardDescription>
                  </CardHeader>
                  
                  <CardContent className="flex-grow">
                    <div className="mb-6">
                      <div className="flex items-baseline">
                        <p className="text-4xl font-bold">
                          {formatCurrency(billingPeriod === "yearly" ? 199 : 19)}
                        </p>
                        <span className="text-sm font-normal text-muted-foreground ml-1">
                          / {billingPeriod === "yearly" ? "year" : "month"}
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      <div className="border border-green-200 rounded-lg p-4 mb-4 bg-green-50/50">
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="font-medium">Monthly Executions</h3>
                          <span className="text-lg font-semibold text-green-600">2,500</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{ width: '25%' }}></div>
                        </div>
                      </div>
                      
                      <ul className="space-y-3">
                        <li className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                          <span className="text-sm">5 active workflows (more than competitors)</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                          <span className="text-sm">10 template access</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                          <span className="text-sm">Basic integrations</span>
                        </li>
                      </ul>
                    </div>
                  </CardContent>
                  
                  <CardFooter className="pt-2 pb-6">
                    <Button className="w-full py-6">
                      Choose Light Usage
                    </Button>
                  </CardFooter>
                </Card>
                
                {/* Standard Usage Plan */}
                <Card className="flex flex-col relative hover:shadow-xl transition-all border-purple-400/50 shadow-md scale-105">
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-violet-600 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </div>
                  
                  <CardHeader className="bg-gradient-to-br from-purple-50 to-indigo-50 border-b border-purple-100">
                    <CardTitle className="text-2xl text-purple-700">Standard Usage</CardTitle>
                    <CardDescription>For regular business automation</CardDescription>
                  </CardHeader>
                  
                  <CardContent className="flex-grow pt-6">
                    <div className="mb-6">
                      <div className="flex items-baseline">
                        <p className="text-4xl font-bold text-purple-600">
                          {formatCurrency(billingPeriod === "yearly" ? 490 : 49)}
                        </p>
                        <span className="text-sm font-normal text-muted-foreground ml-1">
                          / {billingPeriod === "yearly" ? "year" : "month"}
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      <div className="border border-purple-200 rounded-lg p-4 mb-4 bg-purple-50/50">
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="font-medium">Monthly Executions</h3>
                          <span className="text-lg font-semibold text-purple-600">10,000</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-purple-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                        </div>
                      </div>
                      
                      <ul className="space-y-3">
                        <li className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-purple-500 mr-2 shrink-0 mt-0.5" />
                          <span className="text-sm">25 active workflows</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-purple-500 mr-2 shrink-0 mt-0.5" />
                          <span className="text-sm">30 template access</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-purple-500 mr-2 shrink-0 mt-0.5" />
                          <span className="text-sm">Advanced integrations</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-purple-500 mr-2 shrink-0 mt-0.5" />
                          <span className="text-sm">Execution analytics</span>
                        </li>
                      </ul>
                    </div>
                  </CardContent>
                  
                  <CardFooter className="pt-2 pb-6">
                    <Button className="w-full py-6 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700">
                      Choose Standard Usage
                    </Button>
                  </CardFooter>
                </Card>
                
                {/* High Volume Usage Plan */}
                <Card className="flex flex-col relative hover:shadow-xl transition-all">
                  <CardHeader>
                    <CardTitle className="text-2xl">High Volume</CardTitle>
                    <CardDescription>For extensive automation needs</CardDescription>
                  </CardHeader>
                  
                  <CardContent className="flex-grow">
                    <div className="mb-6">
                      <div className="flex items-baseline">
                        <p className="text-4xl font-bold">
                          {formatCurrency(billingPeriod === "yearly" ? 990 : 99)}
                        </p>
                        <span className="text-sm font-normal text-muted-foreground ml-1">
                          / {billingPeriod === "yearly" ? "year" : "month"}
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      <div className="border border-blue-200 rounded-lg p-4 mb-4 bg-blue-50/50">
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="font-medium">Monthly Executions</h3>
                          <span className="text-lg font-semibold text-blue-600">50,000</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-500 h-2 rounded-full" style={{ width: '90%' }}></div>
                        </div>
                      </div>
                      
                      <ul className="space-y-3">
                        <li className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-blue-500 mr-2 shrink-0 mt-0.5" />
                          <span className="text-sm">Unlimited workflows</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-blue-500 mr-2 shrink-0 mt-0.5" />
                          <span className="text-sm">All templates included</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-blue-500 mr-2 shrink-0 mt-0.5" />
                          <span className="text-sm">Premium integrations</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-blue-500 mr-2 shrink-0 mt-0.5" />
                          <span className="text-sm">Advanced reporting & insights</span>
                        </li>
                      </ul>
                    </div>
                  </CardContent>
                  
                  <CardFooter className="pt-2 pb-6">
                    <Button className="w-full py-6">
                      Choose High Volume
                    </Button>
                  </CardFooter>
                </Card>
              </div>
              
              <div className="mt-8 p-4 bg-blue-50 border border-blue-100 rounded-lg text-center">
                <p className="text-sm text-blue-700">Need more executions? <a href="#" className="font-medium underline">Contact sales</a> for custom high-volume plans with up to 500,000 monthly executions.</p>
              </div>
            </div>
          )}
        </>
      )}

      {/* Feature comparison section */}
      <div className="mt-24 mb-16">
        <h2 className="text-3xl font-bold text-center mb-12">Compare Plans Features</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left py-4 px-6 font-medium">Feature</th>
                <th className="text-center py-4 px-6 font-medium">Free</th>
                <th className="text-center py-4 px-6 font-medium">Basic</th>
                <th className="text-center py-4 px-6 font-medium">Professional</th>
                <th className="text-center py-4 px-6 font-medium">Enterprise</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b hover:bg-muted/20">
                <td className="py-4 px-6 font-medium">Templates Access</td>
                <td className="text-center py-4 px-6">5 templates</td>
                <td className="text-center py-4 px-6">20 templates</td>
                <td className="text-center py-4 px-6">All templates</td>
                <td className="text-center py-4 px-6">All + Custom</td>
              </tr>
              <tr className="border-b hover:bg-muted/20">
                <td className="py-4 px-6 font-medium">Workflow Frequency</td>
                <td className="text-center py-4 px-6">Daily only</td>
                <td className="text-center py-4 px-6">Hourly</td>
                <td className="text-center py-4 px-6">Every 15 min</td>
                <td className="text-center py-4 px-6">Every minute</td>
              </tr>
              <tr className="border-b hover:bg-muted/20">
                <td className="py-4 px-6 font-medium">AI Assistance</td>
                <td className="text-center py-4 px-6">
                  <X className="h-5 w-5 text-red-500 mx-auto" />
                </td>
                <td className="text-center py-4 px-6">
                  <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                </td>
                <td className="text-center py-4 px-6">
                  <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                </td>
                <td className="text-center py-4 px-6">
                  <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                </td>
              </tr>
              <tr className="border-b hover:bg-muted/20">
                <td className="py-4 px-6 font-medium">Error Notifications</td>
                <td className="text-center py-4 px-6">Basic</td>
                <td className="text-center py-4 px-6">Advanced</td>
                <td className="text-center py-4 px-6">Real-time</td>
                <td className="text-center py-4 px-6">Custom Alerts</td>
              </tr>
              <tr className="border-b hover:bg-muted/20">
                <td className="py-4 px-6 font-medium">Template Sharing</td>
                <td className="text-center py-4 px-6">
                  <X className="h-5 w-5 text-red-500 mx-auto" />
                </td>
                <td className="text-center py-4 px-6">Team only</td>
                <td className="text-center py-4 px-6">Public + Private</td>
                <td className="text-center py-4 px-6">Advanced controls</td>
              </tr>
              <tr className="border-b hover:bg-muted/20">
                <td className="py-4 px-6 font-medium">Support</td>
                <td className="text-center py-4 px-6">Community</td>
                <td className="text-center py-4 px-6">Email</td>
                <td className="text-center py-4 px-6">Priority Email</td>
                <td className="text-center py-4 px-6">Dedicated Support</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Custom plan section with a better visual appeal */}
      <div className="mt-16 mb-20">
        <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-10 border border-blue-100 shadow-sm relative overflow-hidden">
          {/* Background decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-200/20 to-purple-200/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-green-200/20 to-blue-200/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl"></div>
          
          <div className="max-w-3xl mx-auto text-center relative">
            <h2 className="text-3xl font-bold mb-6">Need a Custom Enterprise Solution?</h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              For organizations with specific requirements or high-volume needs, we offer tailored enterprise solutions with custom features, dedicated support, and flexible pricing.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="default" size="lg" className="font-medium">
                Schedule a Demo
              </Button>
              <Button variant="outline" size="lg" className="font-medium">
                Contact Sales Team
              </Button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12">
              <div className="flex flex-col items-center p-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-blue-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium mb-2">Custom Templates</h3>
                <p className="text-sm text-center text-muted-foreground">Get tailored workflows designed specifically for your business needs</p>
              </div>
              
              <div className="flex flex-col items-center p-4">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-green-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium mb-2">SLA Guarantees</h3>
                <p className="text-sm text-center text-muted-foreground">Get guaranteed uptime and priority support with response time SLAs</p>
              </div>
              
              <div className="flex flex-col items-center p-4">
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-purple-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium mb-2">Private Deployment</h3>
                <p className="text-sm text-center text-muted-foreground">Get PumpFlux deployed in your own secured environment</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Subscription Change</DialogTitle>
            <DialogDescription>
              {selectedPlan?.tier === SubscriptionTier.FREE 
                ? "Are you sure you want to downgrade to the Free plan? You'll lose access to premium features."
                : `You're about to subscribe to the ${selectedPlan?.name} plan for ${formatCurrency(billingPeriod === "yearly" ? selectedPlan?.priceYearly || 0 : selectedPlan?.priceMonthly || 0)}/${billingPeriod === "yearly" ? "year" : "month"}.`
              }
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmPlanChange}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, X, RefreshCw, AlertTriangle, CreditCard, Gauge, Clock, CalendarDays } from "lucide-react";
import { useState } from "react";
import { useLocation, Link } from "wouter";
import { format } from "date-fns";
import { API_ENDPOINTS, ROUTES } from "@/../../shared/config";
import { SubscriptionTier } from "@/../../shared/schema";

type SubscriptionDetails = {
  tier: string;
  status: string;
  periodEnd?: string;
  planDetails: {
    id: number;
    name: string;
    description: string;
    priceMonthly: number;
    priceYearly: number;
    maxWorkflows: number;
    maxWorkspaces: number;
    maxExecutionsPerMonth: number;
    maxTeamMembers: number;
    features: string[];
  } | null;
};

export default function AccountBillingPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [isManagingSubscription, setIsManagingSubscription] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);

  // Redirect if not authenticated
  if (!user) {
    navigate(ROUTES.auth);
    return null;
  }

  // Get user subscription info
  const { data: subscription, isLoading } = useQuery({
    queryKey: [API_ENDPOINTS.subscriptions.current],
    queryFn: async () => {
      const res = await apiRequest("GET", API_ENDPOINTS.subscriptions.current);
      return await res.json();
    }
  });

  // Get all plans for comparison
  const { data: plans } = useQuery({
    queryKey: [API_ENDPOINTS.subscriptions.plans],
    queryFn: async () => {
      const res = await apiRequest("GET", API_ENDPOINTS.subscriptions.plans);
      return await res.json();
    }
  });

  // Mutation to manage subscription via Stripe customer portal
  const manageBillingMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", API_ENDPOINTS.subscriptions.createPortalSession);
      return await res.json();
    },
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to open billing portal",
        variant: "destructive"
      });
    }
  });

  // Mutation to cancel subscription
  const cancelSubscriptionMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", API_ENDPOINTS.subscriptions.cancelSubscription);
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.subscriptions.current] });
      toast({
        title: "Subscription Canceled",
        description: `Your subscription will end on ${format(new Date(data.willEndOn), "MMMM d, yyyy")}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to cancel subscription",
        variant: "destructive"
      });
    }
  });

  const handleManageBilling = () => {
    setIsManagingSubscription(true);
    manageBillingMutation.mutate();
  };

  const handleCancelSubscription = () => {
    setIsCanceling(true);
    cancelSubscriptionMutation.mutate();
  };

  // Function to format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: amount % 1 === 0 ? 0 : 2
    }).format(amount);
  };

  // Function to calculate usage percentages
  const calculateUsagePercent = (used: number, limit: number) => {
    if (limit === 0) return 0;
    const percent = (used / limit) * 100;
    return Math.min(100, Math.max(0, percent));
  };

  // Mock usage data - in a real app, you would fetch this from the backend
  const usageData = {
    workflows: { used: 3, limit: subscription?.planDetails?.maxWorkflows || 0 },
    workspaces: { used: 1, limit: subscription?.planDetails?.maxWorkspaces || 0 },
    executions: { used: 120, limit: subscription?.planDetails?.maxExecutionsPerMonth || 0 },
    teamMembers: { used: 1, limit: subscription?.planDetails?.maxTeamMembers || 0 }
  };

  const isActivePaidPlan = subscription && 
                           subscription.tier !== SubscriptionTier.FREE && 
                           subscription.status !== "canceled" &&
                           subscription.status !== "unpaid";

  return (
    <div className="container mx-auto py-10 px-4 md:px-6">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Billing & Usage</h1>
          <p className="text-muted-foreground mt-1">Manage your subscription and monitor resource usage</p>
        </div>
        <div className="mt-4 sm:mt-0 flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            asChild
          >
            <Link href="/pricing">
              View Plans
            </Link>
          </Button>
          {isActivePaidPlan && (
            <Button 
              variant="default" 
              size="sm"
              onClick={handleManageBilling}
              disabled={isManagingSubscription || manageBillingMutation.isPending}
            >
              {manageBillingMutation.isPending ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Manage Billing
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="subscription" className="space-y-6">
        <TabsList>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
          <TabsTrigger value="usage">Usage & Limits</TabsTrigger>
          <TabsTrigger value="history">Billing History</TabsTrigger>
        </TabsList>

        <TabsContent value="subscription" className="space-y-6">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : (
            <>
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>Current Plan</CardTitle>
                      <CardDescription>Your active subscription details</CardDescription>
                    </div>
                    
                    <div className="flex gap-2 items-center">
                      {subscription?.status === "active" && (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          Active
                        </Badge>
                      )}
                      {subscription?.status === "canceled" && (
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                          Canceled
                        </Badge>
                      )}
                      {subscription?.status === "unpaid" && (
                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                          Unpaid
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div>
                      <h3 className="text-2xl font-bold">
                        {subscription?.planDetails?.name || "Free"}
                      </h3>
                      <p className="text-muted-foreground mt-1">
                        {subscription?.planDetails?.description || "Basic workflow automation features"}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">
                        {subscription?.planDetails ? 
                          formatCurrency(subscription.planDetails.priceMonthly) + "/month" : 
                          "Free"}
                      </div>
                      {subscription?.periodEnd && subscription.status !== "canceled" && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Next billing date: {format(new Date(subscription.periodEnd), "MMMM d, yyyy")}
                        </p>
                      )}
                      {subscription?.status === "canceled" && subscription?.periodEnd && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Access until: {format(new Date(subscription.periodEnd), "MMMM d, yyyy")}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="font-medium mb-3">Plan Features</h4>
                    <ul className="space-y-2 grid sm:grid-cols-2 gap-2">
                      {subscription?.planDetails?.features?.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col sm:flex-row justify-between gap-4">
                  {(subscription?.tier === SubscriptionTier.FREE || !subscription?.tier) ? (
                    <div className="w-full">
                      <Button 
                        className="w-full sm:w-auto" 
                        asChild
                      >
                        <Link href="/pricing">
                          Upgrade Plan
                        </Link>
                      </Button>
                    </div>
                  ) : subscription?.status === "canceled" ? (
                    <div className="flex flex-col w-full">
                      <p className="text-sm text-muted-foreground mb-2">
                        Your subscription has been canceled but remains active until the end of the billing period.
                      </p>
                      <Button 
                        className="w-full sm:w-auto" 
                        asChild
                      >
                        <Link href="/pricing">
                          Renew Subscription
                        </Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row gap-3 w-full">
                      <Button 
                        variant="outline" 
                        className="w-full sm:w-auto"
                        onClick={handleManageBilling}
                        disabled={manageBillingMutation.isPending}
                      >
                        {manageBillingMutation.isPending ? "Processing..." : "Update Payment Method"}
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="destructive"
                            className="w-full sm:w-auto"
                            disabled={cancelSubscriptionMutation.isPending}
                          >
                            {cancelSubscriptionMutation.isPending ? (
                              <>
                                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                Processing...
                              </>
                            ) : (
                              "Cancel Subscription"
                            )}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Cancel Subscription</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to cancel your subscription? You will still have access to your current features until the end of your billing period.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
                            <AlertDialogAction 
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              onClick={handleCancelSubscription}
                            >
                              Cancel Subscription
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  )}
                </CardFooter>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="usage" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Resource Usage</CardTitle>
              <CardDescription>Track your usage against plan limits</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <div className="mb-2 flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                        <RefreshCw className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Workflows</p>
                        <p className="text-sm text-muted-foreground">
                          {usageData.workflows.used} of {usageData.workflows.limit} used
                        </p>
                      </div>
                    </div>
                    <Badge variant={usageData.workflows.used / usageData.workflows.limit > 0.8 ? "destructive" : "outline"}>
                      {Math.round(calculateUsagePercent(usageData.workflows.used, usageData.workflows.limit))}%
                    </Badge>
                  </div>
                  <Progress value={calculateUsagePercent(usageData.workflows.used, usageData.workflows.limit)} className="h-2" />
                </div>

                <div>
                  <div className="mb-2 flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                        <Gauge className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Executions</p>
                        <p className="text-sm text-muted-foreground">
                          {usageData.executions.used} of {usageData.executions.limit} this month
                        </p>
                      </div>
                    </div>
                    <Badge variant={usageData.executions.used / usageData.executions.limit > 0.8 ? "destructive" : "outline"}>
                      {Math.round(calculateUsagePercent(usageData.executions.used, usageData.executions.limit))}%
                    </Badge>
                  </div>
                  <Progress value={calculateUsagePercent(usageData.executions.used, usageData.executions.limit)} className="h-2" />
                </div>

                <div>
                  <div className="mb-2 flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                        <CreditCard className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Workspaces</p>
                        <p className="text-sm text-muted-foreground">
                          {usageData.workspaces.used} of {usageData.workspaces.limit} used
                        </p>
                      </div>
                    </div>
                    <Badge variant={usageData.workspaces.used / usageData.workspaces.limit > 0.8 ? "destructive" : "outline"}>
                      {Math.round(calculateUsagePercent(usageData.workspaces.used, usageData.workspaces.limit))}%
                    </Badge>
                  </div>
                  <Progress value={calculateUsagePercent(usageData.workspaces.used, usageData.workspaces.limit)} className="h-2" />
                </div>

                <div>
                  <div className="mb-2 flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                        <Clock className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Team Members</p>
                        <p className="text-sm text-muted-foreground">
                          {usageData.teamMembers.used} of {usageData.teamMembers.limit} used
                        </p>
                      </div>
                    </div>
                    <Badge variant={usageData.teamMembers.used / usageData.teamMembers.limit > 0.8 ? "destructive" : "outline"}>
                      {Math.round(calculateUsagePercent(usageData.teamMembers.used, usageData.teamMembers.limit))}%
                    </Badge>
                  </div>
                  <Progress value={calculateUsagePercent(usageData.teamMembers.used, usageData.teamMembers.limit)} className="h-2" />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" asChild>
                <Link href="/pricing">
                  Upgrade for More Resources
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Billing History</CardTitle>
              <CardDescription>View and download your past invoices</CardDescription>
            </CardHeader>
            <CardContent>
              {/* In a real app, you would fetch this data from the server */}
              <div className="rounded-md border">
                <div className="flex flex-col">
                  <div className="grid grid-cols-4 gap-4 p-4 font-medium border-b">
                    <div>Date</div>
                    <div>Description</div>
                    <div>Amount</div>
                    <div className="text-right">Receipt</div>
                  </div>
                  
                  {/* Sample invoice items - replace with real data */}
                  <div className="grid grid-cols-4 gap-4 p-4 border-b">
                    <div className="flex items-center">
                      <CalendarDays className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>May 1, 2025</span>
                    </div>
                    <div>Pro Plan Subscription</div>
                    <div>{formatCurrency(49.99)}</div>
                    <div className="text-right">
                      <Button variant="ghost" size="sm">
                        Download
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-4 p-4 border-b">
                    <div className="flex items-center">
                      <CalendarDays className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>Apr 1, 2025</span>
                    </div>
                    <div>Pro Plan Subscription</div>
                    <div>{formatCurrency(49.99)}</div>
                    <div className="text-right">
                      <Button variant="ghost" size="sm">
                        Download
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col items-start gap-2">
              <p className="text-sm text-muted-foreground">
                Need a copy of a specific invoice for your records? 
              </p>
              <Button variant="outline" size="sm" onClick={handleManageBilling}>
                View More in Billing Portal
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
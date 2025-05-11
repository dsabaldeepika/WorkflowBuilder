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
  const { toast } = useToast();
  const [, navigate] = useLocation();

  // Get user subscription info if logged in
  const { data: subscription } = useQuery({
    queryKey: ["/api/subscriptions/current"],
    queryFn: async () => {
      try {
        const res = await apiRequest("GET", "/api/subscriptions/current");
        return await res.json();
      } catch (error) {
        // Return free tier as default if there's an error
        return { tier: SubscriptionTier.FREE, status: "inactive" };
      }
    },
    enabled: !!user
  });

  // Get all subscription plans
  const { data: plans, isLoading: plansLoading } = useQuery({
    queryKey: ["/api/subscriptions/plans"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/subscriptions/plans");
      return await res.json();
    }
  });

  const startCheckout = async (plan: SubscriptionPlan) => {
    // If user is not logged in, redirect to login
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to subscribe to a plan",
        variant: "default"
      });
      navigate("/auth");
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
      
      const res = await apiRequest("POST", "/api/subscriptions/create-checkout-session", {
        planId: plan.id,
        priceId,
        billingPeriod
      });
      
      const data = await res.json();
      
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

  const userTier = subscription?.tier || SubscriptionTier.FREE;

  return (
    <div className="container mx-auto py-10 px-4 md:px-6">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          Pricing Plans
        </h1>
        <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
          Choose the right plan for your automation needs. Upgrade or downgrade at any time.
        </p>
        
        <div className="flex items-center justify-center mt-8">
          <Label htmlFor="billing-toggle" className={!billingPeriod || billingPeriod === "monthly" ? "font-medium" : "text-muted-foreground"}>
            Monthly
          </Label>
          <Switch
            id="billing-toggle"
            className="mx-4"
            checked={billingPeriod === "yearly"}
            onCheckedChange={(checked) => setBillingPeriod(checked ? "yearly" : "monthly")}
          />
          <Label htmlFor="billing-toggle" className={billingPeriod === "yearly" ? "font-medium" : "text-muted-foreground"}>
            Yearly
            <Badge variant="secondary" className="ml-2 font-normal">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans?.map((plan: SubscriptionPlan) => {
            const discount = calculateYearlyDiscount(plan.priceMonthly, plan.priceYearly);
            const price = billingPeriod === "yearly" ? plan.priceYearly : plan.priceMonthly;
            const isCurrentPlan = userTier === plan.tier;
            
            return (
              <Card key={plan.id} className={`flex flex-col ${isCurrentPlan ? 'border-primary' : ''}`}>
                <CardHeader>
                  {isCurrentPlan && (
                    <Badge className="w-fit mb-2" variant="outline">Current Plan</Badge>
                  )}
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="mb-6">
                    <p className="text-3xl font-bold">
                      {formatCurrency(price)}
                      <span className="text-sm font-normal text-muted-foreground">
                        {plan.tier !== SubscriptionTier.FREE && ` / ${billingPeriod === "yearly" ? "year" : "month"}`}
                      </span>
                    </p>
                    {billingPeriod === "yearly" && plan.tier !== SubscriptionTier.FREE && discount > 0 && (
                      <p className="text-sm text-muted-foreground">
                        Save {discount}% compared to monthly
                      </p>
                    )}
                  </div>
                  <ul className="space-y-2">
                    {plan.features?.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full" 
                    variant={isCurrentPlan ? "outline" : "default"}
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

      <div className="mt-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Need Something Custom?</h2>
        <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
          For organizations with specific requirements, we offer tailored solutions. 
          Contact us to discuss your needs.
        </p>
        <Button variant="outline" size="lg">
          Contact Sales
        </Button>
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
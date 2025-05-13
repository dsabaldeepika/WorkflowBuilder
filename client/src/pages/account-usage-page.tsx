import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { API_ENDPOINTS, ROUTES } from '@shared/config';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import UsageMetrics from '@/components/subscription/UsageMetrics';
import TransactionHistory from '@/components/subscription/TransactionHistory';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import {
  DollarSign,
  HelpCircle,
  Loader2,
  AlertCircle,
  ArrowRight,
  Package
} from 'lucide-react';
import { Link, useLocation } from 'wouter';

export default function AccountUsagePage() {
  const { user } = useAuth();
  const [location, navigate] = useLocation();

  const { data: subscription, isLoading: subscriptionLoading } = useQuery({
    queryKey: [API_ENDPOINTS.subscriptions.current],
    queryFn: async () => {
      try {
        return await apiRequest(API_ENDPOINTS.subscriptions.current);
      } catch (error) {
        console.error('Error fetching subscription data:', error);
        return { tier: 'free', status: 'inactive' };
      }
    },
    enabled: !!user
  });

  if (subscriptionLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading subscription details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 md:py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Subscription & Usage</h1>
        <p className="text-muted-foreground mt-2">
          Monitor your workflow usage and subscription activity
        </p>
      </div>

      {/* Current Subscription Overview */}
      <div className="mb-8 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg p-6 border border-primary/20">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-6">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold">Current Subscription</h2>
              <HoverCard>
                <HoverCardTrigger>
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </HoverCardTrigger>
                <HoverCardContent className="w-80">
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">About your subscription</h4>
                    <p className="text-sm text-muted-foreground">
                      Your subscription determines the features and resources available to you. 
                      Upgrade anytime to access additional capabilities.
                    </p>
                  </div>
                </HoverCardContent>
              </HoverCard>
            </div>
            <div className="mt-2 flex items-center">
              <Package className="h-5 w-5 text-primary mr-2" />
              <span className="font-medium text-lg capitalize">{subscription?.tier || 'Free'} Plan</span>
              {subscription?.status === 'trial' && (
                <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-amber-100 text-amber-800">
                  Trial ends in {subscription?.trialDaysRemaining || 0} days
                </span>
              )}
            </div>
            <div className="mt-1 text-muted-foreground text-sm">
              {subscription?.status === 'active' ? (
                <span>Your subscription is active and will renew automatically.</span>
              ) : subscription?.status === 'trial' ? (
                <span>You're currently on a free trial. Consider upgrading to maintain access to all features.</span>
              ) : subscription?.status === 'canceled' ? (
                <span className="text-red-500">Your subscription has been canceled and will end on {new Date(subscription?.currentPeriodEnd).toLocaleDateString()}.</span>
              ) : (
                <span>You're currently on the free plan with limited features.</span>
              )}
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" asChild>
              <Link href={ROUTES.accountBilling}>
                Billing Settings
              </Link>
            </Button>
            <Button asChild>
              <Link href={ROUTES.pricing}>
                Upgrade Plan <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Usage Tabs */}
      <Tabs defaultValue="usage" className="space-y-6">
        <TabsList>
          <TabsTrigger value="usage">Usage Metrics</TabsTrigger>
          <TabsTrigger value="transactions">Transaction History</TabsTrigger>
        </TabsList>

        <TabsContent value="usage" className="space-y-6">
          <UsageMetrics />
        </TabsContent>

        <TabsContent value="transactions" className="space-y-6">
          <TransactionHistory />
        </TabsContent>
      </Tabs>
    </div>
  );
}
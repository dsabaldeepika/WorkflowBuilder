import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { API_ENDPOINTS } from '@shared/config';
import { Loader2, AlertCircle, ExternalLink, Receipt, ArrowUpRight, ArrowDownRight, Calendar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

type Transaction = {
  id: number;
  date: string;
  planName: string;
  planTier: string;
  period: 'monthly' | 'yearly';
  amount: number;
  status: 'success' | 'pending' | 'failed';
  type: 'subscription' | 'renewal' | 'upgrade' | 'downgrade' | 'refund' | 'cancellation';
  fromPlan?: string;
  toPlan?: string;
  invoiceUrl?: string;
};

export default function TransactionHistory() {
  const { data: transactions, isLoading, error } = useQuery<Transaction[]>({
    queryKey: [API_ENDPOINTS.subscriptions.transactions],
    queryFn: async () => {
      return await apiRequest(API_ENDPOINTS.subscriptions.transactions);
    }
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          We were unable to load your transaction history. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  // If no transaction history available
  if (!transactions || transactions.length === 0) {
    return (
      <Card className="bg-muted/30">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center text-center p-6">
            <Receipt className="h-12 w-12 text-muted-foreground opacity-50 mb-4" />
            <h3 className="text-lg font-medium">No Transaction History</h3>
            <p className="text-sm text-muted-foreground mt-2 max-w-md">
              Your billing and subscription history will appear here once you've made a purchase or subscribed to a paid plan.
            </p>
            <Button variant="outline" className="mt-4" asChild>
              <a href="/pricing">View Pricing Plans</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: amount % 1 === 0 ? 0 : 2
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get transaction badge variant
  const getTransactionBadgeVariant = (type: Transaction['type']): "default" | "outline" | "destructive" | "secondary" | "success" | null | undefined => {
    switch (type) {
      case 'subscription':
      case 'renewal':
        return 'default';
      case 'upgrade':
        return 'success';
      case 'downgrade':
        // No 'warning' variant in our badge component, use outline instead
        return 'outline';
      case 'refund':
      case 'cancellation':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  // Get human-readable transaction type
  const getTransactionTypeLabel = (type: Transaction['type']) => {
    switch (type) {
      case 'subscription':
        return 'New Subscription';
      case 'renewal':
        return 'Subscription Renewal';
      case 'upgrade':
        return 'Plan Upgrade';
      case 'downgrade':
        return 'Plan Downgrade';
      case 'refund':
        return 'Refund';
      case 'cancellation':
        return 'Cancellation';
      default:
        // Safe handling of type
        const typeString = String(type);
        return typeString.charAt(0).toUpperCase() + typeString.slice(1);
    }
  };

  // Get transaction icon
  const getTransactionIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'upgrade':
        return <ArrowUpRight className="h-4 w-4" />;
      case 'downgrade':
        return <ArrowDownRight className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction History</CardTitle>
        <CardDescription>
          View your billing and subscription history
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y">
          {transactions.map((transaction, index) => (
            <div key={transaction.id} className="p-4 hover:bg-muted/20 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <Badge variant={getTransactionBadgeVariant(transaction.type)}>
                    {getTransactionIcon(transaction.type)}
                    <span className="ml-1">{getTransactionTypeLabel(transaction.type)}</span>
                  </Badge>
                  <span className="text-sm text-muted-foreground">{formatDate(transaction.date)}</span>
                </div>
                <div className="text-right">
                  <span className="font-medium">{formatCurrency(transaction.amount)}</span>
                  <div className="text-xs text-muted-foreground">
                    {transaction.period === 'yearly' ? 'Annual billing' : 'Monthly billing'}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium">{transaction.planName}</h4>
                  {(transaction.type === 'upgrade' || transaction.type === 'downgrade') && (
                    <div className="text-xs text-muted-foreground flex items-center mt-1">
                      <span>From {transaction.fromPlan} to {transaction.toPlan}</span>
                    </div>
                  )}
                </div>
                
                {transaction.invoiceUrl && (
                  <Button variant="ghost" size="sm" className="h-7 px-2" asChild>
                    <a href={transaction.invoiceUrl} target="_blank" rel="noopener noreferrer">
                      <span className="text-xs">View Invoice</span>
                      <ExternalLink className="ml-1 h-3 w-3" />
                    </a>
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
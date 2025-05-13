import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Calendar, DollarSign, Clock, AlertCircle } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { SubscriptionTier } from '@shared/config';
import { Skeleton } from '@/components/ui/skeleton';

// Define transaction type
interface Transaction {
  id: number;
  date: string;
  planName: string;
  planTier: SubscriptionTier;
  period: 'monthly' | 'yearly';
  amount: number;
  status: 'success' | 'pending' | 'failed';
  invoiceUrl?: string;
  fromPlan?: string;
  toPlan?: string;
  type: 'subscription' | 'upgrade' | 'downgrade' | 'cancellation' | 'renewal';
}

export default function TransactionHistory() {
  // Fetch transaction history
  const { data: transactions, isLoading } = useQuery({
    queryKey: ['/api/subscriptions/transactions'],
    queryFn: async () => {
      try {
        const response = await apiRequest('/api/subscriptions/transactions');
        return response;
      } catch (error) {
        console.error('Error fetching transaction history:', error);
        return [];
      }
    }
  });

  // Function to format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: amount % 1 === 0 ? 0 : 2
    }).format(amount);
  };

  // Function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  // Get status badge color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Successful</Badge>;
      case 'pending':
        return <Badge className="bg-amber-100 text-amber-800 border-amber-200">Pending</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Failed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Get transaction type badge
  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'subscription':
        return <Badge variant="outline">New Subscription</Badge>;
      case 'upgrade':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Upgrade</Badge>;
      case 'downgrade':
        return <Badge className="bg-amber-100 text-amber-800 border-amber-200">Downgrade</Badge>;
      case 'cancellation':
        return <Badge className="bg-slate-100 text-slate-800 border-slate-200">Cancellation</Badge>;
      case 'renewal':
        return <Badge className="bg-purple-100 text-purple-800 border-purple-200">Renewal</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  return (
    <Card className="w-full shadow-md">
      <CardHeader>
        <CardTitle className="text-xl flex items-center">
          <DollarSign className="mr-2 h-5 w-5 text-primary" />
          Transaction History
        </CardTitle>
        <CardDescription>
          View all your subscription changes and payments
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : transactions?.length > 0 ? (
          <Table>
            <TableCaption>Your transaction history</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction: Transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                      {formatDate(transaction.date)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{transaction.planName}</div>
                    <div className="text-xs text-muted-foreground">
                      {transaction.period.charAt(0).toUpperCase() + transaction.period.slice(1)}
                    </div>
                  </TableCell>
                  <TableCell>{getTypeBadge(transaction.type)}</TableCell>
                  <TableCell>{formatCurrency(transaction.amount)}</TableCell>
                  <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                  <TableCell>
                    {transaction.type === 'upgrade' || transaction.type === 'downgrade' ? (
                      <div className="text-xs">
                        {transaction.fromPlan} → {transaction.toPlan}
                      </div>
                    ) : transaction.invoiceUrl ? (
                      <a 
                        href={transaction.invoiceUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline"
                      >
                        View Invoice
                      </a>
                    ) : null}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8 flex flex-col items-center">
            <Clock className="mb-2 h-12 w-12 text-muted" />
            <h3 className="text-lg font-medium">No transactions yet</h3>
            <p className="text-muted-foreground">
              Your transaction history will appear here once you make changes to your subscription.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
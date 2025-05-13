import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, CheckCircle2, CreditCard, X, AlertTriangle } from 'lucide-react';
import { API_ENDPOINTS, ROUTES } from '@/../../shared/config';
import { useQuery } from '@tanstack/react-query';

// Initialize stripe promise as null first until we check if feature is enabled
let stripePromise: Promise<any> | null = null;

const CheckoutForm = ({ onSuccess, onCancel }: { onSuccess: () => void, onCancel: () => void }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not loaded yet
      return;
    }

    setIsProcessing(true);
    setErrorMessage('');

    // Confirm payment
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin + '/account/billing?success=true',
      },
      redirect: 'if_required',
    });

    if (error) {
      setErrorMessage(error.message || 'An error occurred during payment');
      toast({
        title: 'Payment Failed',
        description: error.message || 'An error occurred during payment',
        variant: 'destructive',
      });
      setIsProcessing(false);
    } else {
      // Payment succeeded
      toast({
        title: 'Payment Successful',
        description: 'Your subscription has been activated!',
      });
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <PaymentElement />
        
        {errorMessage && (
          <div className="p-3 rounded bg-destructive/10 text-destructive text-sm">
            {errorMessage}
          </div>
        )}
        
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-between mt-6">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            disabled={isProcessing}
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          
          <Button 
            type="submit" 
            disabled={!stripe || isProcessing}
          >
            {isProcessing ? (
              <>
                <div className="h-4 w-4 border-2 border-background border-t-transparent rounded-full animate-spin mr-2" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="h-4 w-4 mr-2" />
                Complete Payment
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default function CheckoutPage() {
  const [clientSecret, setClientSecret] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [stripeDisabled, setStripeDisabled] = useState(false);
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [location] = useLocation();
  const { toast } = useToast();
  
  // Check if Stripe feature is enabled
  const featureFlagQuery = '/api/feature-flags/stripe_enabled/status';
  const { data: stripeFeature, isLoading: featureLoading } = useQuery({
    queryKey: [featureFlagQuery],
    queryFn: async () => {
      const res = await fetch(featureFlagQuery);
      return await res.json();
    }
  });

  // Handle Stripe initialization based on feature flag
  useEffect(() => {
    if (!featureLoading && stripeFeature) {
      // If Stripe is enabled and we have a public key, initialize it
      if (stripeFeature.isEnabled && import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
        try {
          stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);
        } catch (err) {
          console.error('Error loading Stripe:', err);
          setStripeDisabled(true);
        }
      } else {
        // Feature flag is disabled
        setStripeDisabled(true);
        console.warn('Stripe is disabled by feature flag');
      }
    } else if (!featureLoading && !stripeFeature) {
      // If there's an error checking the feature flag, disable Stripe
      setStripeDisabled(true);
      console.warn('Error checking Stripe feature flag, disabling Stripe');
    }
  }, [featureLoading, stripeFeature]);

  // Get query parameters
  const searchParams = new URLSearchParams(window.location.search);
  const planId = searchParams.get('planId');
  const priceId = searchParams.get('priceId');
  const billingPeriod = searchParams.get('billingPeriod') || 'monthly';

  // Redirect if no plan selected
  useEffect(() => {
    if (!planId && !priceId) {
      navigate(ROUTES.pricing);
    }
  }, [planId, priceId, navigate]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      navigate(ROUTES.auth);
    }
  }, [user, navigate]);

  // Get the client secret
  useEffect(() => {
    if (!user || (!planId && !priceId)) return;
    
    // Skip payment intent creation if Stripe is disabled
    if (stripeDisabled) {
      setLoading(false);
      return;
    }

    const createPaymentIntent = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Skip payment intent creation if stripe isn't initialized
        if (!stripePromise) {
          setError('Payment system is currently unavailable');
          return;
        }
        
        const response = await fetch(API_ENDPOINTS.subscriptions.createSubscription, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            planId: planId ? parseInt(planId) : undefined,
            priceId,
            billingPeriod,
          }),
        });
        
        const data = await response.json();
        
        if (data.clientSecret) {
          setClientSecret(data.clientSecret);
        } else if (data.url) {
          // Redirect to Stripe Checkout page if returned instead of client secret
          window.location.href = data.url;
          return;
        } else {
          setError('Failed to initialize payment');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to initialize payment');
        toast({
          title: 'Error',
          description: err.message || 'Failed to initialize payment',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    createPaymentIntent();
  }, [user, planId, priceId, billingPeriod, toast, stripeDisabled, stripePromise]);

  const handlePaymentSuccess = () => {
    setSuccess(true);
    // Redirect to billing page after a short delay
    setTimeout(() => {
      navigate('/account/billing?success=true');
    }, 1500);
  };

  const handleCancel = () => {
    navigate('/pricing');
  };

  if (!user) {
    return null; // Will redirect to auth
  }

  if (success) {
    return (
      <div className="container max-w-md mx-auto py-16 px-4">
        <Card>
          <CardHeader>
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-center">Payment Successful!</CardTitle>
            <CardDescription className="text-center">
              Your subscription has been activated
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p>Thank you for your payment. You will be redirected to your account page shortly.</p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button onClick={() => navigate('/account/billing')}>
              Go to My Account
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-3xl mx-auto py-10 px-4 md:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Complete your subscription</h1>
        <p className="text-muted-foreground mt-1">Enter your payment details to finalize your subscription</p>
      </div>

      {/* Loading state */}
      {loading && featureLoading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      ) : stripeDisabled ? (
        /* Feature flag disabled state */
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Payments Currently Unavailable
            </CardTitle>
            <CardDescription>Online payments are temporarily disabled</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p>Our payment system is currently undergoing maintenance. Please try again later or contact our support team for assistance.</p>
              <div className="rounded-lg bg-amber-50 p-4 border border-amber-200">
                <h3 className="font-medium text-amber-800 mb-2">Alternative Payment Options</h3>
                <p className="text-amber-700 text-sm">
                  If you would like to upgrade your account immediately, please contact our support team to arrange an alternative payment method.
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <Button variant="outline" onClick={handleCancel} className="flex-1">
                Return to Pricing
              </Button>
              <Button onClick={() => navigate('/contact')} className="flex-1">
                Contact Support
              </Button>
            </div>
          </CardFooter>
        </Card>
      ) : error ? (
        /* Error state */
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>There was a problem initializing the payment</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-destructive">{error}</p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => navigate('/pricing')}>
              Return to Pricing
            </Button>
          </CardFooter>
        </Card>
      ) : clientSecret ? (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          <Card className="md:col-span-3">
            <CardHeader>
              <CardTitle>Payment Information</CardTitle>
              <CardDescription>Your payment is securely processed by Stripe</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Only show Elements if Stripe is available */}
              {stripePromise ? (
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <CheckoutForm onSuccess={handlePaymentSuccess} onCancel={handleCancel} />
                </Elements>
              ) : (
                <div className="p-6 text-center">
                  <p className="text-destructive mb-4">Stripe payment system could not be loaded.</p>
                  <Button onClick={handleCancel}>Return to Pricing</Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
              <CardDescription>Review your subscription details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium">Plan Details</h3>
                <p className="text-sm text-muted-foreground">
                  {billingPeriod === 'yearly' ? 'Annual' : 'Monthly'} Billing
                </p>
              </div>
              
              <Separator />
              
              <div className="pt-2">
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                    <span>Instant access to premium features</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                    <span>Cancel anytime before next billing cycle</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                    <span>Secure payment processing</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
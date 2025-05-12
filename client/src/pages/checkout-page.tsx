import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle, 
  CheckCircle2, 
  CreditCard, 
  X, 
  Lock, 
  Calendar, 
  CreditCard as CardIcon 
} from 'lucide-react';
import { API_ENDPOINTS, ROUTES } from '@/../../shared/config';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Mock checkout form without Stripe
const CheckoutForm = ({ onSuccess, onCancel }: { onSuccess: () => void, onCancel: () => void }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvc, setCvc] = useState('');
  const [name, setName] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple validation
    const errors: Record<string, string> = {};
    
    if (!cardNumber) errors.cardNumber = 'Card number is required';
    if (!expiryDate) errors.expiryDate = 'Expiry date is required';
    if (!cvc) errors.cvc = 'CVC is required';
    if (!name) errors.name = 'Name is required';
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      toast({
        title: 'Payment Successful',
        description: 'Your subscription has been activated!',
      });
      onSuccess();
    }, 1500);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="cardName">Name on Card</Label>
          <Input 
            id="cardName" 
            placeholder="John Smith" 
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          {formErrors.name && <p className="text-sm text-destructive">{formErrors.name}</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="cardNumber">Card Number</Label>
          <div className="relative">
            <Input 
              id="cardNumber" 
              placeholder="1234 5678 9012 3456" 
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').replace(/(\d{4})/g, '$1 ').trim())}
              maxLength={19}
            />
            <CardIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
          {formErrors.cardNumber && <p className="text-sm text-destructive">{formErrors.cardNumber}</p>}
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="expiry">Expiry Date</Label>
            <div className="relative">
              <Input 
                id="expiry" 
                placeholder="MM/YY" 
                value={expiryDate}
                onChange={(e) => {
                  let value = e.target.value.replace(/\D/g, '');
                  if (value.length > 2) {
                    value = value.slice(0, 2) + '/' + value.slice(2, 4);
                  }
                  setExpiryDate(value);
                }}
                maxLength={5}
              />
              <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
            {formErrors.expiryDate && <p className="text-sm text-destructive">{formErrors.expiryDate}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="cvc">CVC</Label>
            <div className="relative">
              <Input 
                id="cvc" 
                placeholder="123" 
                value={cvc}
                onChange={(e) => setCvc(e.target.value.replace(/\D/g, ''))}
                maxLength={3}
              />
              <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
            {formErrors.cvc && <p className="text-sm text-destructive">{formErrors.cvc}</p>}
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="country">Country</Label>
          <Select defaultValue="us">
            <SelectTrigger>
              <SelectValue placeholder="Select country" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="us">United States</SelectItem>
              <SelectItem value="ca">Canada</SelectItem>
              <SelectItem value="uk">United Kingdom</SelectItem>
              <SelectItem value="au">Australia</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center space-x-2 pt-2">
          <Lock className="h-4 w-4 text-green-600" />
          <span className="text-sm text-muted-foreground">
            Your payment information is secure. We use encryption to protect your data.
          </span>
        </div>
        
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
            disabled={isProcessing}
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
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  // Get query parameters
  const searchParams = new URLSearchParams(window.location.search);
  const planId = searchParams.get('planId');
  const billingPeriod = searchParams.get('billingPeriod') || 'monthly';

  // Redirect if no plan selected
  useEffect(() => {
    if (!planId) {
      navigate(ROUTES.pricing);
    } else {
      // Simulate loading
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    }
  }, [planId, navigate]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      navigate(ROUTES.auth);
    }
  }, [user, navigate]);

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

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          <Card className="md:col-span-3">
            <CardHeader>
              <CardTitle>Payment Information</CardTitle>
              <CardDescription>Enter your card details to complete payment</CardDescription>
            </CardHeader>
            <CardContent>
              <CheckoutForm onSuccess={handlePaymentSuccess} onCancel={handleCancel} />
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
      )}
    </div>
  );
}
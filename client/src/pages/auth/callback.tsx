import React, { useEffect } from 'react';
import { useLocation, useRouter } from 'wouter';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

/**
 * OAuth Callback Handler
 * 
 * This component handles the redirect from OAuth providers (Google, Facebook)
 * and stores the JWT token in localStorage for authentication.
 */
export default function OAuthCallback() {
  const { toast } = useToast();
  const [location, navigate] = useLocation();
  
  useEffect(() => {
    // Extract token from URL
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const error = params.get('error');
    
    if (error) {
      toast({
        title: 'Authentication failed',
        description: error,
        variant: 'destructive',
      });
      navigate('/login');
      return;
    }
    
    if (token) {
      // Store token in localStorage
      localStorage.setItem('pumpflux_auth_token', token);
      
      toast({
        title: 'Login successful',
        description: 'You have been successfully authenticated',
        variant: 'default',
      });
      
      // Redirect to dashboard
      navigate('/dashboard');
    } else {
      toast({
        title: 'Authentication failed',
        description: 'No authentication token received',
        variant: 'destructive',
      });
      navigate('/login');
    }
  }, [navigate, toast]);
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <h1 className="text-2xl font-bold">Completing authentication...</h1>
        <p className="text-muted-foreground">Please wait while we redirect you</p>
      </div>
    </div>
  );
}
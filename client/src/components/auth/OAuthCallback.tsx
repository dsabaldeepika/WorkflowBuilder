import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import FlowingBackground from './FlowingBackground';

/**
 * Component to handle OAuth callbacks
 * This catches the redirect from the OAuth provider with the token
 * and stores it in auth state before redirecting to the dashboard
 */
const OAuthCallback: React.FC = () => {
  const [location, navigate] = useLocation();
  const { loginWithToken, isLoggedIn } = useAuth();
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Extract token from URL
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');
        
        if (!token) {
          setError('No authentication token received');
          return;
        }
        
        // Login with the token
        await loginWithToken(token);
        
        // Clear the token from URL (for security)
        window.history.replaceState({}, document.title, '/auth/callback');
      } catch (err) {
        console.error('Error during OAuth callback:', err);
        setError('Failed to authenticate. Please try again.');
      }
    };
    
    handleCallback();
  }, []);
  
  // Redirect to dashboard once logged in
  useEffect(() => {
    if (isLoggedIn) {
      navigate('/dashboard');
    }
  }, [isLoggedIn]);
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <FlowingBackground />
      
      <Card className="w-full max-w-md z-10 bg-white/95 backdrop-blur-sm shadow-xl">
        <CardContent className="p-6 flex flex-col items-center justify-center space-y-4">
          {error ? (
            <div className="text-center">
              <h2 className="text-xl font-semibold text-red-600 mb-2">Authentication Error</h2>
              <p className="text-gray-600">{error}</p>
              <button 
                onClick={() => navigate('/login')}
                className="mt-4 text-primary hover:text-primary/80 underline"
              >
                Return to login
              </button>
            </div>
          ) : (
            <div className="text-center">
              <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Authenticating...</h2>
              <p className="text-gray-600">Please wait while we log you in.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OAuthCallback;
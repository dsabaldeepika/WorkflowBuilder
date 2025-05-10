import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

const OAuthCallback: React.FC = () => {
  const [, navigate] = useLocation();
  const { getUser } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processCallback = async () => {
      try {
        // The auth server will have already set cookies and session at this point
        // We just need to get the user data
        const user = await getUser();
        
        if (user) {
          // Navigate to the dashboard on successful login
          navigate('/dashboard');
        } else {
          setError('Authentication failed. Please try again.');
          // Navigate back to login page after a delay
          setTimeout(() => navigate('/login'), 3000);
        }
      } catch (err) {
        console.error('OAuth callback error:', err);
        setError('Authentication failed. Please try again.');
        // Navigate back to login page after a delay
        setTimeout(() => navigate('/login'), 3000);
      }
    };

    processCallback();
  }, [getUser, navigate]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
      <div className="w-full max-w-md space-y-8 p-8 text-center">
        {error ? (
          <div className="rounded-lg bg-destructive/10 p-4 text-destructive">
            <p>{error}</p>
            <p className="mt-2 text-sm">Redirecting to login page...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <h2 className="text-2xl font-bold">Completing authentication</h2>
            <p className="text-muted-foreground">Please wait while we log you in...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OAuthCallback;
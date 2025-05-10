import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import FlowingBackground from './FlowingBackground';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { FaGithub } from 'react-icons/fa';
import { Workflow, DropletIcon } from 'lucide-react';

const LoginPage: React.FC = () => {
  const { isLoggedIn, loginWithTest, isLoading, error } = useAuth();
  const [location, navigate] = useLocation();
  const [testToken, setTestToken] = useState('');
  const [showTestLogin, setShowTestLogin] = useState(false);
  const { toast } = useToast();

  // Parse token from URL if present
  useEffect(() => {
    // Handle OAuth callback logic
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    
    if (token) {
      loginWithToken(token);
    }
  }, [location]);

  // Redirect if already logged in
  useEffect(() => {
    if (isLoggedIn) {
      navigate('/dashboard');
    }
  }, [isLoggedIn]);

  // Handle error display
  useEffect(() => {
    if (error) {
      toast({
        title: 'Authentication Error',
        description: error,
        variant: 'destructive',
      });
    }
  }, [error]);

  // Handle test login (for development)
  const handleTestLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testToken) {
      toast({
        title: 'Please enter a test token',
        variant: 'destructive',
      });
      return;
    }
    await loginWithTest(testToken);
  };

  // Mock function for JWT token handling from OAuth callback
  const loginWithToken = async (token: string) => {
    // This would be implemented in the auth hook
    // This is just a placeholder
    console.log('Received token from OAuth callback:', token);
    toast({
      title: 'OAuth Login',
      description: 'OAuth login not yet implemented. Use test login.',
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 relative">
      {/* Flowing background */}
      <FlowingBackground />
      
      {/* Login card */}
      <Card className="w-full max-w-md z-10 bg-white/95 backdrop-blur-sm shadow-xl">
        <CardHeader className="space-y-2 text-center">
          <div className="flex justify-center mb-2">
            <div className="relative">
              <Workflow className="h-12 w-12 text-primary" />
              <DropletIcon className="h-6 w-6 text-blue-400 absolute -right-1 -bottom-1" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-700 to-purple-700 bg-clip-text text-transparent">
            PumpFlux
          </CardTitle>
          <CardDescription>
            Login to your workflow automation platform
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* OAuth Login Options */}
          <div className="grid gap-3">
            <Button
              variant="outline"
              className="flex items-center justify-center gap-2"
              onClick={() => window.location.href = '/api/auth/google'}
              disabled={isLoading}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="h-5 w-5"
              >
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </Button>
            
            <Button
              variant="outline"
              className="flex items-center justify-center gap-2"
              onClick={() => window.location.href = '/api/auth/github'}
              disabled={isLoading}
            >
              <FaGithub className="h-5 w-5" />
              Continue with GitHub
            </Button>
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">Or</span>
            </div>
          </div>
          
          {/* Test User Login (for development) */}
          <div>
            <Button
              variant="ghost"
              className="w-full text-sm"
              onClick={() => setShowTestLogin(prev => !prev)}
              type="button"
            >
              {showTestLogin ? 'Hide Test Login' : 'Development Test Login'}
            </Button>
            
            {showTestLogin && (
              <form onSubmit={handleTestLogin} className="mt-3 space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="test-token">Test User Token</Label>
                  <Input
                    id="test-token"
                    type="text"
                    value={testToken}
                    onChange={(e) => setTestToken(e.target.value)}
                    placeholder="Enter test token"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? 'Authenticating...' : 'Login as Test User'}
                </Button>
              </form>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-center text-sm text-gray-600">
          By signing in, you agree to PumpFlux's Terms of Service and Privacy Policy.
        </CardFooter>
      </Card>
    </div>
  );
};

export default LoginPage;
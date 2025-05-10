import React from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import FlowingBackground from './FlowingBackground';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { FaGithub } from 'react-icons/fa';
import { Workflow, DropletIcon } from 'lucide-react';

const LoginPage: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  // Redirect if already logged in
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Handle Replit login
  const handleReplitLogin = () => {
    window.location.href = '/api/login';
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
          {/* Login Button */}
          <div className="grid gap-3">
            <Button
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              onClick={handleReplitLogin}
              disabled={isLoading}
            >
              {isLoading ? 'Loading...' : 'Sign in with Replit'}
            </Button>
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
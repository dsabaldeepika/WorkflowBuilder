import React from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import FlowingBackground from '@/components/auth/FlowingBackground';
import { Loader2 } from 'lucide-react';

export default function Login() {
  const { isAuthenticated, isLoading, login } = useAuth();
  const [location, navigate] = useLocation();
  
  // Redirect to dashboard if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);
  
  // Handle Replit Auth login
  const handleLogin = () => {
    login();
  };
  
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-background">
      <FlowingBackground />
      
      <div className="container flex items-center justify-center p-4 md:p-8 z-10">
        <div className="grid w-full grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto shadow-xl rounded-xl overflow-hidden bg-card border border-border/50">
          {/* Hero section */}
          <div className="hidden lg:flex flex-col p-10 bg-gradient-to-br from-primary/90 to-primary-foreground text-primary-foreground">
            <div className="mt-auto">
              <h1 className="text-4xl font-bold tracking-tight mb-4">
                Welcome to PumpFlux
              </h1>
              <p className="text-xl opacity-90 mb-6">
                The complete workflow automation platform for connecting your apps and data.
              </p>
              <ul className="space-y-2 mb-10">
                <li className="flex items-center gap-2">
                  <div className="rounded-full w-1.5 h-1.5 bg-white"></div>
                  <span>Create powerful automated workflows</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="rounded-full w-1.5 h-1.5 bg-white"></div>
                  <span>Connect all your favorite apps and services</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="rounded-full w-1.5 h-1.5 bg-white"></div>
                  <span>Schedule and monitor your workflows</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="rounded-full w-1.5 h-1.5 bg-white"></div>
                  <span>Let AI build workflows for you</span>
                </li>
              </ul>
            </div>
          </div>
          
          {/* Auth form */}
          <div className="p-6 md:p-10 flex flex-col items-center justify-center">
            <Card className="w-full max-w-md border-0 shadow-none">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Sign in to PumpFlux</CardTitle>
                <CardDescription>
                  Continue with your Replit account to access the platform
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Button 
                  size="lg"
                  className="w-full py-6 text-lg" 
                  onClick={handleLogin}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Signing in...
                    </>
                  ) : "Sign in with Replit"}
                </Button>
                
                <div className="text-center text-sm text-muted-foreground">
                  By continuing, you agree to PumpFlux's Terms of Service and Privacy Policy.
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
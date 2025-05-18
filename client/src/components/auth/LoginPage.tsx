import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import FlowingBackground from './FlowingBackground';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Workflow, DropletIcon, Github, Twitter, Mail, Lock, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const LoginPage: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('login');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: ''
  });

  // Redirect if already logged in
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Attempting login with:', { email: formData.email });
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });

      console.log('Login response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Received non-JSON response:', text);
        throw new Error('Server returned non-JSON response');
      }

      const data = await response.json();
      console.log('Login response data:', data);
      
      if (response.ok && data.token) {
        // Store the token
        localStorage.setItem('accessToken', data.token);
        console.log('Login successful, token stored');
        
        toast({
          title: 'Login successful',
          description: 'Welcome back!',
        });
        navigate('/dashboard');
      } else {
        console.error('Login failed:', data.message);
        toast({
          title: 'Login failed',
          description: data.message || 'Invalid credentials',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: 'Error',
        description: 'An error occurred during login',
        variant: 'destructive',
      });
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate password match
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: 'Error',
        description: 'Passwords do not match',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        // Store tokens
        localStorage.setItem('accessToken', data.token);
        
        toast({
          title: 'Registration successful',
          description: 'Welcome to PumpFlux!',
        });
        
        // Redirect to dashboard
        navigate('/dashboard');
      } else {
        toast({
          title: 'Registration failed',
          description: data.message || 'Failed to create account',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An error occurred during registration',
        variant: 'destructive',
      });
    }
  };

  const handleOAuthLogin = async (provider: string) => {
    try {
      const response = await fetch(`/api/auth/${provider}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        throw new Error(`${provider} authentication failed`);
      }

      window.location.href = response.url;
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An error occurred during authentication',
        variant: 'destructive',
      });
    }
  };

  const handleMockLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/auth/mock/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        localStorage.setItem('accessToken', data.token);
        toast({
          title: 'Login successful',
          description: 'Welcome back!',
        });
        navigate('/dashboard');
      } else {
        toast({
          title: 'Login failed',
          description: data.message || 'Invalid credentials',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An error occurred during login',
        variant: 'destructive',
      });
    }
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
          <div className="flex items-center justify-center p-8">
            <Card className="w-full max-w-md border-0 shadow-none">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Sign in to PumpFlux</CardTitle>
                <CardDescription>
                  Enter your credentials to access the platform
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Tabs defaultValue="login" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="login">Login</TabsTrigger>
                    <TabsTrigger value="register">Register</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="login">
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="Enter your email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                          id="password"
                          name="password"
                          type="password"
                          placeholder="Enter your password"
                          value={formData.password}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <Button type="submit" className="w-full">
                        Sign In
                      </Button>
                    </form>
                  </TabsContent>
                  
                  <TabsContent value="register">
                    <form onSubmit={handleRegister} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input
                          id="username"
                          name="username"
                          placeholder="Choose a username"
                          value={formData.username}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="Enter your email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                          id="password"
                          name="password"
                          type="password"
                          placeholder="Choose a password"
                          value={formData.password}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                        <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          type="password"
                          placeholder="Confirm your password"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <Button type="submit" className="w-full">
                        Register
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>

                {/* Test Credentials Section */}
                <div className="mt-6 p-4 bg-blue-50/80 backdrop-blur-sm border border-blue-200/50 rounded-lg">
                  <h3 className="font-semibold text-blue-800 mb-2">Test Credentials:</h3>
                  <div className="space-y-2 text-sm text-blue-700">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>test@gmail.com / test123</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>admin@gmail.com / admin123</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>demo@gmail.com / demo123</span>
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-blue-600">
                    These credentials are for testing purposes only.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

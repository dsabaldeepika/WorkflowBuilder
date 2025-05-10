import React, { useState } from 'react';
import { useLocation, useRouter } from 'wouter';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { FaGoogle, FaFacebook } from 'react-icons/fa';
import { useAuth } from '@/hooks/useAuth';
import FlowingBackground from '@/components/auth/FlowingBackground';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Loader2 } from 'lucide-react';

// Login form schema
const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
});

// Registration form schema
const registerSchema = z.object({
  username: z.string().min(3, { message: "Username must be at least 3 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  confirmPassword: z.string(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function Login() {
  const [activeTab, setActiveTab] = useState("login");
  const { isAuthenticated, isLoading, login, register } = useAuth();
  const [location, navigate] = useLocation();
  
  // Redirect to dashboard if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);
  
  // Login form
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  
  // Register form
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
    },
  });
  
  // Handle login submit
  const onLoginSubmit = async (values: LoginFormValues) => {
    try {
      await login(values);
    } catch (error) {
      console.error("Login error:", error);
    }
  };
  
  // Handle register submit
  const onRegisterSubmit = async (values: RegisterFormValues) => {
    try {
      await register(values);
    } catch (error) {
      console.error("Registration error:", error);
    }
  };
  
  // Handle OAuth login
  const handleOAuthLogin = (provider: string) => {
    window.location.href = `/api/auth/${provider}`;
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
          
          {/* Auth forms */}
          <div className="p-6 md:p-10">
            <Tabs 
              defaultValue="login" 
              value={activeTab} 
              onValueChange={setActiveTab} 
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>
              
              {/* Login Tab */}
              <TabsContent value="login">
                <Card className="border-0 shadow-none">
                  <CardHeader className="px-0 pt-0">
                    <CardTitle className="text-2xl">Login to your account</CardTitle>
                    <CardDescription>
                      Choose your preferred login method
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="px-0 space-y-4">
                    {/* OAuth Buttons */}
                    <div className="grid grid-cols-2 gap-4">
                      <Button 
                        variant="outline" 
                        className="w-full" 
                        type="button" 
                        onClick={() => handleOAuthLogin('google')}
                        disabled={isLoading}
                      >
                        <FaGoogle className="mr-2 h-4 w-4" /> Google
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full" 
                        type="button" 
                        onClick={() => handleOAuthLogin('facebook')}
                        disabled={isLoading}
                      >
                        <FaFacebook className="mr-2 h-4 w-4" /> Facebook
                      </Button>
                    </div>
                    
                    <div className="flex items-center gap-2 my-6">
                      <Separator className="flex-1" />
                      <span className="text-sm text-muted-foreground">OR</span>
                      <Separator className="flex-1" />
                    </div>
                    
                    {/* Login Form */}
                    <Form {...loginForm}>
                      <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                        <FormField
                          control={loginForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input placeholder="your.email@example.com" type="email" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={loginForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Password</FormLabel>
                              <FormControl>
                                <Input placeholder="Your password" type="password" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <Button 
                          type="submit" 
                          className="w-full" 
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Logging in...
                            </>
                          ) : "Login"}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                  <CardFooter className="px-0 pt-4 flex flex-col items-center">
                    <div className="text-sm text-muted-foreground">
                      Don't have an account?{" "}
                      <button 
                        className="text-primary underline" 
                        onClick={() => setActiveTab("register")}
                      >
                        Register
                      </button>
                    </div>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              {/* Register Tab */}
              <TabsContent value="register">
                <Card className="border-0 shadow-none">
                  <CardHeader className="px-0 pt-0">
                    <CardTitle className="text-2xl">Create an account</CardTitle>
                    <CardDescription>
                      Sign up to start automating your workflows
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="px-0">
                    {/* Register Form */}
                    <Form {...registerForm}>
                      <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                        <FormField
                          control={registerForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Username</FormLabel>
                              <FormControl>
                                <Input placeholder="johndoe" type="text" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={registerForm.control}
                            name="firstName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>First Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="John" type="text" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={registerForm.control}
                            name="lastName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Last Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="Doe" type="text" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <FormField
                          control={registerForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input placeholder="your.email@example.com" type="email" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={registerForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Password</FormLabel>
                              <FormControl>
                                <Input placeholder="Create a password" type="password" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={registerForm.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Confirm Password</FormLabel>
                              <FormControl>
                                <Input placeholder="Confirm your password" type="password" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <Button 
                          type="submit" 
                          className="w-full" 
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Creating account...
                            </>
                          ) : "Create Account"}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                  <CardFooter className="px-0 pt-4 flex flex-col items-center">
                    <div className="text-sm text-muted-foreground">
                      Already have an account?{" "}
                      <button 
                        className="text-primary underline" 
                        onClick={() => setActiveTab("login")}
                      >
                        Login
                      </button>
                    </div>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
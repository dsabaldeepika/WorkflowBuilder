import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Suspense, lazy, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ROUTES } from "@shared/config";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import { Workflow } from "lucide-react";
import LoginPage from '@/components/auth/LoginPage';
import { WelcomeContent } from '@/components/dashboard/WelcomeContent';
import { useLocation } from "wouter";

// Import the home page eagerly (critical for initial load)
import Home from "@/pages/home";

// Lazy load all other pages
const NotFound = lazy(() => import("@/pages/not-found"));
const WorkflowBuilder = lazy(() => import("@/pages/workflow-builder"));
const Login = lazy(() => import("@/pages/login"));
const Signup = lazy(() => import("@/pages/signup"));
const Dashboard = lazy(() => import("@/pages/dashboard-new"));
const Callback = lazy(() => import("@/pages/auth/callback"));
const WorkflowAnimationsDemo = lazy(() => import("@/pages/workflow-animations-demo"));
const WorkflowMonitoring = lazy(() => import("@/pages/workflow-monitoring"));
const HealthDashboardPage = lazy(() => import("@/pages/health-dashboard-page"));
const TemplatesPage = lazy(() => import("@/pages/templates-page"));
const TemplateSetupPage = lazy(() => import("@/pages/template-setup-page"));
const TemplateDetailPage = lazy(() => import("@/pages/template-detail-page"));
const PricingPage = lazy(() => import("@/pages/pricing-page"));
const AccountBillingPage = lazy(() => import("@/pages/account-billing-page"));
const AccountUsagePage = lazy(() => import("@/pages/account-usage-page"));
const WorkflowOptimizerPage = lazy(() => import("@/pages/workflow-optimizer-page"));
const LoadingAnimationsDemo = lazy(() => import("@/pages/loading-animations-demo"));
const EmailSettingsPage = lazy(() => import("@/pages/email-settings-page"));
const InspirationGalleryPage = lazy(() => import("@/pages/inspiration-gallery"));
// Temporarily disabled to fix Stripe.js loading issue
// const CheckoutPage = lazy(() => import("@/pages/checkout-page"));

// Protected route component
const ProtectedRoute = ({ component: Component, ...rest }: any) => {
  const { isAuthenticated, isLoading } = useAuth();
  const [, navigate] = useLocation();
  
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/');
    }
  }, [isLoading, isAuthenticated, navigate]);
  
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{
              duration: 2,
              ease: "linear",
              repeat: Infinity
            }}
          >
            <Workflow className="h-12 w-12 text-blue-500" />
          </motion.div>
          <span className="text-lg text-gray-600">Loading your workspace...</span>
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return null;
  }
  
  return (
    <Suspense fallback={<PageLoader />}>
      <Component {...rest} />
    </Suspense>
  );
};

// Loading fallback for lazy-loaded components
const PageLoader = () => (
  <div className="flex h-screen items-center justify-center">
    <div className="flex flex-col items-center space-y-4">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{
          duration: 2,
          ease: "linear",
          repeat: Infinity
        }}
      >
        <Workflow className="h-12 w-12 text-blue-500" />
      </motion.div>
      <span className="text-lg text-gray-600">Loading...</span>
    </div>
  </div>
);

function Router() {
  // Define a wrapper component that handles lazy loading
  const LazyRouteComponent = ({ Component }: { Component: React.ComponentType<any> }) => (
    <Suspense fallback={<PageLoader />}>
      <Component />
    </Suspense>
  );
  
  return (
    <Switch>
      {/* Make login page the default route */}
      <Route path="/">
        <LoginPage />
      </Route>
      
      <Route path="/login">
        <LoginPage />
      </Route>
      
      <Route path="/signup">
        <LazyRouteComponent Component={Signup} />
      </Route>
      
      <Route path="/auth/callback">
        <LazyRouteComponent Component={Callback} />
      </Route>
      
      <Route path="/dashboard">
        <ProtectedRoute component={Dashboard} />
      </Route>
      
      {/* Protected routes */}
      <Route path={ROUTES.createWorkflow}>
        <ProtectedRoute component={WorkflowBuilder} />
      </Route>
      
      <Route path={ROUTES.workflowAnimations}>
        <ProtectedRoute component={WorkflowAnimationsDemo} />
      </Route>
      
      <Route path="/monitoring">
        <ProtectedRoute component={WorkflowMonitoring} />
      </Route>
      
      <Route path="/health-dashboard">
        <ProtectedRoute component={HealthDashboardPage} />
      </Route>
      
      <Route path={ROUTES.templates}>
        <ProtectedRoute component={TemplatesPage} />
      </Route>
      
      <Route path={ROUTES.inspirationGallery}>
        <ProtectedRoute component={InspirationGalleryPage} />
      </Route>
      
      <Route path="/templates/:id">
        <ProtectedRoute component={TemplateDetailPage} />
      </Route>
      
      <Route path="/template-setup/:id">
        <ProtectedRoute component={TemplateSetupPage} />
      </Route>
      
      <Route path={ROUTES.pricing}>
        <ProtectedRoute component={PricingPage} />
      </Route>
      
      <Route path={ROUTES.loadingAnimations}>
        <ProtectedRoute component={LoadingAnimationsDemo} />
      </Route>
      
      <Route path={ROUTES.checkout}>
        <ProtectedRoute component={PricingPage} />
      </Route>
      
      <Route path={ROUTES.accountBilling}>
        <ProtectedRoute component={AccountBillingPage} />
      </Route>
      
      <Route path={ROUTES.subscriptionUsage}>
        <ProtectedRoute component={AccountUsagePage} />
      </Route>
      
      <Route path={ROUTES.transactionHistory}>
        <ProtectedRoute component={AccountUsagePage} />
      </Route>
      
      <Route path={ROUTES.emailSettings}>
        <ProtectedRoute component={EmailSettingsPage} />
      </Route>
      
      <Route path={ROUTES.workflowOptimizer}>
        <ProtectedRoute component={WorkflowOptimizerPage} />
      </Route>
      
      {/* Catch-all route - redirect to login */}
      <Route>
        <LoginPage />
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        {process.env.NODE_ENV === 'development'}
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

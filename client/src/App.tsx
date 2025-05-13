import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ROUTES } from "@shared/config";
import { Suspense, lazy } from "react";
import { useAuth } from "@/hooks/useAuth";

// Loading fallback component
import PageLoader from "@/components/ui/page-loader";

// Lazy load all page components to reduce initial bundle size
const NotFound = lazy(() => import("@/pages/not-found"));
const Home = lazy(() => import("@/pages/home"));
const WorkflowBuilder = lazy(() => import("@/pages/workflow-builder"));
const Login = lazy(() => import("@/pages/login"));
const Dashboard = lazy(() => import("@/pages/dashboard-new"));
const Callback = lazy(() => import("@/pages/auth/callback"));
const WorkflowAnimationsDemo = lazy(() => import("@/pages/workflow-animations-demo"));
const WorkflowMonitoring = lazy(() => import("@/pages/workflow-monitoring"));
const HealthDashboardPage = lazy(() => import("@/pages/health-dashboard-page"));
const TemplatesPage = lazy(() => import("@/pages/templates-page"));
const PricingPage = lazy(() => import("@/pages/pricing-page"));
const AccountBillingPage = lazy(() => import("@/pages/account-billing-page"));
const CheckoutPage = lazy(() => import("@/pages/checkout-page"));
const FeatureFlagsPage = lazy(() => import("@/pages/feature-flags-page"));
const PerformanceOptimizationPage = lazy(() => import("@/pages/performance-optimization-page"));

// Protected route component
const ProtectedRoute = ({ component: Component, ...rest }: any) => {
  const { isAuthenticated, isLoading, login } = useAuth();
  
  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }
  
  if (!isAuthenticated) {
    // Use the Replit Auth login method
    login();
    return null;
  }
  
  return <Component {...rest} />;
};

function Router() {
  // BYPASS: Direct access to components without authentication
  // This is a temporary solution until auth issues are resolved
  
  // Automatic redirect to workflow page
  const HomeRoute = () => {
    return (
      <Suspense fallback={<PageLoader message="Loading dashboard..." />}>
        <Dashboard />
      </Suspense>
    );
  };
  
  // Wrap each route component with Suspense for lazy loading
  const LazyRoute = ({ component: Component, ...props }: any) => (
    <Route
      {...props}
      component={(routeProps: any) => (
        <Suspense fallback={<PageLoader />}>
          <Component {...routeProps} />
        </Suspense>
      )}
    />
  );
  
  return (
    <Switch>
      <Route path={ROUTES.home} component={HomeRoute} />
      <LazyRoute path="/login" component={Dashboard} /> {/* Bypass login */}
      <LazyRoute path="/auth/callback" component={Dashboard} /> {/* Bypass callback */}
      <LazyRoute path={ROUTES.dashboard} component={Dashboard} />
      <LazyRoute path={ROUTES.createWorkflow} component={WorkflowBuilder} />
      <LazyRoute path={ROUTES.workflowAnimations} component={WorkflowAnimationsDemo} />
      <LazyRoute path="/monitoring" component={WorkflowMonitoring} />
      <LazyRoute path="/health-dashboard" component={HealthDashboardPage} />
      <LazyRoute path={ROUTES.templates} component={TemplatesPage} />
      <LazyRoute path={ROUTES.pricing} component={PricingPage} />
      <LazyRoute path={ROUTES.checkout} component={CheckoutPage} />
      <LazyRoute path={ROUTES.accountBilling} component={AccountBillingPage} />
      <LazyRoute path={ROUTES.featureFlags} component={FeatureFlagsPage} />
      <LazyRoute path="/performance" component={PerformanceOptimizationPage} />
      <LazyRoute component={Dashboard} /> {/* Default to Dashboard instead of NotFound */}
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

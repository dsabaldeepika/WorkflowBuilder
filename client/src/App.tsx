import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ROUTES } from "@shared/config";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import WorkflowBuilder from "@/pages/workflow-builder";
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard-new";
import Callback from "@/pages/auth/callback";
import WorkflowAnimationsDemo from "@/pages/workflow-animations-demo";
import WorkflowMonitoring from "@/pages/workflow-monitoring";
import HealthDashboardPage from "@/pages/health-dashboard-page";
import TemplatesPage from "@/pages/templates-page";
import TemplateSetupPage from "@/pages/template-setup-page";
import PricingPage from "@/pages/pricing-page";
import AccountBillingPage from "@/pages/account-billing-page";
// Temporarily disabled to fix Stripe.js loading issue
// import CheckoutPage from "@/pages/checkout-page";
import { useAuth } from "@/hooks/useAuth";

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
    return <Dashboard />;
  };
  
  return (
    <Switch>
      <Route path={ROUTES.home} component={HomeRoute} />
      <Route path="/login" component={Dashboard} /> {/* Bypass login */}
      <Route path="/auth/callback" component={Dashboard} /> {/* Bypass callback */}
      <Route path={ROUTES.dashboard} component={Dashboard} />
      <Route path={ROUTES.createWorkflow} component={WorkflowBuilder} />
      <Route path={ROUTES.workflowAnimations} component={WorkflowAnimationsDemo} />
      <Route path="/monitoring" component={WorkflowMonitoring} />
      <Route path="/health-dashboard" component={HealthDashboardPage} />
      <Route path={ROUTES.templates} component={TemplatesPage} />
      <Route path="/template-setup/:id" component={TemplateSetupPage} />
      <Route path={ROUTES.pricing} component={PricingPage} />
      {/* Temporarily disabled checkout route to fix Stripe.js loading issue */}
      <Route path={ROUTES.checkout} component={PricingPage} />
      <Route path={ROUTES.accountBilling} component={AccountBillingPage} />
      <Route component={Dashboard} /> {/* Default to Dashboard instead of NotFound */}
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

import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import WorkflowBuilder from "@/pages/workflow-builder";
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard-new";
import Callback from "@/pages/auth/callback";
import WorkflowAnimationsDemo from "@/pages/workflow-animations-demo";
import WorkflowMonitoring from "@/pages/workflow-monitoring";
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
  // Check auth status for home route
  const HomeRoute = () => {
    const { isAuthenticated, isLoading } = useAuth();
    
    if (isLoading) {
      return <div className="flex h-screen items-center justify-center">Loading...</div>;
    }
    
    if (isAuthenticated) {
      return <Dashboard />;
    } else {
      return <Login />;
    }
  };
  
  return (
    <Switch>
      <Route path="/" component={HomeRoute} />
      <Route path="/login" component={Login} />
      <Route path="/auth/callback" component={Callback} />
      <Route path="/dashboard">
        {(params) => <ProtectedRoute component={Dashboard} params={params} />}
      </Route>
      <Route path="/create">
        {(params) => <ProtectedRoute component={WorkflowBuilder} params={params} />}
      </Route>
      <Route path="/workflow-animations">
        {(params) => <ProtectedRoute component={WorkflowAnimationsDemo} params={params} />}
      </Route>
      <Route path="/monitoring">
        {(params) => <ProtectedRoute component={WorkflowMonitoring} params={params} />}
      </Route>
      <Route component={NotFound} />
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

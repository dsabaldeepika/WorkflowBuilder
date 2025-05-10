import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import WorkflowBuilder from "@/pages/workflow-builder";
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import Callback from "@/pages/auth/callback";
import { useAuth } from "@/hooks/useAuth";

// Protected route component
const ProtectedRoute = ({ component: Component, ...rest }: any) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }
  
  if (!isAuthenticated) {
    window.location.href = "/login";
    return null;
  }
  
  return <Component {...rest} />;
};

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/auth/callback" component={Callback} />
      <Route path="/dashboard">
        {(params) => <ProtectedRoute component={Dashboard} params={params} />}
      </Route>
      <Route path="/create">
        {(params) => <ProtectedRoute component={WorkflowBuilder} params={params} />}
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

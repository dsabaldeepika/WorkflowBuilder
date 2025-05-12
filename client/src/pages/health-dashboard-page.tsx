import React, { useEffect, useState } from 'react';
import WorkflowHealthDashboard from '@/components/workflow/WorkflowHealthDashboard';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';

const HealthDashboardPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading API data
  useEffect(() => {
    // This simulates fetching data from the API
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container flex h-16 items-center px-4 sm:px-6">
          <div className="flex items-center space-x-3">
            <div className="text-2xl font-bold flex items-center">
              <span className="text-blue-500 mr-2">PumpFlux</span>
            </div>
            <div className="text-sm px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
              Health Dashboard
            </div>
          </div>
          <div className="ml-auto flex items-center space-x-4">
            <Link href="/dashboard">
              <Button variant="outline">
                Return to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-[80vh]">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <WorkflowHealthDashboard />
        )}
      </main>
    </div>
  );
};

export default HealthDashboardPage;
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { User } from '@/hooks/useAuth';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await logout();
      // Redirect is handled in logout function
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to log out. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Card className="mx-auto max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl">PumpFlux Dashboard</CardTitle>
          <CardDescription>Welcome to your workflow automation dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {user && (
              <div className="rounded-lg bg-muted p-4">
                <h3 className="mb-2 font-medium">User Information</h3>
                <div className="grid gap-2">
                  {user.profileImageUrl && (
                    <div className="flex justify-center">
                      <img 
                        src={user.profileImageUrl} 
                        alt="Profile" 
                        className="h-16 w-16 rounded-full object-cover"
                      />
                    </div>
                  )}
                  <p><span className="font-semibold">Username:</span> {user.username}</p>
                  <p><span className="font-semibold">Email:</span> {user.email || 'Not provided'}</p>
                  <p><span className="font-semibold">Role:</span> {user.role}</p>
                </div>
              </div>
            )}
            
            <div className="rounded-lg bg-primary/10 p-4">
              <h3 className="mb-2 font-medium">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" onClick={() => window.location.href = '/create'}>
                  Create Workflow
                </Button>
                <Button variant="outline" onClick={() => window.location.href = '/'}>
                  View Workflows
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button variant="ghost" onClick={handleLogout}>
            Log out
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
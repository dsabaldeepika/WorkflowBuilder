import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

// Type for Replit Auth user
export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
  profileImageUrl: string | null;
}

export function useAuth() {
  const { toast } = useToast();
  const [token, setToken] = useState<string | null>(
    typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null
  );

  // Save token to local storage when it changes
  useEffect(() => {
    if (token) {
      localStorage.setItem('accessToken', token);
    } else {
      localStorage.removeItem('accessToken');
    }
  }, [token]);

  // Fetch user data
  const { 
    data: user, 
    isLoading: isLoadingUser,
    error: userError 
  } = useQuery({
    queryKey: ['/api/auth/user'],
    queryFn: async () => {
      if (!token) return null;
      
      const response = await fetch('/api/auth/user', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          setToken(null);
          return null;
        }
        throw new Error('Failed to fetch user data');
      }
      
      return response.json();
    },
    retry: false,
    enabled: !!token
  });

  const login = async (credentials: { email: string; password: string }) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });

      const data = await response.json();

      if (response.ok && data.token) {
        setToken(data.token);
        toast({
          title: 'Login successful',
          description: 'Welcome back!',
        });
        return data;
      } else {
        throw new Error(data.message || 'Login failed');
      }
    } catch (error) {
      toast({
        title: 'Login failed',
        description: error instanceof Error ? error.message : 'An error occurred during login',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const logout = () => {
    setToken(null);
    toast({
      title: 'Logged out',
      description: 'You have been logged out successfully',
    });
    window.location.href = '/';
  };

  return {
    user,
    isLoading: isLoadingUser,
    isAuthenticated: !!user,
    login,
    logout
  };
}
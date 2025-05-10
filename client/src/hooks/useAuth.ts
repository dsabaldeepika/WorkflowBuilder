import { useQuery } from '@tanstack/react-query';

// Type for Replit Auth user
export interface User {
  claims?: {
    sub: string;
    email?: string;
    first_name?: string;
    last_name?: string;
    profile_image_url?: string;
    username?: string;
  };
}

export function useAuth() {
  // Fetch authenticated user data
  const { 
    data: user, 
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['/api/auth/user'],
    queryFn: async () => {
      const response = await fetch('/api/auth/user');
      
      if (!response.ok) {
        if (response.status === 401) {
          return null;
        }
        throw new Error('Failed to fetch user data');
      }
      
      return response.json();
    },
    retry: false
  });

  // Login with Replit Auth
  const login = () => {
    window.location.href = '/api/login';
  };

  // Logout
  const logout = () => {
    window.location.href = '/api/logout';
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    refetch
  };
}
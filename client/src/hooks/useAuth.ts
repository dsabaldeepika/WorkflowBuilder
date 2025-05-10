import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiRequest } from '@/lib/queryClient';
import { useQuery } from '@tanstack/react-query';

export type UserRole = 'creator' | 'editor' | 'admin';

export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
  role: UserRole;
}

interface AuthState {
  isLoading: boolean;
  error: string | null;
  
  // Actions
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  (set) => ({
    isLoading: false,
    error: null,
    
    logout: async () => {
      set({ isLoading: true });
      
      try {
        // Redirect to logout endpoint which will clear the session
        window.location.href = '/api/logout';
      } catch (error) {
        console.error('Logout error:', error);
        set({ isLoading: false });
      }
    }
  })
);

// Hook to use in components
export function useAuth() {
  const { isLoading: storeLoading, error, logout } = useAuthStore();
  
  const { data: user, isLoading: queryLoading } = useQuery({
    queryKey: ['/api/auth/user'],
    retry: false,
  });

  return {
    user,
    isLoading: storeLoading || queryLoading,
    isAuthenticated: !!user,
    error,
    logout,
  };
};
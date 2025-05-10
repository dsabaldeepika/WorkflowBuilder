import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiRequest } from '@/lib/queryClient';

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
  user: User | null;
  token: string | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  loginWithToken: (token: string) => Promise<void>;
  loginWithTest: (token: string) => Promise<void>;
  logout: () => Promise<void>;
  getUser: () => Promise<User | null>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoggedIn: false,
      isLoading: false,
      error: null,
      
      loginWithToken: async (token: string) => {
        set({ isLoading: true, error: null });
        
        try {
          // Store the token
          set({ token });
          
          // Fetch user profile
          const user = await get().getUser();
          
          set({ 
            user,
            isLoggedIn: true,
            isLoading: false,
          });
        } catch (error) {
          console.error('Login error:', error);
          set({ 
            error: 'Authentication failed. Please try again.',
            isLoading: false,
            token: null
          });
        }
      },
      
      loginWithTest: async (token: string) => {
        set({ isLoading: true, error: null });
        
        try {
          // Test login endpoint
          const response = await apiRequest<{ user: User; token: string }>('/api/auth/test-login', {
            method: 'POST',
            body: JSON.stringify({ token }),
          });
          
          set({
            user: response.user,
            token: response.token,
            isLoggedIn: true,
            isLoading: false,
          });
        } catch (error) {
          console.error('Test login error:', error);
          set({ 
            error: 'Test authentication failed. Invalid token.',
            isLoading: false 
          });
        }
      },
      
      logout: async () => {
        set({ isLoading: true });
        
        try {
          set({ 
            user: null,
            token: null,
            isLoggedIn: false,
            isLoading: false
          });
          
          // Redirect to home page
          window.location.href = '/';
        } catch (error) {
          console.error('Logout error:', error);
          set({ isLoading: false });
        }
      },
      
      getUser: async () => {
        const { token } = get();
        
        if (!token) {
          return null;
        }
        
        try {
          const user = await apiRequest<User>('/api/auth/me', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          
          set({ user });
          return user;
        } catch (error) {
          console.error('Get user error:', error);
          set({ 
            user: null,
            token: null,
            isLoggedIn: false
          });
          return null;
        }
      },
    }),
    {
      name: 'pumpflux-auth',
      partialize: (state) => ({ token: state.token }),
    }
  )
);

// Hook to use in components
export const useAuth = () => {
  const {
    user,
    token,
    isLoggedIn,
    isLoading,
    error,
    loginWithToken,
    loginWithTest,
    logout,
    getUser,
  } = useAuthStore();

  return {
    user,
    token,
    isLoggedIn,
    isLoading,
    error,
    loginWithToken,
    loginWithTest,
    logout,
    getUser,
  };
};
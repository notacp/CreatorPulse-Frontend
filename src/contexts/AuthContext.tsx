'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@/lib/types';
import { apiService } from '@/lib/apiService';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, timezone?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing auth state on mount
    const checkAuthState = () => {
      try {
        const currentUser = apiService.getCurrentUser();
        const isAuth = apiService.isAuthenticated();
        console.log('AuthContext: checkAuthState', { currentUser, isAuth });
        setUser(currentUser);
      } catch (error) {
        console.error('Error checking auth state:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthState();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await apiService.login({ email, password });
      
      if (response.success && response.data) {
        setUser(response.data.user);
        
        // Force a re-check of authentication state
        setTimeout(() => {
          const currentUser = apiService.getCurrentUser();
          if (currentUser) {
            setUser(currentUser);
          }
        }, 100);
        
        return { success: true };
      } else {
        return { 
          success: false, 
          error: response.error?.message || 'Login failed' 
        };
      }
    } catch {
      return { 
        success: false, 
        error: 'Network error. Please try again.' 
      };
    }
  };

  const register = async (email: string, password: string, timezone?: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await apiService.register({ email, password, timezone });
      
      if (response.success && response.data) {
        setUser(response.data.user);
        return { success: true };
      } else {
        return { 
          success: false, 
          error: response.error?.message || 'Registration failed' 
        };
      }
    } catch {
      return { 
        success: false, 
        error: 'Network error. Please try again.' 
      };
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      // Clear localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('creatorpulse_auth');
      }
    }
  };

  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await apiService.resetPassword({ email });
      
      if (response.success) {
        return { success: true };
      } else {
        return { 
          success: false, 
          error: response.error?.message || 'Password reset failed' 
        };
      }
    } catch {
      return { 
        success: false, 
        error: 'Network error. Please try again.' 
      };
    }
  };

  const isAuthenticated = !!user && (() => {
    try {
      return apiService.isAuthenticated();
    } catch (error) {
      console.error('Error checking authentication:', error);
      return false;
    }
  })();
  console.log('AuthContext: render state', { user: !!user, isAuthenticated, isLoading });

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
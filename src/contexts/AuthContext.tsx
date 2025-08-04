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
      const currentUser = apiService.getCurrentUser();
      setUser(currentUser);
      setIsLoading(false);
    };

    checkAuthState();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await apiService.login({ email, password });
      
      if (response.success && response.data) {
        setUser(response.data.user);
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

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
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
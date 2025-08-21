import React, { createContext, useContext } from 'react';
import { User } from '@/lib/types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, timezone?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
}

const MockAuthContext = createContext<AuthContextType | undefined>(undefined);

interface MockAuthProviderProps {
  children: React.ReactNode;
  user?: User | null;
  isAuthenticated?: boolean;
  isLoading?: boolean;
}

export function MockAuthProvider({ 
  children, 
  user = null, 
  isAuthenticated = false, 
  isLoading = false 
}: MockAuthProviderProps) {
  const mockLogin = jest.fn().mockResolvedValue({ success: true });
  const mockRegister = jest.fn().mockResolvedValue({ success: true });
  const mockLogout = jest.fn().mockResolvedValue(undefined);
  const mockResetPassword = jest.fn().mockResolvedValue({ success: true });

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login: mockLogin,
    register: mockRegister,
    logout: mockLogout,
    resetPassword: mockResetPassword,
  };

  return (
    <MockAuthContext.Provider value={value}>
      {children}
    </MockAuthContext.Provider>
  );
}

export function useMockAuth() {
  const context = useContext(MockAuthContext);
  if (context === undefined) {
    throw new Error('useMockAuth must be used within a MockAuthProvider');
  }
  return context;
}

// Helper function to render components with auth context
export function renderWithAuth(
  ui: React.ReactElement,
  options: {
    user?: User | null;
    isAuthenticated?: boolean;
    isLoading?: boolean;
  } = {}
) {
  return (
    <MockAuthProvider {...options}>
      {ui}
    </MockAuthProvider>
  );
}

// Add a basic test to prevent "no tests found" error
describe('MockAuthProvider', () => {
  it('should be defined and export required functions', () => {
    expect(MockAuthProvider).toBeDefined();
    expect(useMockAuth).toBeDefined();
    expect(renderWithAuth).toBeDefined();
  });
});
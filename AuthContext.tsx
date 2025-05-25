import React, { createContext, useState, useContext, useEffect } from 'react';
import { User } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (phone: string, password: string) => Promise<void>;
  register: (name: string, phone: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: () => {},
});

// Function to export the hook at the end
interface AuthProviderProps {
  children: React.ReactNode;
}

// Export the useAuth hook
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      try {
        setLoading(true);
        console.log('Checking authentication status...');
        
        console.log('Sending auth check request to /api/auth/me');
        const response = await fetch('/api/auth/me', {
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });
        console.log('Response headers received');
        
        console.log('Auth check response:', response.status);
        
        if (response.ok) {
          const userData = await response.json();
          console.log('User data received:', userData);
          setUser(userData);
        } else {
          // User is not logged in
          console.log('User not authenticated');
          setUser(null);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setUser(null);
      } finally {
        console.log('Auth check complete, setting loading to false');
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (phone: string, password: string) => {
    setLoading(true);
    try {
      console.log('Attempting login with:', { phone });
      
      // Make direct API call with credentials
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include', // Important for sending/receiving cookies
        body: JSON.stringify({ phone, password })
      });
      
      console.log('Login response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Login failed' }));
        console.error('Login error:', errorData);
        throw new Error(errorData.message || 'Login failed');
      }
      
      const userData = await response.json();
      console.log('Login successful, user data:', userData);
      
      // Update local state
      setUser(userData);
      
      // Verify session is working by immediately checking auth status
      try {
        const verifyResponse = await fetch('/api/auth/me', {
          credentials: 'include',
          headers: {
            'Accept': 'application/json'
          }
        });
        console.log('Verification response status:', verifyResponse.status);
        
        if (verifyResponse.ok) {
          console.log('Session verified successfully');
        } else {
          console.warn('Session not verified after login');
        }
      } catch (verifyError) {
        console.error('Session verification failed:', verifyError);
      }
      
      // Refresh all queries
      queryClient.invalidateQueries();
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, phone: string, password: string) => {
    setLoading(true);
    try {
      console.log('Attempting registration with:', { name, phone });
      
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ name, phone, password })
      });
      
      console.log('Registration response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Registration failed' }));
        console.error('Registration error:', errorData);
        throw new Error(errorData.message || 'Registration failed');
      }
      
      console.log('Registration successful');
      // Don't automatically log in after registration
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      console.log('Attempting logout');
      
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include'
      });
      
      console.log('Logout response status:', response.status);
      
      if (!response.ok) {
        console.error('Logout failed with status:', response.status);
      }
      
      setUser(null);
      queryClient.clear();
      console.log('User session cleared');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

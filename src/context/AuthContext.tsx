import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '../api/auth';
import { refreshAccessToken } from '../api/config';

// Define types
interface UserInfo {
  _id: string;
  name: string;
  email: string;
  roles?: string[];
}

interface AuthResponse {
  message: string;
  code: number;
  metadata: {
    shop?: UserInfo;
    tokens: {
      accessToken: string;
      refreshToken: string;
    };
  };
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserInfo | null;
  login: (email: string, password: string) => Promise<AuthResponse>;
  signup: (name: string, email: string, password: string) => Promise<AuthResponse>;
  logout: () => void;
  refreshSession: () => Promise<boolean>;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Context provider
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<UserInfo | null>(null);

  // Function to update auth state from localStorage
  const updateAuthFromStorage = () => {
    const token = localStorage.getItem('accessToken');
    const userInfo = localStorage.getItem('userInfo');
    
    if (token && userInfo) {
      try {
        const parsedUserInfo = JSON.parse(userInfo);
        setUser(parsedUserInfo);
        setIsAuthenticated(true);
        return true;
      } catch (e) {
        console.error('Error parsing user info from localStorage:', e);
        return false;
      }
    }
    return false;
  };

  // Function to refresh the session
  const refreshSession = async (): Promise<boolean> => {
    try {
      console.log('[AuthContext] Attempting to refresh session');
      const refreshed = await refreshAccessToken();
      
      if (refreshed) {
        const success = updateAuthFromStorage();
        console.log('[AuthContext] Session refresh status:', { refreshed, authStateUpdated: success });
        return success;
      }
      return false;
    } catch (error) {
      console.error('[AuthContext] Error refreshing session:', error);
      return false;
    }
  };

  // Check if user is already logged in (on component mount)
  useEffect(() => {
    const initAuth = async () => {
      if (!updateAuthFromStorage()) {
        // If localStorage doesn't have valid data, try to refresh
        const token = localStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');
        
        if (token && refreshToken) {
          try {
            await refreshSession();
          } catch (e) {
            console.error('Error refreshing session during initialization:', e);
          }
        }
      }
    };
    
    initAuth();
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login({ email, password });
      
      console.log('Login response in AuthContext:', response);
      
      if (response.metadata?.shop) {
        setUser(response.metadata.shop);
        setIsAuthenticated(true);
        
        // Save user info to localStorage
        localStorage.setItem('userInfo', JSON.stringify(response.metadata.shop));
        localStorage.setItem('userId', response.metadata.shop._id);
        
        // Debug log for user roles
        console.log('User after login:', { 
          user: response.metadata.shop,
          roles: response.metadata.shop.roles,
          hasAdminRole: response.metadata.shop.roles?.includes('ADMIN')
        });
      }
      
      return response;
    } catch (error) {
      console.error('Login error in context:', error);
      throw error;
    }
  };

  // Signup function
  const signup = async (name: string, email: string, password: string) => {
    try {
      const response = await authService.signup({ name, email, password });
      
      if (response.metadata?.shop) {
        setUser(response.metadata.shop);
        setIsAuthenticated(true);
        
        // Save user info to localStorage
        localStorage.setItem('userInfo', JSON.stringify(response.metadata.shop));
        localStorage.setItem('userId', response.metadata.shop._id);
      }
      
      return response;
    } catch (error) {
      console.error('Signup error in context:', error);
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await authService.logout();
      setIsAuthenticated(false);
      setUser(null);
      
      // Clear localStorage items
      localStorage.removeItem('userInfo');
      localStorage.removeItem('userId');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      
      // Redirect to login page
      window.location.href = '/signin';
    } catch (error) {
      console.error('Logout error in context:', error);
      
      // Even if there's an error, clear the state and localStorage
      setIsAuthenticated(false);
      setUser(null);
      localStorage.removeItem('userInfo');
      localStorage.removeItem('userId');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      
      // Still redirect to login page
      window.location.href = '/signin';
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        login,
        signup,
        logout,
        refreshSession
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 
"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiService } from './api';
import { Player } from '@/interface/Player';
import { LoginCredentials } from '@/interface/LoginCredentials';
import { RegisterCredentials } from '@/interface/RegisterCredentials';
import { AuthResponse } from '@/interface/AuthResponse';
interface AuthContextType {
  player: Player | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  login: (credentials: LoginCredentials) => Promise<void>;

  startRegistration: (credentials: RegisterCredentials) => Promise<AuthResponse>;
  verifyRegistration: (email: string, code: string) => Promise<AuthResponse>;

  logout: () => void;
  checkAuth: () => Promise<void>;
}


const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Player | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  // Update the checkAuth function to use cookies
  useEffect(() => {
    const checkAuth = async () => {
      const userData = apiService.initializeAuth();
      if (!userData) {
        setIsLoading(false);
        return;
      }

      try {
        const profile = await apiService.getProfile();
        if (profile) {
          setUser(profile);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        // Only remove data if it's an authentication error
        if (error instanceof Error && error.message.includes('401')) {
          setUser(null);
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Update login to use cookies
  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await apiService.login(credentials);
      if (response.success && response.player) {
        setUser(response.player);
      } else {
        throw new Error(response.error || 'Login failed');
      }
    } catch (error) {
      throw error;
    }
  };

 const startRegistration = async (credentials: RegisterCredentials) => {
  try {
    const response = await apiService.startRegistration(credentials);
    if (!response.success) {
      throw new Error(response.error || "Failed to send code");
    }
    return response;
  } catch (err) {
    throw err;
  }
};
const verifyRegistration = async (email: string, code: string) => {
  try {
    const response = await apiService.verifyRegistration(email, code);

    if (response.success && response.player) {
      setUser(response.player);  // user logged in after verify
    } else {
      throw new Error(response.error || "Verification failed");
    }

    return response;

  } catch (err) {
    throw err;
  }
};

  // Update logout to use cookies
  const logout = () => {
    apiService.logout();
    setUser(null);
  };

  const value: AuthContextType = {
    player:user,
    isLoading,
    isAuthenticated,
    login,
    startRegistration,
    verifyRegistration,
    logout,
    checkAuth: async () => {
      setIsLoading(true);
      try {
        const userData = apiService.initializeAuth();
        if (!userData) {
          setUser(null);
          setIsLoading(false);
          return;
        }

        const profile = await apiService.getProfile();
        if (profile) {
          setUser(profile);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        if (error instanceof Error && error.message.includes('401')) {
          setUser(null);
        }
      } finally {
        setIsLoading(false);
      }
    },
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(){
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, AuthResponse } from '../types/auth';
import { fetchWithAuth, getToken, setTokens, clearTokens } from '../lib/api';

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  login: (authData: AuthResponse, rememberMe?: boolean) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      const token = getToken();
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const profile = await fetchWithAuth<UserProfile>('/auth/me');
        setUser(profile);
      } catch (err) {
        console.error('Failed to restore session:', err);
        clearTokens();
      } finally {
        setIsLoading(false);
      }
    }
    loadUser();
  }, []);

  const login = (authData: AuthResponse, rememberMe: boolean = true) => {
    setTokens(authData.accessToken, authData.refreshToken, rememberMe);
    setUser(authData.user);
  };

  const logout = () => {
    clearTokens();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

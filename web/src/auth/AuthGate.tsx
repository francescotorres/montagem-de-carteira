import React from 'react';
import { useAuth } from './AuthContext';
import { LoginPage } from './LoginPage';

export const AuthGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <LoginPage />;
};

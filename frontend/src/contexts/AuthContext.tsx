import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '@/services/api';

interface User {
  _id: string;
  name: string;
  email: string;
  address: string;
  addresses?: Array<{
    id: number;
    type: 'Home' | 'Office';
    fullName: string;
    phone: string;
    city: string;
    barangay: string;
    street: string;
    landmark?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
    locationComment?: string;
    isDefault: boolean;
  }>;
  phone_number: string;
  role: string;
  gender: 'male' | 'female' | 'prefer not to say';
  dateOfBirth: string;
  profilePicture?: {
    public_id?: string;
    url?: string;
  };
  defaultWallet: number;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (userData: User, token: string) => void;
  logout: () => void;
  updateUser: (userData: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is already logged in on app start
    const checkAuth = () => {
      const isAuth = auth.isAuthenticated();
      const userData = auth.getUserData();
      
      if (isAuth && userData) {
        setUser(userData);
        setIsAuthenticated(true);
      }
    };

    checkAuth();
  }, []);

  const login = (userData: User, token: string) => {
    auth.saveUserData(userData, token);
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = () => {
    auth.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateUser = (userData: User) => {
    setUser(userData);
    // Update localStorage as well
    auth.saveUserData(userData, auth.getToken() || '');
  };

  const value = {
    user,
    isAuthenticated,
    login,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;

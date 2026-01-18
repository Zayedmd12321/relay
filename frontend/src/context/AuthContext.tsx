'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import axiosInstance from '@/lib/axios';
import { User } from '@/types';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: string) => Promise<void>;
  verifyOtp: (email: string, otp: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

interface DecodedToken {
  id: string;
  role: string;
  iat: number;
  exp: number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Fetch user details from backend
  const fetchUser = async () => {
    try {
      const token = Cookies.get('token');
      
      if (!token) {
        setLoading(false);
        return;
      }

      // Verify token is not expired
      const decoded = jwtDecode<DecodedToken>(token);
      const currentTime = Date.now() / 1000;
      
      if (decoded.exp < currentTime) {
        Cookies.remove('token');
        setUser(null);
        setLoading(false);
        return;
      }

      // Fetch current user details
      const response = await axiosInstance.get('/auth/me');
      
      if (response.data.success) {
        setUser({
          id: response.data.data.user.id || response.data.data.user._id,
          name: response.data.data.user.name,
          email: response.data.data.user.email,
          role: response.data.data.user.role,
        });
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      Cookies.remove('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Initialize user on mount
  useEffect(() => {
    fetchUser();
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    try {
      const response = await axiosInstance.post('/auth/login', {
        email,
        password,
      });

      if (response.data.success) {
        const { token, user: userData } = response.data.data;
        
        // Save token to cookie (expires in 7 days)
        Cookies.set('token', token, { expires: 7 });
        
        // Set user state
        setUser({
          id: userData.id || userData._id,
          name: userData.name,
          email: userData.email,
          role: userData.role,
        });

        toast.success('Login successful!');
        router.push('/dashboard');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      toast.error(errorMessage);
      throw error;
    }
  };

  // Register function
  const register = async (name: string, email: string, password: string, role: string) => {
    try {
      const response = await axiosInstance.post('/auth/register', {
        name,
        email,
        password,
        role,
      });

      if (response.data.success) {
        // Don't auto-login, user needs to verify OTP first
        // Registration component will handle showing OTP screen
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Registration failed';
      toast.error(errorMessage);
      throw error;
    }
  };

  // Verify OTP function
  const verifyOtp = async (email: string, otp: string) => {
    try {
      const response = await axiosInstance.post('/auth/verify-otp', {
        email,
        otp,
      });

      if (response.data.success) {
        const { token, user: userData } = response.data.data;
        
        // Save token to cookie
        Cookies.set('token', token, { expires: 7 });
        
        // Set user state
        setUser({
          id: userData.id || userData._id,
          name: userData.name,
          email: userData.email,
          role: userData.role,
        });

        toast.success('Email verified successfully!');
        router.push('/dashboard');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'OTP verification failed';
      toast.error(errorMessage);
      throw error;
    }
  };

  // Logout function
  const logout = () => {
    Cookies.remove('token');
    setUser(null);
    toast.success('Logged out successfully');
    router.push('/login');
  };

  // Refresh user data
  const refreshUser = async () => {
    await fetchUser();
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, verifyOtp, logout, refreshUser }}>
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

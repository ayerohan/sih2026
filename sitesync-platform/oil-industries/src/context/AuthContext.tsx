import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthUser } from '../types';
import { DEMO_USERS } from '../data/demoUsers';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (employeeId: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (userData: {
    name: string;
    employeeId: string;
    email: string;
    password: string;
    role: 'ADMIN' | 'WORKER';
    designation?: string;
    discipline?: string;
    avatar?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'sitesync_auth_session_v1';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    try {
      const savedSession = localStorage.getItem(AUTH_STORAGE_KEY);
      if (savedSession) {
        const parsedUser: AuthUser = JSON.parse(savedSession);
        if (parsedUser && parsedUser.id && parsedUser.role) {
          setUser(parsedUser);
        }
      }
    } catch (e) {
      console.error('Failed to parse auth session from localStorage:', e);
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (employeeId: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);

    const cleanEmpId = employeeId.trim().toUpperCase();
    const cleanPassword = password.trim();

    if (!cleanEmpId) {
      setIsLoading(false);
      return { success: false, error: 'Employee ID / User ID is required.' };
    }

    if (!cleanPassword) {
      setIsLoading(false);
      return { success: false, error: 'Password is required.' };
    }

    let authenticatedUser: AuthUser | null = null;

    // 1. Try Supabase Authentication if configured
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .ilike('employee_id', cleanEmpId)
          .eq('password', cleanPassword)
          .single();

        if (data && !error) {
          authenticatedUser = {
            id: data.id,
            employeeId: data.employee_id,
            name: data.name,
            email: data.email,
            role: data.role as 'ADMIN' | 'WORKER',
            designation: data.designation,
            avatar: data.avatar,
          };
        }
      } catch (e) {
        console.warn('Supabase auth check query exception, falling back to demo users DB:', e);
      }
    }

    // 2. Fallback to registered users + local demo DB
    if (!authenticatedUser) {
      const storedUsersRaw = localStorage.getItem('sitesync_registered_users');
      const registeredUsers: any[] = storedUsersRaw ? JSON.parse(storedUsersRaw) : [];
      const allUsers = [...registeredUsers, ...DEMO_USERS];

      const match = allUsers.find(
        u => u.employeeId.toUpperCase() === cleanEmpId && u.password === cleanPassword
      );

      if (match) {
        authenticatedUser = {
          id: match.id,
          employeeId: match.employeeId,
          name: match.name,
          email: match.email,
          role: match.role,
          designation: match.designation,
          avatar: match.avatar,
        };
      }
    }

    if (!authenticatedUser) {
      setIsLoading(false);
      return {
        success: false,
        error: 'Invalid Employee ID or Password. Please check your credentials.',
      };
    }

    setUser(authenticatedUser);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authenticatedUser));
    setIsLoading(false);

    return { success: true };
  };

  const signup = async (userData: {
    employeeId: string;
    name: string;
    email: string;
    role: 'ADMIN' | 'WORKER';
    designation?: string;
    discipline?: string;
    password: string;
    avatar?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    const cleanEmpId = userData.employeeId.trim().toUpperCase();
    const cleanPassword = userData.password.trim();

    if (!cleanEmpId || !cleanPassword || !userData.name.trim()) {
      setIsLoading(false);
      return { success: false, error: 'Name, Employee ID, and Password are required.' };
    }

    const storedUsersRaw = localStorage.getItem('sitesync_registered_users');
    const registeredUsers: any[] = storedUsersRaw ? JSON.parse(storedUsersRaw) : [];
    const allUsers = [...registeredUsers, ...DEMO_USERS];

    if (allUsers.some(u => u.employeeId.toUpperCase() === cleanEmpId)) {
      setIsLoading(false);
      return { success: false, error: `Employee ID ${cleanEmpId} already exists. Please choose another ID.` };
    }

    const newUserRecord = {
      id: `USR-${cleanEmpId}`,
      employeeId: cleanEmpId,
      name: userData.name.trim(),
      email: userData.email.trim() || `${cleanEmpId.toLowerCase()}@sitesync.oil.in`,
      role: userData.role,
      designation: userData.designation || (userData.role === 'ADMIN' ? 'PROJECT MANAGER' : 'SITE ENGINEER'),
      password: cleanPassword,
      avatar: userData.avatar || (userData.role === 'ADMIN'
        ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'),
    };

    registeredUsers.push(newUserRecord);
    localStorage.setItem('sitesync_registered_users', JSON.stringify(registeredUsers));

    const authUser: AuthUser = {
      id: newUserRecord.id,
      employeeId: newUserRecord.employeeId,
      name: newUserRecord.name,
      email: newUserRecord.email,
      role: newUserRecord.role,
      designation: newUserRecord.designation,
      avatar: newUserRecord.avatar,
    };

    setUser(authUser);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authUser));
    setIsLoading(false);

    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
      }}
    >
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

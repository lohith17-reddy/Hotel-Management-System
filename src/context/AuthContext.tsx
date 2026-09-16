import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Student, Allocation } from '../types/index.ts';
import { api } from '../services/apiClient.ts';

interface AuthContextType {
  currentUser: User | null;
  currentStudent: Student | null;
  currentAllocation: Allocation | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; user?: User; message?: string }>;
  loginAsStudent: (email: string, password?: string) => Promise<{ success: boolean; user?: User; message?: string }>;
  loginAsWarden: (email: string, password?: string) => Promise<{ success: boolean; user?: User; message?: string }>;
  loginAsAdmin: (email: string, password?: string) => Promise<{ success: boolean; user?: User; message?: string }>;
  loginWithDemo: (role: 'student' | 'warden' | 'admin') => Promise<{ success: boolean; user?: User; message?: string }>;
  setAuthSession: (user: User, token: string) => Promise<void>;
  logout: () => void;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
  const [currentAllocation, setCurrentAllocation] = useState<Allocation | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('campushostel_auth_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchStudentData = useCallback(async (userId: string) => {
    try {
      const res = await api.getStudents();
      const st = res.students?.find(s => s.userId === userId);
      if (st) {
        setCurrentStudent(st);
        setCurrentAllocation(st.currentAllocation || null);
      } else {
        setCurrentStudent(null);
        setCurrentAllocation(null);
      }
    } catch (e) {
      console.error('Failed to fetch student data', e);
      setCurrentStudent(null);
      setCurrentAllocation(null);
    }
  }, []);

  const setAuthSession = useCallback(async (user: User, authToken: string) => {
    setCurrentUser(user);
    setToken(authToken);
    localStorage.setItem('campushostel_auth_token', authToken);
    localStorage.setItem('campushostel_user_id', user.id);

    if (user.role === 'student') {
      await fetchStudentData(user.id);
    } else {
      setCurrentStudent(null);
      setCurrentAllocation(null);
    }
  }, [fetchStudentData]);

  const initAuth = useCallback(async () => {
    setIsLoading(true);
    try {
      const savedToken = localStorage.getItem('campushostel_auth_token');
      const savedUserId = localStorage.getItem('campushostel_user_id');

      if (!savedToken && !savedUserId) {
        setCurrentUser(null);
        setCurrentStudent(null);
        setCurrentAllocation(null);
        setIsLoading(false);
        return;
      }

      const res = await api.getCurrentUser(savedUserId || undefined);
      if (res.success && res.user) {
        setCurrentUser(res.user);
        if (res.user.role === 'student') {
          await fetchStudentData(res.user.id);
        } else {
          setCurrentStudent(null);
          setCurrentAllocation(null);
        }
      } else {
        localStorage.removeItem('campushostel_auth_token');
        localStorage.removeItem('campushostel_user_id');
        setCurrentUser(null);
      }
    } catch (err) {
      console.warn('Session verification failed:', err);
      localStorage.removeItem('campushostel_auth_token');
      localStorage.removeItem('campushostel_user_id');
      setCurrentUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [fetchStudentData]);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  const loginAsStudent = async (email: string, password?: string) => {
    setIsLoading(true);
    try {
      const res = await api.studentLogin(email, password);
      if (res.success && res.user) {
        await setAuthSession(res.user, res.token);
        return { success: true, user: res.user };
      }
      return { success: false, message: res.message || 'Invalid student credentials.' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Student login failed.' };
    } finally {
      setIsLoading(false);
    }
  };

  const loginAsWarden = async (email: string, password?: string) => {
    setIsLoading(true);
    try {
      const res = await api.wardenLogin(email, password);
      if (res.success && res.user) {
        await setAuthSession(res.user, res.token);
        return { success: true, user: res.user };
      }
      return { success: false, message: res.message || 'Invalid warden credentials.' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Warden login failed.' };
    } finally {
      setIsLoading(false);
    }
  };

  const loginAsAdmin = async (email: string, password?: string) => {
    setIsLoading(true);
    try {
      const res = await api.adminLogin(email, password);
      if (res.success && res.user) {
        await setAuthSession(res.user, res.token);
        return { success: true, user: res.user };
      }
      return { success: false, message: res.message || 'Invalid admin credentials.' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Administrator login failed.' };
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithDemo = async (role: 'student' | 'warden' | 'admin') => {
    setIsLoading(true);
    try {
      const res = await api.demoLogin(role);
      if (res.success && res.user) {
        await setAuthSession(res.user, res.token);
        return { success: true, user: res.user };
      }
      return { success: false, message: res.message || `Failed to sign in with demo ${role} account.` };
    } catch (err: any) {
      return { success: false, message: err.message || `Demo ${role} login failed.` };
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password?: string) => {
    setIsLoading(true);
    try {
      const res = await api.login(email, password);
      if (res.success && res.user) {
        await setAuthSession(res.user, res.token);
        return { success: true, user: res.user };
      }
      return { success: false, message: res.message || 'Invalid credentials' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Login failed.' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    try {
      api.logout().catch(() => {});
    } catch (e) {}
    localStorage.removeItem('campushostel_auth_token');
    localStorage.removeItem('campushostel_user_id');
    setToken(null);
    setCurrentUser(null);
    setCurrentStudent(null);
    setCurrentAllocation(null);
  };

  const refreshUserData = async () => {
    if (currentUser) {
      if (currentUser.role === 'student') {
        await fetchStudentData(currentUser.id);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentStudent,
        currentAllocation,
        token,
        isAuthenticated: !!currentUser,
        isLoading,
        login,
        loginAsStudent,
        loginAsWarden,
        loginAsAdmin,
        loginWithDemo,
        setAuthSession,
        logout,
        refreshUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}

import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 앱 로드 시 로컬 스토리지에서 사용자 정보 복원
    const storedUser = authAPI.getCurrentUser();
    if (storedUser) {
      setUser(storedUser);
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      const data = await authAPI.login(credentials);
      setUser(data.user);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || '로그인에 실패했습니다.',
      };
    }
  };

  const register = async (userData) => {
    try {
      const data = await authAPI.register(userData);
      setUser(data.user);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || '회원가입에 실패했습니다.',
      };
    }
  };

  const logout = () => {
    authAPI.logout();
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, tokenStorage } from '../services/api.js';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const checkAuth = useCallback(async () => {
    const token = tokenStorage.get();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await api.auth.getMe();
      if (res.success && res.user) {
        setUser(res.user);
      } else {
        tokenStorage.remove();
        setUser(null);
      }
    } catch {
      tokenStorage.remove();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (email, password) => {
    setError(null);
    try {
      const res = await api.auth.login({ email, password });
      if (res.success && res.token) {
        tokenStorage.set(res.token);
        setUser(res.user);
        return res;
      }
    } catch (err) {
      setError(err.message || 'Login failed.');
      throw err;
    }
  };

  const register = async (userData) => {
    setError(null);
    try {
      const res = await api.auth.register(userData);
      if (res.success && res.token) {
        tokenStorage.set(res.token);
        setUser(res.user);
        return res;
      }
    } catch (err) {
      setError(err.message || 'Registration failed.');
      throw err;
    }
  };

  const loginAsDemo = async () => {
    return login('demo@careerflow.ai', 'password123');
  };

  const logout = () => {
    tokenStorage.remove();
    setUser(null);
  };

  const updateProfile = async (profileData) => {
    try {
      const res = await api.auth.updateProfile(profileData);
      if (res.success && res.user) {
        setUser(res.user);
      }
      return res;
    } catch (err) {
      throw err;
    }
  };

  const refreshUser = async () => {
    try {
      const res = await api.auth.getMe();
      if (res.success && res.user) {
        setUser(res.user);
      }
    } catch {
      // ignore
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        isAuthenticated: !!user,
        login,
        register,
        loginAsDemo,
        logout,
        updateProfile,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

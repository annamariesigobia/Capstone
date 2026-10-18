import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    
    const unsubscribe = authService.subscribeToAuthChanges((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const u = await authService.login(email, password);
      setUser(u);
      setLoading(false);
      return u;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const register = async (email, password, fullName, phone, role) => {
    setLoading(true);
    try {
      const u = await authService.register(email, password, fullName, phone, role);
      setUser(u);
      setLoading(false);
      return u;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const loginWithGoogle = async (role, address = '') => {
    setLoading(true);
    try {
      const u = await authService.loginWithGoogle(role, address);
      setUser(u);
      setLoading(false);
      return u;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authService.logout();
      setUser(null);
    } catch (error) {
      console.error("Logout failed", error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (data) => {
    if (!user) return;
    try {
      const updated = await authService.updateProfile(user.uid, data);
      if (typeof updated === 'object') {
        setUser(updated);
      } else {
        setUser(prev => ({ ...prev, ...data }));
      }
    } catch (error) {
      console.error("Profile update failed", error);
      throw error;
    }
  };

const switchRole = (newRole) => {
    if (authService.isMock()) {
      const updated = authService.debugSwitchRole(user.uid, newRole);
      if (updated) {
        setUser(updated);
      }
    } else {
      console.warn("Direct role switching is restricted in Firebase Production mode.");
    }
  };

  const value = {
    user,
    loading,
    isMock: authService.isMock(),
    login,
    register,
    loginWithGoogle,
    logout,
    updateProfile,
    switchRole
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <div className="flex items-center justify-center min-h-screen bg-slate-50">
          <div className="flex flex-col items-center space-y-3">
            <div className="h-10 w-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-slate-500 font-semibold">Loading Dinagat Islands...</p>
          </div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

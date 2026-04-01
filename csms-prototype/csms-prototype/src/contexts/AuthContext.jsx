import React, { createContext, useContext, useState, useEffect } from 'react';

// The 4 Roles
export const ROLES = {
  ADMIN: 'admin',
  OWNER: 'owner',
  ACCOUNTANT: 'accountant',
  STAFF: 'staff',
  USER: 'user'
};

const AuthContext = createContext();

export function AuthProvider({ children }) {
  // Mock initial state: Not logged in
  const [user, setUser] = useState(null);

  // For simulation, load user from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('csmsUser');
    const savedToken = localStorage.getItem('csmsToken');
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = async (email, password) => {
    try {
      const response = await fetch('http://localhost:3307/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const result = await response.json();
      
      if (response.ok) {
        setUser(result.user);
        localStorage.setItem('csmsUser', JSON.stringify(result.user));
        localStorage.setItem('csmsToken', result.token);
        return { success: true };
      } else {
        return { success: false, message: result.message };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Server error' };
    }
  };

  const signup = async (userData) => {
    try {
      const response = await fetch('http://localhost:3307/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      const result = await response.json();
      
      if (response.ok) {
        setUser(result.user);
        localStorage.setItem('csmsUser', JSON.stringify(result.user));
        localStorage.setItem('csmsToken', result.token);
        return { success: true };
      } else {
        return { success: false, message: result.message };
      }
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, message: 'Server error' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('csmsUser');
    localStorage.removeItem('csmsToken');
  };

  // Helper function to check role access
  const hasAccess = (allowedRoles) => {
    if (!user || !user.role) return false;
    const userRoleStr = String(user.role).toLowerCase();
    const allowedLower = allowedRoles.map(r => String(r).toLowerCase());
    return allowedLower.includes(userRoleStr);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, hasAccess }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

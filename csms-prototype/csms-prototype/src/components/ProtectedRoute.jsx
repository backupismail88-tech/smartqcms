import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute({ allowedRoles, children }) {
  const { user, hasAccess } = useAuth();

  // Wait for auth to initialize ideally, but since it's synchronous localStorage, we can check directly
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !hasAccess(allowedRoles)) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-black">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600 dark:text-gray-400">You do not have permission to view this page.</p>
        </div>
      </div>
    );
  }

  return children;
}

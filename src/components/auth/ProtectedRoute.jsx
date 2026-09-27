import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Loader2 } from 'lucide-react';

/**
 * Returns the canonical dashboard route for a given user role.
 */
export const getRoleDashboard = (role) => {
  const normalized = (role || '').toString().toLowerCase().trim();
  if (normalized === 'agent') return '/agent/dashboard';
  if (normalized === 'agency') return '/agency/dashboard';
  if (
    normalized === 'university_rep' ||
    normalized === 'university' ||
    normalized === 'uni rep' ||
    normalized === 'university representative'
  ) {
    return '/university-rep/dashboard';
  }
  if (normalized === 'admin') return '/admin/dashboard';
  return '/student/dashboard';
};

/**
 * Checks if a requested pathname is permitted for a given user role.
 */
export const isPathAllowedForRole = (pathname, role) => {
  if (!pathname || typeof pathname !== 'string') return false;
  const normalizedRole = (role || '').toString().toLowerCase().trim();
  const path = pathname.toLowerCase();

  // Exclude public/auth paths
  if (
    path === '/' ||
    path.startsWith('/login') ||
    path.startsWith('/register') ||
    path.startsWith('/features') ||
    path.startsWith('/pricing') ||
    path.startsWith('/universities') ||
    path.startsWith('/about') ||
    path.startsWith('/careers') ||
    path.startsWith('/blog') ||
    path.startsWith('/contact')
  ) {
    return false;
  }

  if (normalizedRole === 'student') {
    return path.startsWith('/student');
  }
  if (normalizedRole === 'agent') {
    return path.startsWith('/agent');
  }
  if (normalizedRole === 'agency') {
    return path.startsWith('/agency');
  }
  if (
    normalizedRole === 'university_rep' ||
    normalizedRole === 'university' ||
    normalizedRole === 'uni rep' ||
    normalizedRole === 'university representative'
  ) {
    return path.startsWith('/university-rep') || path.startsWith('/university');
  }
  if (normalizedRole === 'admin') {
    return path.startsWith('/admin');
  }
  return false;
};

const ProtectedRoute = ({ allowedRoles, redirectTo }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-violet-500 animate-spin" />
      </div>
    );
  }

  // 1. Unauthenticated user handling: Redirect to appropriate login route
  if (!user) {
    const defaultRedirect = location.pathname.startsWith('/admin') ? '/admin/login' : '/login';
    const targetRedirect = redirectTo || defaultRedirect;
    return <Navigate to={targetRedirect} state={{ from: location }} replace />;
  }

  // 2. Authenticated user role check
  const userRole = (user.role || user.user_metadata?.role || '').toString().toLowerCase().trim();

  // If specific roles are required, verify that the authenticated user possesses the role
  if (allowedRoles && allowedRoles.length > 0) {
    const isAuthorized = allowedRoles.some((r) => r.toString().toLowerCase().trim() === userRole);

    if (!isAuthorized) {
      // Role unauthorized: redirect authenticated user directly to their own canonical role dashboard
      // NEVER send an authenticated user to /login or a mismatched dashboard
      const authorizedDashboard = getRoleDashboard(userRole);
      return <Navigate to={authorizedDashboard} replace />;
    }
  }

  // 3. Agency specific check: Account must be ACTIVE to access agency dashboard
  if (userRole === 'agency') {
    const isAgencyActive =
      user.accountStatus === 'ACTIVE' ||
      user.user_metadata?.accountStatus === 'ACTIVE';

    if (!isAgencyActive) {
      return <Navigate to="/login" state={{ from: location, reason: 'unactivated_agency' }} replace />;
    }
  }

  // 4. University Representative specific check: Account must be ACTIVE to access unirep dashboard
  if (userRole === 'university_rep' || userRole === 'university') {
    const isUniRepActive =
      user.accountStatus === 'ACTIVE' ||
      user.user_metadata?.accountStatus === 'ACTIVE';

    if (!isUniRepActive) {
      return <Navigate to="/login" state={{ from: location, reason: 'unactivated_unirep' }} replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;

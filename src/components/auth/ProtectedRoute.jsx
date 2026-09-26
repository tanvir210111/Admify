import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Loader2 } from 'lucide-react';

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

  // Choose the appropriate login fallback destination
  const defaultRedirect = location.pathname.startsWith('/admin') ? '/admin/login' : '/login';
  const targetRedirect = redirectTo || defaultRedirect;

  if (!user) {
    // Redirect unauthenticated user to the appropriate login route
    return <Navigate to={targetRedirect} state={{ from: location }} replace />;
  }

  // If specific roles are required, verify that the authenticated user possesses the role
  const userRole = (user.role || user.user_metadata?.role || '').toLowerCase();

  if (allowedRoles && allowedRoles.length > 0) {
    const isAuthorized = allowedRoles.some((r) => r.toLowerCase() === userRole);

    if (!isAuthorized) {
      // Role unauthorized: redirect away from protected route
      return <Navigate to={targetRedirect} state={{ from: location }} replace />;
    }
  }

  // Agency specific check: Account must be ACTIVE to access agency dashboard
  if (userRole === 'agency') {
    const isAgencyActive =
      user.accountStatus === 'ACTIVE' ||
      user.user_metadata?.accountStatus === 'ACTIVE';

    if (!isAgencyActive) {
      return <Navigate to="/login" state={{ from: location, reason: 'unactivated_agency' }} replace />;
    }
  }

  // University Representative specific check: Account must be ACTIVE to access unirep dashboard
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

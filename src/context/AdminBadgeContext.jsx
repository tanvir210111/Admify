import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from './AuthContext';

const initialCounts = {
  agencies: 0,
  agents: 0,
  uniRepresentatives: 0,
  applications: 0,
  partnerships: 0,
  payments: 0,
  reports: 0,
  supportInbox: 0,
  notifications: 0,
  scholarships: 0,
};

const initialStatusCounts = {
  agencies: {},
  agents: {},
  uniRepresentatives: {},
  applications: {},
  partnerships: {},
  payments: {},
  reports: {},
  supportInbox: {},
  notifications: {},
  scholarships: {},
};

const AdminBadgeContext = createContext({
  sidebarCounts: initialCounts,
  statusCounts: initialStatusCounts,
  isLoading: false,
  refreshSidebarCounts: () => Promise.resolve(),
  formatBadgeCount: (count) => '',
  markEntityAsSeen: (entityType, entityId) => Promise.resolve(),
  getStatusCount: (section, tabKey) => 0,
});

export const ADMIN_BADGE_REFRESH_EVENT = 'admify_admin_badge_refresh';

/**
 * Dispatches a lightweight refresh event to all listeners across the Admin panel.
 * Call this immediately after any relevant admin mutation (approve/reject/resolve/etc.).
 */
export const triggerAdminBadgeRefresh = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(ADMIN_BADGE_REFRESH_EVENT));
  }
};

/**
 * Format badge count display:
 * - count <= 0: '' (hidden)
 * - count > 99: '99+'
 * - otherwise: string representation of count
 */
export const formatBadgeCount = (count) => {
  const num = Number(count) || 0;
  if (num <= 0) return '';
  if (num > 99) return '99+';
  return String(num);
};

export const AdminBadgeProvider = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();
  const [sidebarCounts, setSidebarCounts] = useState(initialCounts);
  const [statusCounts, setStatusCounts] = useState(initialStatusCounts);
  const [isLoading, setIsLoading] = useState(false);

  const isAdmin = useMemo(() => {
    return user && (user.role === 'admin' || user.role === 'ADMIN');
  }, [user]);

  const fetchCounts = useCallback(async () => {
    if (!isAdmin) return;

    try {
      setIsLoading(true);
      const res = await api.get('/api/admin/sidebar-counts');
      if (res?.success && res.data) {
        const { statusCounts: returnedStatusCounts, ...pureSidebarCounts } = res.data;
        setSidebarCounts((prev) => ({
          ...prev,
          ...pureSidebarCounts,
        }));
        if (returnedStatusCounts) {
          setStatusCounts(returnedStatusCounts);
        }
      }
    } catch (err) {
      // Graceful fallback without disrupting admin operations
      console.warn('Admin badge fetch error:', err?.message || err);
    } finally {
      setIsLoading(false);
    }
  }, [isAdmin]);

  const markEntityAsSeen = useCallback(
    async (entityType, entityId) => {
      if (!isAdmin || !entityType || !entityId) return;

      try {
        // Optimistic UI update for sidebar and status
        const sectionMap = {
          agency: 'agencies',
          agent: 'agents',
          agent_user: 'agents',
          university_rep: 'uniRepresentatives',
          application: 'applications',
          partnership: 'partnerships',
          payment: 'payments',
          report: 'reports',
          support: 'supportInbox',
          notification: 'notifications',
          scholarship: 'scholarships',
        };

        const sectionKey = sectionMap[entityType];
        if (sectionKey) {
          setSidebarCounts((prev) => ({
            ...prev,
            [sectionKey]: Math.max(0, (Number(prev[sectionKey]) || 0) - 1),
          }));
        }

        await api.put(`/api/admin/seen/${entityType}/${entityId}`);
        triggerAdminBadgeRefresh();
      } catch (err) {
        console.warn(`Failed to mark entity as seen (${entityType}/${entityId}):`, err?.message || err);
      }
    },
    [isAdmin]
  );

  const getStatusCount = useCallback(
    (section, tabKey) => {
      if (!statusCounts || !statusCounts[section]) return 0;
      const sec = statusCounts[section];
      const normalizedKey = (tabKey || '').toString().toLowerCase().trim();
      return sec[normalizedKey] !== undefined ? sec[normalizedKey] : (sec[tabKey] || 0);
    },
    [statusCounts]
  );

  // Initial load and on admin page navigations
  useEffect(() => {
    if (isAdmin && location.pathname.startsWith('/admin')) {
      fetchCounts();
    }
  }, [fetchCounts, isAdmin, location.pathname]);

  // Window focus, custom event trigger, and 45s background polling
  useEffect(() => {
    if (!isAdmin) return;

    const handleEventRefresh = () => {
      fetchCounts();
    };

    const handleWindowFocus = () => {
      fetchCounts();
    };

    window.addEventListener(ADMIN_BADGE_REFRESH_EVENT, handleEventRefresh);
    window.addEventListener('focus', handleWindowFocus);

    // Lightweight 45s interval
    const interval = setInterval(fetchCounts, 45000);

    return () => {
      window.removeEventListener(ADMIN_BADGE_REFRESH_EVENT, handleEventRefresh);
      window.removeEventListener('focus', handleWindowFocus);
      clearInterval(interval);
    };
  }, [fetchCounts, isAdmin]);

  const contextValue = useMemo(
    () => ({
      sidebarCounts,
      statusCounts,
      isLoading,
      refreshSidebarCounts: fetchCounts,
      formatBadgeCount,
      markEntityAsSeen,
      getStatusCount,
    }),
    [sidebarCounts, statusCounts, isLoading, fetchCounts, markEntityAsSeen, getStatusCount]
  );

  return (
    <AdminBadgeContext.Provider value={contextValue}>
      {children}
    </AdminBadgeContext.Provider>
  );
};

export const useAdminBadges = () => useContext(AdminBadgeContext);

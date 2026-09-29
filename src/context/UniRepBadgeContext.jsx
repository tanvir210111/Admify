import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from './AuthContext';

const initialCounts = {
  partnerships: 0,
  applications: 0,
  documents: 0,
  messages: 0,
  notifications: 0,
  reports: 0,
};

const initialStatusCounts = {
  partnerships: {},
  applications: {},
  documents: {},
};

const UniRepBadgeContext = createContext({
  sidebarCounts: initialCounts,
  statusCounts: initialStatusCounts,
  isLoading: false,
  refreshSidebarCounts: () => Promise.resolve(),
  formatBadgeCount: (count) => '',
  markEntityAsSeen: (entityType, entityId) => Promise.resolve(),
  getStatusCount: (section, tabKey) => 0,
});

export const UNI_REP_BADGE_REFRESH_EVENT = 'admify_uni_rep_badge_refresh';

/**
 * Dispatches a lightweight refresh event to all listeners across the Uni Rep panel.
 */
export const triggerUniRepBadgeRefresh = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(UNI_REP_BADGE_REFRESH_EVENT));
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

export const UniRepBadgeProvider = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();
  const [sidebarCounts, setSidebarCounts] = useState(initialCounts);
  const [statusCounts, setStatusCounts] = useState(initialStatusCounts);
  const [isLoading, setIsLoading] = useState(false);

  const isUniRep = useMemo(() => {
    const role = user?.role;
    return role === 'university_rep' || role === 'university representative' || role === 'university';
  }, [user]);

  const fetchCounts = useCallback(async () => {
    if (!isUniRep) return;

    try {
      setIsLoading(true);
      const res = await api.get('/api/university-rep/sidebar-counts');
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
      console.warn('Uni Rep badge fetch error:', err?.message || err);
    } finally {
      setIsLoading(false);
    }
  }, [isUniRep]);

  const markEntityAsSeen = useCallback(
    async (entityType, entityId) => {
      if (!isUniRep || !entityType || !entityId) return;

      try {
        // Optimistic UI decrement for sidebar counts
        const sectionMap = {
          partnership: 'partnerships',
          partnerships: 'partnerships',
          universityAgencyConnection: 'partnerships',
          application: 'applications',
          applications: 'applications',
          document: 'documents',
          documents: 'documents',
          message: 'messages',
          messages: 'messages',
          chat_message: 'messages',
          notification: 'notifications',
          notifications: 'notifications',
          report: 'reports',
          reports: 'reports',
        };

        const sectionKey = sectionMap[entityType];
        if (sectionKey) {
          setSidebarCounts((prev) => ({
            ...prev,
            [sectionKey]: Math.max(0, (Number(prev[sectionKey]) || 0) - 1),
          }));
        }

        await api.put(`/api/university-rep/seen/${entityType}/${entityId}`);
        triggerUniRepBadgeRefresh();
      } catch (err) {
        console.warn(`Failed to mark Uni Rep entity as seen (${entityType}/${entityId}):`, err?.message || err);
      }
    },
    [isUniRep]
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

  // Initial load and on Uni Rep page navigations
  useEffect(() => {
    if (isUniRep && location.pathname.startsWith('/university-rep')) {
      fetchCounts();
    }
  }, [fetchCounts, isUniRep, location.pathname]);

  // Window focus, custom event trigger, and 45s background polling
  useEffect(() => {
    if (!isUniRep) return;

    const handleEventRefresh = () => {
      fetchCounts();
    };

    const handleWindowFocus = () => {
      fetchCounts();
    };

    window.addEventListener(UNI_REP_BADGE_REFRESH_EVENT, handleEventRefresh);
    window.addEventListener('focus', handleWindowFocus);

    const interval = setInterval(fetchCounts, 45000);

    return () => {
      window.removeEventListener(UNI_REP_BADGE_REFRESH_EVENT, handleEventRefresh);
      window.removeEventListener('focus', handleWindowFocus);
      clearInterval(interval);
    };
  }, [fetchCounts, isUniRep]);

  const value = useMemo(
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

  return <UniRepBadgeContext.Provider value={value}>{children}</UniRepBadgeContext.Provider>;
};

export const useUniRepBadges = () => {
  const context = useContext(UniRepBadgeContext);
  if (!context) {
    throw new Error('useUniRepBadges must be used within an UniRepBadgeProvider');
  }
  return context;
};

export default UniRepBadgeContext;

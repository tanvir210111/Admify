import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from './AuthContext';

const initialCounts = {
  agents: 0,
  students: 0,
  applications: 0,
  serviceRequests: 0,
  universityPartnerships: 0,
  messages: 0,
  notifications: 0,
  reports: 0,
};

const initialStatusCounts = {
  applications: {},
  serviceRequests: {},
  agents: {},
  universityPartnerships: {},
  reports: {},
};

const AgencyBadgeContext = createContext({
  sidebarCounts: initialCounts,
  statusCounts: initialStatusCounts,
  isLoading: false,
  refreshSidebarCounts: () => Promise.resolve(),
  formatBadgeCount: (count) => '',
  markEntityAsSeen: (entityType, entityId) => Promise.resolve(),
  getStatusCount: (section, tabKey) => 0,
});

export const AGENCY_BADGE_REFRESH_EVENT = 'admify_agency_badge_refresh';

/**
 * Dispatches a lightweight refresh event to all listeners across the Agency panel.
 */
export const triggerAgencyBadgeRefresh = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(AGENCY_BADGE_REFRESH_EVENT));
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

export const AgencyBadgeProvider = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();
  const [sidebarCounts, setSidebarCounts] = useState(initialCounts);
  const [statusCounts, setStatusCounts] = useState(initialStatusCounts);
  const [isLoading, setIsLoading] = useState(false);

  const isAgency = useMemo(() => {
    return user && (user.role === 'agency' || user.accountType === 'agency');
  }, [user]);

  const fetchCounts = useCallback(async () => {
    if (!isAgency) return;

    try {
      setIsLoading(true);
      const res = await api.get('/api/agency/sidebar-counts');
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
      // Graceful fallback without disrupting agency operations
      console.warn('Agency badge fetch error:', err?.message || err);
    } finally {
      setIsLoading(false);
    }
  }, [isAgency]);

  const markEntityAsSeen = useCallback(
    async (entityType, entityId) => {
      if (!isAgency || !entityType || !entityId) return;

      try {
        // Optimistic UI decrement for sidebar and status
        const sectionMap = {
          application: 'applications',
          applications: 'applications',
          student: 'students',
          students: 'students',
          agent: 'agents',
          agents: 'agents',
          agentApplication: 'agents',
          agentApplications: 'agents',
          serviceRequest: 'serviceRequests',
          serviceRequests: 'serviceRequests',
          serviceOrder: 'serviceRequests',
          serviceOrders: 'serviceRequests',
          universityPartnership: 'universityPartnerships',
          universityPartnerships: 'universityPartnerships',
          university_connection: 'universityPartnerships',
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

        await api.put(`/api/agency/seen/${entityType}/${entityId}`);
        triggerAgencyBadgeRefresh();
      } catch (err) {
        console.warn(`Failed to mark agency entity as seen (${entityType}/${entityId}):`, err?.message || err);
      }
    },
    [isAgency]
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

  // Initial load and on agency page navigations
  useEffect(() => {
    if (isAgency && location.pathname.startsWith('/agency')) {
      fetchCounts();
    }
  }, [fetchCounts, isAgency, location.pathname]);

  // Window focus, custom event trigger, and 45s background polling
  useEffect(() => {
    if (!isAgency) return;

    const handleEventRefresh = () => {
      fetchCounts();
    };

    const handleWindowFocus = () => {
      fetchCounts();
    };

    window.addEventListener(AGENCY_BADGE_REFRESH_EVENT, handleEventRefresh);
    window.addEventListener('focus', handleWindowFocus);

    const interval = setInterval(fetchCounts, 45000);

    return () => {
      window.removeEventListener(AGENCY_BADGE_REFRESH_EVENT, handleEventRefresh);
      window.removeEventListener('focus', handleWindowFocus);
      clearInterval(interval);
    };
  }, [fetchCounts, isAgency]);

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

  return <AgencyBadgeContext.Provider value={value}>{children}</AgencyBadgeContext.Provider>;
};

export const useAgencyBadges = () => {
  const context = useContext(AgencyBadgeContext);
  if (!context) {
    throw new Error('useAgencyBadges must be used within an AgencyBadgeProvider');
  }
  return context;
};

export default AgencyBadgeContext;

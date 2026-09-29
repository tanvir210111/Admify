import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from './AuthContext';

const initialCounts = {
  students: 0,
  applications: 0,
  documents: 0,
  sopLor: 0,
  messages: 0,
  tasks: 0,
  notifications: 0,
  reports: 0,
  agency: 0,
};

const initialStatusCounts = {
  students: {},
  applications: {},
  documents: {},
  sopLor: {},
  messages: {},
  tasks: {},
  notifications: {},
  reports: {},
  agency: {},
};

const AgentBadgeContext = createContext({
  sidebarCounts: initialCounts,
  statusCounts: initialStatusCounts,
  isLoading: false,
  refreshSidebarCounts: () => Promise.resolve(),
  formatBadgeCount: (count) => '',
  markEntityAsSeen: (entityType, entityId) => Promise.resolve(),
  getStatusCount: (section, tabKey) => 0,
});

export const AGENT_BADGE_REFRESH_EVENT = 'admify_agent_badge_refresh';

/**
 * Dispatches a lightweight refresh event to all listeners across the Agent panel.
 */
export const triggerAgentBadgeRefresh = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(AGENT_BADGE_REFRESH_EVENT));
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

export const AgentBadgeProvider = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();
  const [sidebarCounts, setSidebarCounts] = useState(initialCounts);
  const [statusCounts, setStatusCounts] = useState(initialStatusCounts);
  const [isLoading, setIsLoading] = useState(false);

  const isAgent = useMemo(() => {
    return user && user.role === 'agent';
  }, [user]);

  const fetchCounts = useCallback(async () => {
    if (!isAgent) return;

    try {
      setIsLoading(true);
      const res = await api.get('/api/agent/sidebar-counts');
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
      // Graceful fallback without disrupting agent operations
      console.warn('Agent badge fetch error:', err?.message || err);
    } finally {
      setIsLoading(false);
    }
  }, [isAgent]);

  const markEntityAsSeen = useCallback(
    async (entityType, entityId) => {
      if (!isAgent || !entityType || !entityId) return;

      try {
        // Optimistic UI decrement for sidebar and status
        const sectionMap = {
          application: 'applications',
          applications: 'applications',
          student: 'students',
          students: 'students',
          document: 'documents',
          documents: 'documents',
          sop_lor: 'sopLor',
          sopLor: 'sopLor',
          message: 'messages',
          messages: 'messages',
          chat_message: 'messages',
          task: 'tasks',
          tasks: 'tasks',
          notification: 'notifications',
          notifications: 'notifications',
          report: 'reports',
          reports: 'reports',
          agency: 'agency',
        };

        const sectionKey = sectionMap[entityType];
        if (sectionKey) {
          setSidebarCounts((prev) => ({
            ...prev,
            [sectionKey]: Math.max(0, (Number(prev[sectionKey]) || 0) - 1),
          }));
        }

        await api.put(`/api/agent/seen/${entityType}/${entityId}`);
        triggerAgentBadgeRefresh();
      } catch (err) {
        console.warn(`Failed to mark agent entity as seen (${entityType}/${entityId}):`, err?.message || err);
      }
    },
    [isAgent]
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

  // Initial load and on agent page navigations
  useEffect(() => {
    if (isAgent && location.pathname.startsWith('/agent')) {
      fetchCounts();
    }
  }, [fetchCounts, isAgent, location.pathname]);

  // Window focus, custom event trigger, and 45s background polling
  useEffect(() => {
    if (!isAgent) return;

    const handleEventRefresh = () => {
      fetchCounts();
    };

    const handleWindowFocus = () => {
      fetchCounts();
    };

    window.addEventListener(AGENT_BADGE_REFRESH_EVENT, handleEventRefresh);
    window.addEventListener('focus', handleWindowFocus);

    const interval = setInterval(fetchCounts, 45000);

    return () => {
      window.removeEventListener(AGENT_BADGE_REFRESH_EVENT, handleEventRefresh);
      window.removeEventListener('focus', handleWindowFocus);
      clearInterval(interval);
    };
  }, [fetchCounts, isAgent]);

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
    <AgentBadgeContext.Provider value={contextValue}>
      {children}
    </AgentBadgeContext.Provider>
  );
};

export const useAgentBadges = () => useContext(AgentBadgeContext);
export default AgentBadgeContext;

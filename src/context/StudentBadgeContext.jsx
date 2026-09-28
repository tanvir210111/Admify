import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from './AuthContext';

const initialCounts = {
  directApplications: 0,
  applications: 0,
  agencyAssistance: 0,
  messages: 0,
  documents: 0,
  reports: 0,
  notifications: 0,
  scholarships: 0,
  recommendations: 0,
};

const initialStatusCounts = {
  applications: {},
  notifications: {},
  reports: {},
  directApplications: {},
  agencyAssistance: {},
  messages: {},
  documents: {},
  scholarships: {},
  recommendations: {},
};

const StudentBadgeContext = createContext({
  sidebarCounts: initialCounts,
  statusCounts: initialStatusCounts,
  isLoading: false,
  refreshSidebarCounts: () => Promise.resolve(),
  formatBadgeCount: (count) => '',
  markEntityAsSeen: (entityType, entityId) => Promise.resolve(),
  getStatusCount: (section, tabKey) => 0,
});

export const STUDENT_BADGE_REFRESH_EVENT = 'admify_student_badge_refresh';

/**
 * Dispatches a lightweight refresh event to all listeners across the Student panel.
 */
export const triggerStudentBadgeRefresh = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(STUDENT_BADGE_REFRESH_EVENT));
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

export const StudentBadgeProvider = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();
  const [sidebarCounts, setSidebarCounts] = useState(initialCounts);
  const [statusCounts, setStatusCounts] = useState(initialStatusCounts);
  const [isLoading, setIsLoading] = useState(false);

  const isStudent = useMemo(() => {
    return user && (user.role === 'student' || !user.role);
  }, [user]);

  const fetchCounts = useCallback(async () => {
    if (!isStudent) return;

    try {
      setIsLoading(true);
      const res = await api.get('/api/student/sidebar-counts');
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
      // Graceful fallback without disrupting student operations
      console.warn('Student badge fetch error:', err?.message || err);
    } finally {
      setIsLoading(false);
    }
  }, [isStudent]);

  const markEntityAsSeen = useCallback(
    async (entityType, entityId) => {
      if (!isStudent || !entityType || !entityId) return;

      try {
        // Optimistic UI decrement for sidebar and status
        const sectionMap = {
          application: 'applications',
          applications: 'applications',
          direct_application: 'directApplications',
          directApplications: 'directApplications',
          agency_order: 'agencyAssistance',
          agency_service_order: 'agencyAssistance',
          agencyAssistance: 'agencyAssistance',
          message: 'messages',
          messages: 'messages',
          chat_message: 'messages',
          support: 'messages',
          document: 'documents',
          documents: 'documents',
          report: 'reports',
          reports: 'reports',
          notification: 'notifications',
          notifications: 'notifications',
          scholarship: 'scholarships',
          scholarships: 'scholarships',
        };

        const sectionKey = sectionMap[entityType];
        if (sectionKey) {
          setSidebarCounts((prev) => ({
            ...prev,
            [sectionKey]: Math.max(0, (Number(prev[sectionKey]) || 0) - 1),
            ...(sectionKey === 'directApplications'
              ? { applications: Math.max(0, (Number(prev.applications) || 0) - 1) }
              : {}),
          }));
        }

        await api.put(`/api/student/seen/${entityType}/${entityId}`);
        triggerStudentBadgeRefresh();
      } catch (err) {
        console.warn(`Failed to mark student entity as seen (${entityType}/${entityId}):`, err?.message || err);
      }
    },
    [isStudent]
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

  // Initial load and on student page navigations
  useEffect(() => {
    if (isStudent && location.pathname.startsWith('/student')) {
      fetchCounts();
    }
  }, [fetchCounts, isStudent, location.pathname]);

  // Window focus, custom event trigger, and 45s background polling
  useEffect(() => {
    if (!isStudent) return;

    const handleEventRefresh = () => {
      fetchCounts();
    };

    const handleWindowFocus = () => {
      fetchCounts();
    };

    window.addEventListener(STUDENT_BADGE_REFRESH_EVENT, handleEventRefresh);
    window.addEventListener('focus', handleWindowFocus);

    const interval = setInterval(fetchCounts, 45000);

    return () => {
      window.removeEventListener(STUDENT_BADGE_REFRESH_EVENT, handleEventRefresh);
      window.removeEventListener('focus', handleWindowFocus);
      clearInterval(interval);
    };
  }, [fetchCounts, isStudent]);

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
    <StudentBadgeContext.Provider value={contextValue}>
      {children}
    </StudentBadgeContext.Provider>
  );
};

export const useStudentBadges = () => useContext(StudentBadgeContext);
export default StudentBadgeContext;

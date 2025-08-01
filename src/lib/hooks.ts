import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import useSWR from 'swr';
import { api } from './api';

// Debounce hook for search inputs
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Optimized data fetching hook with caching
export function useApiData<T>(
  key: string | null,
  fetcher: () => Promise<T>,
  options?: {
    refreshInterval?: number;
    revalidateOnFocus?: boolean;
    revalidateOnReconnect?: boolean;
  }
) {
  const { data, error, isLoading, mutate } = useSWR(
    key,
    fetcher,
    {
      refreshInterval: options?.refreshInterval || 0,
      revalidateOnFocus: options?.revalidateOnFocus ?? false,
      revalidateOnReconnect: options?.revalidateOnReconnect ?? true,
      dedupingInterval: 2000, // Dedupe requests within 2 seconds
      focusThrottleInterval: 5000, // Throttle focus revalidation
    }
  );

  return {
    data,
    error,
    isLoading,
    mutate,
    isError: !!error,
  };
}

// Optimized projects hook
export function useProjects(params?: {
  page?: number;
  limit?: number;
  difficulty?: string;
  status?: string;
}) {
  const cacheKey = params ? `projects:${JSON.stringify(params)}` : null;
  
  return useApiData(
    cacheKey,
    () => api.getProjects(params),
    {
      refreshInterval: 5 * 60 * 1000, // Refresh every 5 minutes
      revalidateOnFocus: false,
    }
  );
}

// Optimized dashboard stats hook
export function useDashboardStats() {
  return useApiData(
    'dashboard-stats',
    () => api.getDashboardStats(),
    {
      refreshInterval: 2 * 60 * 1000, // Refresh every 2 minutes
      revalidateOnFocus: false,
    }
  );
}

// Optimized progress stats hook
export function useProgressStats() {
  return useApiData(
    'progress-stats',
    () => api.getProgressStats(),
    {
      refreshInterval: 2 * 60 * 1000, // Refresh every 2 minutes
      revalidateOnFocus: false,
    }
  );
}

// Optimized today's project hook
export function useTodayProject() {
  return useApiData(
    'today-project',
    () => api.getTodayProject(),
    {
      refreshInterval: 1 * 60 * 1000, // Refresh every minute
      revalidateOnFocus: false,
    }
  );
}

// Optimized recent submissions hook
export function useRecentSubmissions() {
  return useApiData(
    'recent-submissions',
    () => api.getRecentSubmissions(),
    {
      refreshInterval: 1 * 60 * 1000, // Refresh every minute
      revalidateOnFocus: false,
    }
  );
}

// Optimized notifications hook
export function useNotifications() {
  return useApiData(
    'notifications',
    () => api.getNotifications(),
    {
      refreshInterval: 30 * 1000, // Refresh every 30 seconds
      revalidateOnFocus: true,
    }
  );
}

// Optimized admin stats hook
export function useAdminStats() {
  return useApiData(
    'admin-stats',
    () => api.getAdminStats(),
    {
      refreshInterval: 1 * 60 * 1000, // Refresh every minute
      revalidateOnFocus: false,
    }
  );
}

// Optimized admin recent activity hook
export function useAdminRecentActivity() {
  return useApiData(
    'admin-recent-activity',
    () => api.getAdminRecentActivity(),
    {
      refreshInterval: 30 * 1000, // Refresh every 30 seconds
      revalidateOnFocus: false,
    }
  );
}

// Optimized admin quick submissions hook
export function useAdminQuickSubmissions() {
  return useApiData(
    'admin-quick-submissions',
    () => api.getAdminQuickSubmissions(),
    {
      refreshInterval: 30 * 1000, // Refresh every 30 seconds
      revalidateOnFocus: false,
    }
  );
}

// Optimized leaderboard hook
export function useLeaderboard(params?: {
  page?: number;
  limit?: number;
  filter?: string;
  projectId?: string;
}) {
  const cacheKey = params ? `leaderboard:${JSON.stringify(params)}` : null;
  
  return useApiData(
    cacheKey,
    () => api.getLeaderboard(params),
    {
      refreshInterval: 1 * 60 * 1000, // Refresh every minute
      revalidateOnFocus: false,
    }
  );
}

// Optimized my rank hook
export function useMyRank() {
  return useApiData(
    'my-rank',
    () => api.getMyRank(),
    {
      refreshInterval: 2 * 60 * 1000, // Refresh every 2 minutes
      revalidateOnFocus: false,
    }
  );
}

// Optimized leaderboard stats hook
export function useLeaderboardStats() {
  return useApiData(
    'leaderboard-stats',
    () => api.getLeaderboardStats(),
    {
      refreshInterval: 2 * 60 * 1000, // Refresh every 2 minutes
      revalidateOnFocus: false,
    }
  );
}

// Optimized classes hook
export function useClasses(params?: {
  page?: number;
  limit?: number;
  status?: string;
}) {
  const cacheKey = params ? `classes:${JSON.stringify(params)}` : null;
  
  return useApiData(
    cacheKey,
    () => api.getClasses(params),
    {
      refreshInterval: 3 * 60 * 1000, // Refresh every 3 minutes
      revalidateOnFocus: false,
    }
  );
}

// Optimized assignments hook
export function useAssignments(params?: {
  page?: number;
  limit?: number;
  status?: string;
  classId?: string;
}) {
  const cacheKey = params ? `assignments:${JSON.stringify(params)}` : null;
  
  return useApiData(
    cacheKey,
    () => api.getAssignments(params),
    {
      refreshInterval: 3 * 60 * 1000, // Refresh every 3 minutes
      revalidateOnFocus: false,
    }
  );
}

// Optimized challenges hook
export function useChallenges(params?: {
  page?: number;
  limit?: number;
  status?: string;
}) {
  const cacheKey = params ? `challenges:${JSON.stringify(params)}` : null;
  
  return useApiData(
    cacheKey,
    () => api.getChallenges(params),
    {
      refreshInterval: 3 * 60 * 1000, // Refresh every 3 minutes
      revalidateOnFocus: false,
    }
  );
}

// Optimized payments hook
export function usePayments(params?: {
  page?: number;
  limit?: number;
  status?: string;
}) {
  const cacheKey = params ? `payments:${JSON.stringify(params)}` : null;
  
  return useApiData(
    cacheKey,
    () => api.getPayments(params),
    {
      refreshInterval: 2 * 60 * 1000, // Refresh every 2 minutes
      revalidateOnFocus: false,
    }
  );
}

// Optimized admin users hook
export function useAdminUsers(params?: {
  page?: number;
  limit?: number;
  role?: string;
  status?: string;
}) {
  const cacheKey = params ? `admin-users:${JSON.stringify(params)}` : null;
  
  return useApiData(
    cacheKey,
    () => api.getAdminUsers(params),
    {
      refreshInterval: 1 * 60 * 1000, // Refresh every minute
      revalidateOnFocus: false,
    }
  );
}

// Optimized admin payments hook
export function useAdminPayments(params?: {
  page?: number;
  limit?: number;
  status?: string;
  type?: string;
}) {
  const cacheKey = params ? `admin-payments:${JSON.stringify(params)}` : null;
  
  return useApiData(
    cacheKey,
    () => api.getAdminPayments(params),
    {
      refreshInterval: 1 * 60 * 1000, // Refresh every minute
      revalidateOnFocus: false,
    }
  );
}

// Optimized admin classes hook
export function useAdminClasses() {
  return useApiData(
    'admin-classes',
    () => api.getAdminClasses(),
    {
      refreshInterval: 2 * 60 * 1000, // Refresh every 2 minutes
      revalidateOnFocus: false,
    }
  );
}

// Optimized admin assignments hook
export function useAdminAssignments() {
  return useApiData(
    'admin-assignments',
    () => api.getAdminAssignments(),
    {
      refreshInterval: 2 * 60 * 1000, // Refresh every 2 minutes
      revalidateOnFocus: false,
    }
  );
}

// Optimized payment stats hook
export function usePaymentStats() {
  return useApiData(
    'payment-stats',
    () => api.getPaymentStats(),
    {
      refreshInterval: 2 * 60 * 1000, // Refresh every 2 minutes
      revalidateOnFocus: false,
    }
  );
}

// Optimized payment history hook
export function usePaymentHistory(params?: {
  page?: number;
  limit?: number;
}) {
  const cacheKey = params ? `payment-history:${JSON.stringify(params)}` : null;
  
  return useApiData(
    cacheKey,
    () => api.getPaymentHistory(params),
    {
      refreshInterval: 2 * 60 * 1000, // Refresh every 2 minutes
      revalidateOnFocus: false,
    }
  );
}

// Optimized my submissions hook
export function useMySubmissions(params?: {
  page?: number;
  limit?: number;
  status?: string;
}) {
  const cacheKey = params ? `my-submissions:${JSON.stringify(params)}` : null;
  
  return useApiData(
    cacheKey,
    () => api.getMySubmissions(params),
    {
      refreshInterval: 2 * 60 * 1000, // Refresh every 2 minutes
      revalidateOnFocus: false,
    }
  );
}

// Optimized project hook
export function useProject(id: string) {
  const cacheKey = id ? `project:${id}` : null;
  
  return useApiData(
    cacheKey,
    () => api.getProject(id),
    {
      refreshInterval: 5 * 60 * 1000, // Refresh every 5 minutes
      revalidateOnFocus: false,
    }
  );
}

// Optimized submission hook
export function useSubmission(id: string) {
  const cacheKey = id ? `submission:${id}` : null;
  
  return useApiData(
    cacheKey,
    () => api.getSubmission(id),
    {
      refreshInterval: 5 * 60 * 1000, // Refresh every 5 minutes
      revalidateOnFocus: false,
    }
  );
}

// Optimized class hook
export function useClass(id: string) {
  const cacheKey = id ? `class:${id}` : null;
  
  return useApiData(
    cacheKey,
    () => api.getClass(id),
    {
      refreshInterval: 5 * 60 * 1000, // Refresh every 5 minutes
      revalidateOnFocus: false,
    }
  );
}

// Optimized assignment hook
export function useAssignment(id: string) {
  const cacheKey = id ? `assignment:${id}` : null;
  
  return useApiData(
    cacheKey,
    () => api.getAssignment(id),
    {
      refreshInterval: 5 * 60 * 1000, // Refresh every 5 minutes
      revalidateOnFocus: false,
    }
  );
}

// Optimized challenge hook
export function useChallenge(id: string) {
  const cacheKey = id ? `challenge:${id}` : null;
  
  return useApiData(
    cacheKey,
    () => api.getChallenge(id),
    {
      refreshInterval: 5 * 60 * 1000, // Refresh every 5 minutes
      revalidateOnFocus: false,
    }
  );
}

// Optimized payment hook
export function usePayment(id: string) {
  const cacheKey = id ? `payment:${id}` : null;
  
  return useApiData(
    cacheKey,
    () => api.getPayment(id),
    {
      refreshInterval: 5 * 60 * 1000, // Refresh every 5 minutes
      revalidateOnFocus: false,
    }
  );
}

// Optimized user details hook
export function useUserDetails(id: string) {
  const cacheKey = id ? `user-details:${id}` : null;
  
  return useApiData(
    cacheKey,
    () => api.getUserDetails(id),
    {
      refreshInterval: 5 * 60 * 1000, // Refresh every 5 minutes
      revalidateOnFocus: false,
    }
  );
}

// Optimized admin project hook
export function useAdminProject(id: string) {
  const cacheKey = id ? `admin-project:${id}` : null;
  
  return useApiData(
    cacheKey,
    () => api.getAdminProject(id),
    {
      refreshInterval: 5 * 60 * 1000, // Refresh every 5 minutes
      revalidateOnFocus: false,
    }
  );
}

// Optimized admin class students hook
export function useAdminClassStudents(classId: string) {
  const cacheKey = classId ? `admin-class-students:${classId}` : null;
  
  return useApiData(
    cacheKey,
    () => api.getAdminClassStudents(classId),
    {
      refreshInterval: 2 * 60 * 1000, // Refresh every 2 minutes
      revalidateOnFocus: false,
    }
  );
}

// Optimized class assignments hook
export function useClassAssignments(classId: string, params?: {
  page?: number;
  limit?: number;
  status?: string;
}) {
  const cacheKey = classId ? `class-assignments:${classId}:${JSON.stringify(params)}` : null;
  
  return useApiData(
    cacheKey,
    () => api.getClassAssignments(classId, params),
    {
      refreshInterval: 2 * 60 * 1000, // Refresh every 2 minutes
      revalidateOnFocus: false,
    }
  );
}

// Optimized assignment submissions hook
export function useAssignmentSubmissions(assignmentId: string, params?: {
  page?: number;
  limit?: number;
  status?: string;
}) {
  const cacheKey = assignmentId ? `assignment-submissions:${assignmentId}:${JSON.stringify(params)}` : null;
  
  return useApiData(
    cacheKey,
    () => api.getAssignmentSubmissions(assignmentId, params),
    {
      refreshInterval: 1 * 60 * 1000, // Refresh every minute
      revalidateOnFocus: false,
    }
  );
}

// Optimized challenge leaderboard hook
export function useChallengeLeaderboard(challengeId: string, params?: {
  page?: number;
  limit?: number;
  filter?: string;
}) {
  const cacheKey = challengeId ? `challenge-leaderboard:${challengeId}:${JSON.stringify(params)}` : null;
  
  return useApiData(
    cacheKey,
    () => api.getChallengeLeaderboard(challengeId, params),
    {
      refreshInterval: 1 * 60 * 1000, // Refresh every minute
      revalidateOnFocus: false,
    }
  );
}

// Optimized project leaderboard hook
export function useProjectLeaderboard(projectId: string, params?: {
  page?: number;
  limit?: number;
}) {
  const cacheKey = projectId ? `project-leaderboard:${projectId}:${JSON.stringify(params)}` : null;
  
  return useApiData(
    cacheKey,
    () => api.getProjectLeaderboard(projectId, params),
    {
      refreshInterval: 1 * 60 * 1000, // Refresh every minute
      revalidateOnFocus: false,
    }
  );
}

// Optimized streak leaderboard hook
export function useStreakLeaderboard(params?: {
  page?: number;
  limit?: number;
}) {
  const cacheKey = params ? `streak-leaderboard:${JSON.stringify(params)}` : null;
  
  return useApiData(
    cacheKey,
    () => api.getStreakLeaderboard(params),
    {
      refreshInterval: 1 * 60 * 1000, // Refresh every minute
      revalidateOnFocus: false,
    }
  );
}

// Optimized progress hook
export function useProgress(userId: string) {
  const cacheKey = userId ? `progress:${userId}` : null;
  
  return useApiData(
    cacheKey,
    () => api.getProgress(userId),
    {
      refreshInterval: 2 * 60 * 1000, // Refresh every 2 minutes
      revalidateOnFocus: false,
    }
  );
}

// Optimized project stats hook
export function useProjectStats(id: string) {
  const cacheKey = id ? `project-stats:${id}` : null;
  
  return useApiData(
    cacheKey,
    () => api.getProjectStats(id),
    {
      refreshInterval: 2 * 60 * 1000, // Refresh every 2 minutes
      revalidateOnFocus: false,
    }
  );
}

// Optimized all submissions hook
export function useAllSubmissions(params?: {
  page?: number;
  limit?: number;
  status?: string;
  projectId?: string;
  userId?: string;
}) {
  const cacheKey = params ? `all-submissions:${JSON.stringify(params)}` : null;
  
  return useApiData(
    cacheKey,
    () => api.getAllSubmissions(params),
    {
      refreshInterval: 1 * 60 * 1000, // Refresh every minute
      revalidateOnFocus: false,
    }
  );
}

// Optimized admin submissions hook
export function useAdminSubmissions() {
  return useApiData(
    'admin-submissions',
    () => api.getAdminSubmissions(),
    {
      refreshInterval: 1 * 60 * 1000, // Refresh every minute
      revalidateOnFocus: false,
    }
  );
}

// Optimized infinite scroll hook
export function useInfiniteScroll<T>(
  fetcher: (page: number) => Promise<{ data: T[]; total: number; page: number; totalPages: number }>,
  pageSize: number = 10
) {
  const [data, setData] = useState<T[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    setError(null);

    try {
      const result = await fetcher(page);
      setData(prev => [...prev, ...result.data]);
      setHasMore(page < result.totalPages);
      setPage(prev => prev + 1);
    } catch (err: any) {
      setError(err.message || 'Failed to load more data');
    } finally {
      setLoading(false);
    }
  }, [fetcher, page, loading, hasMore]);

  const reset = useCallback(() => {
    setData([]);
    setPage(1);
    setHasMore(true);
    setError(null);
  }, []);

  return {
    data,
    loading,
    error,
    hasMore,
    loadMore,
    reset,
  };
}

// Optimized intersection observer hook for infinite scroll
export function useIntersectionObserver(
  callback: () => void,
  options: IntersectionObserverInit = {}
) {
  const observerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          callback();
        }
      });
    }, options);

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => {
      if (observerRef.current) {
        observer.unobserve(observerRef.current);
      }
    };
  }, [callback, options]);

  return observerRef;
}

// Optimized local storage hook
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue] as const;
}

// Optimized session storage hook
export function useSessionStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.sessionStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading sessionStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      
      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Error setting sessionStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue] as const;
}

// Optimized media query hook
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }

    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    
    return () => media.removeEventListener('change', listener);
  }, [matches, query]);

  return matches;
}

// Optimized window size hook
export function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
}

// Optimized scroll position hook
export function useScrollPosition() {
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleScroll = () => {
      setScrollPosition(window.pageYOffset);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return scrollPosition;
}

// Optimized click outside hook
export function useClickOutside(ref: React.RefObject<HTMLElement>, handler: () => void) {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      handler();
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
}

// Optimized keyboard hook
export function useKeyboard(keys: string[], callback: () => void) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (keys.includes(event.key)) {
        callback();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [keys, callback]);
}

// Optimized previous value hook
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

// Optimized mounted hook
export function useMounted() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted;
}

// Optimized online status hook
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

// Optimized network status hook
export function useNetworkStatus() {
  const [networkStatus, setNetworkStatus] = useState({
    effectiveType: 'unknown' as 'slow-2g' | '2g' | '3g' | '4g' | 'unknown',
    downlink: 0,
    rtt: 0,
    saveData: false,
  });

  useEffect(() => {
    if (typeof navigator === 'undefined' || !(navigator as any).connection) return;

    const updateNetworkInfo = () => {
      const connection = (navigator as any).connection;
      setNetworkStatus({
        effectiveType: connection.effectiveType || 'unknown',
        downlink: connection.downlink || 0,
        rtt: connection.rtt || 0,
        saveData: connection.saveData || false,
      });
    };

    updateNetworkInfo();
    (navigator as any).connection?.addEventListener('change', updateNetworkInfo);

    return () => {
      (navigator as any).connection?.removeEventListener('change', updateNetworkInfo);
    };
  }, []);

  return networkStatus;
}

// Optimized performance monitoring hook
export function usePerformanceMonitoring() {
  const [metrics, setMetrics] = useState({
    fcp: 0,
    lcp: 0,
    fid: 0,
    cls: 0,
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return;

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        switch (entry.entryType) {
          case 'first-contentful-paint':
            setMetrics(prev => ({ ...prev, fcp: entry.startTime }));
            break;
          case 'largest-contentful-paint':
            setMetrics(prev => ({ ...prev, lcp: entry.startTime }));
            break;
          case 'first-input':
            if ('processingStart' in entry) {
              setMetrics(prev => ({ ...prev, fid: (entry as PerformanceEventTiming).processingStart - entry.startTime }));
            }
            break;
          case 'layout-shift':
            setMetrics(prev => ({ ...prev, cls: prev.cls + (entry as any).value }));
            break;
        }
      }
    });

    observer.observe({ entryTypes: ['first-contentful-paint', 'largest-contentful-paint', 'first-input', 'layout-shift'] });

    return () => observer.disconnect();
  }, []);

  return metrics;
} 
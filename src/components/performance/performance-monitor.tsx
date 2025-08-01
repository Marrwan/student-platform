'use client';

import { useEffect, useState, useCallback } from 'react';
import { usePerformanceMonitoring, useOnlineStatus, useNetworkStatus } from '@/lib/hooks';

interface PerformanceMetrics {
  fcp: number;
  lcp: number;
  fid: number;
  cls: number;
}

interface PerformanceMonitorProps {
  enabled?: boolean;
  onMetricsUpdate?: (metrics: PerformanceMetrics) => void;
}

export function PerformanceMonitor({ 
  enabled = process.env.NODE_ENV === 'development',
  onMetricsUpdate 
}: PerformanceMonitorProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fcp: 0,
    lcp: 0,
    fid: 0,
    cls: 0,
  });
  
  const isOnline = useOnlineStatus();
  const networkStatus = useNetworkStatus();
  const performanceMetrics = usePerformanceMonitoring();

  // Update metrics when performance data changes
  useEffect(() => {
    if (performanceMetrics) {
      setMetrics(performanceMetrics);
      onMetricsUpdate?.(performanceMetrics);
    }
  }, [performanceMetrics, onMetricsUpdate]);

  // Toggle visibility with keyboard shortcut (Ctrl+Shift+P)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey && event.key === 'P') {
        event.preventDefault();
        setIsVisible(prev => !prev);
      }
    };

    if (enabled) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [enabled]);

  // Don't render if not enabled
  if (!enabled) {
    return null;
  }

  const getMetricColor = (metric: string, value: number) => {
    switch (metric) {
      case 'fcp':
        return value < 1800 ? 'text-green-600' : value < 3000 ? 'text-yellow-600' : 'text-red-600';
      case 'lcp':
        return value < 2500 ? 'text-green-600' : value < 4000 ? 'text-yellow-600' : 'text-red-600';
      case 'fid':
        return value < 100 ? 'text-green-600' : value < 300 ? 'text-yellow-600' : 'text-red-600';
      case 'cls':
        return value < 0.1 ? 'text-green-600' : value < 0.25 ? 'text-yellow-600' : 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getMetricLabel = (metric: string) => {
    switch (metric) {
      case 'fcp': return 'First Contentful Paint';
      case 'lcp': return 'Largest Contentful Paint';
      case 'fid': return 'First Input Delay';
      case 'cls': return 'Cumulative Layout Shift';
      default: return metric;
    }
  };

  const formatMetric = (metric: string, value: number) => {
    switch (metric) {
      case 'fcp':
      case 'lcp':
      case 'fid':
        return `${Math.round(value)}ms`;
      case 'cls':
        return value.toFixed(3);
      default:
        return value.toString();
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 z-50 max-w-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
          Performance Monitor
        </h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          ✕
        </button>
      </div>

      {/* Connection Status */}
      <div className="mb-3 p-2 rounded bg-gray-50 dark:bg-gray-700">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-600 dark:text-gray-300">Connection:</span>
          <span className={`font-medium ${isOnline ? 'text-green-600' : 'text-red-600'}`}>
            {isOnline ? 'Online' : 'Offline'}
          </span>
        </div>
        {isOnline && networkStatus.effectiveType !== 'unknown' && (
          <div className="flex items-center justify-between text-xs mt-1">
            <span className="text-gray-600 dark:text-gray-300">Network:</span>
            <span className="font-medium text-blue-600">
              {networkStatus.effectiveType.toUpperCase()} ({networkStatus.downlink}Mbps)
            </span>
          </div>
        )}
      </div>

      {/* Performance Metrics */}
      <div className="space-y-2">
        {Object.entries(metrics).map(([metric, value]) => (
          <div key={metric} className="flex items-center justify-between text-xs">
            <span className="text-gray-600 dark:text-gray-300">
              {getMetricLabel(metric)}:
            </span>
            <span className={`font-medium ${getMetricColor(metric, value)}`}>
              {formatMetric(metric, value)}
            </span>
          </div>
        ))}
      </div>

      {/* Performance Score */}
      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-600 dark:text-gray-300">Performance Score:</span>
          <span className="font-medium text-green-600">
            {calculatePerformanceScore(metrics)}/100
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
        <div className="flex gap-2">
          <button
            onClick={() => window.location.reload()}
            className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Reload
          </button>
          <button
            onClick={() => {
              if ('caches' in window) {
                caches.keys().then(names => {
                  names.forEach(name => caches.delete(name));
                });
              }
            }}
            className="text-xs px-2 py-1 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Clear Cache
          </button>
        </div>
      </div>
    </div>
  );
}

// Calculate overall performance score
function calculatePerformanceScore(metrics: PerformanceMetrics): number {
  let score = 100;

  // FCP scoring (0-25 points)
  if (metrics.fcp > 3000) score -= 25;
  else if (metrics.fcp > 1800) score -= 15;
  else if (metrics.fcp > 1000) score -= 5;

  // LCP scoring (0-25 points)
  if (metrics.lcp > 4000) score -= 25;
  else if (metrics.lcp > 2500) score -= 15;
  else if (metrics.lcp > 1500) score -= 5;

  // FID scoring (0-25 points)
  if (metrics.fid > 300) score -= 25;
  else if (metrics.fid > 100) score -= 15;
  else if (metrics.fid > 50) score -= 5;

  // CLS scoring (0-25 points)
  if (metrics.cls > 0.25) score -= 25;
  else if (metrics.cls > 0.1) score -= 15;
  else if (metrics.cls > 0.05) score -= 5;

  return Math.max(0, score);
}

// Performance monitoring hook
export function usePerformanceMonitor() {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = useCallback(() => {
    setIsVisible(prev => !prev);
  }, []);

  const showMonitor = useCallback(() => {
    setIsVisible(true);
  }, []);

  const hideMonitor = useCallback(() => {
    setIsVisible(false);
  }, []);

  return {
    isVisible,
    toggleVisibility,
    showMonitor,
    hideMonitor,
  };
}

// Performance reporting utility
export function reportPerformanceMetrics(metrics: PerformanceMetrics) {
  // Send to analytics service
  if (typeof window !== 'undefined' && typeof (window as any).gtag === 'function') {
    (window as any).gtag('event', 'performance_metrics', {
      event_category: 'performance',
      event_label: 'web_vitals',
      value: calculatePerformanceScore(metrics),
      custom_map: {
        fcp: metrics.fcp,
        lcp: metrics.lcp,
        fid: metrics.fid,
        cls: metrics.cls,
      },
    });
  }

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.group('Performance Metrics');
    console.log('FCP:', metrics.fcp, 'ms');
    console.log('LCP:', metrics.lcp, 'ms');
    console.log('FID:', metrics.fid, 'ms');
    console.log('CLS:', metrics.cls);
    console.log('Score:', calculatePerformanceScore(metrics), '/100');
    console.groupEnd();
  }
}

// Performance observer setup
export function setupPerformanceObserver() {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
    return;
  }

  const observer = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    const metrics: PerformanceMetrics = {
      fcp: 0,
      lcp: 0,
      fid: 0,
      cls: 0,
    };

    entries.forEach((entry) => {
      switch (entry.entryType) {
        case 'first-contentful-paint':
          metrics.fcp = entry.startTime;
          break;
        case 'largest-contentful-paint':
          metrics.lcp = entry.startTime;
          break;
        case 'first-input':
          if ('processingStart' in entry) {
            metrics.fid = (entry as PerformanceEventTiming).processingStart - entry.startTime;
          }
          break;
        case 'layout-shift':
          metrics.cls += (entry as any).value;
          break;
      }
    });

    // Report metrics if any are available
    if (Object.values(metrics).some(value => value > 0)) {
      reportPerformanceMetrics(metrics);
    }
  });

  try {
    observer.observe({ 
      entryTypes: ['first-contentful-paint', 'largest-contentful-paint', 'first-input', 'layout-shift'] 
    });
  } catch (error) {
    console.warn('PerformanceObserver not supported:', error);
  }
}

// Initialize performance monitoring
if (typeof window !== 'undefined') {
  setupPerformanceObserver();
} 
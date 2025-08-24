'use client';

import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

// Lazy load header to reduce initial bundle size
const Header = dynamic(() => import('@/components/layout/header'), {
  ssr: true,
  loading: () => (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="animate-pulse bg-gray-200 h-8 w-32 rounded"></div>
          <div className="animate-pulse bg-gray-200 h-8 w-24 rounded"></div>
        </div>
      </div>
    </header>
  ),
});

export default function ConditionalHeader() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Don't render anything until mounted to prevent hydration issues
  if (!mounted) {
    return null;
  }
  
  // Don't render header on homepage
  if (pathname === '/') {
    return null;
  }
  
  try {
    return <Header />;
  } catch (error) {
    console.error('Error rendering header:', error);
    return null;
  }
}

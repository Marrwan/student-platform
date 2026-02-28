'use client';

import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

// Lazy load header to reduce initial bundle size
const Header = dynamic(() => import('@/components/layout/header'), {
  ssr: true,
  loading: () => (
    <header className="border-b border-border/50 bg-background/80 backdrop-blur-xl sticky top-0 z-50 h-14 sm:h-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-full">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 animate-pulse"></div>
            <div className="bg-white/5 h-6 w-24 rounded animate-pulse"></div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="bg-white/5 h-8 w-20 rounded-md animate-pulse"></div>
            <div className="bg-white/5 h-8 w-8 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    </header>
  ),
});

export default function ConditionalHeader() {
  const pathname = usePathname();

  // Don't render header on homepage
  if (pathname === '/') {
    return null;
  }

  // Don't render global header on HRMS pages (they have their own layouts)
  if (pathname?.startsWith('/hrms')) {
    return null;
  }

  try {
    return <Header />;
  } catch (error) {
    console.error('Error rendering header:', error);
    return null;
  }
}

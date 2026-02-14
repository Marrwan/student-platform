import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '@/components/providers/auth-provider'
import ErrorBoundaryClient from '@/components/ErrorBoundaryClient';
import { PerformanceMonitor } from '@/components/performance/performance-monitor';
import ConditionalHeader from '@/components/layout/conditional-header';
import Script from 'next/script';

// Optimize font loading
const inter = Inter({
  subsets: ['latin'],
  display: 'swap', // Optimize font loading
  preload: true,
  fallback: ['system-ui', 'arial'],
});

export const metadata: Metadata = {
  title: 'Learning Platform',
  description: 'A comprehensive learning platform for structured programming education with assignments, progress tracking, and expert feedback',
  keywords: ['Programming', 'Learning', 'Education', 'Assignments', 'Progress Tracking', 'Web Development'],
  authors: [{ name: 'Learning Platform Team' }],
  icons: {
    icon: '/logo.jpeg',
    shortcut: '/logo.jpeg',
    apple: '/logo.jpeg',
  },
  // Performance optimizations
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  // Open Graph
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://learning-platform.com',
    title: 'Learning Platform',
    description: 'A comprehensive learning platform for structured programming education',
    siteName: 'Learning Platform',
  },
  // Twitter
  twitter: {
    card: 'summary_large_image',
    title: 'Learning Platform',
    description: 'A comprehensive learning platform for structured programming education',
  },
  // Performance hints
  other: {
    'theme-color': '#3B82F6',
    'color-scheme': 'light dark',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#3B82F6',
}

// Error fallback component
function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-red-50 text-red-800 p-4">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
        <p className="text-sm mb-6 text-red-600">
          {error.message || 'An unexpected error occurred'}
        </p>
        <div className="space-y-3">
          <button
            onClick={resetErrorBoundary}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Try again
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="w-full px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
          >
            Go to homepage
          </button>
        </div>
      </div>
    </div>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.className}>
      <head>
        {/* Favicon */}
        <link rel="icon" type="image/jpeg" href="/logo.jpeg" style={{ borderRadius: '50%' }} />
        <link rel="shortcut icon" type="image/jpeg" href="/logo.jpeg" style={{ borderRadius: '50%' }} />
        <link rel="apple-touch-icon" href="/logo.jpeg" style={{ borderRadius: '50%' }} />

        {/* Preload critical resources */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* DNS prefetch for external domains */}
        <link rel="dns-prefetch" href="//via.placeholder.com" />
        <link rel="dns-prefetch" href="//images.unsplash.com" />

        {/* Preload critical CSS */}
        <link rel="preload" href="/globals.css" as="style" />

        {/* Preload critical images */}
        <link rel="preload" href="/logo.jpeg" as="image" type="image/jpeg" />

        {/* Performance monitoring */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Performance monitoring
              if ('performance' in window) {
                window.addEventListener('load', function() {
                  setTimeout(function() {
                    const perfData = performance.getEntriesByType('navigation')[0];
                    if (perfData) {
                      console.log('Page Load Time:', perfData.loadEventEnd - perfData.loadEventStart, 'ms');
                      console.log('DOM Content Loaded:', perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart, 'ms');
                    }
                  }, 0);
                });
              }
              
              // Service Worker registration for offline support
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').catch(function(err) {
                    console.log('ServiceWorker registration failed: ', err);
                  });
                });
              }
            `,
          }}
        />
        {/* Paystack Inline Script */}
        <Script src="https://js.paystack.co/v1/inline.js" strategy="lazyOnload" />
      </head>
      <body className={`${inter.className} antialiased`}>
        <ErrorBoundaryClient>
          <AuthProvider>
            <div className="min-h-screen flex flex-col">
              <ConditionalHeader />
              <main className="flex-1">
                {children}
              </main>
            </div>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: 'hsl(var(--background))',
                  color: 'hsl(var(--foreground))',
                  border: '1px solid hsl(var(--border))',
                },
              }}
            />
            <PerformanceMonitor />
          </AuthProvider>
        </ErrorBoundaryClient>

        {/* Performance monitoring script */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Web Vitals monitoring
              if ('PerformanceObserver' in window) {
                const observer = new PerformanceObserver((list) => {
                  list.getEntries().forEach((entry) => {
                    if (entry.entryType === 'largest-contentful-paint') {
                      console.log('LCP:', entry.startTime, 'ms');
                    }
                    if (entry.entryType === 'first-input') {
                      console.log('FID:', entry.processingStart - entry.startTime, 'ms');
                    }
                    if (entry.entryType === 'layout-shift') {
                      console.log('CLS:', entry.value);
                    }
                  });
                });
                
                observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });
              }
            `,
          }}
        />
      </body>
    </html>
  )
} 
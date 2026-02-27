import type { Metadata, Viewport } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
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

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-jetbrains-mono',
});

export const metadata: Metadata = {
  title: 'Nexus',
  description: 'A comprehensive Nexus Systems for structured programming education with assignments, progress tracking, and expert feedback',
  keywords: ['Programming', 'Learning', 'Education', 'Assignments', 'Progress Tracking', 'Web Development'],
  authors: [{ name: 'Nexus Team' }],
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
    title: 'Nexus',
    description: 'A comprehensive Nexus Systems for structured programming education',
    siteName: 'Nexus',
  },
  // Twitter
  twitter: {
    card: 'summary_large_image',
    title: 'Nexus',
    description: 'A comprehensive Nexus Systems for structured programming education',
  },
  // Performance hints
  other: {
    'theme-color': '#0a0b10',
    'color-scheme': 'dark',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#0a0b10',
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
    <html lang="en" className={`dark ${inter.className} ${jetbrainsMono.variable}`}>
      <head>
        {/* Favicon */}
        <link rel="icon" type="image/jpeg" href="/logo.jpeg" />
        <link rel="shortcut icon" type="image/jpeg" href="/logo.jpeg" />
        <link rel="apple-touch-icon" href="/logo.jpeg" />

        {/* Preload critical resources */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* DNS prefetch for external domains */}
        <link rel="dns-prefetch" href="//via.placeholder.com" />
        <link rel="dns-prefetch" href="//images.unsplash.com" />

        {/* Preload critical images */}
        <link rel="preload" href="/logo.jpeg" as="image" type="image/jpeg" />

        {/* Performance monitoring */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Performance monitoring and Cache Purge (ES5 for broad compatibility)
              (function() {
                try {
                  if ('performance' in window && typeof performance.getEntriesByType === 'function') {
                    window.addEventListener('load', function() {
                      setTimeout(function() {
                        var entries = performance.getEntriesByType('navigation');
                        if (entries && entries.length > 0) {
                          var perfData = entries[0];
                          console.log('Page Load Time:', perfData.loadEventEnd - perfData.loadEventStart, 'ms');
                        }
                      }, 0);
                    });
                  }

                  // UNCOMPROMISING_CACHE_PURGE: Unregister any existing Service Workers and clear caches
                  if ('serviceWorker' in navigator && typeof navigator.serviceWorker.getRegistrations === 'function') {
                    window.addEventListener('load', function() {
                      navigator.serviceWorker.getRegistrations().then(function(registrations) {
                        if (registrations && registrations.length > 0) {
                          for (var i = 0; i < registrations.length; i++) {
                            registrations[i].unregister();
                          }
                          console.log('SW_UNREGISTERED_OK');
                        }
                      })['catch'](function(err) {
                        console.warn('SW_REG_ERR:', err);
                      });

                      // Force clear caches
                      if ('caches' in window && typeof caches.keys === 'function') {
                        caches.keys().then(function(names) {
                          if (names && names.length > 0) {
                            for (var j = 0; j < names.length; j++) {
                              caches['delete'](names[j]);
                            }
                            console.log('CACHE_PURGE_COMPLETE');
                          }
                        })['catch'](function(err) {
                          console.warn('CACHE_ERR:', err);
                        });
                      }
                    });
                  }
                } catch (e) {
                  // Silent catch to prevent script-based page blocks
                  if (console && console.error) console.error('INIT_ERR:', e);
                }
              })();
            `,
          }}
        />
        {/* Paystack Popup Script (for modals that use PaystackPop). Assignment late-fee uses redirect, not this script. */}
        <Script src="https://js.paystack.co/v1/popup.js" strategy="lazyOnload" />
      </head>
      <body className={`${inter.className} ${jetbrainsMono.variable} antialiased selection:bg-neon-cyan/30`}>
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
              // Web Vitals monitoring (ES5)
              (function() {
                try {
                  if ('PerformanceObserver' in window) {
                    var observer = new PerformanceObserver(function(list) {
                      var entries = list.getEntries();
                      for (var i = 0; i < entries.length; i++) {
                        var entry = entries[i];
                        if (entry.entryType === 'largest-contentful-paint') {
                          console.log('LCP:', entry.startTime, 'ms');
                        }
                        if (entry.entryType === 'first-input') {
                          console.log('FID:', entry.processingStart - entry.startTime, 'ms');
                        }
                        if (entry.entryType === 'layout-shift') {
                          console.log('CLS:', entry.value);
                        }
                      }
                    });
                    
                    observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });
                  }
                } catch (e) {
                  // Silent catch
                }
              })();
            `,
          }}
        />
      </body>
    </html>
  )
} 
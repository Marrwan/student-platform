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
    <html lang="en" className="dark">
      <head>
        {/* NUCLEAR CACHE RECOVERY SCRIPT */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var VERSION_ID = "v1_${Date.now()}"; // Unique build ID
                  var STORED_VERSION = localStorage.getItem('NEXUS_UI_VERSION');
                  
                  // 1. Version Parity Check (Force Refresh on New Build)
                  if (STORED_VERSION && STORED_VERSION !== VERSION_ID) {
                    console.warn('New deployment detected. Purging systematic cache...');
                    if ('serviceWorker' in navigator) {
                      navigator.serviceWorker.getRegistrations().then(function(regs) {
                        for (var i = 0; i < regs.length; i++) regs[i].unregister();
                      });
                    }
                    if ('caches' in window) {
                      caches.keys().then(function(keys) {
                        for (var i = 0; i < keys.length; i++) caches.delete(keys[i]);
                      });
                    }
                    localStorage.setItem('NEXUS_UI_VERSION', VERSION_ID);
                    window.location.reload(true);
                  } else {
                    localStorage.setItem('NEXUS_UI_VERSION', VERSION_ID);
                  }

                  // 2. Continuous Chunk Error Recovery
                  window.addEventListener('error', function(e) {
                    if (e && e.message && e.message.indexOf('ChunkLoadError') !== -1) {
                      window.location.reload();
                    }
                  }, true);

                  window.addEventListener('unhandledrejection', function(e) {
                    var msg = e.reason && (e.reason.message || e.reason.name || '');
                    if (msg && msg.indexOf('ChunkLoadError') !== -1) {
                      window.location.reload();
                    }
                  });
                } catch (err) {}
              })();
            `,
          }}
        />

        {/* Prevent Browser-Level Index Caching */}
        <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
        <meta httpEquiv="Pragma" content="no-cache" />
        <meta httpEquiv="Expires" content="0" />

        {/* Favicon */}
        <link rel="icon" type="image/jpeg" href="/logo.jpeg" />
        <link rel="shortcut icon" type="image/jpeg" href="/logo.jpeg" />
        <link rel="apple-touch-icon" href="/logo.jpeg" />

        {/* DNS prefetch */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* Metadata and preloads */}
        <link rel="preload" href="/logo.jpeg" as="image" type="image/jpeg" />
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

      </body>
    </html >
  )
} 
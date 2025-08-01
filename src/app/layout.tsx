import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '@/components/providers/auth-provider'
import { ErrorBoundary } from 'react-error-boundary';
import Header from '@/components/layout/header';

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Learning Platform',
  description: 'A comprehensive learning platform for structured programming education with assignments, progress tracking, and expert feedback',
  keywords: ['Programming', 'Learning', 'Education', 'Assignments', 'Progress Tracking', 'Web Development'],
  authors: [{ name: 'Learning Platform Team' }],
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ErrorBoundary fallback={<div className="min-h-screen flex flex-col items-center justify-center bg-red-50 text-red-800"><h1 className="text-2xl font-bold mb-4">Something went wrong</h1><p>Please refresh the page or contact support.</p></div>}>
          <AuthProvider>
            <div className="min-h-screen flex flex-col">
              <Header />
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
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
} 
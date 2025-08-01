'use client';
import { ErrorBoundary } from 'react-error-boundary';
import React from 'react';

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

export default function ErrorBoundaryClient({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      fallbackRender={({ error, resetErrorBoundary }) => (
        <ErrorFallback error={error} resetErrorBoundary={resetErrorBoundary} />
      )}
      onError={(error, errorInfo) => {
        // Log error to monitoring service
        console.error('Application Error:', error, errorInfo);
      }}
      onReset={() => {
        // Clear any cached data or state
        if (typeof window !== 'undefined') {
          window.location.reload();
        }
      }}
    >
      {children}
    </ErrorBoundary>
  );
}
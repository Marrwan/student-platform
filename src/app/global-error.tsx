'use client'

import { Button } from '@/components/ui/button'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {error.message || 'An unexpected error occurred'}
            </p>
            <Button onClick={reset}>
              Try again
            </Button>
          </div>
        </div>
      </body>
    </html>
  )
} 
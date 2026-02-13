import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';

export default function AdminAnalyticsPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-8">
      <Card className="w-full max-w-2xl mx-auto shadow-xl">
        <CardHeader>
          <CardTitle>Admin Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-lg text-gray-700 dark:text-gray-200 py-12">
            <div className="flex flex-col items-center gap-4">
              <TrendingUp className="h-16 w-16 text-blue-500 animate-pulse" />
              <p className="font-medium text-xl">Analytics Engine Warming Up</p>
              <p className="text-sm text-gray-500 max-w-sm">
                We are currently aggregating your platform data. Real-time insights will appear here once enough submission data is collected.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 
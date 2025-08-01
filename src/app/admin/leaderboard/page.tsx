import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function AdminLeaderboardPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-8">
      <Card className="w-full max-w-2xl mx-auto shadow-xl">
        <CardHeader>
          <CardTitle>Admin Leaderboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-lg text-gray-700 dark:text-gray-200 py-12">
            🏆 <span className="font-semibold">Leaderboard admin page coming soon!</span> 🏆
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 
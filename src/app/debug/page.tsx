'use client';

import { useAuth } from '@/components/providers/auth-provider';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DebugPage() {
  const { user, loading, login } = useAuth();
  const [testResult, setTestResult] = useState<string>('');

  const testLogin = async () => {
    try {
      setTestResult('Testing login...');
      await login('admin@javascriptchallenge.com', 'admin123');
      setTestResult('Login successful!');
    } catch (error: any) {
      setTestResult(`Login failed: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Debug Page</h1>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Auth State</CardTitle>
          </CardHeader>
          <CardContent>
            <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
            <p><strong>User:</strong> {user ? JSON.stringify(user, null, 2) : 'None'}</p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Test Login</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={testLogin} className="mb-4">
              Test Admin Login
            </Button>
            <p><strong>Result:</strong> {testResult}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button onClick={() => window.location.href = '/login'} variant="outline" className="w-full">
              Go to Login Page
            </Button>
            <Button onClick={() => window.location.href = '/dashboard'} variant="outline" className="w-full">
              Go to Dashboard
            </Button>
            <Button onClick={() => window.location.href = '/admin'} variant="outline" className="w-full">
              Go to Admin
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 
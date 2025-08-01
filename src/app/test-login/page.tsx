'use client';

import { useState } from 'react';
import { useAuth } from '@/components/providers/auth-provider';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TestLoginPage() {
  const { user, loading } = useAuth();
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isTesting, setIsTesting] = useState(false);

  const addLog = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testLogin = async () => {
    setIsTesting(true);
    setTestResults([]);
    
    try {
      addLog('🔍 Starting login test...');
      
      // Test 1: Direct API call
      addLog('📡 Testing direct API call...');
      const response = await api.login({
        email: 'admin@javascriptchallenge.com',
        password: 'admin123'
      });
      addLog(`✅ API Response: ${JSON.stringify(response, null, 2)}`);
      
      // Test 2: Check if token was stored
      addLog('🍪 Checking if token was stored...');
      const token = document.cookie.includes('token');
      addLog(`Token in cookies: ${token}`);
      
      // Test 3: Check user state
      addLog('👤 Checking user state...');
      addLog(`User state: ${JSON.stringify(user, null, 2)}`);
      
      // Test 4: Test getProfile
      addLog('📞 Testing getProfile...');
      try {
        const profile = await api.getProfile();
        addLog(`✅ Profile: ${JSON.stringify(profile, null, 2)}`);
      } catch (error: any) {
        addLog(`❌ Profile error: ${error.message}`);
      }
      
    } catch (error: any) {
      addLog(`❌ Test failed: ${error.message}`);
      addLog(`Error details: ${JSON.stringify(error, null, 2)}`);
    } finally {
      setIsTesting(false);
    }
  };

  const clearLogs = () => {
    setTestResults([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Login Debug Test</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-4">
                <Button onClick={testLogin} disabled={isTesting}>
                  {isTesting ? 'Testing...' : 'Test Login Flow'}
                </Button>
                <Button onClick={clearLogs} variant="outline">
                  Clear Logs
                </Button>
              </div>

              <div className="bg-gray-100 p-4 rounded">
                <h3 className="font-semibold mb-2">Current State:</h3>
                <p>Loading: {loading.toString()}</p>
                <p>User: {user ? JSON.stringify(user, null, 2) : 'null'}</p>
              </div>

              <div className="bg-black text-green-400 p-4 rounded font-mono text-sm max-h-96 overflow-y-auto">
                <h3 className="font-semibold mb-2">Test Results:</h3>
                {testResults.length === 0 ? (
                  <p className="text-gray-500">No test results yet. Click "Test Login Flow" to start.</p>
                ) : (
                  testResults.map((log, index) => (
                    <div key={index} className="mb-1">
                      {log}
                    </div>
                  ))
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 
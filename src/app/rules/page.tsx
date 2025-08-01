'use client';

import { useAuth } from '@/components/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Clock, AlertTriangle, CheckCircle, XCircle, Mail, Users, Trophy, Calendar } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function RulesPage() {
  const { user } = useAuth();
  const router = useRouter();

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Navigation */}
      <nav className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              onClick={() => handleNavigation('/')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </div>
          <div className="flex space-x-4">
            {user ? (
              <Button onClick={() => handleNavigation(user.role === 'admin' ? '/admin' : '/dashboard')}>
                Dashboard
              </Button>
            ) : (
              <Button onClick={() => handleNavigation('/login')}>
                Login
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Platform Rules & Guidelines
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Understanding our policies ensures a fair and productive learning environment
            </p>
          </div>

          {/* Time Management */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                  <Clock className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle>Time Management</CardTitle>
                  <CardDescription>Deadlines and submission policies</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Assignment Deadlines</h4>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                    <li>• All assignments have strict deadlines</li>
                    <li>• Submissions are locked after deadline</li>
                    <li>• Early submissions are not allowed</li>
                    <li>• Time zones are based on UTC</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Late Submissions</h4>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                    <li>• Late submissions incur penalties</li>
                    <li>• ₦500 late fee via Paystack</li>
                    <li>• Score deductions apply</li>
                    <li>• After 48 hours: zero score</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Penalties & Fees */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <CardTitle>Penalties & Fees</CardTitle>
                  <CardDescription>Consequences for rule violations</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-red-600 mb-2">₦500</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Late Fee</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-orange-600 mb-2">10-25%</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Score Deduction</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-gray-600 mb-2">0</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Missed Deadline</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Academic Integrity */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <CardTitle>Academic Integrity</CardTitle>
                  <CardDescription>Maintaining honest and original work</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2 text-green-700 dark:text-green-300">✅ Allowed</h4>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                    <li>• Original code development</li>
                    <li>• Using official documentation</li>
                    <li>• Seeking help from instructors</li>
                    <li>• Learning from examples</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-red-700 dark:text-red-300">❌ Prohibited</h4>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                    <li>• Copying others' code</li>
                    <li>• Using unauthorized sources</li>
                    <li>• Submitting work that's not yours</li>
                    <li>• Sharing solutions with others</li>
                  </ul>
                </div>
              </div>
              <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">⚠️ Plagiarism Policy</h4>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  First offense: Warning and score deduction. Second offense: Disqualification from the platform.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Submission Guidelines */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                  <Trophy className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <CardTitle>Submission Guidelines</CardTitle>
                  <CardDescription>How to submit your work properly</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">GitHub Links</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Share your repository URL for code review
                  </p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Code Paste</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Paste your code directly in the submission form
                  </p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">ZIP Files</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Upload compressed project files (max 10MB)
                  </p>
                </div>
              </div>
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">📝 Submission Requirements</h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  At least one submission method is required. Multiple methods are allowed and encouraged.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Notification System */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center">
                  <Mail className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <CardTitle>Notification System</CardTitle>
                  <CardDescription>Stay informed about your progress</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Email Notifications</h4>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                    <li>• New assignment notifications</li>
                    <li>• Deadline reminders (24h, 1h)</li>
                    <li>• Submission feedback</li>
                    <li>• Score updates</li>
                    <li>• Payment confirmations</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Dashboard Alerts</h4>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                    <li>• Real-time status updates</li>
                    <li>• Progress tracking</li>
                    <li>• Leaderboard changes</li>
                    <li>• Class announcements</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Challenge Rules */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <CardTitle>Challenge Rules</CardTitle>
                  <CardDescription>Special rules for coding challenges</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Daily Challenges</h4>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                    <li>• One project per day</li>
                    <li>• Projects unlock at midnight UTC</li>
                    <li>• Can't submit early</li>
                    <li>• Missed days = zero points</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Scoring System</h4>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                    <li>• Base score: 100 points</li>
                    <li>• Streak bonuses available</li>
                    <li>• Late penalties apply</li>
                    <li>• Bonus points for excellence</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Class Rules */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900 rounded-lg flex items-center justify-center">
                  <Users className="h-5 w-5 text-teal-600" />
                </div>
                <div>
                  <CardTitle>Class Rules</CardTitle>
                  <CardDescription>Guidelines for classroom participation</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Enrollment</h4>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                    <li>• Join via invitation code</li>
                    <li>• Accept/decline invitations</li>
                    <li>• Respect class capacity limits</li>
                    <li>• Follow instructor guidelines</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Participation</h4>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                    <li>• Complete assigned work</li>
                    <li>• Participate in discussions</li>
                    <li>• Respect classmates</li>
                    <li>• Follow class schedule</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Consequences & Disciplinary Actions */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
                  <XCircle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <CardTitle>Consequences & Disciplinary Actions</CardTitle>
                  <CardDescription>What happens when rules are violated</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="p-4 border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20">
                  <h4 className="font-semibold text-yellow-800 dark:text-yellow-200">Warning</h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    First-time minor violations result in a warning and score deduction.
                  </p>
                </div>
                <div className="p-4 border-l-4 border-orange-500 bg-orange-50 dark:bg-orange-900/20">
                  <h4 className="font-semibold text-orange-800 dark:text-orange-200">Suspension</h4>
                  <p className="text-sm text-orange-700 dark:text-orange-300">
                    Repeated violations may result in temporary suspension from the platform.
                  </p>
                </div>
                <div className="p-4 border-l-4 border-red-500 bg-red-50 dark:bg-red-900/20">
                  <h4 className="font-semibold text-red-800 dark:text-red-200">Disqualification</h4>
                  <p className="text-sm text-red-700 dark:text-red-300">
                    Severe violations, including plagiarism, result in permanent disqualification.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Need Help?</CardTitle>
              <CardDescription>Contact us if you have questions about these rules</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  If you have questions about these rules or need clarification, please contact our support team.
                </p>
                <Button onClick={() => handleNavigation('/')}>
                  Return to Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 
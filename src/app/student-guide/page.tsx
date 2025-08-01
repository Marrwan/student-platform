'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, 
  Users, 
  Code, 
  Upload, 
  Github, 
  Mail, 
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Info,
  ArrowRight,
  Star,
  Trophy,
  Target,
  TrendingUp
} from 'lucide-react';
import Link from 'next/link';

export default function StudentGuidePage() {
  const [activeTab, setActiveTab] = useState('getting-started');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Student Guide
            </h1>
            <p className="text-gray-600">
              Everything you need to know about using the Learning Platform
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="getting-started">Getting Started</TabsTrigger>
            <TabsTrigger value="joining-classes">Joining Classes</TabsTrigger>
            <TabsTrigger value="submitting-work">Submitting Work</TabsTrigger>
            <TabsTrigger value="tracking-progress">Tracking Progress</TabsTrigger>
          </TabsList>

          {/* Getting Started Tab */}
          <TabsContent value="getting-started" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-blue-600" />
                  Welcome to the Learning Platform
                </CardTitle>
                <CardDescription>
                  Your comprehensive guide to mastering JavaScript through daily challenges and structured learning
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <BookOpen className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <h3 className="font-semibold">Daily Projects</h3>
                    <p className="text-sm text-gray-600">Complete daily JavaScript challenges</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <h3 className="font-semibold">Join Classes</h3>
                    <p className="text-sm text-gray-600">Learn with instructors and peers</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <Trophy className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <h3 className="font-semibold">Track Progress</h3>
                    <p className="text-sm text-gray-600">Monitor your learning journey</p>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-yellow-800">Important Note</h4>
                      <p className="text-yellow-700 text-sm">
                        Make sure to verify your email address after registration to access all features.
                        Check your inbox for the verification code.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Joining Classes Tab */}
          <TabsContent value="joining-classes" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-green-600" />
                  How to Join Classes
                </CardTitle>
                <CardDescription>
                  There are several ways to join classes and start learning with instructors
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Method 1: Enrollment Code */}
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    Method 1: Using Enrollment Code
                  </h3>
                  <div className="space-y-3">
                    <p className="text-gray-600">
                      If you have an enrollment code from your instructor, you can join a class directly.
                    </p>
                    <div className="bg-gray-50 p-3 rounded border">
                      <h4 className="font-medium mb-2">Steps:</h4>
                      <ol className="list-decimal list-inside space-y-1 text-sm">
                        <li>Go to the <Link href="/classes" className="text-blue-600 hover:underline">Classes page</Link></li>
                        <li>Click the "Join Class" button</li>
                        <li>Enter the 8-character enrollment code</li>
                        <li>Click "Join Class" to enroll</li>
                      </ol>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Info className="h-4 w-4" />
                      Enrollment codes are case-sensitive and usually 8 characters long
                    </div>
                  </div>
                </div>

                {/* Method 2: Invitation */}
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <Mail className="h-5 w-5 text-blue-600" />
                    Method 2: Email Invitation
                  </h3>
                  <div className="space-y-3">
                    <p className="text-gray-600">
                      Your instructor may send you an email invitation to join their class.
                    </p>
                    <div className="bg-gray-50 p-3 rounded border">
                      <h4 className="font-medium mb-2">Steps:</h4>
                      <ol className="list-decimal list-inside space-y-1 text-sm">
                        <li>Check your email for an invitation</li>
                        <li>Click the link in the email or use the provided enrollment code</li>
                        <li>Log in to your account</li>
                        <li>You'll be automatically enrolled in the class</li>
                      </ol>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Info className="h-4 w-4" />
                      If you don't have an account, you can register using the email address
                    </div>
                  </div>
                </div>

                {/* Method 3: Request to Join */}
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-orange-600" />
                    Method 3: Request to Join
                  </h3>
                  <div className="space-y-3">
                    <p className="text-gray-600">
                      For classes that require approval, you can submit a join request.
                    </p>
                    <div className="bg-gray-50 p-3 rounded border">
                      <h4 className="font-medium mb-2">Steps:</h4>
                      <ol className="list-decimal list-inside space-y-1 text-sm">
                        <li>Find the class you want to join</li>
                        <li>Click "Request to Join"</li>
                        <li>Add an optional message explaining why you want to join</li>
                        <li>Submit your request and wait for instructor approval</li>
                      </ol>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Info className="h-4 w-4" />
                      You'll receive an email notification when your request is approved or rejected
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-blue-800">Need Help?</h4>
                      <p className="text-blue-700 text-sm">
                        If you're having trouble joining a class, contact your instructor or reach out to support.
                        Make sure you have the correct enrollment code and that your email is verified.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Submitting Work Tab */}
          <TabsContent value="submitting-work" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5 text-purple-600" />
                  How to Submit Your Work
                </CardTitle>
                <CardDescription>
                  Learn how to submit your projects and assignments for review
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Daily Projects */}
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <Code className="h-5 w-5 text-green-600" />
                    Daily JavaScript Projects
                  </h3>
                  <div className="space-y-3">
                    <p className="text-gray-600">
                      Complete daily JavaScript challenges to improve your skills and earn points.
                    </p>
                    <div className="bg-gray-50 p-3 rounded border">
                      <h4 className="font-medium mb-2">Submission Methods:</h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Code className="h-4 w-4 text-blue-600" />
                          <span className="text-sm"><strong>Code Editor:</strong> Write HTML, CSS, and JavaScript directly in the platform</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Github className="h-4 w-4 text-gray-800" />
                          <span className="text-sm"><strong>GitHub Link:</strong> Submit a link to your GitHub repository</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Upload className="h-4 w-4 text-green-600" />
                          <span className="text-sm"><strong>File Upload:</strong> Upload a ZIP file containing your project</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Class Assignments */}
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                    Class Assignments
                  </h3>
                  <div className="space-y-3">
                    <p className="text-gray-600">
                      Submit assignments for classes you're enrolled in.
                    </p>
                    <div className="bg-gray-50 p-3 rounded border">
                      <h4 className="font-medium mb-2">Steps:</h4>
                      <ol className="list-decimal list-inside space-y-1 text-sm">
                        <li>Go to your enrolled class</li>
                        <li>Find the assignment you want to submit</li>
                        <li>Click "Submit Assignment"</li>
                        <li>Choose your submission method</li>
                        <li>Add any required comments or explanations</li>
                        <li>Submit before the deadline</li>
                      </ol>
                    </div>
                  </div>
                </div>

                {/* Submission Guidelines */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-800 mb-2">Submission Guidelines</h4>
                  <ul className="space-y-1 text-sm text-yellow-700">
                    <li>• Submit before the deadline to avoid late penalties</li>
                    <li>• Ensure your code is well-commented and readable</li>
                    <li>• Test your code thoroughly before submitting</li>
                    <li>• Include any required documentation or README files</li>
                    <li>• Make sure all links are accessible and working</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tracking Progress Tab */}
          <TabsContent value="tracking-progress" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-purple-600" />
                  Tracking Your Progress
                </CardTitle>
                <CardDescription>
                  Monitor your learning journey and achievements
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Dashboard Overview */}
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-600" />
                    Dashboard Overview
                  </h3>
                  <div className="space-y-3">
                    <p className="text-gray-600">
                      Your dashboard shows your overall progress and achievements.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-3 rounded border">
                        <h4 className="font-medium mb-2">Key Metrics:</h4>
                        <ul className="space-y-1 text-sm">
                          <li>• Total Score</li>
                          <li>• Current Streak</li>
                          <li>• Completion Rate</li>
                          <li>• Average Score</li>
                          <li>• Rank among students</li>
                        </ul>
                      </div>
                      <div className="bg-gray-50 p-3 rounded border">
                        <h4 className="font-medium mb-2">Recent Activity:</h4>
                        <ul className="space-y-1 text-sm">
                          <li>• Latest submissions</li>
                          <li>• Recent feedback</li>
                          <li>• New assignments</li>
                          <li>• Class announcements</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Progress Tracking */}
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    Progress Tracking
                  </h3>
                  <div className="space-y-3">
                    <p className="text-gray-600">
                      Track your progress across different areas of learning.
                    </p>
                    <div className="bg-gray-50 p-3 rounded border">
                      <h4 className="font-medium mb-2">What You Can Track:</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h5 className="font-medium text-sm">Daily Projects:</h5>
                          <ul className="text-sm space-y-1">
                            <li>• Completed projects</li>
                            <li>• Missed deadlines</li>
                            <li>• Scores and feedback</li>
                          </ul>
                        </div>
                        <div>
                          <h5 className="font-medium text-sm">Class Progress:</h5>
                          <ul className="text-sm space-y-1">
                            <li>• Enrolled classes</li>
                            <li>• Assignment completion</li>
                            <li>• Class participation</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Leaderboard */}
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-600" />
                    Leaderboards
                  </h3>
                  <div className="space-y-3">
                    <p className="text-gray-600">
                      Compete with other students and see how you rank.
                    </p>
                    <div className="bg-gray-50 p-3 rounded border">
                      <h4 className="font-medium mb-2">Available Leaderboards:</h4>
                      <ul className="space-y-1 text-sm">
                        <li>• <Link href="/leaderboard" className="text-blue-600 hover:underline">Overall Leaderboard</Link> - Rank among all students</li>
                        <li>• Project Leaderboards - Top performers for specific projects</li>
                        <li>• Streak Leaderboard - Students with the longest active streaks</li>
                        <li>• Class Leaderboards - Top performers in specific classes</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Get started with these common actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link href="/classes">
                  <Button className="w-full" variant="outline">
                    <Users className="h-4 w-4 mr-2" />
                    Browse Classes
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
                <Link href="/projects">
                  <Button className="w-full" variant="outline">
                    <Code className="h-4 w-4 mr-2" />
                    View Projects
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button className="w-full" variant="outline">
                    <Target className="h-4 w-4 mr-2" />
                    Go to Dashboard
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
} 
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, 
  Code, 
  FileText, 
  Users, 
  Trophy, 
  Calendar, 
  Clock, 
  CheckCircle,
  AlertCircle,
  Info,
  ArrowRight,
  Star,
  Target,
  Activity
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function StudentGuidePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Student Guide</h1>
              <p className="text-gray-600 dark:text-gray-300">
                Everything you need to know about using the platform
              </p>
            </div>
            <Button onClick={() => router.push('/dashboard')}>
              <ArrowRight className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="getting-started" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="getting-started">Getting Started</TabsTrigger>
            <TabsTrigger value="joining-classes">Joining Classes</TabsTrigger>
            <TabsTrigger value="submitting-work">Submitting Work</TabsTrigger>
            <TabsTrigger value="tracking-progress">Tracking Progress</TabsTrigger>
          </TabsList>

          {/* Getting Started */}
          <TabsContent value="getting-started" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  Welcome to the Learning Platform
                </CardTitle>
                <CardDescription>
                  Your journey to becoming a better programmer starts here
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <Code className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                    <h3 className="font-semibold">Programming Projects</h3>
                    <p className="text-sm text-gray-600">Daily coding challenges to improve your skills</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <BookOpen className="h-8 w-8 mx-auto mb-2 text-green-600" />
                    <h3 className="font-semibold">Class Assignments</h3>
                    <p className="text-sm text-gray-600">Structured learning through class-based assignments</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <Trophy className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                    <h3 className="font-semibold">Leaderboards</h3>
                    <p className="text-sm text-gray-600">Compete with other students and track your progress</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-500" />
                  Platform Features
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Daily Programming Challenges</h4>
                      <p className="text-sm text-gray-600">Complete projects ranging from beginner to advanced levels</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Class Enrollment</h4>
                      <p className="text-sm text-gray-600">Join classes and participate in structured learning</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Progress Tracking</h4>
                      <p className="text-sm text-gray-600">Monitor your learning progress and achievements</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Leaderboards</h4>
                      <p className="text-sm text-gray-600">Compete with peers and see your ranking</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Joining Classes */}
          <TabsContent value="joining-classes" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-green-500" />
                  How to Join Classes
                </CardTitle>
                <CardDescription>
                  There are three ways to join a class on the platform
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Method 1: Enrollment Code */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="outline">Method 1</Badge>
                    <h3 className="font-semibold">Enrollment Code</h3>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p>1. Ask your instructor for the 8-character enrollment code</p>
                    <p>2. Go to the <Button variant="link" className="p-0 h-auto" onClick={() => router.push('/classes')}>Classes page</Button></p>
                    <p>3. Click "Join Class" button</p>
                    <p>4. Enter the enrollment code and click "Join Class"</p>
                    <p>5. You'll be automatically enrolled in the class</p>
                  </div>
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Info className="h-4 w-4 text-blue-600 mt-0.5" />
                      <p className="text-sm text-blue-800">This method works for classes that don't require approval.</p>
                    </div>
                  </div>
                </div>

                {/* Method 2: Invitation */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="outline">Method 2</Badge>
                    <h3 className="font-semibold">Email Invitation</h3>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p>1. Your instructor will send you an email invitation</p>
                    <p>2. Click the invitation link in the email</p>
                    <p>3. If you don't have an account, you'll be prompted to create one</p>
                    <p>4. You'll be automatically enrolled in the class</p>
                  </div>
                  <div className="mt-3 p-3 bg-green-50 rounded-lg">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <p className="text-sm text-green-800">This is the easiest method if your instructor has your email.</p>
                    </div>
                  </div>
                </div>

                {/* Method 3: Request to Join */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="outline">Method 3</Badge>
                    <h3 className="font-semibold">Request to Join</h3>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p>1. Go to the <Button variant="link" className="p-0 h-auto" onClick={() => router.push('/classes')}>Classes page</Button></p>
                    <p>2. Find the class you want to join</p>
                    <p>3. Click "Request to Join" (if available)</p>
                    <p>4. Add an optional message explaining why you want to join</p>
                    <p>5. Wait for instructor approval</p>
                  </div>
                  <div className="mt-3 p-3 bg-yellow-50 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                      <p className="text-sm text-yellow-800">This method requires instructor approval and may not be available for all classes.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-blue-500" />
                  Class Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Class Duration</h4>
                      <p className="text-sm text-gray-600">Classes have start and end dates. Make sure to complete assignments before the deadline.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Users className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Student Limit</h4>
                      <p className="text-sm text-gray-600">Some classes have a maximum number of students. Join early to secure your spot.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <FileText className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Assignments</h4>
                      <p className="text-sm text-gray-600">Once enrolled, you'll see all class assignments in your dashboard.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Submitting Work */}
          <TabsContent value="submitting-work" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5 text-purple-500" />
                  How to Submit Your Work
                </CardTitle>
                <CardDescription>
                  Learn how to submit projects and assignments
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Programming Projects */}
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-3">Programming Projects</h3>
                  <div className="space-y-2 text-sm">
                    <p>1. Go to the <Button variant="link" className="p-0 h-auto" onClick={() => router.push('/projects')}>Projects page</Button></p>
                    <p>2. Click on a project to view details</p>
                    <p>3. Read the requirements and sample output carefully</p>
                    <p>4. Complete your project using your preferred tools</p>
                    <p>5. Click "Submit Work" on the project page</p>
                    <p>6. Choose your submission method:</p>
                    <ul className="ml-6 space-y-1">
                      <li>• <strong>GitHub Link:</strong> Upload your code to GitHub and provide the repository URL</li>
                      <li>• <strong>Code Submission:</strong> Paste your HTML, CSS, and JavaScript directly</li>
                      <li>• <strong>ZIP File:</strong> Upload a compressed file with your project</li>
                    </ul>
                    <p>7. Add any additional comments and submit</p>
                  </div>
                </div>

                {/* Class Assignments */}
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-3">Class Assignments</h3>
                  <div className="space-y-2 text-sm">
                    <p>1. Go to the <Button variant="link" className="p-0 h-auto" onClick={() => router.push('/assignments')}>Assignments page</Button></p>
                    <p>2. Find the assignment you want to submit</p>
                    <p>3. Click "Submit" button</p>
                    <p>4. Follow the same submission process as projects</p>
                    <p>5. Your instructor will review and grade your submission</p>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Info className="h-4 w-4 text-blue-600 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium">Important Notes:</p>
                      <ul className="mt-1 space-y-1">
                        <li>• Make sure your code is working before submitting</li>
                        <li>• Check that you've met all requirements</li>
                        <li>• Submit before the deadline to avoid late penalties</li>
                        <li>• You can submit multiple times, but only the latest submission will be graded</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-orange-500" />
                  Deadlines and Late Submissions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Late Penalties</h4>
                      <p className="text-sm text-gray-600">Submissions after the deadline may incur penalties. Check individual project/assignment details for specific rules.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Time Tracking</h4>
                      <p className="text-sm text-gray-600">Each project shows the time remaining until the deadline. Plan your work accordingly.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tracking Progress */}
          <TabsContent value="tracking-progress" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-green-500" />
                  Tracking Your Progress
                </CardTitle>
                <CardDescription>
                  Monitor your learning journey and achievements
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Dashboard Stats */}
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-3">Dashboard Statistics</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">Total Score</div>
                      <div className="text-sm text-gray-600">Your cumulative score</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">Completion Rate</div>
                      <div className="text-sm text-gray-600">% of projects completed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">Current Streak</div>
                      <div className="text-sm text-gray-600">Days of consistent work</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">Average Score</div>
                      <div className="text-sm text-gray-600">Your performance average</div>
                    </div>
                  </div>
                </div>

                {/* Progress Tracking */}
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-3">Progress Tracking Features</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <div>
                        <h4 className="font-medium">Recent Submissions</h4>
                        <p className="text-sm text-gray-600">View your latest project submissions and feedback</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <div>
                        <h4 className="font-medium">Leaderboard Rankings</h4>
                        <p className="text-sm text-gray-600">See how you rank among other students</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <div>
                        <h4 className="font-medium">Achievement Badges</h4>
                        <p className="text-sm text-gray-600">Earn badges for completing milestones</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <div>
                        <h4 className="font-medium">Detailed Analytics</h4>
                        <p className="text-sm text-gray-600">Track your performance over time</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tips for Success */}
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-3">Tips for Success</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <Star className="h-4 w-4 text-yellow-500 mt-0.5" />
                      <p>Complete projects regularly to maintain your streak</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Star className="h-4 w-4 text-yellow-500 mt-0.5" />
                      <p>Read feedback carefully and apply it to future projects</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Star className="h-4 w-4 text-yellow-500 mt-0.5" />
                      <p>Participate in classes to get structured learning</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Star className="h-4 w-4 text-yellow-500 mt-0.5" />
                      <p>Challenge yourself with harder projects as you improve</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Star className="h-4 w-4 text-yellow-500 mt-0.5" />
                      <p>Use the leaderboard to stay motivated and competitive</p>
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
              <CardTitle>Ready to Get Started?</CardTitle>
              <CardDescription>
                Jump into your learning journey with these quick actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button 
                  className="h-auto p-4 flex flex-col items-center gap-2" 
                  onClick={() => router.push('/projects')}
                >
                  <Code className="h-6 w-6" />
                  <span>View Projects</span>
                  <span className="text-xs opacity-80">Start coding challenges</span>
                </Button>
                <Button 
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center gap-2" 
                  onClick={() => router.push('/classes')}
                >
                  <BookOpen className="h-6 w-6" />
                  <span>Join Classes</span>
                  <span className="text-xs opacity-80">Enroll in structured learning</span>
                </Button>
                <Button 
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center gap-2" 
                  onClick={() => router.push('/leaderboard')}
                >
                  <Trophy className="h-6 w-6" />
                  <span>View Leaderboard</span>
                  <span className="text-xs opacity-80">See your ranking</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
} 
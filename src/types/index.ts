export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'student' | 'admin' | 'partial_admin';
  isActive?: boolean;
  emailVerified?: boolean;
  lastLogin?: string;
  totalScore?: number;
  streakCount?: number;
  completedProjects?: number;
  missedDeadlines?: number;
  avatar?: string;
  bio?: string;
  githubUsername?: string;
  linkedinUrl?: string;
  emailNotifications?: boolean;
  pushNotifications?: boolean;
  permissions?: {
    canCreateClasses: boolean;
    canManageStudents: boolean;
    canReviewSubmissions: boolean;
    canManageProjects: boolean;
    canViewAnalytics: boolean;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface Project {
  id: string;
  day: number;
  title: string;
  description: string;
  requirements: string[];
  difficulty: 'easy' | 'medium' | 'hard' | 'advanced';
  maxScore: number;
  deadline: string;
  isUnlocked: boolean;
  isActive: boolean;
  isLocked?: boolean;
  sampleOutput?: string;
  starterCode?: string;
  hints?: string;
  tags: string[];
  estimatedTime: number;
  challengeId?: string;
  startDate?: string;
  endDate?: string;
  autoUnlock?: boolean;
  unlockTime?: string;
  unlockDelay?: number;
  prerequisites?: number[];
  bonusPoints?: number;
  penaltyPoints?: number;
  latePenalty?: number;
  allowLateSubmission?: boolean;
  maxLateHours?: number;
  submissionLimit?: number;
  videoUrl?: string;
  resources?: any[];
  learningObjectives: string[];
  skillsPracticed?: string[];
  hasLivePreview?: boolean;
  hasCodeEditor?: boolean;
  hasAutoTest?: boolean;
  testCases?: any[];
  totalSubmissions?: number;
  averageScore?: number;
  completionRate?: number;
  averageTimeSpent?: number;
  settings?: any;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
  // Additional fields for students
  submissionStatus?: 'not_submitted' | 'pending' | 'reviewed' | 'accepted' | 'rejected';
  submissionScore?: number;
  isOverdue?: boolean;
  timeRemaining?: number;
  htmlCode?: string;
  cssCode?: string;
  jsCode?: string;
}

export interface Submission {
  id: string;
  userId: string;
  projectId: string;
  githubLink: string;
  codeSubmission?: string;
  zipFileUrl?: string;
  submittedAt: string;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
  score: number;
  isLate: boolean;
  latePenalty: number;
  adminFeedback?: string;
  adminComments?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  bonusPoints: number;
  deductions: number;
  finalScore: number;
  createdAt: string;
  updatedAt: string;
  // Related data
  user?: User;
  project?: Project;
  reviewer?: User;
  // Payment related
  paymentRequired?: boolean;
  paymentStatus?: 'pending' | 'paid' | 'failed';
}

export interface Payment {
  id: string;
  userId: string;
  submissionId?: string;
  type: 'late_fee' | 'penalty' | 'subscription' | 'other';
  amount: number;
  currency: string;
  reference: string;
  paystackReference?: string;
  status: 'pending' | 'successful' | 'failed' | 'cancelled';
  description?: string;
  metadata?: any;
  paidAt?: string;
  failureReason?: string;
  createdAt: string;
  updatedAt: string;
  // Related data
  user?: User;
  submission?: Submission;
}

export interface Class {
  id: string;
  name: string;
  description?: string;
  instructorId: string;
  startDate: string;
  endDate: string;
  maxStudents: number;
  isActive: boolean;
  enrollmentCode: string;
  syllabus?: string;
  requirements?: string;
  schedule?: any;
  settings?: any;
  tags: string[];
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  language: string;
  timezone: string;
  isPublic: boolean;
  allowEnrollment: boolean;
  autoEnroll: boolean;
  notificationSettings?: any;
  createdAt: string;
  updatedAt: string;
  // Related data
  instructor?: User;
  enrollments?: ClassEnrollment[];
  assignments?: Assignment[];
}

export interface ClassEnrollment {
  id: string;
  classId: string;
  userId: string;
  enrolledAt: string;
  status: 'active' | 'inactive' | 'dropped' | 'completed';
  role: 'student' | 'teaching_assistant';
  grade?: number;
  attendance: number;
  lastActivity?: string;
  progress: number;
  completedAssignments: number;
  totalAssignments: number;
  averageScore: number;
  notes?: string;
  settings?: any;
  invitedBy?: string;
  invitedAt?: string;
  acceptedAt?: string;
  // Related data
  class?: Class;
  student?: User;
  inviter?: User;
}

export interface Assignment {
  id: string;
  classId: string;
  title: string;
  description: string;
  instructions?: string;
  maxScore: number;
  dueDate: string;
  startDate?: string;
  isActive: boolean;
  isPublished: boolean;
  allowLateSubmission: boolean;
  latePenalty: number;
  submissionType: 'file' | 'text' | 'link' | 'multiple';
  allowedFileTypes: string[];
  maxFileSize: number;
  maxSubmissions: number;
  rubric?: any;
  attachments?: any[];
  tags: string[];
  difficulty: 'easy' | 'medium' | 'hard' | 'advanced';
  estimatedTime: number;
  groupAssignment: boolean;
  maxGroupSize: number;
  peerReview: boolean;
  autoGrade: boolean;
  settings?: any;
  weight: number;
  createdAt: string;
  updatedAt: string;
  // Related data
  class?: Class;
  submissions?: AssignmentSubmission[];
  grades?: AssignmentGrade[];
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  enrollmentId: string;
  submittedAt: string;
  status: 'draft' | 'submitted' | 'graded' | 'late' | 'overdue';
  score: number;
  maxScore: number;
  isLate: boolean;
  latePenalty: number;
  finalScore: number;
  feedback?: string;
  comments?: string;
  gradedBy?: string;
  gradedAt?: string;
  submissionNumber: number;
  files?: any[];
  textContent?: string;
  links?: any[];
  metadata?: any;
  rubricScores?: any;
  peerReviews?: any[];
  autoGradeResult?: any;
  plagiarismScore?: number;
  timeSpent: number;
  attempts: number;
  // Related data
  assignment?: Assignment;
  enrollment?: ClassEnrollment;
  grader?: User;
}

export interface AssignmentGrade {
  id: string;
  assignmentId: string;
  enrollmentId: string;
  score: number;
  maxScore: number;
  percentage: number;
  letterGrade: string;
  feedback?: string;
  gradedBy?: string;
  gradedAt: string;
  rubricScores?: any;
  comments?: string;
  isLate: boolean;
  latePenalty: number;
  finalScore: number;
  metadata?: any;
  // Related data
  assignment?: Assignment;
  enrollment?: ClassEnrollment;
  grader?: User;
}

export interface Challenge {
  id: string;
  name: string;
  description: string;
  type: 'javascript' | 'python' | 'react' | 'nodejs' | 'custom';
  startDate: string;
  endDate: string;
  duration: number;
  isActive: boolean;
  isPublic: boolean;
  allowRegistration: boolean;
  maxParticipants: number;
  currentParticipants: number;
  autoStart: boolean;
  autoUnlockProjects: boolean;
  unlockTime: string;
  timezone: string;
  scoringSystem: 'points' | 'percentage' | 'stars';
  maxScore: number;
  bonusPoints: number;
  streakBonus: number;
  latePenalty: number;
  allowLateSubmission: boolean;
  maxLateHours: number;
  hasLeaderboard: boolean;
  hasCertificates: boolean;
  hasProgressTracking: boolean;
  hasNotifications: boolean;
  hasDiscussions: boolean;
  hasMentorship: boolean;
  welcomeMessage?: string;
  rules?: any[];
  prizes?: any[];
  sponsors?: any[];
  totalSubmissions: number;
  averageCompletionRate: number;
  averageScore: number;
  settings?: any;
  metadata?: any;
  createdBy: string;
  moderators: string[];
  status: 'draft' | 'published' | 'active' | 'paused' | 'completed' | 'archived';
  createdAt: string;
  updatedAt: string;
  // Related data
  creator?: User;
  projects?: Project[];
  registrations?: ChallengeRegistration[];
  announcements?: ChallengeAnnouncement[];
  leaderboard?: ChallengeLeaderboard[];
}

export interface ChallengeRegistration {
  id: string;
  challengeId: string;
  userId: string;
  registeredAt: string;
  status: 'active' | 'inactive' | 'dropped' | 'completed';
  totalScore: number;
  completedProjects: number;
  streakCount: number;
  lastSubmissionAt?: string;
  startDate?: string;
  endDate?: string;
  progress: number;
  averageScore: number;
  rank?: number;
  certificateEarned: boolean;
  certificateUrl?: string;
  settings?: any;
  metadata?: any;
  // Related data
  challenge?: Challenge;
  user?: User;
}

export interface ChallengeLeaderboard {
  id: string;
  challengeId: string;
  userId: string;
  totalScore: number;
  completedProjects: number;
  streakCount: number;
  averageScore: number;
  rank?: number;
  lastSubmissionAt?: string;
  lastUpdated: string;
  bonusPoints: number;
  penaltyPoints: number;
  finalScore: number;
  metadata?: any;
  // Related data
  challenge?: Challenge;
  user?: User;
}

export interface ChallengeAnnouncement {
  id: string;
  challengeId: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'success' | 'error';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  isPublished: boolean;
  publishedAt?: string;
  expiresAt?: string;
  createdBy: string;
  readBy: string[];
  metadata?: any;
  // Related data
  challenge?: Challenge;
  author?: User;
}

export interface LeaderboardEntry {
  id: string;
  rank: number;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  totalScore: number;
  completedProjects: number;
  streakCount: number;
  averageScore: number;
  lastSubmissionAt: string;
  bonusPoints: number;
  penaltyPoints: number;
  finalScore: number;
  completionRate: number;
  qualityScore: number;
  totalSubmissions: number;
  isCurrentUser: boolean;
}

export interface ClassLeaderboardEntry {
  id: string;
  rank: number;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  attendanceScore: number;
  assignmentScore: number;
  finalScore: number;
  completedProjects: number;
  totalSubmissions: number;
  completionRate: number;
  lateSubmissions: number;
  enrolledAt: string;
  isCurrentUser: boolean;
}

export interface ProjectLeaderboardEntry {
  id: string;
  rank: number;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  submissionId: string;
  baseScore: number;
  bonusPoints: number;
  deductions: number;
  finalScore: number;
  intelligentScore: number;
  timeBonus: number;
  qualityBonus: number;
  latePenalty: number;
  hoursToSubmit: number;
  isLate: boolean;
  status: string;
  submittedAt: string;
  reviewedAt: string;
  adminFeedback: string;
  isCurrentUser: boolean;
}

export interface ProjectStats {
  totalSubmissions: number;
  pendingSubmissions: number;
  reviewedSubmissions: number;
  acceptedSubmissions: number;
  rejectedSubmissions: number;
  averageScore: number;
  lateSubmissions: number;
  submissions: Submission[];
}

export interface LeaderboardStats {
  totalStudents: number;
  totalSubmissions: number;
  averageScore: number;
  totalParticipants: number;
  topScore: number;
  activeStreaks: number;
  completionRate: number;
  totalClasses: number;
  activeClasses: number;
}

export interface PersonalStats {
  totalSubmissions: number;
  averageScore: number;
  recentSubmissions: Submission[];
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  totalPages: number;
  currentPage: number;
}

export interface LoginFormData {
  email: string;
  password: string;
  verificationOtp?: string;
}

export interface RegisterFormData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface SubmissionFormData {
  projectId: string;
  githubLink: string;
  codeSubmission?: string;
  zipFile?: File;
}

export interface ReviewFormData {
  score: number;
  adminFeedback?: string;
  adminComments?: string;
  bonusPoints?: number;
  deductions?: number;
}

export interface ProjectFormData {
  day: number;
  title: string;
  description: string;
  requirements: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'advanced';
  maxScore: number;
  deadline: string;
  sampleOutput?: string;
  starterCode?: string;
  hints?: string;
  tags: string[];
  estimatedTime: number;
  isUnlocked?: boolean;
  isActive?: boolean;
}

export interface ClassFormData {
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  maxStudents: number;
  syllabus?: string;
  requirements?: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  isPublic: boolean;
  allowEnrollment: boolean;
}

export interface AssignmentFormData {
  title: string;
  description: string;
  instructions?: string;
  maxScore: number;
  dueDate: string;
  startDate?: string;
  submissionType: 'file' | 'text' | 'link' | 'multiple';
  allowedFileTypes: string[];
  maxFileSize: number;
  maxSubmissions: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'advanced';
  estimatedTime: number;
  groupAssignment: boolean;
  maxGroupSize: number;
  peerReview: boolean;
  autoGrade: boolean;
  weight: number;
}

export interface ChallengeFormData {
  name: string;
  description: string;
  type: 'javascript' | 'python' | 'react' | 'nodejs' | 'custom';
  startDate: string;
  endDate: string;
  duration: number;
  maxParticipants: number;
  scoringSystem: 'points' | 'percentage' | 'stars';
  maxScore: number;
  hasLeaderboard: boolean;
  hasCertificates: boolean;
  hasProgressTracking: boolean;
  hasNotifications: boolean;
  welcomeMessage?: string;
}

export interface UserRank {
  rank: number;
  totalStudents: number;
  percentile: number;
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
}

export interface PaymentFormData {
  submissionId: string;
  amount: number;
}

export interface PaystackResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
} 
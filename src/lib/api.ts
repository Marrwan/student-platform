import axios, { AxiosInstance, AxiosResponse } from 'axios';
import Cookies from 'js-cookie';
import {
  User,
  Project,
  Submission,
  LeaderboardEntry,
  ClassLeaderboardEntry,
  ProjectLeaderboardEntry,
  AuthResponse,
  ApiResponse,
  PaginatedResponse,
  ProjectStats,
  LeaderboardStats,
  PersonalStats,
  UserRank,
  LoginFormData,
  RegisterFormData,
  SubmissionFormData,
  ReviewFormData,
  ProjectFormData,
  Class,
  ClassEnrollment,
  Assignment,
  AssignmentSubmission,
  AssignmentGrade,
  Challenge,
  ChallengeRegistration,
  ChallengeLeaderboard,
  ChallengeAnnouncement,
  Payment,
  ClassFormData,
  AssignmentFormData,
  ChallengeFormData,
  PaymentFormData,
  PaystackResponse
} from '@/types';

// Cache interface
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

// Simple in-memory cache
class ApiCache {
  private cache = new Map<string, CacheEntry<any>>();

  set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  clear(): void {
    this.cache.clear();
  }

  delete(key: string): void {
    this.cache.delete(key);
  }
}

// Request deduplication
class RequestDeduplicator {
  private pendingRequests = new Map<string, Promise<any>>();

  async deduplicate<T>(key: string, requestFn: () => Promise<T>): Promise<T> {
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key)!;
    }

    const promise = requestFn().finally(() => {
      this.pendingRequests.delete(key);
    });

    this.pendingRequests.set(key, promise);
    return promise;
  }
}

class ApiClient {
  private client: AxiosInstance;
  private cache: ApiCache;
  private deduplicator: RequestDeduplicator;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000, // 10 second timeout
    });

    this.cache = new ApiCache();
    this.deduplicator = new RequestDeduplicator();

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = Cookies.get('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle errors
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          Cookies.remove('token');
          // Only redirect if not already on login page
          if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // Generic cached request method
  private async cachedRequest<T>(
    key: string,
    requestFn: () => Promise<T>,
    ttl: number = 5 * 60 * 1000
  ): Promise<T> {
    // Check cache first
    const cached = this.cache.get<T>(key);
    if (cached) {
      return cached;
    }

    // Deduplicate requests
    return this.deduplicator.deduplicate(key, async () => {
      const result = await requestFn();
      this.cache.set(key, result, ttl);
      return result;
    });
  }

  // Clear cache for specific patterns
  clearCache(pattern?: string): void {
    if (pattern) {
      const keys = Array.from(this.cache['cache'].keys());
      for (const key of keys) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }

  // Cache management
  invalidateCache(key: string) {
    this.cache.delete(key);
  }

  // Auth endpoints
  async login(data: LoginFormData): Promise<AuthResponse> {
    const response: AxiosResponse<AuthResponse> = await this.client.post('/auth/login', data);
    return response.data;
  }

  async register(data: RegisterFormData): Promise<AuthResponse> {
    const response: AxiosResponse<AuthResponse> = await this.client.post('/auth/register', data);
    return response.data;
  }

  async verifyEmail(token: string): Promise<AuthResponse> {
    const response: AxiosResponse<AuthResponse> = await this.client.post('/auth/verify-email', { token });
    return response.data;
  }

  async resendVerification(email: string): Promise<{ message: string }> {
    const response: AxiosResponse<{ message: string }> = await this.client.post('/auth/resend-verification', { email });
    return response.data;
  }

  async getUsers(): Promise<User[]> {
    return this.cachedRequest(
      'users',
      async () => {
        const response: AxiosResponse<User[]> = await this.client.get('/users');
        return response.data;
      },
      5 * 60 * 1000 // 5 minutes cache
    );
  }

  async getProfile(): Promise<{ user: User }> {
    return this.cachedRequest(
      'profile',
      async () => {
        const response: AxiosResponse<{ user: User }> = await this.client.get('/auth/profile');
        return response.data;
      },
      2 * 60 * 1000 // 2 minutes cache
    );
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    const response: AxiosResponse<{ message: string }> = await this.client.post('/auth/forgot-password', { email });
    return response.data;
  }

  async resetPassword(token: string, password: string): Promise<{ message: string }> {
    const response: AxiosResponse<{ message: string }> = await this.client.post('/auth/reset-password', { token, password });
    return response.data;
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
    const response: AxiosResponse<{ message: string }> = await this.client.post('/auth/change-password', { currentPassword, newPassword });
    return response.data;
  }

  async updateProfile(data: Partial<User>): Promise<{ message: string; user: User }> {
    const response: AxiosResponse<{ message: string; user: User }> = await this.client.put('/auth/profile', data);
    // Clear profile cache after update
    this.clearCache('profile');
    return response.data;
  }

  async updateNotifications(emailNotifications: boolean, pushNotifications: boolean): Promise<{ message: string; settings: any }> {
    const response: AxiosResponse<{ message: string; settings: any }> = await this.client.put('/auth/notifications', { emailNotifications, pushNotifications });
    return response.data;
  }

  // Project endpoints
  async getProjects(params?: {
    page?: number;
    limit?: number;
    difficulty?: string;
    status?: string;
  }): Promise<PaginatedResponse<Project>> {
    const cacheKey = `projects:${JSON.stringify(params)}`;
    return this.cachedRequest(
      cacheKey,
      async () => {
        const response: AxiosResponse<PaginatedResponse<Project>> = await this.client.get('/projects', { params });
        return response.data;
      },
      3 * 60 * 1000 // 3 minutes cache
    );
  }

  async getProject(id: string): Promise<{ project: Project }> {
    return this.cachedRequest(
      `project:${id}`,
      async () => {
        const response: AxiosResponse<{ project: Project }> = await this.client.get(`/projects/${id}`);
        return response.data;
      },
      5 * 60 * 1000 // 5 minutes cache
    );
  }

  async getTodayProject(): Promise<{ project: any }> {
    return this.cachedRequest(
      'today-project',
      async () => {
        const response: AxiosResponse<{ project: any }> = await this.client.get('/dashboard/today-project');
        return response.data;
      },
      1 * 60 * 1000 // 1 minute cache
    );
  }

  async createProject(data: ProjectFormData): Promise<{ message: string; project: Project }> {
    const response: AxiosResponse<{ message: string; project: Project }> = await this.client.post('/projects', data);
    // Clear projects cache
    this.clearCache('projects');
    return response.data;
  }

  async updateProject(id: string, data: Partial<ProjectFormData>): Promise<{ message: string; project: Project }> {
    const response: AxiosResponse<{ message: string; project: Project }> = await this.client.put(`/projects/${id}`, data);
    // Clear related caches
    this.clearCache('projects');
    this.clearCache(`project:${id}`);
    return response.data;
  }

  async deleteProject(id: string): Promise<{ message: string }> {
    const response: AxiosResponse<{ message: string }> = await this.client.delete(`/projects/${id}`);
    // Clear related caches
    this.clearCache('projects');
    this.clearCache(`project:${id}`);
    return response.data;
  }

  async unlockProject(id: string): Promise<{ message: string; project: Project }> {
    const response: AxiosResponse<{ message: string; project: Project }> = await this.client.post(`/projects/${id}/unlock`);
    // Clear related caches
    this.clearCache('projects');
    this.clearCache(`project:${id}`);
    return response.data;
  }

  async lockProject(id: string): Promise<{ message: string; project: Project }> {
    const response: AxiosResponse<{ message: string; project: Project }> = await this.client.post(`/projects/${id}/lock`);
    // Clear related caches
    this.clearCache('projects');
    this.clearCache(`project:${id}`);
    return response.data;
  }

  async getProjectStats(id: string): Promise<{ stats: ProjectStats }> {
    return this.cachedRequest(
      `project-stats:${id}`,
      async () => {
        const response: AxiosResponse<{ stats: ProjectStats }> = await this.client.get(`/projects/${id}/stats`);
        return response.data;
      },
      2 * 60 * 1000 // 2 minutes cache
    );
  }

  // Submission endpoints
  async submitProject(data: SubmissionFormData): Promise<{ message: string; submission: Submission }> {
    const formData = new FormData();
    formData.append('projectId', data.projectId);
    formData.append('githubLink', data.githubLink);
    if (data.codeSubmission) {
      formData.append('codeSubmission', data.codeSubmission);
    }
    if (data.zipFile) {
      formData.append('zipFile', data.zipFile);
    }

    const response: AxiosResponse<{ message: string; submission: Submission }> = await this.client.post('/submissions', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    // Clear submissions cache
    this.clearCache('submissions');
    return response.data;
  }

  // Get my submission for an assignment
  async getMySubmission(assignmentId: string): Promise<{ submission: Submission | null; hasPaid?: boolean }> {
    return this.cachedRequest(
      `my-submission:${assignmentId}`,
      async () => {
        try {
          const response: AxiosResponse<{ submission: Submission }> = await this.client.get(`/assignments/${assignmentId}/my-submission`);
          return response.data;
        } catch (error: any) {
          if (error.response?.status === 404) {
            return { submission: null };
          }
          throw error;
        }
      },
      1 * 60 * 1000 // 1 minute cache
    );
  }

  // Check if user can edit submission
  async canEditSubmission(assignmentId: string): Promise<{ canEdit: boolean; reason: string }> {
    return this.cachedRequest(
      `can-edit-submission:${assignmentId}`,
      async () => {
        const response: AxiosResponse<{ canEdit: boolean; reason: string }> = await this.client.get(`/assignments/${assignmentId}/can-edit`);
        return response.data;
      },
      1 * 60 * 1000 // 1 minute cache
    );
  }

  // Update submission (for students)
  async updateSubmission(assignmentId: string, data: any): Promise<{ message: string; submission: Submission }> {
    const response: AxiosResponse<{ message: string; submission: Submission }> = await this.client.put(`/assignments/${assignmentId}/submission`, data);
    // Clear submissions cache
    this.clearCache('submissions');
    this.clearCache(`my-submission:${assignmentId}`);
    return response.data;
  }

  async getMySubmissions(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<PaginatedResponse<Submission>> {
    const cacheKey = `my-submissions:${JSON.stringify(params)}`;
    return this.cachedRequest(
      cacheKey,
      async () => {
        const response: AxiosResponse<PaginatedResponse<Submission>> = await this.client.get('/submissions/my-submissions', { params });
        return response.data;
      },
      2 * 60 * 1000 // 2 minutes cache
    );
  }

  async getSubmission(id: string): Promise<{ submission: Submission }> {
    return this.cachedRequest(
      `submission:${id}`,
      async () => {
        const response: AxiosResponse<{ submission: Submission }> = await this.client.get(`/submissions/${id}`);
        return response.data;
      },
      5 * 60 * 1000 // 5 minutes cache
    );
  }

  async getAllSubmissions(params?: {
    page?: number;
    limit?: number;
    status?: string;
    projectId?: string;
    userId?: string;
  }): Promise<PaginatedResponse<Submission>> {
    const cacheKey = `all-submissions:${JSON.stringify(params)}`;
    return this.cachedRequest(
      cacheKey,
      async () => {
        const response: AxiosResponse<PaginatedResponse<Submission>> = await this.client.get('/submissions', { params });
        return response.data;
      },
      1 * 60 * 1000 // 1 minute cache
    );
  }

  async reviewSubmission(id: string, data: ReviewFormData): Promise<{ message: string; submission: Submission }> {
    const response: AxiosResponse<{ message: string; submission: Submission }> = await this.client.put(`/submissions/${id}/review`, data);
    // Clear submissions cache
    this.clearCache('submissions');
    this.clearCache(`submission:${id}`);
    return response.data;
  }

  async acceptSubmission(id: string): Promise<{ message: string; submission: Submission }> {
    const response: AxiosResponse<{ message: string; submission: Submission }> = await this.client.put(`/submissions/${id}/accept`);
    // Clear submissions cache
    this.clearCache('submissions');
    this.clearCache(`submission:${id}`);
    return response.data;
  }

  async rejectSubmission(id: string, reason: string): Promise<{ message: string; submission: Submission }> {
    const response: AxiosResponse<{ message: string; submission: Submission }> = await this.client.put(`/submissions/${id}/reject`, { reason });
    // Clear submissions cache
    this.clearCache('submissions');
    this.clearCache(`submission:${id}`);
    return response.data;
  }

  async deleteSubmission(id: string): Promise<{ message: string }> {
    const response: AxiosResponse<{ message: string }> = await this.client.delete(`/submissions/${id}`);
    // Clear submissions cache
    this.clearCache('submissions');
    this.clearCache(`submission:${id}`);
    return response.data;
  }

  // Payment endpoints
  async initializeLateFeePayment(data: PaymentFormData): Promise<{ message: string; payment: Payment; paystack: PaystackResponse }> {
    const response: AxiosResponse<{ message: string; payment: Payment; paystack: PaystackResponse }> = await this.client.post('/payments/late-fee', data);
    return response.data;
  }

  async verifyPayment(reference: string): Promise<{ success: boolean; message: string; payment: Payment }> {
    const response: AxiosResponse<{ success: boolean; message: string; payment: Payment }> = await this.client.post('/payments/verify', { reference });
    return response.data;
  }

  async getPaymentHistory(params?: { page?: number; limit?: number }): Promise<PaginatedResponse<Payment>> {
    const cacheKey = `payment-history:${JSON.stringify(params)}`;
    return this.cachedRequest(
      cacheKey,
      async () => {
        const response: AxiosResponse<PaginatedResponse<Payment>> = await this.client.get('/payments/history', { params });
        return response.data;
      },
      2 * 60 * 1000 // 2 minutes cache
    );
  }

  async getPayment(id: string): Promise<{ payment: Payment }> {
    return this.cachedRequest(
      `payment:${id}`,
      async () => {
        const response: AxiosResponse<{ payment: Payment }> = await this.client.get(`/payments/${id}`);
        return response.data;
      },
      5 * 60 * 1000 // 5 minutes cache
    );
  }

  // Class Management
  async getClasses(params?: { page?: number; limit?: number; status?: string }) {
    const cacheKey = `classes:${JSON.stringify(params)}`;
    return this.cachedRequest(
      cacheKey,
      async () => {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        if (params?.status) queryParams.append('status', params.status);

        const response = await this.client.get(`/classes?${queryParams.toString()}`);
        return response.data;
      },
      3 * 60 * 1000 // 3 minutes cache
    );
  }

  async createClass(data: {
    name: string;
    description: string;
    maxStudents?: number;
    startDate?: string;
    endDate?: string;
    settings?: any;
  }) {
    const response = await this.client.post('/classes', data);
    // Clear classes cache
    this.clearCache('classes');
    return response.data;
  }

  async getClass(id: string) {
    return this.cachedRequest(
      `class:${id}`,
      async () => {
        const response = await this.client.get(`/classes/${id}`);
        return response.data;
      },
      5 * 60 * 1000 // 5 minutes cache
    );
  }

  async updateClass(id: string, data: any) {
    const response = await this.client.put(`/classes/${id}`, data);
    // Clear related caches
    this.clearCache('classes');
    this.clearCache(`class:${id}`);
    return response.data;
  }

  async deleteClass(id: string) {
    const response = await this.client.delete(`/classes/${id}`);
    // Clear related caches
    this.clearCache('classes');
    this.clearCache(`class:${id}`);
    return response.data;
  }

  async joinClass(enrollmentCode: string) {
    const response = await this.client.post('/classes/join', { enrollmentCode });
    // Clear classes cache
    this.clearCache('classes');
    return response.data;
  }

  async requestToJoinClass(classId: string, message?: string) {
    const response = await this.client.post('/classes/request-join', { classId, message });
    return response.data;
  }

  async leaveClass(classId: string) {
    const response = await this.client.post(`/classes/${classId}/leave`);
    // Clear classes cache
    this.clearCache('classes');
    this.clearCache(`class:${classId}`);
    return response.data;
  }

  async getClassAssignments(classId: string, params?: { page?: number; limit?: number; status?: string }) {
    const cacheKey = `class-assignments:${classId}:${JSON.stringify(params)}`;
    return this.cachedRequest(
      cacheKey,
      async () => {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        if (params?.status) queryParams.append('status', params.status);

        const response = await this.client.get(`/classes/${classId}/assignments?${queryParams.toString()}`);
        return response.data;
      },
      2 * 60 * 1000 // 2 minutes cache
    );
  }

  async inviteStudents(classId: string, data: { emails: string[]; message?: string; createAccounts?: boolean }) {
    const response = await this.client.post(`/classes/${classId}/invite`, data);
    return response.data;
  }

  async createClassSchedule(data: {
    classId: string;
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    type: 'virtual' | 'physical';
    location?: string;
    meetingLink?: string;
  }) {
    const response = await this.client.post(`/classes/${data.classId}/schedule`, data);
    // Clear class cache
    this.clearCache(`class:${data.classId}`);
    return response.data;
  }

  async updateClassSchedule(scheduleId: string, data: any) {
    const response = await this.client.put(`/classes/schedule/${scheduleId}`, data);
    return response.data;
  }

  async deleteClassSchedule(scheduleId: string) {
    const response = await this.client.delete(`/classes/schedule/${scheduleId}`);
    return response.data;
  }

  // Assignment Management
  async getAssignments(params?: { page?: number; limit?: number; status?: string; classId?: string }) {
    const cacheKey = `assignments:${JSON.stringify(params)}`;
    return this.cachedRequest(
      cacheKey,
      async () => {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        if (params?.status) queryParams.append('status', params.status);
        if (params?.classId) queryParams.append('classId', params.classId);

        const response = await this.client.get(`/assignments?${queryParams.toString()}`);
        return response.data;
      },
      3 * 60 * 1000 // 3 minutes cache
    );
  }

  async createAssignment(data: {
    title: string;
    description: string;
    classId: string;
    type?: string;
    difficulty?: string;
    maxScore?: number;
    startDate: string;
    deadline: string;
    requirements: string;
    sampleOutputUrl?: string;
    sampleOutputCode?: any;
    submissionMode?: string;
    paymentRequired?: boolean;
    paymentAmount?: number;
    allowLateSubmission?: boolean;
    latePenalty?: number;
  }) {
    const response = await this.client.post('/assignments', data);
    // Clear assignments cache
    this.clearCache('assignments');
    return response.data;
  }

  async getAssignment(id: string) {
    return this.cachedRequest(
      `assignment:${id}`,
      async () => {
        const response = await this.client.get(`/assignments/${id}`);
        return response.data;
      },
      5 * 60 * 1000 // 5 minutes cache
    );
  }

  async updateAssignment(id: string, data: any) {
    const response = await this.client.put(`/assignments/${id}`, data);
    // Clear related caches
    this.clearCache('assignments');
    this.clearCache(`assignment:${id}`);
    // Also clear class cache if classId is returned so class detail refreshes correctly
    if ((response.data?.assignment && response.data.assignment.classId) || (response.data?.assignment?.classId)) {
      const classId = response.data.assignment.classId;
      this.clearCache(`class:${classId}`);
    }
    return response.data;
  }

  async deleteAssignment(id: string) {
    const response = await this.client.delete(`/assignments/${id}`);
    // Clear related caches
    this.clearCache('assignments');
    this.clearCache(`assignment:${id}`);
    return response.data;
  }

  async markSubmission(assignmentId: string, submissionId: string, data: {
    score?: number;
    feedback?: string;
    status?: string;
    requestCorrection?: boolean;
    correctionComments?: string;
  }): Promise<{ message: string; submission: any }> {
    const response: AxiosResponse<{ message: string; submission: any }> = await this.client.put(
      `/assignments/${assignmentId}/submissions/${submissionId}/mark`,
      data
    );
    // Clear submission caches
    this.clearCache(`assignment-submissions:${assignmentId}`);
    this.clearCache('assignments');
    return response.data;
  }

  async submitAssignment(assignmentId: string, data: {
    submissionType: 'github' | 'code' | 'link' | 'zip';
    githubLink?: string;
    submissionLink?: string;
    codeSubmission?: {
      html: string;
      css: string;
      javascript: string;
    };
    zipFile?: File;
  }) {
    const formData = new FormData();
    formData.append('submissionType', data.submissionType);

    if (data.githubLink) {
      formData.append('githubLink', data.githubLink);
    }

    if (data.submissionLink) {
      formData.append('submissionLink', data.submissionLink);
    }

    if (data.codeSubmission) {
      formData.append('codeSubmission', JSON.stringify(data.codeSubmission));
    }

    if (data.zipFile) {
      formData.append('zipFile', data.zipFile);
    }

    const response = await this.client.post(`/assignments/${assignmentId}/submit`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    // Clear assignments cache
    this.clearCache('assignments');
    return response.data;
  }

  async getAssignmentSubmissions(assignmentId: string, params?: { page?: number; limit?: number; status?: string }) {
    const cacheKey = `assignment-submissions:${assignmentId}:${JSON.stringify(params)}`;
    return this.cachedRequest(
      cacheKey,
      async () => {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        if (params?.status) queryParams.append('status', params.status);

        const response = await this.client.get(`/assignments/${assignmentId}/submissions?${queryParams.toString()}`);
        return response.data;
      },
      1 * 60 * 1000 // 1 minute cache
    );
  }

  async unlockAssignment(assignmentId: string) {
    const response = await this.client.post(`/assignments/${assignmentId}/unlock`);
    // Clear assignments cache
    this.clearCache('assignments');
    this.clearCache(`assignment:${assignmentId}`);
    return response.data;
  }

  async awardAttendanceScore(classId: string, data: {
    userId: string;
    score: number;
    notes?: string;
  }) {
    const response = await this.client.post(`/assignments/${classId}/attendance`, data);
    // Clear leaderboard cache when attendance is updated
    this.clearCache(`class-leaderboard:${classId}`);
    return response.data;
  }



  // HRMS & Appraisals
  async getHRMSDashboardStats() {
    return this.cachedRequest(
      'dashboard-stats',
      async () => {
        const response: AxiosResponse<any> = await this.client.get('/hrms/dashboard/stats');
        return response.data;
      },
      2 * 60 * 1000 // 2 minutes cache
    );
  }

  async getTeamMembers(page: number = 1, limit: number = 10, search: string = '') {
    const cacheKey = `team-members:${page}:${limit}:${search}`;
    return this.cachedRequest(
      cacheKey,
      async () => {
        const response: AxiosResponse<any> = await this.client.get('/hrms/team/members', {
          params: { page, limit, search }
        });
        return response.data;
      },
      1 * 60 * 1000 // 1 minute cache
    );
  }

  async getTeams() {
    return this.cachedRequest(
      'teams-list',
      async () => {
        const response: AxiosResponse<any> = await this.client.get('/hrms/teams');
        return response.data;
      },
      2 * 60 * 1000 // 2 minutes cache
    );
  }

  async getSupervisorAppraisals() {
    return this.cachedRequest(
      'supervisor-appraisals',
      async () => {
        const response: AxiosResponse<any> = await this.client.get('/hrms/supervisor/appraisals');
        return response.data;
      },
      2 * 60 * 1000
    );
  }

  async getDemographics() {
    return this.cachedRequest(
      'demographics',
      async () => {
        const response: AxiosResponse<any> = await this.client.get('/hrms/dashboard/demographics');
        return response.data;
      },
      2 * 60 * 1000
    );
  }

  // Standup Management
  async createStandup(data: { title: string; scheduledFor: string; description?: string; teamId?: string }) {
    const response: AxiosResponse<any> = await this.client.post('/standups', data);
    return response.data;
  }

  async getStandups(page: number = 1, limit: number = 10, status?: string, teamId?: string) {
    const cacheKey = `standups:${page}:${limit}:${status}:${teamId}`;
    return this.cachedRequest(
      cacheKey,
      async () => {
        const response: AxiosResponse<any> = await this.client.get('/standups', {
          params: { page, limit, status, teamId }
        });
        return response.data;
      },
      1 * 60 * 1000
    );
  }

  async getStandupById(id: string) {
    return this.cachedRequest(
      `standup:${id}`,
      async () => {
        const response: AxiosResponse<any> = await this.client.get(`/standups/${id}`);
        return response.data;
      },
      30 * 1000
    );
  }

  async submitStandupResponse(standupId: string, data: {
    whatDidYouDo: string;
    whatWillYouDo: string;
    blockers?: string;
    attendanceStatus: 'present' | 'absent' | 'late';
  }) {
    const response: AxiosResponse<any> = await this.client.post(`/standups/${standupId}/respond`, data);
    this.invalidateCache(`standup:${standupId}`);
    return response.data;
  }

  async getStandupAttendance(standupId: string) {
    const response: AxiosResponse<any> = await this.client.get(`/standups/${standupId}/attendance`);
    return response.data;
  }

  async createActionItem(standupId: string, data: {
    assignedTo: string;
    description: string;
    dueDate?: string;
  }) {
    const response: AxiosResponse<any> = await this.client.post(`/standups/${standupId}/action-items`, data);
    this.invalidateCache(`standup:${standupId}`);
    return response.data;
  }

  async updateActionItem(actionItemId: string, data: {
    status?: 'pending' | 'in_progress' | 'completed';
    description?: string;
    dueDate?: string;
  }) {
    const response: AxiosResponse<any> = await this.client.put(`/standups/action-items/${actionItemId}`, data);
    return response.data;
  }

  async getMyActionItems(status?: string) {
    const cacheKey = `my-action-items:${status}`;
    return this.cachedRequest(
      cacheKey,
      async () => {
        const response: AxiosResponse<any> = await this.client.get('/standups/my/action-items', {
          params: { status }
        });
        return response.data;
      },
      1 * 60 * 1000
    );
  }

  async getAppraisalCycles() {
    return this.cachedRequest(
      'appraisal-cycles',
      async () => {
        // ... existing logic if any or simple get
        const response = await this.client.get('/appraisals/cycles');
        return response.data;
      }
    );
  }


  async getMyAppraisals() {
    return this.cachedRequest(
      'my-appraisals',
      async () => {
        const response = await this.client.get('/appraisals/my');
        return response.data;
      },
      2 * 60 * 1000
    );
  }

  // Portfolio
  async createPortfolio(data: any) {
    const response = await this.client.post('/portfolio', data);
    return response.data;
  }

  async getMyPortfolio() {
    return this.cachedRequest(
      'my-portfolio',
      async () => {
        const response = await this.client.get('/portfolio/me');
        return response.data;
      },
      5 * 60 * 1000
    );
  }

  async updatePortfolio(data: any) {
    const response = await this.client.put('/portfolio', data);
    this.invalidateCache('my-portfolio');
    return response.data;
  }

  async getPublicPortfolio(slug: string) {
    const response = await this.client.get(`/portfolio/public/${slug}`);
    return response.data;
  }

  async addPortfolioProject(data: any) {
    const response = await this.client.post('/portfolio/projects', data);
    this.invalidateCache('my-portfolio');
    return response.data;
  }

  async updatePortfolioProject(id: string, data: any) {
    const response = await this.client.put(`/portfolio/projects/${id}`, data);
    this.invalidateCache('my-portfolio');
    return response.data;
  }

  async deletePortfolioProject(id: string) {
    const response = await this.client.delete(`/portfolio/projects/${id}`);
    this.invalidateCache('my-portfolio');
    return response.data;
  }

  async getAtRiskInterns() {
    const response = await this.client.get('/performance/analytics/at-risk');
    return response.data;
  }

  // Gamification
  async getUserBadges(userId: string) {
    const response = await this.client.get(`/gamification/badges/user/${userId}`);
    return response.data;
  }

  async getRecognitions(userId?: string) {
    const url = userId ? `/gamification/recognitions/user/${userId}` : '/gamification/recognitions';
    const response = await this.client.get(url);
    return response.data;
  }

  async getGamificationLeaderboard() {
    const response = await this.client.get('/gamification/leaderboard');
    return response.data;
  }

  async sendRecognition(data: { toUserId: string, message: string, category: string, isPublic: boolean }) {
    const response = await this.client.post('/gamification/recognitions', data);
    return response.data;
  }

  async getInternsOfTheMonth() {
    const response = await this.client.get('/gamification/intern-of-month');
    return response.data;
  }

  async createObjective(appraisalId: string, data: any) {
    const response = await this.client.post(`/appraisals/${appraisalId}/objectives`, data);
    this.clearCache('my-appraisals');
    return response.data;
  }

  // Payroll
  async getMyPayrollHistory() {
    return this.cachedRequest(
      'my-payroll',
      async () => {
        const response = await this.client.get('/payroll/my');
        return response.data;
      },
      5 * 60 * 1000
    );
  }

  async getPayrollDetails(id: string) {
    return this.cachedRequest(
      `payroll:${id}`,
      async () => {
        const response = await this.client.get(`/payroll/${id}`);
        return response.data;
      },
      5 * 60 * 1000
    );
  }

  async checkUserBlockStatus() {
    return this.cachedRequest(
      'user-block-status',
      async () => {

        const response = await this.client.get('/assignments/user/block-status');
        return response.data;
      },
      30 * 1000 // 30 seconds cache
    );
  }

  async processOverduePayment(data: {
    paymentReference: string;
    amount: number;
  }) {
    const response = await this.client.post('/assignments/user/process-payment', data);
    // Clear block status cache
    this.clearCache('user-block-status');
    return response.data;
  }

  // Challenge Management
  async getChallenges(params?: { page?: number; limit?: number; status?: string }) {
    const cacheKey = `challenges:${JSON.stringify(params)}`;
    return this.cachedRequest(
      cacheKey,
      async () => {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        if (params?.status) queryParams.append('status', params.status);

        const response = await this.client.get(`/challenges?${queryParams.toString()}`);
        return response.data;
      },
      3 * 60 * 1000 // 3 minutes cache
    );
  }

  async createChallenge(data: any) {
    const response = await this.client.post('/challenges', data);
    // Clear challenges cache
    this.clearCache('challenges');
    return response.data;
  }

  async getChallenge(id: string) {
    return this.cachedRequest(
      `challenge:${id}`,
      async () => {
        const response = await this.client.get(`/challenges/${id}`);
        return response.data;
      },
      5 * 60 * 1000 // 5 minutes cache
    );
  }

  async updateChallenge(id: string, data: any) {
    const response = await this.client.put(`/challenges/${id}`, data);
    // Clear related caches
    this.clearCache('challenges');
    this.clearCache(`challenge:${id}`);
    return response.data;
  }

  async deleteChallenge(id: string) {
    const response = await this.client.delete(`/challenges/${id}`);
    // Clear related caches
    this.clearCache('challenges');
    this.clearCache(`challenge:${id}`);
    return response.data;
  }

  async registerForChallenge(challengeId: string) {
    const response = await this.client.post(`/challenges/${challengeId}/register`);
    // Clear challenges cache
    this.clearCache('challenges');
    this.clearCache(`challenge:${challengeId}`);
    return response.data;
  }

  async getChallengeLeaderboard(challengeId: string, params?: { page?: number; limit?: number; filter?: string }) {
    const cacheKey = `challenge-leaderboard:${challengeId}:${JSON.stringify(params)}`;
    return this.cachedRequest(
      cacheKey,
      async () => {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        if (params?.filter) queryParams.append('filter', params.filter);

        const response = await this.client.get(`/challenges/${challengeId}/leaderboard?${queryParams.toString()}`);
        return response.data;
      },
      1 * 60 * 1000 // 1 minute cache
    );
  }

  // Payment Management
  async getPayments(params?: { page?: number; limit?: number; status?: string }) {
    const cacheKey = `payments:${JSON.stringify(params)}`;
    return this.cachedRequest(
      cacheKey,
      async () => {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        if (params?.status) queryParams.append('status', params.status);

        const response = await this.client.get(`/payments?${queryParams.toString()}`);
        return response.data;
      },
      2 * 60 * 1000 // 2 minutes cache
    );
  }

  async createPayment(data: {
    amount: number;
    submissionId: string;
    description: string;
  }) {
    const response = await this.client.post('/payments', data);
    // Clear payments cache
    this.clearCache('payments');
    return response.data;
  }

  // Dashboard Data
  async getDashboardStats() {
    return this.cachedRequest(
      'dashboard-stats',
      async () => {
        const response: AxiosResponse<any> = await this.client.get('/dashboard/stats');
        return response.data;
      },
      2 * 60 * 1000 // 2 minutes cache
    );
  }

  async getProgressStats() {
    return this.cachedRequest(
      'progress-stats',
      async () => {
        const response: AxiosResponse<{ stats: any }> = await this.client.get('/dashboard/progress-stats');
        return response.data;
      },
      2 * 60 * 1000 // 2 minutes cache
    );
  }

  // Leaderboard endpoints
  async getLeaderboard(params?: {
    page?: number;
    limit?: number;
    filter?: string;
    projectId?: string;
  }): Promise<PaginatedResponse<LeaderboardEntry>> {
    const cacheKey = `leaderboard:${JSON.stringify(params)}`;
    return this.cachedRequest(
      cacheKey,
      async () => {
        const response: AxiosResponse<PaginatedResponse<LeaderboardEntry>> = await this.client.get('/leaderboard', { params });
        return response.data;
      },
      1 * 60 * 1000 // 1 minute cache
    );
  }

  async getMyRank(): Promise<UserRank> {
    return this.cachedRequest(
      'my-rank',
      async () => {
        const response: AxiosResponse<UserRank> = await this.client.get('/leaderboard/my-rank');
        return response.data;
      },
      2 * 60 * 1000 // 2 minutes cache
    );
  }

  async getClassLeaderboard(classId: string, params?: {
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<ClassLeaderboardEntry>> {
    const cacheKey = `class-leaderboard:${classId}:${JSON.stringify(params)}`;
    return this.cachedRequest(
      cacheKey,
      async () => {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.limit) queryParams.append('limit', params.limit.toString());

        const response: AxiosResponse<PaginatedResponse<ClassLeaderboardEntry>> = await this.client.get(`/assignments/${classId}/leaderboard?${queryParams.toString()}`);
        return response.data;
      },
      1 * 60 * 1000 // 1 minute cache
    );
  }

  async refreshClassLeaderboard(classId: string) {
    const response = await this.client.post(`/assignments/${classId}/leaderboard/refresh`);
    // Clear leaderboard cache
    this.clearCache(`class-leaderboard:${classId}`);
    return response.data;
  }

  async getProjectLeaderboard(projectId: string, params?: {
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<ProjectLeaderboardEntry>> {
    const cacheKey = `project-leaderboard:${projectId}:${JSON.stringify(params)}`;
    return this.cachedRequest(
      cacheKey,
      async () => {
        const response: AxiosResponse<PaginatedResponse<ProjectLeaderboardEntry>> = await this.client.get(`/leaderboard/project/${projectId}`, { params });
        return response.data;
      },
      1 * 60 * 1000 // 1 minute cache
    );
  }

  async getLeaderboardStats(): Promise<{
    stats: LeaderboardStats;
    topPerformers: User[];
    personalStats?: PersonalStats;
  }> {
    return this.cachedRequest(
      'leaderboard-stats',
      async () => {
        const response: AxiosResponse<{
          stats: LeaderboardStats;
          topPerformers: User[];
          personalStats?: PersonalStats;
        }> = await this.client.get('/leaderboard/stats');
        return response.data;
      },
      2 * 60 * 1000 // 2 minutes cache
    );
  }

  async getStreakLeaderboard(params?: {
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<LeaderboardEntry>> {
    const cacheKey = `streak-leaderboard:${JSON.stringify(params)}`;
    return this.cachedRequest(
      cacheKey,
      async () => {
        const response: AxiosResponse<PaginatedResponse<LeaderboardEntry>> = await this.client.get('/leaderboard/streaks', { params });
        return response.data;
      },
      1 * 60 * 1000 // 1 minute cache
    );
  }

  // Admin endpoints
  async getAdminStats(): Promise<any> {
    return this.cachedRequest(
      'admin-stats',
      async () => {
        const response: AxiosResponse<any> = await this.client.get('/admin/stats');
        return response.data;
      },
      1 * 60 * 1000 // 1 minute cache
    );
  }

  async getAdminUsers(params?: { page?: number; limit?: number; role?: string; status?: string }): Promise<{ users: User[]; total: number; page: number; totalPages: number }> {
    const cacheKey = `admin-users:${JSON.stringify(params)}`;
    return this.cachedRequest(
      cacheKey,
      async () => {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        if (params?.role) queryParams.append('role', params.role);
        if (params?.status) queryParams.append('status', params.status);

        const response: AxiosResponse<{ users: User[]; total: number; page: number; totalPages: number }> = await this.client.get(`/admin/users?${queryParams.toString()}`);
        return response.data;
      },
      1 * 60 * 1000 // 1 minute cache
    );
  }

  async updateUserRole(userId: string, role: string, permissions?: any): Promise<{ message: string; user: User }> {
    const response: AxiosResponse<{ message: string; user: User }> = await this.client.put(`/admin/users/${userId}/role`, { role, permissions });
    // Clear admin users cache
    this.clearCache('admin-users');
    return response.data;
  }

  async updateUser(userId: string, data: Partial<User>): Promise<{ message: string; user: User }> {
    const response: AxiosResponse<{ message: string; user: User }> = await this.client.put(`/users/${userId}`, data);
    // Clear related caches
    this.clearCache('admin-users');
    this.clearCache('profile');
    return response.data;
  }

  async activateUser(userId: string, isActive: boolean): Promise<{ message: string; user: User }> {
    const response: AxiosResponse<{ message: string; user: User }> = await this.client.patch(`/admin/users/${userId}/activate`, { isActive });
    // Clear admin users cache
    this.clearCache('admin-users');
    return response.data;
  }

  async verifyUser(userId: string): Promise<{ message: string; user: User }> {
    const response: AxiosResponse<{ message: string; user: User }> = await this.client.patch(`/admin/users/${userId}/verify`, {});
    // Clear admin users cache
    this.clearCache('admin-users');
    this.clearCache(`user-details:${userId}`);
    return response.data;
  }

  async getUserDetails(userId: string): Promise<{ user: User }> {
    return this.cachedRequest(
      `user-details:${userId}`,
      async () => {
        const response: AxiosResponse<{ user: User }> = await this.client.get(`/admin/users/${userId}`);
        return response.data;
      },
      5 * 60 * 1000 // 5 minutes cache
    );
  }

  async deleteUser(userId: string): Promise<{ message: string }> {
    const response: AxiosResponse<{ message: string }> = await this.client.delete(`/users/${userId}`);
    // Clear related caches
    this.clearCache('admin-users');
    this.clearCache(`user-details:${userId}`);
    return response.data;
  }

  async getAdminPayments(params?: { page?: number; limit?: number; status?: string; type?: string }): Promise<PaginatedResponse<Payment>> {
    const cacheKey = `admin-payments:${JSON.stringify(params)}`;
    return this.cachedRequest(
      cacheKey,
      async () => {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        if (params?.status) queryParams.append('status', params.status);
        if (params?.type) queryParams.append('type', params.type);

        const response: AxiosResponse<PaginatedResponse<Payment>> = await this.client.get(`/admin/payments?${queryParams.toString()}`);
        return response.data;
      },
      1 * 60 * 1000 // 1 minute cache
    );
  }

  async getPaymentStats(): Promise<any> {
    return this.cachedRequest(
      'payment-stats',
      async () => {
        const response: AxiosResponse<any> = await this.client.get('/payments/admin/stats');
        return response.data;
      },
      2 * 60 * 1000 // 2 minutes cache
    );
  }

  async getAdminAssignments(): Promise<{ assignments: any[] }> {
    return this.cachedRequest(
      'admin-assignments',
      async () => {
        const response: AxiosResponse<{ assignments: any[] }> = await this.client.get('/admin/assignments');
        return response.data;
      },
      2 * 60 * 1000 // 2 minutes cache
    );
  }

  async getAdminClasses(): Promise<{ classes: any[] }> {
    return this.cachedRequest(
      'admin-classes',
      async () => {
        const response: AxiosResponse<{ classes: any[] }> = await this.client.get('/admin/classes');
        return response.data;
      },
      2 * 60 * 1000 // 2 minutes cache
    );
  }

  async getAdminProjects(): Promise<{ projects: any[] }> {
    return this.cachedRequest(
      'admin-projects',
      async () => {
        const response: AxiosResponse<{ projects: any[] }> = await this.client.get('/admin/projects');
        return response.data;
      },
      2 * 60 * 1000 // 2 minutes cache
    );
  }

  async createAdminAssignment(data: any): Promise<{ message: string; assignment: any }> {
    const response: AxiosResponse<{ message: string; assignment: any }> = await this.client.post('/admin/assignments', data);
    // Clear assignments cache
    this.clearCache('admin-assignments');
    this.clearCache('assignments');
    return response.data;
  }

  async getAdminClassStudents(classId: string): Promise<{ students: any[] }> {
    return this.cachedRequest(
      `admin-class-students:${classId}`,
      async () => {
        const response: AxiosResponse<{ students: any[] }> = await this.client.get(`/admin/classes/${classId}/students`);
        return response.data;
      },
      2 * 60 * 1000 // 2 minutes cache
    );
  }

  async createAdminClass(data: any): Promise<{ message: string; class: any }> {
    const response: AxiosResponse<{ message: string; class: any }> = await this.client.post('/admin/classes', data);
    // Clear classes cache
    this.clearCache('admin-classes');
    this.clearCache('classes');
    return response.data;
  }

  async resendAssignmentNotification(assignmentId: string): Promise<{ message: string; sentCount: number }> {
    const response = await this.client.post(`/admin/assignments/${assignmentId}/notify`);
    return response.data;
  }

  async updateAdminUser(userId: string, data: {
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
    role?: 'student' | 'admin' | 'partial_admin';
    isActive?: boolean;
    emailVerified?: boolean;
  }): Promise<{ message: string; user: any }> {
    const response = await this.client.put(`/admin/users/${userId}`, data);
    return response.data;
  }

  async inviteAdminClassStudents(classId: string, data: { emails: string[]; message: string }): Promise<{ message: string }> {
    const response: AxiosResponse<{ message: string }> = await this.client.post(`/admin/classes/${classId}/invite`, data);
    return response.data;
  }

  async getAdminRecentActivity(): Promise<{ activity: any[] }> {
    return this.cachedRequest(
      'admin-recent-activity',
      async () => {
        const response: AxiosResponse<{ activity: any[] }> = await this.client.get('/admin/activity');
        return response.data;
      },
      30 * 1000 // 30 seconds cache
    );
  }

  async getAdminQuickSubmissions(): Promise<{ data: any[] }> {
    return this.cachedRequest(
      'admin-quick-submissions',
      async () => {
        const response: AxiosResponse<{ data: any[] }> = await this.client.get('/admin/quick-submissions');
        return response.data;
      },
      30 * 1000 // 30 seconds cache
    );
  }

  async getAdminSubmissions(): Promise<{ data: any[] }> {
    return this.cachedRequest(
      'admin-submissions',
      async () => {
        const response: AxiosResponse<{ data: any[] }> = await this.client.get('/admin/submissions');
        return response.data;
      },
      1 * 60 * 1000 // 1 minute cache
    );
  }

  async getAdminProject(projectId: string): Promise<{ project: any }> {
    return this.cachedRequest(
      `admin-project:${projectId}`,
      async () => {
        const response: AxiosResponse<{ project: any }> = await this.client.get(`/admin/projects/${projectId}`);
        return response.data;
      },
      5 * 60 * 1000 // 5 minutes cache
    );
  }

  async reviewAdminSubmission(submissionId: string, data: any): Promise<{ message: string; submission: any }> {
    const response: AxiosResponse<{ message: string; submission: any }> = await this.client.put(`/admin/submissions/${submissionId}/review`, data);
    // Clear submissions cache
    this.clearCache('admin-submissions');
    this.clearCache('admin-quick-submissions');
    this.clearCache('submissions');
    return response.data;
  }

  async bulkReviewSubmissions(data: { submissionIds: string[]; status: string; score?: number; feedback?: string }) {
    const response = await this.client.post('/admin/submissions/bulk-review', data);
    // Clear submissions cache
    this.clearCache('admin-submissions');
    this.clearCache('admin-quick-submissions');
    this.clearCache('submissions');
    return response.data;
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string; environment: string }> {
    const response: AxiosResponse<{ status: string; timestamp: string; environment: string }> = await this.client.get('/health');
    return response.data;
  }

  // Progress endpoints
  async getProgress(userId: string): Promise<{ projects: any[]; stats: any }> {
    return this.cachedRequest(
      `progress:${userId}`,
      async () => {
        const response: AxiosResponse<{ projects: any[]; stats: any }> = await this.client.get(`/progress/${userId}`);
        return response.data;
      },
      2 * 60 * 1000 // 2 minutes cache
    );
  }

  async getUserPerformance(userId: string) {
    return this.cachedRequest(
      `performance:${userId}`,
      async () => {
        const response = await this.client.get(`/performance/${userId}`);
        return response.data;
      },
      5 * 60 * 1000 // 5 minutes cache
    );
  }

  async getRecentSubmissions(): Promise<{ submissions: any[] }> {
    return this.cachedRequest(
      'recent-submissions',
      async () => {
        const response: AxiosResponse<{ submissions: any[] }> = await this.client.get('/dashboard/recent-submissions');
        return response.data;
      },
      1 * 60 * 1000 // 1 minute cache
    );
  }

  // Notification endpoints
  async getNotifications(): Promise<{ notifications: any[] }> {
    return this.cachedRequest(
      'notifications',
      async () => {
        const response: AxiosResponse<{ notifications: any[] }> = await this.client.get('/notifications');
        return response.data;
      },
      30 * 1000 // 30 seconds cache
    );
  }

  async markNotificationRead(id: string): Promise<{ notification: any }> {
    const response: AxiosResponse<{ notification: any }> = await this.client.patch(`/notifications/${id}/read`);
    // Clear notifications cache
    this.clearCache('notifications');
    return response.data;
  }

  async deleteNotification(id: string): Promise<{ message: string }> {
    const response: AxiosResponse<{ message: string }> = await this.client.delete(`/notifications/${id}`);
    // Clear notifications cache
    this.clearCache('notifications');
    return response.data;
  }

  async createNotification(data: { type: string; title: string; content: string; targetUserId: string; metadata?: any }): Promise<{ notification: any }> {
    const response: AxiosResponse<{ notification: any }> = await this.client.post('/notifications', data);
    // Clear notifications cache
    this.clearCache('notifications');
    return response.data;
  }

  // Utility Methods
  async sendTestEmail(data: { to: string; subject: string; message: string }) {
    const response = await this.client.post('/admin/send-test-email', data);
    return response.data;
  }

  async exportData(type: 'users' | 'submissions' | 'payments' | 'classes') {
    const response = await this.client.get(`/admin/export/${type}`, {
      responseType: 'blob'
    });
    return response.data;
  }

  async importData(type: 'users' | 'classes', file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await this.client.post(`/admin/import/${type}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // Weekly Attendance Methods
  async getWeeklyAttendanceWeeks(classId: string): Promise<{ weeks: any[] }> {
    return this.cachedRequest(
      `weekly-attendance-weeks-${classId}`,
      async () => {
        const response = await this.client.get(`/weekly-attendance/classes/${classId}/weeks`);
        return response.data;
      },
      5 * 60 * 1000 // 5 minutes cache
    );
  }

  async getWeeklyAttendanceStudents(classId: string): Promise<{ students: any[] }> {
    return this.cachedRequest(
      `weekly-attendance-students-${classId}`,
      async () => {
        const response = await this.client.get(`/weekly-attendance/classes/${classId}/students`);
        return response.data;
      },
      5 * 60 * 1000 // 5 minutes cache
    );
  }

  async getWeeklyAttendance(classId: string, weekStartDate: string): Promise<{ attendance: any[] }> {
    return this.cachedRequest(
      `weekly-attendance-${classId}-${weekStartDate}`,
      async () => {
        const response = await this.client.get(`/weekly-attendance/classes/${classId}/attendance?weekStartDate=${weekStartDate}`);
        return response.data;
      },
      2 * 60 * 1000 // 2 minutes cache
    );
  }

  async getStudentAttendanceHistory(classId: string, userId: string): Promise<{ attendance: any[] }> {
    return this.cachedRequest(
      `student-attendance-history-${classId}-${userId}`,
      async () => {
        const response = await this.client.get(`/weekly-attendance/classes/${classId}/students/${userId}/attendance`);
        return response.data;
      },
      5 * 60 * 1000 // 5 minutes cache
    );
  }

  async getClassAttendanceSummary(classId: string): Promise<{ summary: any }> {
    return this.cachedRequest(
      `class-attendance-summary-${classId}`,
      async () => {
        const response = await this.client.get(`/weekly-attendance/classes/${classId}/attendance/summary`);
        return response.data;
      },
      5 * 60 * 1000 // 5 minutes cache
    );
  }

  async markWeeklyAttendance(classId: string, data: {
    userId: string;
    weekStartDate: string;
    attendance: any;
  }): Promise<{ message: string }> {
    const response = await this.client.post(`/weekly-attendance/classes/${classId}/attendance`, data);
    this.clearCache(`weekly-attendance-${classId}-${data.weekStartDate}`);
    this.clearCache(`student-attendance-history-${classId}-${data.userId}`);
    this.clearCache(`class-attendance-summary-${classId}`);
    return response.data;
  }

  async markWeeklyAttendanceBulk(classId: string, data: {
    weekStartDate: string;
    attendanceData: any[];
  }): Promise<{ message: string }> {
    const response = await this.client.post(`/weekly-attendance/classes/${classId}/attendance/bulk`, data);
    this.clearCache(`weekly-attendance-${classId}-${data.weekStartDate}`);
    this.clearCache(`class-attendance-summary-${classId}`);
    return response.data;
  }
}

export const api = new ApiClient(); 
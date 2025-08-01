import axios, { AxiosInstance, AxiosResponse } from 'axios';
import Cookies from 'js-cookie';
import { 
  User, 
  Project, 
  Submission, 
  LeaderboardEntry, 
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

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: '/api',
      headers: {
        'Content-Type': 'application/json',
      },
    });

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

  async getProfile(): Promise<{ user: User }> {
    const response: AxiosResponse<{ user: User }> = await this.client.get('/auth/profile');
    return response.data;
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    const response: AxiosResponse<{ message: string }> = await this.client.post('/auth/forgot-password', { email });
    return response.data;
  }

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    const response: AxiosResponse<{ message: string }> = await this.client.post('/auth/reset-password', { token, newPassword });
    return response.data;
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
    const response: AxiosResponse<{ message: string }> = await this.client.post('/auth/change-password', { currentPassword, newPassword });
    return response.data;
  }

  async updateProfile(data: Partial<User>): Promise<{ message: string; user: User }> {
    const response: AxiosResponse<{ message: string; user: User }> = await this.client.put('/auth/profile', data);
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
    const response: AxiosResponse<PaginatedResponse<Project>> = await this.client.get('/projects', { params });
    return response.data;
  }

  async getProject(id: string): Promise<{ project: Project }> {
    const response: AxiosResponse<{ project: Project }> = await this.client.get(`/projects/${id}`);
    return response.data;
  }

  async getTodayProject(): Promise<{ project: any }> {
    const response: AxiosResponse<{ project: any }> = await this.client.get('/dashboard/today-project');
    return response.data;
  }

  async createProject(data: ProjectFormData): Promise<{ message: string; project: Project }> {
    const response: AxiosResponse<{ message: string; project: Project }> = await this.client.post('/projects', data);
    return response.data;
  }

  async updateProject(id: string, data: Partial<ProjectFormData>): Promise<{ message: string; project: Project }> {
    const response: AxiosResponse<{ message: string; project: Project }> = await this.client.put(`/projects/${id}`, data);
    return response.data;
  }

  async deleteProject(id: string): Promise<{ message: string }> {
    const response: AxiosResponse<{ message: string }> = await this.client.delete(`/projects/${id}`);
    return response.data;
  }

  async unlockProject(id: string): Promise<{ message: string; project: Project }> {
    const response: AxiosResponse<{ message: string; project: Project }> = await this.client.post(`/projects/${id}/unlock`);
    return response.data;
  }

  async lockProject(id: string): Promise<{ message: string; project: Project }> {
    const response: AxiosResponse<{ message: string; project: Project }> = await this.client.post(`/projects/${id}/lock`);
    return response.data;
  }

  async getProjectStats(id: string): Promise<{ stats: ProjectStats }> {
    const response: AxiosResponse<{ stats: ProjectStats }> = await this.client.get(`/projects/${id}/stats`);
    return response.data;
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
    return response.data;
  }

  async getMySubmissions(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<PaginatedResponse<Submission>> {
    const response: AxiosResponse<PaginatedResponse<Submission>> = await this.client.get('/submissions/my-submissions', { params });
    return response.data;
  }

  async getSubmission(id: string): Promise<{ submission: Submission }> {
    const response: AxiosResponse<{ submission: Submission }> = await this.client.get(`/submissions/${id}`);
    return response.data;
  }

  async getAllSubmissions(params?: {
    page?: number;
    limit?: number;
    status?: string;
    projectId?: string;
    userId?: string;
  }): Promise<PaginatedResponse<Submission>> {
    const response: AxiosResponse<PaginatedResponse<Submission>> = await this.client.get('/submissions', { params });
    return response.data;
  }

  async reviewSubmission(id: string, data: ReviewFormData): Promise<{ message: string; submission: Submission }> {
    const response: AxiosResponse<{ message: string; submission: Submission }> = await this.client.put(`/submissions/${id}/review`, data);
    return response.data;
  }

  async acceptSubmission(id: string): Promise<{ message: string; submission: Submission }> {
    const response: AxiosResponse<{ message: string; submission: Submission }> = await this.client.put(`/submissions/${id}/accept`);
    return response.data;
  }

  async rejectSubmission(id: string, reason: string): Promise<{ message: string; submission: Submission }> {
    const response: AxiosResponse<{ message: string; submission: Submission }> = await this.client.put(`/submissions/${id}/reject`, { reason });
    return response.data;
  }

  async deleteSubmission(id: string): Promise<{ message: string }> {
    const response: AxiosResponse<{ message: string }> = await this.client.delete(`/submissions/${id}`);
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
    const response: AxiosResponse<PaginatedResponse<Payment>> = await this.client.get('/payments/history', { params });
    return response.data;
  }

  async getPayment(id: string): Promise<{ payment: Payment }> {
    const response: AxiosResponse<{ payment: Payment }> = await this.client.get(`/payments/${id}`);
    return response.data;
  }

  // Class Management
  async getClasses(params?: { page?: number; limit?: number; status?: string }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);

    const response = await this.client.get(`/classes?${queryParams.toString()}`);
    return response.data;
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
    return response.data;
  }

  async getClass(id: string) {
    const response = await this.client.get(`/classes/${id}`);
    return response.data;
  }

  async updateClass(id: string, data: any) {
    const response = await this.client.put(`/classes/${id}`, data);
    return response.data;
  }

  async deleteClass(id: string) {
    const response = await this.client.delete(`/classes/${id}`);
    return response.data;
  }

  async joinClass(enrollmentCode: string) {
    const response = await this.client.post('/classes/join', { enrollmentCode });
    return response.data;
  }

  async requestToJoinClass(classId: string, message?: string) {
    const response = await this.client.post('/classes/request-join', { classId, message });
    return response.data;
  }

  async leaveClass(classId: string) {
    const response = await this.client.post(`/classes/${classId}/leave`);
    return response.data;
  }

  async getClassAssignments(classId: string, params?: { page?: number; limit?: number; status?: string }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);

    const response = await this.client.get(`/classes/${classId}/assignments?${queryParams.toString()}`);
    return response.data;
  }

  async inviteStudents(classId: string, data: { emails: string[]; message?: string }) {
    const response = await this.client.post(`/classes/${classId}/invite`, data);
    return response.data;
  }

  // Assignment Management
  async getAssignments(params?: { page?: number; limit?: number; status?: string; classId?: string }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.classId) queryParams.append('classId', params.classId);

    const response = await this.client.get(`/assignments?${queryParams.toString()}`);
    return response.data;
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
    sampleOutput?: string;
    starterCode?: any;
    hints?: string;
    resources?: any[];
    submissionTypes?: string[];
    latePenalty?: number;
    allowLateSubmission?: boolean;
    maxLateHours?: number;
    requirePayment?: boolean;
    lateFeeAmount?: number;
  }) {
    const response = await this.client.post('/assignments', data);
    return response.data;
  }

  async getAssignment(id: string) {
    const response = await this.client.get(`/assignments/${id}`);
    return response.data;
  }

  async updateAssignment(id: string, data: any) {
    const response = await this.client.put(`/assignments/${id}`, data);
    return response.data;
  }

  async deleteAssignment(id: string) {
    const response = await this.client.delete(`/assignments/${id}`);
    return response.data;
  }

  async submitAssignment(assignmentId: string, data: {
    submissionType: 'github' | 'code' | 'zip';
    githubLink?: string;
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
    return response.data;
  }

  async getAssignmentSubmissions(assignmentId: string, params?: { page?: number; limit?: number; status?: string }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);

    const response = await this.client.get(`/assignments/${assignmentId}/submissions?${queryParams.toString()}`);
    return response.data;
  }

  // Assignment submission review - renamed to avoid conflict with project submission review
  // async reviewSubmission(assignmentId: string, submissionId: string, data: {
  //   status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
  //   score?: number;
  //   adminFeedback?: string;
  //   adminComments?: string;
  //   bonusPoints?: number;
  //   deductions?: number;
  // }) {
  //   const response = await this.client.put(`/assignments/${assignmentId}/submissions/${submissionId}/review`, data);
  //   return response.data;
  // }

  async unlockAssignment(assignmentId: string) {
    const response = await this.client.post(`/assignments/${assignmentId}/unlock`);
    return response.data;
  }

  // Challenge Management
  async getChallenges(params?: { page?: number; limit?: number; status?: string }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);

    const response = await this.client.get(`/challenges?${queryParams.toString()}`);
    return response.data;
  }

  async createChallenge(data: any) {
    const response = await this.client.post('/challenges', data);
    return response.data;
  }

  async getChallenge(id: string) {
    const response = await this.client.get(`/challenges/${id}`);
    return response.data;
  }

  async updateChallenge(id: string, data: any) {
    const response = await this.client.put(`/challenges/${id}`, data);
    return response.data;
  }

  async deleteChallenge(id: string) {
    const response = await this.client.delete(`/challenges/${id}`);
    return response.data;
  }

  async registerForChallenge(challengeId: string) {
    const response = await this.client.post(`/challenges/${challengeId}/register`);
    return response.data;
  }

  async getChallengeLeaderboard(challengeId: string, params?: { page?: number; limit?: number; filter?: string }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.filter) queryParams.append('filter', params.filter);

    const response = await this.client.get(`/challenges/${challengeId}/leaderboard?${queryParams.toString()}`);
    return response.data;
  }

  // Payment Management
  async getPayments(params?: { page?: number; limit?: number; status?: string }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);

    const response = await this.client.get(`/payments?${queryParams.toString()}`);
    return response.data;
  }

  async createPayment(data: {
    amount: number;
    submissionId: string;
    description: string;
  }) {
    const response = await this.client.post('/payments', data);
    return response.data;
  }

  // Duplicate verifyPayment function - commented out to avoid conflict
  // async verifyPayment(reference: string) {
  //   const response = await this.client.post('/payments/verify', { reference });
  //   return response.data;
  // }

  // Duplicate getPaymentStats function - commented out to avoid conflict
  // async getPaymentStats() {
  //   const response: AxiosResponse<any> = await this.client.get('/payments/admin/stats');
  //   return response.data;
  // }

  // Notification Management
  // Duplicate getNotifications function - commented out to avoid conflict
  // async getNotifications(params?: { page?: number; limit?: number; read?: boolean }) {
  //   const queryParams = new URLSearchParams();
  //   if (params?.page) queryParams.append('page', params.page.toString());
  //   if (params?.limit) queryParams.append('limit', params.limit.toString());
  //   if (params?.read !== undefined) queryParams.append('read', params.read.toString());

  //   const response = await this.client.get(`/notifications?${queryParams.toString()}`);
  //   return response.data;
  // }

  // Duplicate functions - commented out to avoid conflicts
  // async markNotificationAsRead(notificationId: string) {
  //   const response = await this.client.put(`/notifications/${notificationId}/read`);
  //   return response.data;
  // }

  // async markAllNotificationsAsRead() {
  //   const response = await this.client.put('/notifications/read-all');
  //   return response.data;
  // }

  // async deleteNotification(notificationId: string) {
  //   const response = await this.client.delete(`/notifications/${notificationId}`);
  //   return response.data;
  // }

  // Dashboard Data
  async getDashboardStats() {
    const response: AxiosResponse<any> = await this.client.get('/dashboard/stats');
    return response.data;
  }

  // Duplicate getRecentSubmissions function - commented out to avoid conflict
  // async getRecentSubmissions(params?: { limit?: number }) {
  //   const queryParams = new URLSearchParams();
  //   if (params?.limit) queryParams.append('limit', params.limit.toString());

  //   const response: AxiosResponse<{ submissions: any[] }> = await this.client.get(`/dashboard/recent-submissions?${queryParams.toString()}`);
  //   return response.data;
  // }

  async getProgressStats() {
    const response: AxiosResponse<{ stats: any }> = await this.client.get('/dashboard/progress-stats');
    return response.data;
  }

  // Leaderboard endpoints
  async getLeaderboard(params?: {
    page?: number;
    limit?: number;
    filter?: string;
    projectId?: string;
  }): Promise<PaginatedResponse<LeaderboardEntry>> {
    const response: AxiosResponse<PaginatedResponse<LeaderboardEntry>> = await this.client.get('/leaderboard', { params });
    return response.data;
  }

  async getMyRank(): Promise<UserRank> {
    const response: AxiosResponse<UserRank> = await this.client.get('/leaderboard/my-rank');
    return response.data;
  }

  async getProjectLeaderboard(projectId: string, params?: {
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Submission>> {
    const response: AxiosResponse<PaginatedResponse<Submission>> = await this.client.get(`/leaderboard/project/${projectId}`, { params });
    return response.data;
  }

  async getLeaderboardStats(): Promise<{
    stats: LeaderboardStats;
    topPerformers: User[];
    personalStats?: PersonalStats;
  }> {
    const response: AxiosResponse<{
      stats: LeaderboardStats;
      topPerformers: User[];
      personalStats?: PersonalStats;
    }> = await this.client.get('/leaderboard/stats');
    return response.data;
  }

  async getStreakLeaderboard(params?: {
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<LeaderboardEntry>> {
    const response: AxiosResponse<PaginatedResponse<LeaderboardEntry>> = await this.client.get('/leaderboard/streaks', { params });
    return response.data;
  }

  // Admin endpoints
  async getAdminStats(): Promise<any> {
    const response: AxiosResponse<any> = await this.client.get('/admin/stats');
    return response.data;
  }

  async getAdminUsers(params?: { page?: number; limit?: number; role?: string; status?: string }): Promise<{ users: User[]; total: number; page: number; totalPages: number }> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.role) queryParams.append('role', params.role);
    if (params?.status) queryParams.append('status', params.status);

    const response: AxiosResponse<{ users: User[]; total: number; page: number; totalPages: number }> = await this.client.get(`/admin/users?${queryParams.toString()}`);
    return response.data;
  }

  async updateUserRole(userId: string, role: string, permissions?: any): Promise<{ message: string; user: User }> {
    const response: AxiosResponse<{ message: string; user: User }> = await this.client.put(`/admin/users/${userId}/role`, { role, permissions });
    return response.data;
  }

  async updateUser(userId: string, data: Partial<User>): Promise<{ message: string; user: User }> {
    const response: AxiosResponse<{ message: string; user: User }> = await this.client.put(`/users/${userId}`, data);
    return response.data;
  }

  async activateUser(userId: string, isActive: boolean): Promise<{ message: string; user: User }> {
    const response: AxiosResponse<{ message: string; user: User }> = await this.client.patch(`/admin/users/${userId}/activate`, { isActive });
    return response.data;
  }

  async getUserDetails(userId: string): Promise<{ user: User }> {
    const response: AxiosResponse<{ user: User }> = await this.client.get(`/admin/users/${userId}`);
    return response.data;
  }

  async deleteUser(userId: string): Promise<{ message: string }> {
    const response: AxiosResponse<{ message: string }> = await this.client.delete(`/users/${userId}`);
    return response.data;
  }

  async getAdminPayments(params?: { page?: number; limit?: number; status?: string; type?: string }): Promise<PaginatedResponse<Payment>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.type) queryParams.append('type', params.type);

    const response: AxiosResponse<PaginatedResponse<Payment>> = await this.client.get(`/admin/payments?${queryParams.toString()}`);
    return response.data;
  }

  async getPaymentStats(): Promise<any> {
    const response: AxiosResponse<any> = await this.client.get('/payments/admin/stats');
    return response.data;
  }

  async getAdminAssignments(): Promise<{ assignments: any[] }> {
    const response: AxiosResponse<{ assignments: any[] }> = await this.client.get('/admin/assignments');
    return response.data;
  }

  async getAdminClasses(): Promise<{ classes: any[] }> {
    const response: AxiosResponse<{ classes: any[] }> = await this.client.get('/admin/classes');
    return response.data;
  }

  async createAdminAssignment(data: any): Promise<{ message: string; assignment: any }> {
    const response: AxiosResponse<{ message: string; assignment: any }> = await this.client.post('/admin/assignments', data);
    return response.data;
  }

  async getAdminClassStudents(classId: string): Promise<{ students: any[] }> {
    const response: AxiosResponse<{ students: any[] }> = await this.client.get(`/admin/classes/${classId}/students`);
    return response.data;
  }

  async createAdminClass(data: any): Promise<{ message: string; class: any }> {
    const response: AxiosResponse<{ message: string; class: any }> = await this.client.post('/admin/classes', data);
    return response.data;
  }

  async inviteAdminClassStudents(classId: string, data: { emails: string[]; message: string }): Promise<{ message: string }> {
    const response: AxiosResponse<{ message: string }> = await this.client.post(`/admin/classes/${classId}/invite`, data);
    return response.data;
  }

  async getAdminRecentActivity(): Promise<{ activity: any[] }> {
    const response: AxiosResponse<{ activity: any[] }> = await this.client.get('/admin/activity');
    return response.data;
  }

  async getAdminQuickSubmissions(): Promise<{ data: any[] }> {
    const response: AxiosResponse<{ data: any[] }> = await this.client.get('/admin/quick-submissions');
    return response.data;
  }

  async getAdminSubmissions(): Promise<{ data: any[] }> {
    const response: AxiosResponse<{ data: any[] }> = await this.client.get('/admin/submissions');
    return response.data;
  }

  async getAdminProject(projectId: string): Promise<{ project: any }> {
    const response: AxiosResponse<{ project: any }> = await this.client.get(`/admin/projects/${projectId}`);
    return response.data;
  }

  async reviewAdminSubmission(submissionId: string, data: any): Promise<{ message: string; submission: any }> {
    const response: AxiosResponse<{ message: string; submission: any }> = await this.client.put(`/admin/submissions/${submissionId}/review`, data);
    return response.data;
  }

  async bulkReviewSubmissions(data: { submissionIds: string[]; status: string; score?: number; feedback?: string }) {
    const response = await this.client.post('/admin/submissions/bulk-review', data);
    return response.data;
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string; environment: string }> {
    const response: AxiosResponse<{ status: string; timestamp: string; environment: string }> = await this.client.get('/health');
    return response.data;
  }

  // Progress endpoints
  async getProgress(userId: string): Promise<{ projects: any[]; stats: any }> {
    const response: AxiosResponse<{ projects: any[]; stats: any }> = await this.client.get(`/progress/${userId}`);
    return response.data;
  }

  async getRecentSubmissions(): Promise<{ submissions: any[] }> {
    const response: AxiosResponse<{ submissions: any[] }> = await this.client.get('/dashboard/recent-submissions');
    return response.data;
  }

  // Duplicate getProgressStats function - commented out to avoid conflict
  // async getProgressStats() {
  //   const response: AxiosResponse<{ stats: any }> = await this.client.get('/dashboard/progress-stats');
  //   return response.data;
  // }

  // Notification endpoints
  async getNotifications(): Promise<{ notifications: any[] }> {
    const response: AxiosResponse<{ notifications: any[] }> = await this.client.get('/notifications');
    return response.data;
  }

  async markNotificationRead(id: string): Promise<{ notification: any }> {
    const response: AxiosResponse<{ notification: any }> = await this.client.patch(`/notifications/${id}/read`);
    return response.data;
  }

  async deleteNotification(id: string): Promise<{ message: string }> {
    const response: AxiosResponse<{ message: string }> = await this.client.delete(`/notifications/${id}`);
    return response.data;
  }

  async createNotification(data: { type: string; title: string; content: string; targetUserId: string; metadata?: any }): Promise<{ notification: any }> {
    const response: AxiosResponse<{ notification: any }> = await this.client.post('/notifications', data);
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
}

export const api = new ApiClient(); 
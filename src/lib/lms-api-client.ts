import axios, { AxiosInstance } from 'axios';
import Cookies from 'js-cookie';
import env from '@/config/env';
import {
  Course,
  Module,
  Topic,
  Assessment,
  Enrollment,
  DiscussionComment,
  ProjectShowcase,
  Certificate,
  StudentMetric,
  ActivityHeatmap,
} from '@/types/lms';

class LmsApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: env.API_URL,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      timeout: 30000,
    });

    // Request Interceptor: Attach Sanctum Bearer token
    this.client.interceptors.request.use((config) => {
      const token = Cookies.get('summayyah') || Cookies.get('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Response Interceptor: Auto-handle 401 unauthenticated
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          Cookies.remove('summayyah', { path: '/' });
          Cookies.remove('token', { path: '/' });
          Cookies.remove('user_role', { path: '/' });
          Cookies.remove('active_role', { path: '/' });
          if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // --- Auth Endpoints ---
  async login(credentials: { email: string; password: string }) {
    const res = await this.client.post('/auth/login', credentials);
    if (res.data.token) {
      Cookies.set('summayyah', res.data.token, { expires: 7 });
    }
    return res.data;
  }

  async register(data: { first_name: string; last_name: string; email: string; password: string }) {
    const res = await this.client.post('/auth/register', data);
    if (res.data.token) {
      Cookies.set('summayyah', res.data.token, { expires: 7 });
    }
    return res.data;
  }

  async getCurrentUser() {
    const res = await this.client.get('/auth/me');
    return res.data.user;
  }

  async logout() {
    try {
      await this.client.post('/auth/logout');
    } finally {
      Cookies.remove('token');
    }
  }

  // --- Courses & Roadmap ---
  async getCourses(): Promise<{ data: Course[] }> {
    const res = await this.client.get('/courses');
    return res.data;
  }

  async getCourse(id: string): Promise<{ data: Course }> {
    const res = await this.client.get(`/courses/${id}`);
    return res.data;
  }

  async getCourseProgression(courseId: string): Promise<{ data: { modules: Module[] } }> {
    const res = await this.client.get(`/courses/${courseId}/progression`);
    return res.data;
  }

  async enrollCourse(courseId: string): Promise<{ data: Enrollment }> {
    const res = await this.client.post(`/progression/enroll/${courseId}`);
    return res.data;
  }

  // --- Modules & Topics ---
  async getTopic(topicId: string): Promise<{ data: Topic }> {
    const res = await this.client.get(`/topics/${topicId}`);
    return res.data;
  }

  async completeTopic(topicId: string): Promise<{ message: string }> {
    const res = await this.client.post(`/progression/topics/${topicId}/complete`);
    return res.data;
  }

  // --- Code Evaluation & Quizzes ---
  async submitCodeAssessment(topicId: string, code: string) {
    const res = await this.client.post(`/topics/${topicId}/submit`, { code });
    return res.data;
  }

  async submitAssessment(assessmentId: string, payload: { answers?: Record<string, any>; code?: string }) {
    const res = await this.client.post(`/assessments/${assessmentId}/submit`, payload);
    return res.data;
  }

  // --- Discussions ---
  async getTopicDiscussions(topicId: string): Promise<{ data: DiscussionComment[] }> {
    const res = await this.client.get(`/topics/${topicId}/discussions`);
    return res.data;
  }

  async postDiscussionComment(topicId: string, body_markdown: string, parent_id?: string) {
    const res = await this.client.post(`/topics/${topicId}/discussions`, { body_markdown, parent_id });
    return res.data;
  }

  async upvoteDiscussionComment(commentId: string) {
    const res = await this.client.post(`/discussions/${commentId}/upvote`);
    return res.data;
  }

  // --- Project Showcase ---
  async getShowcaseFeed(courseId?: string): Promise<{ data: ProjectShowcase[] }> {
    const res = await this.client.get('/projects/showcase', { params: { course_id: courseId } });
    return res.data;
  }

  async submitProject(data: { project_id: string; live_url?: string; github_url?: string; preview_html?: string }) {
    const res = await this.client.post('/projects/submit', data);
    return res.data;
  }

  async toggleProjectLike(submissionId: string): Promise<{ liked: boolean; likes_count: number }> {
    const res = await this.client.post(`/projects/submissions/${submissionId}/like`);
    return res.data;
  }

  async toggleProjectFeature(submissionId: string): Promise<{ is_featured: boolean }> {
    const res = await this.client.post(`/projects/submissions/${submissionId}/feature`);
    return res.data;
  }

  // --- Student Recognition & Leaderboards ---
  async getWeeklyLeaderboard(period?: string): Promise<{ data: StudentMetric[] }> {
    const res = await this.client.get('/leaderboard/weekly', { params: { period } });
    return res.data;
  }

  async getMonthlyLeaderboard(period?: string): Promise<{ data: StudentMetric[] }> {
    const res = await this.client.get('/leaderboard/monthly', { params: { period } });
    return res.data;
  }

  async getMyRank(): Promise<{ weekly: StudentMetric | null; monthly: StudentMetric | null }> {
    const res = await this.client.get('/leaderboard/me');
    return res.data;
  }

  async getActivityHeatmap(days: number = 365): Promise<{ metrics: ActivityHeatmap }> {
    const res = await this.client.get('/auth/activity-heatmap', { params: { days } });
    return res.data;
  }

  // --- PDF Certificates & Public Verification ---
  async getUserCertificates(): Promise<{ data: Certificate[] }> {
    const res = await this.client.get('/certificates');
    return res.data;
  }

  async downloadCertificate(uuid: string): Promise<Blob> {
    const res = await this.client.get(`/certificates/${uuid}/download`, { responseType: 'blob' });
    return res.data;
  }

  async verifyCertificate(uuid: string): Promise<{ valid: boolean; certificate?: any; message?: string }> {
    const res = await this.client.get(`/certificates/verify/${uuid}`);
    return res.data;
  }

  // --- Paystack Payments ---
  async initializePayment(assessmentId: string) {
    const res = await this.client.post('/payments/initialize', { assessment_id: assessmentId });
    return res.data;
  }

  async verifyPayment(reference: string) {
    const res = await this.client.post('/payments/verify', { reference });
    return res.data;
  }
}

export const lmsApi = new LmsApiClient();

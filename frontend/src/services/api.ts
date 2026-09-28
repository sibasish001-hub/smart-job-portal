import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import type {
  ApiResponse, PageResponse,
  RegisterRequest, LoginRequest, JwtResponse, VerifyOtpRequest,
  ForgotPasswordRequest, ResetPasswordRequest,
  CompanyRequest, CompanyResponse,
  JobRequest, JobResponse, JobSearchFilter,
  ResumeDto, ResumeAnalysisDto,
  ApplicationRequest, ApplicationResponse,
  InterviewRequest, InterviewResponse,
  NotificationDto,
  SeekerDashboard, RecruiterDashboard, AdminDashboard,
} from '../types';

// ─── Axios Instance ───────────────────────────────────────────────────────────

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor: attach access token
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('accessToken');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: handle 401 → refresh token
let isRefreshing = false;
let failedQueue: Array<{ resolve: (v: string) => void; reject: (e: unknown) => void }> = [];

const processQueue = (error: unknown, token: string | null) => {
  failedQueue.forEach(({ resolve, reject }) => (error ? reject(error) : resolve(token!)));
  failedQueue = [];
};

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        const response = await axios.post<ApiResponse<JwtResponse>>('/api/auth/refresh-token', {
          refreshToken,
        });
        const { accessToken, refreshToken: newRefresh } = response.data.data;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', newRefresh);
        processQueue(null, accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// Helper to unwrap data
const unwrap = <T>(res: { data: ApiResponse<T> }) => res.data.data;

// ─── Auth API ─────────────────────────────────────────────────────────────────

export const authApi = {
  register: (data: RegisterRequest) =>
    api.post<ApiResponse<string>>('/auth/register', data).then(unwrap),

  login: (data: LoginRequest) =>
    api.post<ApiResponse<JwtResponse>>('/auth/login', data).then(unwrap),

  verifyOtp: (data: VerifyOtpRequest) =>
    api.post<ApiResponse<JwtResponse>>('/auth/verify-otp', data).then(unwrap),

  refreshToken: (refreshToken: string) =>
    api.post<ApiResponse<JwtResponse>>('/auth/refresh-token', { refreshToken }).then(unwrap),

  forgotPassword: (data: ForgotPasswordRequest) =>
    api.post<ApiResponse<string>>('/auth/forgot-password', data).then(unwrap),

  resetPassword: (data: ResetPasswordRequest) =>
    api.post<ApiResponse<string>>('/auth/reset-password', data).then(unwrap),
};

// ─── Jobs API ─────────────────────────────────────────────────────────────────

export const jobsApi = {
  search: (filters: JobSearchFilter) =>
    api.get<ApiResponse<PageResponse<JobResponse>>>('/jobs', { params: filters }).then(unwrap),

  getById: (id: string) =>
    api.get<ApiResponse<JobResponse>>(`/jobs/${id}`).then(unwrap),

  create: (companyId: string, data: JobRequest) =>
    api.post<ApiResponse<JobResponse>>('/jobs', data, { params: { companyId } }).then(unwrap),

  update: (id: string, data: JobRequest) =>
    api.put<ApiResponse<JobResponse>>(`/jobs/${id}`, data).then(unwrap),

  delete: (id: string) =>
    api.delete<ApiResponse<void>>(`/jobs/${id}`).then(unwrap),

  toggleActive: (id: string, isActive: boolean) =>
    api.patch<ApiResponse<JobResponse>>(`/jobs/${id}/toggle-active`, null, { params: { isActive } }).then(unwrap),

  getRecommended: () =>
    api.get<ApiResponse<JobResponse[]>>('/jobs/recommended').then(unwrap),
};

// ─── Resumes API ──────────────────────────────────────────────────────────────

export const resumesApi = {
  upload: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post<ApiResponse<ResumeDto>>('/resumes/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(unwrap);
  },

  list: () =>
    api.get<ApiResponse<ResumeDto[]>>('/resumes').then(unwrap),

  getDownloadUrl: (id: string) => `/api/resumes/${id}/download`,

  getLatestAnalysis: () =>
    api.get<ApiResponse<ResumeAnalysisDto>>('/resumes/latest-analysis').then(unwrap),

  getAnalysisByResume: (resumeId: string) =>
    api.get<ApiResponse<ResumeAnalysisDto>>(`/resumes/${resumeId}/analysis`).then(unwrap),
};

// ─── Applications API ─────────────────────────────────────────────────────────

export const applicationsApi = {
  apply: (jobId: string, data: ApplicationRequest) =>
    api.post<ApiResponse<ApplicationResponse>>(`/applications/apply/${jobId}`, data).then(unwrap),

  myApplications: () =>
    api.get<ApiResponse<ApplicationResponse[]>>('/applications/my-applications').then(unwrap),

  getByJob: (jobId: string) =>
    api.get<ApiResponse<ApplicationResponse[]>>(`/applications/job/${jobId}`).then(unwrap),

  getAllForRecruiter: () =>
    api.get<ApiResponse<ApplicationResponse[]>>('/applications/recruiter/all').then(unwrap),

  getDetails: (id: string) =>
    api.get<ApiResponse<ApplicationResponse>>(`/applications/${id}`).then(unwrap),

  updateStatus: (id: string, status: string) =>
    api.patch<ApiResponse<ApplicationResponse>>(`/applications/${id}/status`, null, { params: { status } }).then(unwrap),
};

// ─── Companies API ────────────────────────────────────────────────────────────

export const companiesApi = {
  create: (data: CompanyRequest) =>
    api.post<ApiResponse<CompanyResponse>>('/companies', data).then(unwrap),

  update: (id: string, data: CompanyRequest) =>
    api.put<ApiResponse<CompanyResponse>>(`/companies/${id}`, data).then(unwrap),

  getById: (id: string) =>
    api.get<ApiResponse<CompanyResponse>>(`/companies/${id}`).then(unwrap),

  myCompanies: () =>
    api.get<ApiResponse<CompanyResponse[]>>('/companies/my-companies').then(unwrap),
};

// ─── Interviews API ───────────────────────────────────────────────────────────

export const interviewsApi = {
  schedule: (data: InterviewRequest) =>
    api.post<ApiResponse<InterviewResponse>>('/interviews', data).then(unwrap),

  updateStatus: (id: string, status: string) =>
    api.patch<ApiResponse<InterviewResponse>>(`/interviews/${id}/status`, null, { params: { status } }).then(unwrap),

  myInterviews: () =>
    api.get<ApiResponse<InterviewResponse[]>>('/interviews/my-interviews').then(unwrap),
};

// ─── Dashboard API ────────────────────────────────────────────────────────────

export const dashboardApi = {
  seeker: () =>
    api.get<ApiResponse<SeekerDashboard>>('/dashboard/seeker').then(unwrap),

  recruiter: () =>
    api.get<ApiResponse<RecruiterDashboard>>('/dashboard/recruiter').then(unwrap),

  admin: () =>
    api.get<ApiResponse<AdminDashboard>>('/dashboard/admin').then(unwrap),
};

// ─── Saved Jobs API ───────────────────────────────────────────────────────────

export const savedJobsApi = {
  save: (jobId: string) =>
    api.post<ApiResponse<string>>(`/saved-jobs/${jobId}`).then(unwrap),

  unsave: (jobId: string) =>
    api.delete<ApiResponse<string>>(`/saved-jobs/${jobId}`).then(unwrap),

  list: () =>
    api.get<ApiResponse<JobResponse[]>>('/saved-jobs').then(unwrap),

  check: (jobId: string) =>
    api.get<ApiResponse<boolean>>(`/saved-jobs/${jobId}/check`).then(unwrap),
};

// ─── Notifications API ────────────────────────────────────────────────────────

export const notificationsApi = {
  list: () =>
    api.get<ApiResponse<NotificationDto[]>>('/notifications').then(unwrap),

  markRead: (id: string) =>
    api.patch<ApiResponse<NotificationDto>>(`/notifications/${id}/read`).then(unwrap),

  markAllRead: () =>
    api.patch<ApiResponse<string>>('/notifications/read-all').then(unwrap),
};

export default api;

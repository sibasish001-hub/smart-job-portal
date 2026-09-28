// ─── Auth ────────────────────────────────────────────────────────────────────

export interface RegisterRequest {
  email: string;
  password: string;
  role: 'JOB_SEEKER' | 'RECRUITER';
  firstName: string;
  lastName: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface JwtResponse {
  accessToken: string;
  refreshToken: string;
  id: string;
  email: string;
  role: 'JOB_SEEKER' | 'RECRUITER' | 'ADMIN';
  isVerified: boolean;
  firstName: string;
  lastName: string;
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  otp: string;
  newPassword: string;
}

// ─── API Response Wrapper ────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

// ─── User & Profile ──────────────────────────────────────────────────────────

export interface Profile {
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  location: string | null;
  bio: string | null;
  title: string | null;
  githubUrl: string | null;
  linkedinUrl: string | null;
  websiteUrl: string | null;
}

// ─── Company ─────────────────────────────────────────────────────────────────

export interface CompanyRequest {
  name: string;
  description?: string;
  industry?: string;
  website?: string;
  logoUrl?: string;
}

export interface CompanyResponse {
  id: string;
  recruiterId: string;
  name: string;
  description: string | null;
  industry: string | null;
  website: string | null;
  logoUrl: string | null;
}

// ─── Jobs ────────────────────────────────────────────────────────────────────

export type RemoteType = 'REMOTE' | 'HYBRID' | 'ONSITE';
export type JobType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP';
export type ExperienceLevel = 'ENTRY' | 'JUNIOR' | 'MID' | 'SENIOR' | 'LEAD';

export interface JobRequest {
  title: string;
  description: string;
  requirements?: string;
  skillsRequired?: string;
  location: string;
  remoteType: RemoteType;
  jobType: JobType;
  experienceLevel: ExperienceLevel;
  salaryRange?: string;
}

export interface JobResponse {
  id: string;
  companyId: string;
  companyName: string;
  companyLogoUrl: string | null;
  title: string;
  description: string;
  requirements: string | null;
  skillsRequired: string | null;
  location: string;
  remoteType: RemoteType;
  jobType: JobType;
  experienceLevel: ExperienceLevel;
  salaryRange: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface JobSearchFilter {
  query?: string;
  location?: string;
  remoteType?: string;
  jobType?: string;
  experienceLevel?: string;
  skillsRequired?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: string;
}

// ─── Resumes ─────────────────────────────────────────────────────────────────

export interface ResumeDto {
  id: string;
  fileName: string;
  createdAt: string;
}

export interface ResumeAnalysisDto {
  id: string;
  resumeId: string;
  atsScore: number;
  strengths: string | null;
  weaknesses: string | null;
  missingSkills: string | null;
  improvements: string | null;
  suggestedCertifications: string | null;
  careerPath: string | null;
  createdAt: string;
}

// ─── Applications ────────────────────────────────────────────────────────────

export type ApplicationStatus = 'APPLIED' | 'SCREENING' | 'INTERVIEWING' | 'OFFERED' | 'REJECTED';

export interface ApplicationRequest {
  coverLetter?: string;
  resumeId?: string;
}

export interface ApplicationResponse {
  id: string;
  jobId: string;
  jobTitle: string;
  companyName: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  resumeId: string | null;
  resumeName: string;
  status: ApplicationStatus;
  coverLetter: string | null;
  aiMatchScore: number;
  aiMatchDetails: string | null;
  createdAt: string;
  updatedAt: string;
}

// ─── Interviews ──────────────────────────────────────────────────────────────

export interface InterviewRequest {
  applicationId: string;
  interviewDate: string;
  locationOrLink: string;
  notes?: string;
}

export interface InterviewResponse {
  id: string;
  applicationId: string;
  jobTitle: string;
  candidateName: string;
  candidateEmail: string;
  recruiterName: string;
  interviewDate: string;
  locationOrLink: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  notes: string | null;
}

// ─── Notifications ───────────────────────────────────────────────────────────

export interface NotificationDto {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

export interface SeekerDashboard {
  atsScore: number;
  totalApplications: number;
  savedJobsCount: number;
  upcomingInterviews: number;
  recentApplications: ApplicationResponse[];
  upcomingInterviewList: InterviewResponse[];
}

export interface RecruiterDashboard {
  activeJobsCount: number;
  totalApplicants: number;
  scheduledInterviews: number;
  recentJobs: JobResponse[];
  recentApplications: ApplicationResponse[];
}

export interface AdminDashboard {
  totalUsers: number;
  totalRecruiters: number;
  totalJobSeekers: number;
  totalJobsPosted: number;
  totalApplications: number;
}

// ─── Auth Store ──────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  email: string;
  role: 'JOB_SEEKER' | 'RECRUITER' | 'ADMIN';
  isVerified: boolean;
  firstName: string;
  lastName: string;
}

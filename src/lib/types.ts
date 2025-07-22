// Core Data Models
export interface User {
  id: string;
  email: string;
  timezone: string;
  delivery_time: string;
  active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface Source {
  id: string;
  user_id: string;
  type: 'rss' | 'twitter';
  url: string;
  name: string;
  active: boolean;
  last_checked: string | null;
  error_count: number;
  created_at: string;
  updated_at?: string;
  last_error?: string;
}

export interface StylePost {
  id: string;
  user_id: string;
  content: string;
  processed: boolean;
  created_at: string;
  processed_at?: string;
  word_count?: number;
}

export interface Draft {
  id: string;
  user_id: string;
  content: string;
  source_content_id: string | null;
  status: 'pending' | 'approved' | 'rejected';
  feedback_token: string | null;
  email_sent_at: string | null;
  created_at: string;
  updated_at?: string;
  source_name?: string; // For display purposes
  character_count?: number;
  engagement_score?: number;
}

export interface SourceContent {
  id: string;
  source_id: string;
  title: string | null;
  content: string;
  url: string | null;
  published_at: string | null;
  processed: boolean;
  created_at: string;
}

export interface Feedback {
  id: string;
  draft_id: string;
  feedback_type: 'positive' | 'negative';
  created_at: string;
}

// API Request/Response Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  timezone?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  expires_at: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface CreateSourceRequest {
  type: 'rss' | 'twitter';
  url: string;
  name: string;
}

export interface UpdateSourceRequest {
  name?: string;
  active?: boolean;
}

export interface StyleTrainingRequest {
  posts: string[];
}

export interface StyleTrainingStatus {
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  total_posts: number;
  processed_posts: number;
  message?: string;
}

export interface GenerateDraftsRequest {
  force?: boolean; // Force generation even if recent drafts exist
}

export interface UserSettings {
  timezone: string;
  delivery_time: string;
  email_notifications: boolean;
}

export interface DashboardStats {
  total_drafts: number;
  drafts_this_week: number;
  positive_feedback: number;
  negative_feedback: number;
  feedback_rate: number;
  active_sources: number;
}

// API Error Response
export interface ApiError {
  error: string;
  message: string;
  details?: Record<string, unknown>;
}

// Pagination
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

// API Response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

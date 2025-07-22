export interface User {
  id: string;
  email: string;
  timezone: string;
  delivery_time: string;
  active: boolean;
  created_at: string;
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
}

export interface StylePost {
  id: string;
  user_id: string;
  content: string;
  processed: boolean;
  created_at: string;
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

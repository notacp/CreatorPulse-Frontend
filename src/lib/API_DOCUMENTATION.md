# CreatorPulse API Documentation

This document describes all API endpoints, request/response formats, and error handling for the CreatorPulse Core MVP. This specification serves as the contract between the frontend and backend implementations.

## Base URL
```
Production: https://api.creatorpulse.com/v1
Development: http://localhost:8000/v1
```

## API Version
Current version: `v1`

## Content Type
All requests and responses use `application/json` content type unless otherwise specified.

## Authentication

All authenticated endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

## Response Format

All API responses follow this consistent format:

### Success Response
```typescript
{
  "success": true,
  "data": <response_data>
}
```

### Error Response
```typescript
{
  "success": false,
  "error": {
    "error": "error_code",
    "message": "Human readable error message",
    "details": {} // Optional additional error details
  }
}
```

## Error Codes

| Code | Description |
|------|-------------|
| `validation_error` | Request validation failed |
| `authentication_error` | Authentication required or invalid |
| `authorization_error` | Insufficient permissions |
| `not_found` | Resource not found |
| `server_error` | Internal server error |
| `rate_limit_error` | Rate limit exceeded |

## Authentication Endpoints

### POST /auth/login
Authenticate user with email and password.

**Request:**
```typescript
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```typescript
{
  "success": true,
  "data": {
    "user": {
      "id": "user-123",
      "email": "user@example.com",
      "timezone": "America/New_York",
      "delivery_time": "08:00:00",
      "active": true,
      "created_at": "2024-01-15T10:00:00Z"
    },
    "token": "jwt-token-here",
    "expires_at": "2024-07-23T08:00:00Z"
  }
}
```

**Errors:**
- `auth_error`: Invalid credentials
- `server_error`: Login failed

### POST /auth/register
Register new user account.

**Request:**
```typescript
{
  "email": "user@example.com",
  "password": "password123",
  "timezone": "America/New_York" // Optional, defaults to UTC
}
```

**Response:** Same as login response

**Errors:**
- `validation_error`: Email already registered or invalid input
- `server_error`: Registration failed

### POST /auth/logout
Logout current user (invalidate token).

**Headers:** `Authorization: Bearer <token>`

**Response:**
```typescript
{
  "success": true,
  "data": {
    "message": "Logged out successfully"
  }
}
```

### POST /auth/reset-password
Request password reset email.

**Request:**
```typescript
{
  "email": "user@example.com"
}
```

**Response:**
```typescript
{
  "success": true,
  "data": {
    "message": "If the email exists, a reset link has been sent"
  }
}
```

### GET /auth/verify-email?token=<verification_token>
Verify email address with token.

**Response:**
```typescript
{
  "success": true,
  "data": {
    "message": "Email verified successfully"
  }
}
```

**Errors:**
- `validation_error`: Invalid or expired token

## Source Management Endpoints

### GET /sources
Get all sources for authenticated user.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```typescript
{
  "success": true,
  "data": [
    {
      "id": "source-123",
      "user_id": "user-123",
      "type": "rss",
      "url": "https://techcrunch.com/feed/",
      "name": "TechCrunch",
      "active": true,
      "last_checked": "2024-07-22T06:00:00Z",
      "error_count": 0,
      "created_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### POST /sources
Create new content source.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```typescript
{
  "type": "rss" | "twitter",
  "url": "https://example.com/feed/",
  "name": "Source Name"
}
```

**Response:** Single source object

**Errors:**
- `validation_error`: Invalid URL or RSS feed not accessible
- `server_error`: Failed to create source

### PUT /sources/{id}
Update existing source.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```typescript
{
  "name": "Updated Name", // Optional
  "active": false // Optional
}
```

**Response:** Updated source object

**Errors:**
- `not_found`: Source not found
- `authorization_error`: Source belongs to different user

### DELETE /sources/{id}
Delete source.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```typescript
{
  "success": true,
  "data": {
    "message": "Source deleted successfully"
  }
}
```

### GET /sources/{id}/status
Get source health status.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```typescript
{
  "success": true,
  "data": {
    "status": "active" | "inactive" | "error",
    "last_error": "Error message" // Only present if status is "error"
  }
}
```

## Style Training Endpoints

### POST /style/posts/add
Add individual style training post (allows incremental addition).

**Headers:** `Authorization: Bearer <token>`

**Request:**
```typescript
{
  "content": "Sample LinkedIn post content..."
}
```

**Response:**
```typescript
{
  "success": true,
  "data": {
    "message": "Post added successfully",
    "post_id": "post-123"
  }
}
```

**Validation Rules:**
- Content must be between 50 and 3000 characters
- Maximum 100 posts per user
- Content is automatically processed into embeddings

**Errors:**
- `validation_error`: Content too short/long or user at maximum posts
- `server_error`: Failed to save post

### POST /style/upload
Upload multiple writing samples for style training (bulk upload).

**Headers:** `Authorization: Bearer <token>`

**Request:**
```typescript
{
  "posts": [
    "Sample LinkedIn post 1...",
    "Sample LinkedIn post 2...",
    // ... minimum 1 post required, maximum 100 per upload
  ]
}
```

**Response:**
```typescript
{
  "success": true,
  "data": {
    "message": "Successfully uploaded 20 posts",
    "job_id": "style-job-123"
  }
}
```

**Validation Rules:**
- Each post must be between 50 and 3000 characters
- Maximum 100 posts per upload
- Maximum 100 total posts per user
- Posts are processed asynchronously into vector embeddings

**Errors:**
- `validation_error`: Invalid post content or user at maximum posts
- `server_error`: Failed to process style posts

### GET /style/status?job_id=<job_id>
Get style training status.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `job_id` (optional): Specific job ID to check status for

**Response:**
```typescript
{
  "success": true,
  "data": {
    "status": "pending" | "processing" | "completed" | "failed",
    "progress": 75, // Percentage complete (0-100)
    "total_posts": 20,
    "processed_posts": 15,
    "message": "Processing your writing style..."
  }
}
```

**Status Definitions:**
- `pending`: Posts uploaded but processing not started
- `processing`: Currently generating embeddings
- `completed`: All posts processed successfully
- `failed`: Processing failed (user should retry)

### POST /style/retrain
Retrain style model with existing posts.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```typescript
{
  "success": true,
  "data": {
    "message": "Style retraining started",
    "job_id": "retrain-job-123"
  }
}
```

**Behavior:**
- Marks all existing user posts as unprocessed
- Reprocesses all posts into new embeddings
- Useful when updating the embedding model or fixing processing issues

## Draft Management Endpoints

### GET /drafts?page=1&per_page=10
Get drafts with pagination.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page`: Page number (default: 1)
- `per_page`: Items per page (default: 10, max: 50)

**Response:**
```typescript
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "draft-123",
        "user_id": "user-123",
        "content": "LinkedIn post content...",
        "source_content_id": "content-123",
        "status": "pending",
        "feedback_token": "feedback-token-123",
        "email_sent_at": "2024-07-22T08:00:00Z",
        "created_at": "2024-07-22T07:45:00Z",
        "source_name": "TechCrunch"
      }
    ],
    "total": 47,
    "page": 1,
    "per_page": 10,
    "total_pages": 5
  }
}
```

### POST /drafts/generate
Generate new drafts based on recent content.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```typescript
{
  "force": false // Optional: force generation even if recent drafts exist
}
```

**Response:**
```typescript
{
  "success": true,
  "data": {
    "message": "Generated 4 new drafts",
    "drafts_generated": 4
  }
}
```

**Errors:**
- `validation_error`: No active sources or insufficient style training
- `server_error`: Draft generation failed

### GET /drafts/{id}
Get specific draft.

**Headers:** `Authorization: Bearer <token>`

**Response:** Single draft object

### PUT /drafts/{id}/feedback
Submit feedback for draft.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```typescript
{
  "feedback_type": "positive" | "negative"
}
```

**Response:**
```typescript
{
  "success": true,
  "data": {
    "message": "Feedback recorded successfully"
  }
}
```

## User Settings Endpoints

### GET /user/settings
Get user settings.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```typescript
{
  "success": true,
  "data": {
    "timezone": "America/New_York",
    "delivery_time": "08:00:00",
    "email_notifications": true
  }
}
```

### PUT /user/settings
Update user settings.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```typescript
{
  "timezone": "Europe/London", // Optional
  "delivery_time": "09:00:00", // Optional
  "email_notifications": false // Optional
}
```

**Response:** Updated settings object

## Dashboard Endpoints

### GET /dashboard/stats
Get dashboard statistics.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```typescript
{
  "success": true,
  "data": {
    "total_drafts": 47,
    "drafts_this_week": 5,
    "positive_feedback": 28,
    "negative_feedback": 12,
    "feedback_rate": 0.85,
    "active_sources": 3
  }
}
```

## Feedback Endpoints

### POST /feedback/{token}
Submit feedback via email token (public endpoint).

**URL Parameters:**
- `token`: Feedback token from email link

**Request:**
```typescript
{
  "feedback_type": "positive" | "negative"
}
```

**Response:**
```typescript
{
  "success": true,
  "data": {
    "message": "Feedback recorded successfully"
  }
}
```

**Errors:**
- `not_found`: Invalid or expired feedback token
- `validation_error`: Invalid feedback type

### PUT /drafts/{id}/feedback
Submit feedback for draft (authenticated endpoint).

**Headers:** `Authorization: Bearer <token>`

**URL Parameters:**
- `id`: Draft ID

**Request:**
```typescript
{
  "feedback_type": "positive" | "negative"
}
```

**Response:**
```typescript
{
  "success": true,
  "data": {
    "message": "Feedback recorded successfully"
  }
}
```

**Errors:**
- `not_found`: Draft not found
- `authorization_error`: Draft belongs to different user
- `validation_error`: Invalid feedback type

## Rate Limits

Rate limits are enforced per user (authenticated endpoints) or per IP address (public endpoints).

| Endpoint | Limit | Window | Headers |
|----------|-------|--------|---------|
| `/auth/login` | 5 requests | per minute | `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset` |
| `/auth/register` | 3 requests | per minute | `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset` |
| `/auth/reset-password` | 3 requests | per hour | `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset` |
| `/drafts/generate` | 5 requests | per minute | `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset` |
| `/style/upload` | 2 requests | per hour | `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset` |
| `/style/posts/add` | 20 requests | per minute | `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset` |
| `/feedback/{token}` | 10 requests | per minute | `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset` |
| All other endpoints | 100 requests | per minute | `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset` |

### Rate Limit Headers
- `X-RateLimit-Limit`: Maximum number of requests allowed in the time window
- `X-RateLimit-Remaining`: Number of requests remaining in the current window
- `X-RateLimit-Reset`: Unix timestamp when the rate limit window resets

### Rate Limit Exceeded Response
```typescript
{
  "success": false,
  "error": {
    "error": "rate_limit_error",
    "message": "Rate limit exceeded. Try again in 60 seconds.",
    "details": {
      "limit": 5,
      "remaining": 0,
      "reset": 1690876800
    }
  }
}
```

## Webhook Events (Future)

The API will support webhooks for real-time notifications:

- `draft.generated` - New drafts generated
- `feedback.received` - Feedback submitted
- `source.error` - Source monitoring error
- `style.training.completed` - Style training finished

## SDK Usage Examples

### JavaScript/TypeScript
```typescript
import { apiService } from './lib/apiService';

// Login
const loginResult = await apiService.login({
  email: 'user@example.com',
  password: 'password123'
});

if (loginResult.success) {
  console.log('Logged in:', loginResult.data.user);
} else {
  console.error('Login failed:', loginResult.error.message);
}

// Get sources
const sourcesResult = await apiService.getSources();
if (sourcesResult.success) {
  console.log('Sources:', sourcesResult.data);
}

// Generate drafts
const draftsResult = await apiService.generateDrafts();
if (draftsResult.success) {
  console.log('Generated drafts:', draftsResult.data.drafts_generated);
}
```

## Error Handling Best Practices

1. Always check the `success` field before accessing `data`
2. Display user-friendly error messages from `error.message`
3. Log detailed error information from `error.details` for debugging
4. Implement retry logic for `server_error` responses
5. Handle `authentication_error` by redirecting to login
6. Show loading states during API calls with realistic delays

## Testing

The mock API service includes:
- Realistic response delays (200ms - 2000ms)
- 5% random error rate for testing error handling
- Persistent in-memory data during session
- Comprehensive test data covering all scenarios
- Validation of request formats and business rules

This ensures the frontend can be fully developed and tested before the backend is implemented.

## Data Models and Validation Rules

### User Model
```typescript
interface User {
  id: string;                    // UUID v4
  email: string;                 // Valid email format, unique
  timezone: string;              // IANA timezone (e.g., "America/New_York")
  delivery_time: string;         // Time in HH:MM:SS format (e.g., "08:00:00")
  active: boolean;               // Account status
  created_at: string;            // ISO 8601 timestamp
  updated_at?: string;           // ISO 8601 timestamp
}
```

**Validation Rules:**
- `email`: Must be valid email format, unique across all users
- `timezone`: Must be valid IANA timezone identifier
- `delivery_time`: Must be in HH:MM:SS format (24-hour)
- `active`: Defaults to true for new users

### Source Model
```typescript
interface Source {
  id: string;                    // UUID v4
  user_id: string;               // Foreign key to User.id
  type: 'rss' | 'twitter';       // Source type
  url: string;                   // Source URL
  name: string;                  // Display name
  active: boolean;               // Whether to monitor this source
  last_checked: string | null;   // ISO 8601 timestamp of last check
  error_count: number;           // Number of consecutive errors
  created_at: string;            // ISO 8601 timestamp
  updated_at?: string;           // ISO 8601 timestamp
  last_error?: string;           // Last error message (if any)
}
```

**Validation Rules:**
- `type`: Must be either "rss" or "twitter"
- `url`: Must be valid URL format
- `name`: 1-100 characters, required
- `error_count`: Non-negative integer, defaults to 0
- Maximum 20 sources per user

### StylePost Model
```typescript
interface StylePost {
  id: string;                    // UUID v4
  user_id: string;               // Foreign key to User.id
  content: string;               // Post content
  processed: boolean;            // Whether embeddings have been generated
  created_at: string;            // ISO 8601 timestamp
  processed_at?: string;         // ISO 8601 timestamp when processed
  word_count?: number;           // Number of words in content
}
```

**Validation Rules:**
- `content`: 50-3000 characters, required
- `processed`: Defaults to false
- Maximum 100 posts per user

### Draft Model
```typescript
interface Draft {
  id: string;                    // UUID v4
  user_id: string;               // Foreign key to User.id
  content: string;               // Generated post content
  source_content_id: string | null; // Foreign key to SourceContent.id
  status: 'pending' | 'approved' | 'rejected'; // Feedback status
  feedback_token: string | null; // Unique token for email feedback
  email_sent_at: string | null;  // ISO 8601 timestamp when email sent
  created_at: string;            // ISO 8601 timestamp
  updated_at?: string;           // ISO 8601 timestamp
  source_name?: string;          // Display name of source (computed)
  character_count?: number;      // Number of characters in content
  engagement_score?: number;     // Predicted engagement score (0-10)
}
```

**Validation Rules:**
- `content`: 50-3000 characters, required
- `status`: Defaults to "pending"
- `feedback_token`: Must be unique across all drafts
- `engagement_score`: Float between 0.0 and 10.0

### SourceContent Model
```typescript
interface SourceContent {
  id: string;                    // UUID v4
  source_id: string;             // Foreign key to Source.id
  title: string | null;          // Content title (if available)
  content: string;               // Content text
  url: string | null;            // Original content URL
  published_at: string | null;   // ISO 8601 timestamp when published
  processed: boolean;            // Whether used for draft generation
  created_at: string;            // ISO 8601 timestamp
}
```

**Validation Rules:**
- `content`: 10-10000 characters, required
- `processed`: Defaults to false
- Content is automatically deduplicated by URL and content hash

### Feedback Model
```typescript
interface Feedback {
  id: string;                    // UUID v4
  draft_id: string;              // Foreign key to Draft.id
  feedback_type: 'positive' | 'negative'; // Feedback type
  created_at: string;            // ISO 8601 timestamp
}
```

**Validation Rules:**
- `feedback_type`: Must be either "positive" or "negative"
- One feedback record per draft (upsert behavior)

## Database Schema Requirements

### Indexes
```sql
-- Performance indexes
CREATE INDEX idx_sources_user_id_active ON sources(user_id, active);
CREATE INDEX idx_drafts_user_id_created_at ON drafts(user_id, created_at DESC);
CREATE INDEX idx_style_posts_user_id_processed ON style_posts(user_id, processed);
CREATE INDEX idx_source_content_source_id_processed ON source_content(source_id, processed);
CREATE INDEX idx_feedback_draft_id ON feedback(draft_id);

-- Unique constraints
CREATE UNIQUE INDEX idx_drafts_feedback_token ON drafts(feedback_token) WHERE feedback_token IS NOT NULL;
CREATE UNIQUE INDEX idx_users_email ON users(email);
```

### Vector Storage
```sql
-- Enable pg_vector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Style vectors table
CREATE TABLE style_vectors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    style_post_id UUID REFERENCES style_posts(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    embedding VECTOR(768), -- Gemini embedding dimension
    created_at TIMESTAMP DEFAULT NOW()
);

-- Vector similarity index
CREATE INDEX style_vectors_embedding_idx ON style_vectors 
USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
```

### Row Level Security (RLS)
```sql
-- Enable RLS on all user tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE style_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE style_vectors ENABLE ROW LEVEL SECURITY;

-- RLS policies (users can only access their own data)
CREATE POLICY users_policy ON users FOR ALL USING (auth.uid() = id);
CREATE POLICY sources_policy ON sources FOR ALL USING (auth.uid() = user_id);
CREATE POLICY style_posts_policy ON style_posts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY drafts_policy ON drafts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY style_vectors_policy ON style_vectors FOR ALL USING (auth.uid() = user_id);
```

## Background Job Requirements

### Job Types
1. **Content Fetching Jobs**
   - `fetch_rss_content`: Fetch new content from RSS feeds
   - `fetch_twitter_content`: Fetch new tweets from Twitter handles
   - `check_source_health`: Monitor source availability

2. **Processing Jobs**
   - `process_style_posts`: Generate embeddings for style training posts
   - `generate_daily_drafts`: Generate drafts for all active users
   - `send_draft_emails`: Send draft emails to users

3. **Maintenance Jobs**
   - `cleanup_old_drafts`: Remove drafts older than 30 days
   - `cleanup_processed_content`: Remove processed source content older than 7 days
   - `update_source_health`: Update source error counts and status

### Job Scheduling
```python
# Celery Beat schedule
CELERY_BEAT_SCHEDULE = {
    'fetch-rss-content': {
        'task': 'tasks.fetch_rss_content',
        'schedule': crontab(minute='*/30'),  # Every 30 minutes
    },
    'fetch-twitter-content': {
        'task': 'tasks.fetch_twitter_content',
        'schedule': crontab(minute='*/15'),  # Every 15 minutes
    },
    'generate-daily-drafts': {
        'task': 'tasks.generate_daily_drafts',
        'schedule': crontab(hour=6, minute=0),  # 6 AM UTC daily
    },
    'send-draft-emails': {
        'task': 'tasks.send_draft_emails',
        'schedule': crontab(minute='*/10'),  # Every 10 minutes
    },
    'cleanup-old-data': {
        'task': 'tasks.cleanup_old_data',
        'schedule': crontab(hour=2, minute=0),  # 2 AM UTC daily
    },
}
```

## External Service Integration Requirements

### Gemini API Integration
- **Endpoint**: `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent`
- **Authentication**: API Key in header
- **Rate Limits**: 60 requests per minute
- **Use Cases**:
  - Generate text embeddings for style training
  - Generate LinkedIn post drafts using RAG
  - Content quality filtering

### SendGrid Integration
- **Endpoint**: `https://api.sendgrid.com/v3/mail/send`
- **Authentication**: Bearer token
- **Rate Limits**: 100 emails per second
- **Features Required**:
  - HTML email templates
  - Click tracking for feedback links
  - Bounce and spam report handling
  - Unsubscribe link management

### Twitter API v2 Integration
- **Endpoint**: `https://api.twitter.com/2/users/by/username/{username}/tweets`
- **Authentication**: Bearer token
- **Rate Limits**: 300 requests per 15 minutes
- **Features Required**:
  - Fetch recent tweets from username
  - Filter out retweets and replies
  - Handle rate limiting gracefully

## Security Requirements

### Authentication
- JWT tokens with 24-hour expiration
- Refresh token mechanism for seamless user experience
- Secure password hashing using bcrypt (cost factor 12)
- Email verification required for new accounts

### Authorization
- Row Level Security (RLS) for all user data
- API endpoint authorization middleware
- Feedback token validation for public endpoints

### Data Protection
- All sensitive data encrypted at rest
- API requests over HTTPS only
- Input validation and sanitization
- SQL injection prevention
- XSS protection for user-generated content

### Rate Limiting
- Per-user rate limiting for authenticated endpoints
- Per-IP rate limiting for public endpoints
- Exponential backoff for failed requests
- Rate limit headers in responses

## Monitoring and Logging Requirements

### Metrics to Track
- API response times (p50, p95, p99)
- Error rates by endpoint
- Background job success/failure rates
- Email delivery rates
- User engagement metrics (feedback rates)
- External service API usage and errors

### Logging Requirements
- Structured logging (JSON format)
- Request/response logging for debugging
- Error logging with stack traces
- Performance logging for slow queries
- Security event logging (failed auth attempts)

### Health Checks
- `/health`: Basic health check
- `/health/detailed`: Database, Redis, and external service connectivity
- Background job queue health monitoring
- Email delivery service health monitoring
# CreatorPulse API Documentation

This document describes all API endpoints, request/response formats, and error handling for the CreatorPulse Core MVP.

## Base URL
```
Production: https://api.creatorpulse.com/v1
Development: http://localhost:8000/v1
```

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

### POST /style/upload
Upload writing samples for style training.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```typescript
{
  "posts": [
    "Sample LinkedIn post 1...",
    "Sample LinkedIn post 2...",
    // ... minimum 10 posts required
  ]
}
```

**Response:**
```typescript
{
  "success": true,
  "data": {
    "message": "Style training started",
    "job_id": "style-job-123"
  }
}
```

**Errors:**
- `validation_error`: Minimum 10 posts required
- `server_error`: Failed to process style posts

### GET /style/status?job_id=<job_id>
Get style training status.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```typescript
{
  "success": true,
  "data": {
    "status": "pending" | "processing" | "completed" | "failed",
    "progress": 75, // Percentage complete
    "total_posts": 20,
    "processed_posts": 15,
    "message": "Processing your writing style..."
  }
}
```

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
- `not_found`: Invalid feedback token

## Rate Limits

| Endpoint | Limit |
|----------|-------|
| `/auth/login` | 5 requests per minute |
| `/auth/register` | 3 requests per minute |
| `/drafts/generate` | 5 requests per minute |
| `/style/upload` | 2 requests per hour |
| All other endpoints | 100 requests per minute |

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
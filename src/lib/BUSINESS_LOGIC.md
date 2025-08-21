# CreatorPulse Business Logic Requirements

This document defines the detailed business logic requirements for each endpoint and system component, complementing the data models and API documentation.

## Core Business Rules

### 1. User Account Management

**Registration Business Rules**:
- Email must be unique across the entire system
- Password must meet security requirements (8+ characters, mixed case, numbers)
- Account is created in inactive state until email verification
- Default timezone is UTC, default delivery time is 08:00:00
- New users get 30-day free trial period

**Authentication Business Rules**:
- Maximum 5 failed login attempts per email per hour
- JWT tokens expire after 24 hours
- Refresh tokens valid for 30 days
- Account lockout after 10 failed attempts in 24 hours
- Password reset tokens expire after 1 hour

**Account Status Rules**:
- Inactive accounts don't receive emails or generate drafts
- Email verification required within 7 days or account is deleted
- Users can deactivate their own accounts
- Deactivated accounts retain data for 30 days before deletion

### 2. Source Management Business Rules

**Source Addition Rules**:
- Maximum 20 sources per user (free tier)
- RSS feeds must return valid XML with proper content-type
- Twitter handles must exist and be publicly accessible
- Duplicate URLs not allowed per user
- Source names must be unique per user

**Source Health Monitoring Rules**:
- Sources checked every 30 minutes during business hours
- Error count increments on each failed check
- Sources marked inactive after 5 consecutive failures
- Users notified when source becomes inactive
- Error count resets to 0 on successful check
- Inactive sources not monitored until manually reactivated### 3. Sty
le Training Business Rules

**Content Requirements**:
- Minimum 10 posts required for draft generation
- Maximum 100 posts per user
- Each post must be 50-3000 characters
- Content must be primarily in English
- Duplicate content (by hash) rejected

**Processing Rules**:
- Posts processed asynchronously in order of submission
- Processing fails if Gemini API is unavailable
- Failed processing retried up to 3 times with exponential backoff
- Users can retrain style model (reprocesses all posts)
- Processing status tracked per user and per post

**Quality Filters**:
- Remove excessive URLs, mentions, hashtags
- Filter out spam or promotional content
- Ensure professional tone appropriate for LinkedIn
- Remove personally identifiable information
- Validate content relevance to business/professional topics

### 4. Content Processing Business Rules

**Content Fetching Rules**:
- RSS feeds checked every 30 minutes
- Twitter handles checked every 15 minutes
- Only content from last 24 hours processed for drafts
- Content older than 7 days archived
- Maximum 50 items processed per source per day

**Content Quality Rules**:
- Minimum 10 characters, maximum 10,000 characters
- Must be primarily in English
- Filter out retweets, replies, and promotional content
- Remove content with excessive links or hashtags
- Ensure content relevance to professional topics
- Deduplicate by content hash across all sources

**Content Lifecycle**:
- New content marked as unprocessed
- Processed content used for draft generation
- Content older than 30 days automatically deleted
- Users can manually mark content as irrelevant#
## 5. Draft Generation Business Rules

**Generation Scheduling**:
- Drafts generated daily at 6 AM UTC for all active users
- Users must have minimum 10 processed style posts
- Users must have at least 1 active source
- No generation if user received drafts in last 20 hours
- Maximum 5 drafts generated per user per day

**Content Selection Rules**:
- Only use content from last 24 hours
- Prioritize content from sources with higher engagement
- Avoid duplicate topics within same generation batch
- Ensure variety in content types and sources
- Filter out content already used in previous drafts

**RAG Implementation Rules**:
- Find top 5 most similar style examples using vector search
- Similarity threshold of 0.7 or higher required
- Include source attribution in generated content
- Maintain user's voice, tone, and writing patterns
- Ensure LinkedIn-appropriate professional tone

**Quality Assurance Rules**:
- Generated content must be 50-3000 characters
- Content must pass profanity and appropriateness filters
- Engagement score calculated based on content analysis
- Drafts with score below 6.0 are regenerated
- Maximum 3 regeneration attempts per content piece

### 6. Email Delivery Business Rules

**Scheduling Rules**:
- Emails sent at user's preferred time in their timezone
- Delivery window: 6 AM to 10 PM in user's timezone
- No emails sent on weekends unless user opts in
- Maximum 1 email per user per day
- Failed deliveries retried up to 3 times

**Email Content Rules**:
- Include 3-5 drafts per email (based on generation success)
- Each draft includes unique feedback token
- Feedback links expire after 30 days
- Include unsubscribe link in all emails
- Personalize greeting with user's name or email

**Delivery Tracking Rules**:
- Track delivery status via SendGrid webhooks
- Mark emails as bounced/spam based on SendGrid reports
- Automatically pause delivery for bounced addresses
- Remove users from mailing list after 3 consecutive bounces
- Track click-through rates for feedback links#
## 7. Feedback Processing Business Rules

**Feedback Collection Rules**:
- Each draft can receive feedback only once
- Feedback tokens expire after 30 days
- Both positive and negative feedback accepted
- Feedback source tracked (email vs dashboard)
- Anonymous feedback data used for system improvement

**Feedback Impact Rules**:
- Positive feedback increases user's engagement score
- Negative feedback triggers content analysis for improvement
- Feedback patterns influence future draft generation
- Users with high positive feedback get priority processing
- Consistent negative feedback triggers style retraining suggestion

**Analytics Rules**:
- Calculate feedback rate per user (feedbacks / drafts sent)
- Track feedback trends over time
- Identify content patterns that receive positive feedback
- Use feedback data to improve RAG similarity matching
- Generate insights for user dashboard

### 8. User Settings Business Rules

**Timezone Rules**:
- Must be valid IANA timezone identifier
- Affects email delivery scheduling
- Changes take effect for next scheduled email
- Default to UTC for invalid timezones
- Support for daylight saving time transitions

**Delivery Time Rules**:
- Must be between 06:00:00 and 22:00:00
- Time specified in user's local timezone
- Delivery window allows ±30 minutes for processing
- Changes take effect for next scheduled email
- Default to 08:00:00 if invalid time provided

**Notification Preferences**:
- Users can disable draft emails (but keep account active)
- Users can opt into weekend deliveries
- Users can choose email frequency (daily, weekly, custom)
- Unsubscribe stops all non-essential emails
- Account-related emails (security, billing) always sent##
 Error Handling Business Rules

### 1. API Error Responses

**Validation Errors**:
- Return specific field-level validation messages
- Include error codes for programmatic handling
- Provide suggestions for fixing validation errors
- Log validation errors for system improvement
- Rate limit validation error responses to prevent abuse

**Authentication Errors**:
- Don't reveal whether email exists for security
- Implement progressive delays for repeated failures
- Log suspicious authentication patterns
- Provide clear error messages for legitimate users
- Support account recovery workflows

**Authorization Errors**:
- Ensure users can only access their own data
- Log unauthorized access attempts
- Return generic "not found" for unauthorized resources
- Implement role-based access control where needed
- Support admin override for customer support

### 2. External Service Error Handling

**Gemini API Errors**:
- Retry rate limit errors with exponential backoff
- Fall back to cached embeddings when possible
- Queue failed requests for later processing
- Alert administrators for sustained API failures
- Maintain service level agreements with users

**SendGrid Errors**:
- Retry failed email deliveries up to 3 times
- Handle bounce and spam reports appropriately
- Maintain delivery success rate above 98%
- Provide alternative delivery methods if needed
- Track and report email delivery metrics

**Twitter API Errors**:
- Handle rate limits gracefully with queuing
- Skip unavailable accounts without failing entire job
- Cache successful responses to reduce API calls
- Implement circuit breaker pattern for sustained failures
- Provide fallback content sources when needed

### 3. Background Job Error Handling

**Job Failure Rules**:
- Retry failed jobs with exponential backoff
- Maximum 3 retry attempts per job
- Dead letter queue for permanently failed jobs
- Alert administrators for critical job failures
- Maintain job success rate above 95%

**Resource Management**:
- Monitor memory usage and prevent OOM errors
- Implement timeouts for long-running jobs
- Queue jobs during high load periods
- Prioritize user-facing jobs over maintenance tasks
- Scale worker capacity based on queue depth## Pe
rformance and Scaling Business Rules

### 1. Rate Limiting Rules

**API Rate Limits**:
- Authentication endpoints: 5 requests per minute per IP
- Draft generation: 5 requests per minute per user
- Style training: 2 requests per hour per user
- General endpoints: 100 requests per minute per user
- Burst allowance: 20% above limit for short periods

**Background Job Limits**:
- Maximum 10 concurrent jobs per user
- Priority queues for different job types
- Resource-aware job scheduling
- Automatic scaling based on queue depth
- Circuit breakers for failing external services

### 2. Caching Rules

**Cache Invalidation**:
- User data cached for 30 minutes
- Source data cached for 15 minutes
- Draft data cached for 5 minutes
- Style vectors cached for 1 hour
- Cache invalidated on data updates

**Cache Warming**:
- Pre-load frequently accessed user data
- Cache popular content and embeddings
- Warm cache during off-peak hours
- Monitor cache hit rates and optimize accordingly
- Implement cache-aside pattern for consistency

### 3. Database Performance Rules

**Query Optimization**:
- All queries must use appropriate indexes
- Complex queries limited to 2-second execution time
- Implement query result pagination for large datasets
- Use database views for complex aggregations
- Monitor slow queries and optimize regularly

**Connection Management**:
- Connection pool size: 20 connections
- Maximum overflow: 30 connections
- Connection timeout: 30 seconds
- Query timeout: 60 seconds
- Automatic connection recycling every hour

## Data Retention and Cleanup Rules

### 1. Data Lifecycle Management

**User Data Retention**:
- Active user data retained indefinitely
- Inactive user data retained for 30 days
- Deleted user data purged after 7 days
- Backup data retained for 90 days
- Audit logs retained for 1 year

**Content Data Retention**:
- Source content retained for 30 days
- Processed content archived after 7 days
- Draft data retained for 90 days
- Feedback data retained for 1 year
- Email delivery logs retained for 6 months

### 2. Automated Cleanup Rules

**Daily Cleanup Tasks**:
- Delete expired feedback tokens
- Archive old source content
- Clean up failed background jobs
- Update source health status
- Generate daily analytics reports

**Weekly Cleanup Tasks**:
- Delete old draft data
- Clean up unused style vectors
- Archive email delivery logs
- Update user engagement metrics
- Generate weekly performance reports

This comprehensive business logic documentation ensures consistent implementation across all system components and provides clear guidelines for handling edge cases and error conditions.
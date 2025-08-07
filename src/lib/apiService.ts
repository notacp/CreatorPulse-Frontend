import {
  User,
  Source,
  Draft,
  Feedback,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  PasswordResetRequest,
  CreateSourceRequest,
  UpdateSourceRequest,
  StyleTrainingRequest,
  StyleTrainingStatus,
  GenerateDraftsRequest,
  UserSettings,
  DashboardStats,
  ApiResponse,
  PaginatedResponse
} from './types';

import {
  mockUsers,
  mockSources,
  mockStylePosts,
  mockDrafts,
  mockFeedback,
  mockSourceContent,
  generateId,
  getCurrentTimestamp
} from './mockData';

/**
 * Mock API Service for CreatorPulse Frontend
 * 
 * This service simulates all backend API calls with realistic delays,
 * error scenarios, and data persistence (in memory).
 * 
 * All endpoints return ApiResponse<T> format for consistent error handling.
 */
class ApiService {
  private currentUser: User | null = null;
  private authToken: string | null = null;
  
  // In-memory data stores (simulating database)
  private users = [...mockUsers];
  private sources = [...mockSources];
  private stylePosts = [...mockStylePosts];
  private drafts = [...mockDrafts];
  private feedback = [...mockFeedback];
  private sourceContent = [...mockSourceContent];

  /**
   * Simulate network delay with realistic variance
   */
  private async delay(ms: number = 500): Promise<void> {
    // Add realistic variance to delay (±30%)
    const variance = ms * 0.3;
    const actualDelay = ms + (Math.random() - 0.5) * variance;
    return new Promise(resolve => setTimeout(resolve, Math.max(100, actualDelay)));
  }

  /**
   * Simulate random API errors with different rates for different operations
   */
  private shouldSimulateError(errorRate: number = 0.05): boolean {
    return Math.random() < errorRate;
  }

  /**
   * Simulate specific error scenarios
   */
  private simulateSpecificErrors(operation: string): ApiResponse<never> | null {
    const random = Math.random();
    
    switch (operation) {
      case 'login':
        if (random < 0.02) { // 2% chance
          return this.createErrorResponse('rate_limit_error', 'Too many login attempts. Please try again later.');
        }
        break;
      case 'generate_drafts':
        if (random < 0.03) { // 3% chance
          return this.createErrorResponse('server_error', 'AI service temporarily unavailable. Please try again.');
        }
        break;
      case 'upload_style':
        if (random < 0.01) { // 1% chance
          return this.createErrorResponse('server_error', 'Content processing service is overloaded. Please try again later.');
        }
        break;
    }
    
    return null;
  }

  /**
   * Create error response
   */
  private createErrorResponse(error: string, message: string, details?: Record<string, unknown>): ApiResponse<never> {
    return {
      success: false,
      error: { error, message, details }
    };
  }

  /**
   * Create success response
   */
  private createSuccessResponse<T>(data: T): ApiResponse<T> {
    return {
      success: true,
      data
    };
  }

  /**
   * Check if user is authenticated
   */
  private requireAuth(): ApiResponse<never> | null {
    if (!this.currentUser || !this.authToken) {
      return this.createErrorResponse('authentication_error', 'Authentication required');
    }
    return null;
  }

  // ==================== AUTHENTICATION ENDPOINTS ====================

  /**
   * POST /auth/login
   * Authenticate user with email and password
   */
  async login(request: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    await this.delay(800); // Simulate auth delay

    // Check for specific error scenarios
    const specificError = this.simulateSpecificErrors('login');
    if (specificError) return specificError;

    if (this.shouldSimulateError(0.03)) { // 3% error rate for auth
      return this.createErrorResponse('server_error', 'Authentication service temporarily unavailable');
    }

    // Validate input
    if (!request.email || !request.password) {
      return this.createErrorResponse('validation_error', 'Email and password are required');
    }

    const user = this.users.find(u => u.email === request.email);
    
    if (!user) {
      await this.delay(200); // Simulate password check delay even for non-existent users
      return this.createErrorResponse('auth_error', 'Invalid email or password');
    }

    // Simulate password validation (in real app, this would be hashed)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const storedPassword = (user as any).password || 'password123'; // Default for existing mock users
    if (request.password !== storedPassword) {
      await this.delay(200); // Simulate password check delay
      return this.createErrorResponse('auth_error', 'Invalid email or password');
    }

    // Check if user account is active
    if (!user.active) {
      return this.createErrorResponse('auth_error', 'Account is deactivated. Please contact support.');
    }

    // Generate mock JWT token
    const token = `mock-jwt-token-${user.id}-${Date.now()}`;
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours

    this.currentUser = user;
    this.authToken = token;

    // Persist authentication state
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('creatorpulse_auth', JSON.stringify({
          user,
          token,
          expiresAt
        }));
      } catch (error) {
        console.error('Error storing auth in localStorage:', error);
      }
    }

    return this.createSuccessResponse({
      user,
      token,
      expires_at: expiresAt
    });
  }

  /**
   * POST /auth/register
   * Register new user account
   */
  async register(request: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
    await this.delay(1000); // Simulate registration delay

    if (this.shouldSimulateError()) {
      return this.createErrorResponse('server_error', 'Registration failed');
    }

    // Check if email already exists
    if (this.users.find(u => u.email === request.email)) {
      return this.createErrorResponse('validation_error', 'Email already registered');
    }

    // Create new user
    const newUser: User = {
      id: generateId(),
      email: request.email,
      timezone: request.timezone || 'UTC',
      delivery_time: '08:00:00',
      active: true,
      created_at: getCurrentTimestamp()
    };

    // Store password for mock authentication (in real app, this would be hashed)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (newUser as any).password = request.password;

    this.users.push(newUser);

    // Generate mock JWT token
    const token = `mock-jwt-token-${newUser.id}-${Date.now()}`;
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    this.currentUser = newUser;
    this.authToken = token;

    // Persist authentication state
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('creatorpulse_auth', JSON.stringify({
          user: newUser,
          token,
          expiresAt
        }));
      } catch (error) {
        console.error('Error storing auth in localStorage:', error);
      }
    }

    return this.createSuccessResponse({
      user: newUser,
      token,
      expires_at: expiresAt
    });
  }

  /**
   * POST /auth/logout
   * Logout current user
   */
  async logout(): Promise<ApiResponse<{ message: string }>> {
    await this.delay(200);

    this.clearAuthState();

    return this.createSuccessResponse({ message: 'Logged out successfully' });
  }

  /**
   * POST /auth/reset-password
   * Request password reset
   */
  async resetPassword(request: PasswordResetRequest): Promise<ApiResponse<{ message: string }>> {
    await this.delay(600);

    if (this.shouldSimulateError()) {
      return this.createErrorResponse('server_error', 'Failed to send reset email');
    }

    const user = this.users.find(u => u.email === request.email);
    
    if (!user) {
      // Don't reveal if email exists for security
      return this.createSuccessResponse({ 
        message: 'If the email exists, a reset link has been sent' 
      });
    }

    return this.createSuccessResponse({ 
      message: 'Password reset email sent successfully' 
    });
  }

  /**
   * GET /auth/verify-email
   * Verify email with token
   */
  async verifyEmail(token: string): Promise<ApiResponse<{ message: string }>> {
    await this.delay(400);

    if (token !== 'valid-verification-token') {
      return this.createErrorResponse('validation_error', 'Invalid or expired verification token');
    }

    return this.createSuccessResponse({ 
      message: 'Email verified successfully' 
    });
  }

  // ==================== SOURCE MANAGEMENT ENDPOINTS ====================

  /**
   * GET /sources
   * Get all sources for current user
   */
  async getSources(): Promise<ApiResponse<Source[]>> {
    const authError = this.requireAuth();
    if (authError) return authError;

    await this.delay(300);

    if (this.shouldSimulateError()) {
      return this.createErrorResponse('server_error', 'Failed to fetch sources');
    }

    const userSources = this.sources.filter(s => s.user_id === this.currentUser!.id);
    return this.createSuccessResponse(userSources);
  }

  /**
   * POST /sources
   * Create new source
   */
  async createSource(request: CreateSourceRequest): Promise<ApiResponse<Source>> {
    const authError = this.requireAuth();
    if (authError) return authError;

    await this.delay(600);

    if (this.shouldSimulateError()) {
      return this.createErrorResponse('server_error', 'Failed to create source');
    }

    // Validate URL format
    if (!request.url.startsWith('http')) {
      return this.createErrorResponse('validation_error', 'Invalid URL format');
    }

    // Simulate RSS feed validation
    if (request.type === 'rss' && request.url.includes('invalid-feed')) {
      return this.createErrorResponse('validation_error', 'RSS feed is not accessible');
    }

    const newSource: Source = {
      id: generateId(),
      user_id: this.currentUser!.id,
      type: request.type,
      url: request.url,
      name: request.name,
      active: true,
      last_checked: null,
      error_count: 0,
      created_at: getCurrentTimestamp()
    };

    this.sources.push(newSource);
    return this.createSuccessResponse(newSource);
  }

  /**
   * PUT /sources/{id}
   * Update existing source
   */
  async updateSource(id: string, request: UpdateSourceRequest): Promise<ApiResponse<Source>> {
    const authError = this.requireAuth();
    if (authError) return authError;

    await this.delay(400);

    const sourceIndex = this.sources.findIndex(s => s.id === id && s.user_id === this.currentUser!.id);
    
    if (sourceIndex === -1) {
      return this.createErrorResponse('not_found', 'Source not found');
    }

    // Update source
    const updatedSource = {
      ...this.sources[sourceIndex],
      ...request
    };

    this.sources[sourceIndex] = updatedSource;
    return this.createSuccessResponse(updatedSource);
  }

  /**
   * DELETE /sources/{id}
   * Delete source
   */
  async deleteSource(id: string): Promise<ApiResponse<{ message: string }>> {
    const authError = this.requireAuth();
    if (authError) return authError;

    await this.delay(300);

    const sourceIndex = this.sources.findIndex(s => s.id === id && s.user_id === this.currentUser!.id);
    
    if (sourceIndex === -1) {
      return this.createErrorResponse('not_found', 'Source not found');
    }

    this.sources.splice(sourceIndex, 1);
    return this.createSuccessResponse({ message: 'Source deleted successfully' });
  }

  /**
   * GET /sources/{id}/status
   * Get source health status
   */
  async getSourceStatus(id: string): Promise<ApiResponse<{ status: string; last_error?: string }>> {
    const authError = this.requireAuth();
    if (authError) return authError;

    await this.delay(200);

    const source = this.sources.find(s => s.id === id && s.user_id === this.currentUser!.id);
    
    if (!source) {
      return this.createErrorResponse('not_found', 'Source not found');
    }

    const status = source.error_count > 3 ? 'error' : source.active ? 'active' : 'inactive';
    const response: { status: string; last_error?: string } = { status };

    if (status === 'error') {
      response.last_error = 'Feed temporarily unavailable';
    }

    return this.createSuccessResponse(response);
  }

  // ==================== STYLE TRAINING ENDPOINTS ====================

  /**
   * POST /style/upload
   * Upload style training posts
   */
  async uploadStylePosts(request: StyleTrainingRequest): Promise<ApiResponse<{ message: string; job_id: string }>> {
    const authError = this.requireAuth();
    if (authError) return authError;

    await this.delay(1500); // Longer delay for upload

    // Validate input
    if (!request.posts || !Array.isArray(request.posts)) {
      return this.createErrorResponse('validation_error', 'Posts array is required');
    }

    if (request.posts.length < 10) {
      return this.createErrorResponse('validation_error', 'Minimum 10 posts required for effective style training');
    }

    if (request.posts.length > 100) {
      return this.createErrorResponse('validation_error', 'Maximum 100 posts allowed per upload');
    }

    // Validate post content
    const invalidPosts = request.posts.filter(post => 
      !post || typeof post !== 'string' || post.trim().length < 50 || post.length > 3000
    );

    if (invalidPosts.length > 0) {
      return this.createErrorResponse('validation_error', 'Each post must be between 50 and 3000 characters');
    }

    // Check for specific error scenarios
    const specificError = this.simulateSpecificErrors('upload_style');
    if (specificError) return specificError;

    if (this.shouldSimulateError(0.06)) { // 6% error rate for processing
      return this.createErrorResponse('server_error', 'Style processing service temporarily unavailable');
    }

    // Remove existing style posts for this user (simulating retraining)
    this.stylePosts = this.stylePosts.filter(sp => sp.user_id !== this.currentUser!.id);

    // Create style posts with word count
    const stylePosts = request.posts.map(content => ({
      id: generateId(),
      user_id: this.currentUser!.id,
      content: content.trim(),
      processed: false,
      created_at: getCurrentTimestamp(),
      word_count: content.trim().split(/\s+/).length
    }));

    this.stylePosts.push(...stylePosts);

    const jobId = `style-job-${generateId()}`;

    // Simulate gradual processing
    setTimeout(() => {
      const processingInterval = setInterval(() => {
        const unprocessedPosts = this.stylePosts.filter(sp => 
          sp.user_id === this.currentUser?.id && !sp.processed
        );
        
        if (unprocessedPosts.length > 0) {
          // Process 2-3 posts at a time
          const toProcess = unprocessedPosts.slice(0, Math.floor(Math.random() * 2) + 2);
          toProcess.forEach(post => {
            const index = this.stylePosts.findIndex(sp => sp.id === post.id);
            if (index !== -1) {
              this.stylePosts[index] = {
                ...this.stylePosts[index],
                processed: true,
                processed_at: getCurrentTimestamp()
              };
            }
          });
        } else {
          clearInterval(processingInterval);
        }
      }, 2000); // Process every 2 seconds
    }, 1000); // Start processing after 1 second

    return this.createSuccessResponse({
      message: `Style training started with ${request.posts.length} posts`,
      job_id: jobId
    });
  }

  /**
   * GET /style/status
   * Get style training status
   */
  async getStyleTrainingStatus(jobId?: string): Promise<ApiResponse<StyleTrainingStatus>> {
    const authError = this.requireAuth();
    if (authError) return authError;

    await this.delay(200);

    // Note: jobId parameter is for future use when tracking specific training jobs
    // Currently we track overall user style training status
    if (jobId) {
      // Future: Look up specific job status by ID
    }

    const userStylePosts = this.stylePosts.filter(sp => sp.user_id === this.currentUser!.id);
    const totalPosts = userStylePosts.length;
    const processedPosts = userStylePosts.filter(sp => sp.processed).length;

    // Simulate processing progress
    const progress = totalPosts > 0 ? Math.round((processedPosts / totalPosts) * 100) : 0;
    
    let status: StyleTrainingStatus['status'] = 'completed';
    if (progress < 100) {
      status = processedPosts === 0 ? 'pending' : 'processing';
    }

    return this.createSuccessResponse({
      status,
      progress,
      total_posts: totalPosts,
      processed_posts: processedPosts,
      message: status === 'completed' ? 'Style training completed successfully' : 'Processing your writing style...'
    });
  }

  /**
   * POST /style/retrain
   * Retrain style model
   */
  async retrainStyle(): Promise<ApiResponse<{ message: string; job_id: string }>> {
    const authError = this.requireAuth();
    if (authError) return authError;

    await this.delay(800);

    // Mark all user style posts as unprocessed
    this.stylePosts = this.stylePosts.map(sp => 
      sp.user_id === this.currentUser!.id ? { ...sp, processed: false } : sp
    );

    const jobId = `retrain-job-${generateId()}`;

    return this.createSuccessResponse({
      message: 'Style retraining started',
      job_id: jobId
    });
  }

  // ==================== DRAFT MANAGEMENT ENDPOINTS ====================

  /**
   * GET /drafts
   * Get drafts with pagination
   */
  async getDrafts(page: number = 1, perPage: number = 10): Promise<ApiResponse<PaginatedResponse<Draft>>> {
    const authError = this.requireAuth();
    if (authError) return authError;

    await this.delay(400);

    const userDrafts = this.drafts
      .filter(d => d.user_id === this.currentUser!.id)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    const total = userDrafts.length;
    const totalPages = Math.ceil(total / perPage);
    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage;
    const paginatedDrafts = userDrafts.slice(startIndex, endIndex);

    return this.createSuccessResponse({
      data: paginatedDrafts,
      total,
      page,
      per_page: perPage,
      total_pages: totalPages
    });
  }

  /**
   * POST /drafts/generate
   * Generate new drafts
   */
  async generateDrafts(request: GenerateDraftsRequest = {}): Promise<ApiResponse<{ message: string; drafts_generated: number }>> {
    const authError = this.requireAuth();
    if (authError) return authError;

    await this.delay(2500); // Longer delay for AI generation

    // Check for specific error scenarios
    const specificError = this.simulateSpecificErrors('generate_drafts');
    if (specificError) return specificError;

    if (this.shouldSimulateError(0.08)) { // 8% error rate for AI operations
      return this.createErrorResponse('server_error', 'Draft generation failed due to AI service timeout');
    }

    // Check if user has sources
    const userSources = this.sources.filter(s => s.user_id === this.currentUser!.id && s.active);
    if (userSources.length === 0) {
      return this.createErrorResponse('validation_error', 'No active sources found. Please add sources first.');
    }

    // Check if user has style training
    const userStylePosts = this.stylePosts.filter(sp => sp.user_id === this.currentUser!.id && sp.processed);
    if (userStylePosts.length < 10) {
      return this.createErrorResponse('validation_error', 'Insufficient style training. Please upload at least 10 sample posts.');
    }

    // Check for recent drafts (unless forced)
    if (!request.force) {
      const recentDrafts = this.drafts.filter(d => {
        const draftTime = new Date(d.created_at).getTime();
        const sixHoursAgo = Date.now() - (6 * 60 * 60 * 1000);
        return d.user_id === this.currentUser!.id && draftTime > sixHoursAgo;
      });

      if (recentDrafts.length >= 5) {
        return this.createErrorResponse('validation_error', 'You already have recent drafts. Use force=true to generate anyway.');
      }
    }

    // Simulate checking for new content
    const availableContent = this.sourceContent.filter(sc => 
      userSources.some(us => us.id === sc.source_id) && !sc.processed
    );

    if (availableContent.length === 0 && !request.force) {
      return this.createSuccessResponse({
        message: 'No new content available from your sources',
        drafts_generated: 0
      });
    }

    // Generate 3-5 new drafts with realistic content
    const draftsToGenerate = Math.floor(Math.random() * 3) + 3; // 3-5 drafts
    const newDrafts: Draft[] = [];

    const draftTemplates = [
      '🚀 Just came across an interesting development in {topic}. {insight}\n\nThis reminds me of when I {personal_experience}.\n\nWhat\'s your take on {question}?',
      '💡 Hot take: {opinion}\n\nHere\'s why I think this matters:\n→ {reason1}\n→ {reason2}\n→ {reason3}\n\nAm I missing something here?',
      '📈 {achievement_or_milestone}\n\nKey lessons learned:\n• {lesson1}\n• {lesson2}\n• {lesson3}\n\nWhat\'s been your biggest {related_topic} challenge?',
      '🔥 Unpopular opinion: {controversial_statement}\n\n{supporting_argument}\n\nI\'ve seen this play out in {example}.\n\nChange my mind - what am I getting wrong?',
      '⚡ Quick tip that {benefit}:\n\n{specific_tip}\n\nSometimes the simplest solutions are the most effective.\n\nWhat\'s your favorite {category} hack?'
    ];

    for (let i = 0; i < draftsToGenerate; i++) {
      const template = draftTemplates[Math.floor(Math.random() * draftTemplates.length)];
      const sourceContent = availableContent[Math.floor(Math.random() * Math.max(1, availableContent.length))];
      
      const draft: Draft = {
        id: generateId(),
        user_id: this.currentUser!.id,
        content: template.replace(/\{[^}]+\}/g, 'AI-generated content based on your style'),
        source_content_id: sourceContent?.id || null,
        status: 'pending',
        feedback_token: `feedback-${generateId()}`,
        email_sent_at: null,
        created_at: getCurrentTimestamp(),
        updated_at: getCurrentTimestamp(),
        source_name: sourceContent ? userSources.find(s => s.id === sourceContent.source_id)?.name : undefined,
        character_count: Math.floor(Math.random() * 200) + 300, // 300-500 chars
        engagement_score: Math.round((Math.random() * 3 + 7) * 10) / 10 // 7.0-10.0
      };
      newDrafts.push(draft);
    }

    this.drafts.push(...newDrafts);

    // Mark content as processed
    availableContent.forEach(content => {
      const contentIndex = this.sourceContent.findIndex(sc => sc.id === content.id);
      if (contentIndex !== -1) {
        this.sourceContent[contentIndex].processed = true;
      }
    });

    return this.createSuccessResponse({
      message: `Generated ${draftsToGenerate} new drafts based on your recent sources`,
      drafts_generated: draftsToGenerate
    });
  }

  /**
   * GET /drafts/{id}
   * Get specific draft
   */
  async getDraft(id: string): Promise<ApiResponse<Draft>> {
    const authError = this.requireAuth();
    if (authError) return authError;

    await this.delay(200);

    const draft = this.drafts.find(d => d.id === id && d.user_id === this.currentUser!.id);
    
    if (!draft) {
      return this.createErrorResponse('not_found', 'Draft not found');
    }

    return this.createSuccessResponse(draft);
  }

  /**
   * PUT /drafts/{id}/feedback
   * Submit feedback for draft
   */
  async submitDraftFeedback(id: string, feedbackType: 'positive' | 'negative'): Promise<ApiResponse<{ message: string }>> {
    await this.delay(300);

    const draft = this.drafts.find(d => d.id === id);
    
    if (!draft) {
      return this.createErrorResponse('not_found', 'Draft not found');
    }

    // Update draft status
    const draftIndex = this.drafts.findIndex(d => d.id === id);
    this.drafts[draftIndex] = {
      ...draft,
      status: feedbackType === 'positive' ? 'approved' : 'rejected'
    };

    // Record feedback
    const newFeedback: Feedback = {
      id: generateId(),
      draft_id: id,
      feedback_type: feedbackType,
      created_at: getCurrentTimestamp()
    };

    this.feedback.push(newFeedback);

    return this.createSuccessResponse({
      message: 'Feedback recorded successfully'
    });
  }

  // ==================== USER SETTINGS ENDPOINTS ====================

  /**
   * GET /user/settings
   * Get user settings
   */
  async getUserSettings(): Promise<ApiResponse<UserSettings>> {
    const authError = this.requireAuth();
    if (authError) return authError;

    await this.delay(200);

    const settings: UserSettings = {
      timezone: this.currentUser!.timezone,
      delivery_time: this.currentUser!.delivery_time,
      email_notifications: this.currentUser!.active
    };

    return this.createSuccessResponse(settings);
  }

  /**
   * PUT /user/settings
   * Update user settings
   */
  async updateUserSettings(settings: Partial<UserSettings>): Promise<ApiResponse<UserSettings>> {
    const authError = this.requireAuth();
    if (authError) return authError;

    await this.delay(400);

    // Update user
    const userIndex = this.users.findIndex(u => u.id === this.currentUser!.id);
    if (userIndex !== -1) {
      this.users[userIndex] = {
        ...this.users[userIndex],
        timezone: settings.timezone || this.users[userIndex].timezone,
        delivery_time: settings.delivery_time || this.users[userIndex].delivery_time,
        active: settings.email_notifications !== undefined ? settings.email_notifications : this.users[userIndex].active
      };
      this.currentUser = this.users[userIndex];
    }

    const updatedSettings: UserSettings = {
      timezone: this.currentUser!.timezone,
      delivery_time: this.currentUser!.delivery_time,
      email_notifications: this.currentUser!.active
    };

    return this.createSuccessResponse(updatedSettings);
  }

  // ==================== DASHBOARD ENDPOINTS ====================

  /**
   * GET /dashboard/stats
   * Get dashboard statistics
   */
  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    const authError = this.requireAuth();
    if (authError) return authError;

    await this.delay(300);

    const userDrafts = this.drafts.filter(d => d.user_id === this.currentUser!.id);
    const userFeedback = this.feedback.filter(f => 
      userDrafts.some(d => d.id === f.draft_id)
    );
    const userSources = this.sources.filter(s => s.user_id === this.currentUser!.id);

    // Calculate stats
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const draftsThisWeek = userDrafts.filter(d => 
      new Date(d.created_at) > oneWeekAgo
    ).length;

    const positiveFeedback = userFeedback.filter(f => f.feedback_type === 'positive').length;
    const negativeFeedback = userFeedback.filter(f => f.feedback_type === 'negative').length;
    const totalFeedback = positiveFeedback + negativeFeedback;
    const feedbackRate = userDrafts.length > 0 ? totalFeedback / userDrafts.length : 0;

    const stats: DashboardStats = {
      total_drafts: userDrafts.length,
      drafts_this_week: draftsThisWeek,
      positive_feedback: positiveFeedback,
      negative_feedback: negativeFeedback,
      feedback_rate: Math.round(feedbackRate * 100) / 100,
      active_sources: userSources.filter(s => s.active).length
    };

    return this.createSuccessResponse(stats);
  }

  // ==================== FEEDBACK ENDPOINTS ====================

  /**
   * POST /feedback/{token}
   * Submit feedback via email token
   */
  async submitFeedbackByToken(token: string, feedbackType: 'positive' | 'negative'): Promise<ApiResponse<{ message: string }>> {
    await this.delay(300);

    const draft = this.drafts.find(d => d.feedback_token === token);
    
    if (!draft) {
      return this.createErrorResponse('not_found', 'Invalid feedback token');
    }

    return this.submitDraftFeedback(draft.id, feedbackType);
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Get current authenticated user
   */
  getCurrentUser(): User | null {
    // Check in-memory first
    if (this.currentUser) {
      return this.currentUser;
    }

    // Check localStorage for persistence
    if (typeof window !== 'undefined') {
      try {
        const storedAuth = localStorage.getItem('creatorpulse_auth');
        if (storedAuth) {
          const { user, token, expiresAt } = JSON.parse(storedAuth);
          
          // Check if token is still valid
          if (new Date(expiresAt) > new Date()) {
            this.currentUser = user;
            this.authToken = token;
            return user;
          } else {
            // Token expired, clear storage
            localStorage.removeItem('creatorpulse_auth');
          }
        }
      } catch (error) {
        console.error('Error reading auth from localStorage:', error);
        localStorage.removeItem('creatorpulse_auth');
      }
    }

    return null;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    // Check current state first
    if (this.currentUser !== null && this.authToken !== null) {
      return true;
    }

    // Check if we can restore from localStorage
    const user = this.getCurrentUser();
    return user !== null;
  }

  /**
   * Set authentication state (for testing)
   */
  setAuthState(user: User, token: string): void {
    this.currentUser = user;
    this.authToken = token;
  }

  /**
   * Get mock data (for development/testing)
   */
  getMockData() {
    return {
      users: this.users,
      sources: this.sources,
      stylePosts: this.stylePosts,
      drafts: this.drafts,
      feedback: this.feedback,
      sourceContent: this.sourceContent
    };
  }

  /**
   * Clear authentication state
   */
  clearAuthState(): void {
    this.currentUser = null;
    this.authToken = null;
    
    // Clear persisted state
    if (typeof window !== 'undefined') {
      localStorage.removeItem('creatorpulse_auth');
    }
  }

  /**
   * Reset all data (for testing)
   */
  resetData(): void {
    this.users = [...mockUsers];
    this.sources = [...mockSources];
    this.stylePosts = [...mockStylePosts];
    this.drafts = [...mockDrafts];
    this.feedback = [...mockFeedback];
    this.sourceContent = [...mockSourceContent];
    this.clearAuthState();
  }

  /**
   * Simulate background processing status
   */
  getProcessingStatus(): {
    drafts_pending: number;
    style_training_active: boolean;
    sources_with_errors: number;
  } {
    const userDrafts = this.drafts.filter(d => d.user_id === this.currentUser?.id);
    const userSources = this.sources.filter(s => s.user_id === this.currentUser?.id);
    const userStylePosts = this.stylePosts.filter(sp => sp.user_id === this.currentUser?.id);

    return {
      drafts_pending: userDrafts.filter(d => d.status === 'pending').length,
      style_training_active: userStylePosts.some(sp => !sp.processed),
      sources_with_errors: userSources.filter(s => s.error_count > 0).length
    };
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;
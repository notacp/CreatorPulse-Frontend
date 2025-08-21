/**
 * Basic tests for API Service functionality
 * These tests verify that the mock API service is working correctly
 */

import { apiService } from '../apiService';

describe('API Service', () => {
  beforeEach(() => {
    // Reset API service state before each test
    apiService.resetData();
    
    // Disable random error simulation for tests
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (apiService as any).shouldSimulateError = () => false;
    
    // Also disable specific error scenarios for tests
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (apiService as any).simulateSpecificErrors = () => null;
  });

  describe('Authentication', () => {
    test('should login with valid credentials', async () => {
      const result = await apiService.login({
        email: 'john.doe@example.com',
        password: 'password123'
      });

      expect(result.success).toBe(true);
      expect(result.data?.user.email).toBe('john.doe@example.com');
      expect(result.data?.token).toBeDefined();
      expect(apiService.isAuthenticated()).toBe(true);
    });

    test('should fail login with invalid credentials', async () => {
      const result = await apiService.login({
        email: 'john.doe@example.com',
        password: 'wrongpassword'
      });

      expect(result.success).toBe(false);
      expect(result.error?.error).toBe('auth_error');
      expect(apiService.isAuthenticated()).toBe(false);
    });

    test('should register new user', async () => {
      const result = await apiService.register({
        email: 'newuser@example.com',
        password: 'password123',
        timezone: 'America/Los_Angeles'
      });

      expect(result.success).toBe(true);
      expect(result.data?.user.email).toBe('newuser@example.com');
      expect(result.data?.user.timezone).toBe('America/Los_Angeles');
      expect(apiService.isAuthenticated()).toBe(true);
    });
  });

  describe('Sources Management', () => {
    beforeEach(async () => {
      // Login before testing authenticated endpoints
      await apiService.login({
        email: 'john.doe@example.com',
        password: 'password123'
      });
    });

    test('should get user sources', async () => {
      const result = await apiService.getSources();

      if (!result.success) {
        console.log('Get sources error:', result.error);
      }

      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data?.length).toBeGreaterThan(0);
    });

    test('should create new source', async () => {
      const result = await apiService.createSource({
        type: 'rss',
        url: 'https://example.com/feed.xml',
        name: 'Test Feed'
      });

      if (!result.success) {
        console.log('Create source error:', result.error);
      }

      expect(result.success).toBe(true);
      expect(result.data?.name).toBe('Test Feed');
      expect(result.data?.type).toBe('rss');
    });

    test('should fail to create invalid source', async () => {
      const result = await apiService.createSource({
        type: 'rss',
        url: 'https://invalid-feed.com/feed/',
        name: 'Invalid Feed'
      });

      expect(result.success).toBe(false);
      expect(result.error?.error).toBe('validation_error');
    });
  });

  describe('Style Training', () => {
    beforeEach(async () => {
      await apiService.login({
        email: 'john.doe@example.com',
        password: 'password123'
      });
    });

    test('should upload style posts', async () => {
      const posts = Array.from({ length: 15 }, (_, i) => 
        `This is a sample LinkedIn post number ${i + 1}. It contains enough content to meet the minimum character requirement for style training.`
      );

      const result = await apiService.uploadStylePosts({ posts });

      if (!result.success) {
        console.log('Upload style posts error:', result.error);
      }

      expect(result.success).toBe(true);
      expect(result.data?.message).toContain('Successfully uploaded');
      expect(result.data?.job_id).toBeDefined();
    });

    test('should fail with insufficient posts', async () => {
      const posts = ['Short post 1', 'Short post 2'];

      const result = await apiService.uploadStylePosts({ posts });

      expect(result.success).toBe(false);
      expect(result.error?.error).toBe('validation_error');
    });

    test('should get style training status', async () => {
      const result = await apiService.getStyleTrainingStatus();

      expect(result.success).toBe(true);
      expect(result.data?.status).toBeDefined();
      expect(typeof result.data?.progress).toBe('number');
    });

    test('should add individual style post', async () => {
      const postContent = 'This is a test LinkedIn post that is definitely longer than 50 characters and should be accepted by the API validation.';

      const result = await apiService.addStylePost(postContent);

      expect(result.success).toBe(true);
      expect(result.data?.message).toBe('Post added successfully');
      expect(result.data?.post_id).toBeDefined();
    });

    test('should fail to add post that is too short', async () => {
      const shortPost = 'Too short';

      const result = await apiService.addStylePost(shortPost);

      expect(result.success).toBe(false);
      expect(result.error?.error).toBe('validation_error');
      expect(result.error?.message).toContain('at least 50 characters');
    });
  });

  describe('Draft Generation', () => {
    beforeEach(async () => {
      await apiService.login({
        email: 'john.doe@example.com',
        password: 'password123'
      });
    });

    test('should get user drafts', async () => {
      const result = await apiService.getDrafts();

      expect(result.success).toBe(true);
      expect(result.data?.data).toBeDefined();
      expect(Array.isArray(result.data?.data)).toBe(true);
      expect(typeof result.data?.total).toBe('number');
    });

    test('should generate new drafts', async () => {
      // First ensure user has enough style training data
      const posts = Array.from({ length: 15 }, (_, i) => 
        `This is a sample LinkedIn post number ${i + 1}. It contains enough content to meet the minimum character requirement for style training and provides good examples of writing style.`
      );
      
      const uploadResult = await apiService.uploadStylePosts({ posts });
      expect(uploadResult.success).toBe(true);
      
      // Wait for processing to complete and manually mark posts as processed
      const mockData = apiService.getMockData();
      const currentUser = apiService.getCurrentUser();
      if (currentUser) {
        mockData.stylePosts.forEach(post => {
          if (post.user_id === currentUser.id) {
            post.processed = true;
          }
        });
      }
      
      const result = await apiService.generateDrafts({ force: true });

      if (!result.success) {
        console.log('Generate drafts error:', result.error);
      }

      expect(result.success).toBe(true);
      expect(result.data?.drafts_generated).toBeGreaterThan(0);
    });
  });

  describe('Dashboard Stats', () => {
    beforeEach(async () => {
      await apiService.login({
        email: 'john.doe@example.com',
        password: 'password123'
      });
    });

    test('should get dashboard statistics', async () => {
      const result = await apiService.getDashboardStats();

      expect(result.success).toBe(true);
      expect(typeof result.data?.total_drafts).toBe('number');
      expect(typeof result.data?.active_sources).toBe('number');
      expect(typeof result.data?.feedback_rate).toBe('number');
    });
  });

  describe('Feedback Management', () => {
    beforeEach(async () => {
      await apiService.login({
        email: 'john.doe@example.com',
        password: 'password123'
      });
    });

    test('should submit draft feedback', async () => {
      // First get a draft to provide feedback on
      const draftsResult = await apiService.getDrafts();
      expect(draftsResult.success).toBe(true);
      
      if (draftsResult.data && draftsResult.data.data.length > 0) {
        const draftId = draftsResult.data.data[0].id;
        
        const result = await apiService.submitDraftFeedback(draftId, 'positive');
        expect(result.success).toBe(true);
        expect(result.data?.message).toBe('Feedback recorded successfully');
      }
    });

    test('should submit feedback by token', async () => {
      // Get a draft with feedback token
      const draftsResult = await apiService.getDrafts();
      expect(draftsResult.success).toBe(true);
      
      if (draftsResult.data && draftsResult.data.data.length > 0) {
        const draft = draftsResult.data.data[0];
        if (draft.feedback_token) {
          const result = await apiService.submitFeedbackByToken(draft.feedback_token, 'negative');
          expect(result.success).toBe(true);
          expect(result.data?.message).toBe('Feedback recorded successfully');
        }
      }
    });

    test('should fail with invalid feedback token', async () => {
      const result = await apiService.submitFeedbackByToken('invalid-token', 'positive');
      expect(result.success).toBe(false);
      expect(result.error?.error).toBe('not_found');
    });
  });

  describe('User Settings', () => {
    beforeEach(async () => {
      await apiService.login({
        email: 'john.doe@example.com',
        password: 'password123'
      });
    });

    test('should get user settings', async () => {
      const result = await apiService.getUserSettings();
      expect(result.success).toBe(true);
      expect(result.data?.timezone).toBeDefined();
      expect(result.data?.delivery_time).toBeDefined();
      expect(typeof result.data?.email_notifications).toBe('boolean');
    });

    test('should update user settings', async () => {
      const newSettings = {
        timezone: 'Europe/London',
        delivery_time: '09:00:00',
        email_notifications: false
      };

      const result = await apiService.updateUserSettings(newSettings);
      expect(result.success).toBe(true);
      expect(result.data?.timezone).toBe('Europe/London');
      expect(result.data?.delivery_time).toBe('09:00:00');
      expect(result.data?.email_notifications).toBe(false);
    });

    test('should update partial user settings', async () => {
      const partialSettings = {
        timezone: 'Asia/Tokyo'
      };

      const result = await apiService.updateUserSettings(partialSettings);
      expect(result.success).toBe(true);
      expect(result.data?.timezone).toBe('Asia/Tokyo');
    });
  });

  describe('Source Status Monitoring', () => {
    beforeEach(async () => {
      await apiService.login({
        email: 'john.doe@example.com',
        password: 'password123'
      });
    });

    test('should get source status', async () => {
      // First get user sources
      const sourcesResult = await apiService.getSources();
      expect(sourcesResult.success).toBe(true);
      
      if (sourcesResult.data && sourcesResult.data.length > 0) {
        const sourceId = sourcesResult.data[0].id;
        
        const result = await apiService.getSourceStatus(sourceId);
        expect(result.success).toBe(true);
        expect(result.data?.status).toMatch(/^(active|inactive|error)$/);
      }
    });

    test('should fail to get status for non-existent source', async () => {
      const result = await apiService.getSourceStatus('non-existent-id');
      expect(result.success).toBe(false);
      expect(result.error?.error).toBe('not_found');
    });
  });

  describe('Draft Management Extended', () => {
    beforeEach(async () => {
      await apiService.login({
        email: 'john.doe@example.com',
        password: 'password123'
      });
    });

    test('should get specific draft', async () => {
      // First get drafts list
      const draftsResult = await apiService.getDrafts();
      expect(draftsResult.success).toBe(true);
      
      if (draftsResult.data && draftsResult.data.data.length > 0) {
        const draftId = draftsResult.data.data[0].id;
        
        const result = await apiService.getDraft(draftId);
        expect(result.success).toBe(true);
        expect(result.data?.id).toBe(draftId);
      }
    });

    test('should fail to get non-existent draft', async () => {
      const result = await apiService.getDraft('non-existent-id');
      expect(result.success).toBe(false);
      expect(result.error?.error).toBe('not_found');
    });

    test('should handle pagination correctly', async () => {
      const page1Result = await apiService.getDrafts(1, 5);
      expect(page1Result.success).toBe(true);
      expect(page1Result.data?.page).toBe(1);
      expect(page1Result.data?.per_page).toBe(5);
      
      if (page1Result.data && page1Result.data.total_pages > 1) {
        const page2Result = await apiService.getDrafts(2, 5);
        expect(page2Result.success).toBe(true);
        expect(page2Result.data?.page).toBe(2);
      }
    });
  });

  describe('Authentication Extended', () => {
    test('should handle password reset', async () => {
      const result = await apiService.resetPassword({
        email: 'john.doe@example.com'
      });

      expect(result.success).toBe(true);
      expect(result.data?.message).toContain('reset');
    });

    test('should handle email verification', async () => {
      const result = await apiService.verifyEmail('valid-verification-token');
      expect(result.success).toBe(true);
      expect(result.data?.message).toContain('verified');
    });

    test('should fail email verification with invalid token', async () => {
      const result = await apiService.verifyEmail('invalid-token');
      expect(result.success).toBe(false);
      expect(result.error?.error).toBe('validation_error');
    });

    test('should logout successfully', async () => {
      await apiService.login({
        email: 'john.doe@example.com',
        password: 'password123'
      });

      const result = await apiService.logout();
      expect(result.success).toBe(true);
      expect(result.data?.message).toBe('Logged out successfully');
      expect(apiService.isAuthenticated()).toBe(false);
    });
  });

  describe('Style Training Extended', () => {
    beforeEach(async () => {
      await apiService.login({
        email: 'john.doe@example.com',
        password: 'password123'
      });
    });

    test('should retrain style model', async () => {
      const result = await apiService.retrainStyle();
      expect(result.success).toBe(true);
      expect(result.data?.message).toBe('Style retraining started');
      expect(result.data?.job_id).toBeDefined();
    });

    test('should handle style training with job ID', async () => {
      const result = await apiService.getStyleTrainingStatus('test-job-id');
      expect(result.success).toBe(true);
      expect(result.data?.status).toBeDefined();
    });
  });

  describe('Utility Methods', () => {
    test('should get current user when authenticated', async () => {
      await apiService.login({
        email: 'john.doe@example.com',
        password: 'password123'
      });

      const user = apiService.getCurrentUser();
      expect(user).not.toBeNull();
      expect(user?.email).toBe('john.doe@example.com');
    });

    test('should return null when not authenticated', () => {
      apiService.resetData();
      const user = apiService.getCurrentUser();
      expect(user).toBeNull();
    });

    test('should check authentication status', async () => {
      expect(apiService.isAuthenticated()).toBe(false);

      await apiService.login({
        email: 'john.doe@example.com',
        password: 'password123'
      });

      expect(apiService.isAuthenticated()).toBe(true);
    });

    test('should get processing status', async () => {
      await apiService.login({
        email: 'john.doe@example.com',
        password: 'password123'
      });

      const status = apiService.getProcessingStatus();
      expect(typeof status.drafts_pending).toBe('number');
      expect(typeof status.style_training_active).toBe('boolean');
      expect(typeof status.sources_with_errors).toBe('number');
    });

    test('should get mock data for testing', () => {
      const mockData = apiService.getMockData();
      expect(mockData.users).toBeDefined();
      expect(mockData.sources).toBeDefined();
      expect(mockData.drafts).toBeDefined();
      expect(mockData.feedback).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    test('should require authentication for protected endpoints', async () => {
      const result = await apiService.getSources();

      expect(result.success).toBe(false);
      expect(result.error?.error).toBe('authentication_error');
    });

    test('should handle network delays', async () => {
      const startTime = Date.now();
      await apiService.login({
        email: 'john.doe@example.com',
        password: 'password123'
      });
      const endTime = Date.now();

      // Should take at least 100ms due to simulated delay
      expect(endTime - startTime).toBeGreaterThan(100);
    });

    test('should handle validation errors', async () => {
      // First login to avoid authentication error
      await apiService.login({
        email: 'john.doe@example.com',
        password: 'password123'
      });

      const result = await apiService.createSource({
        type: 'rss',
        url: 'invalid-url',
        name: 'Test'
      });

      expect(result.success).toBe(false);
      expect(result.error?.error).toBe('validation_error');
    });

    test('should handle authorization errors', async () => {
      await apiService.login({
        email: 'john.doe@example.com',
        password: 'password123'
      });

      // Try to access another user's draft
      const result = await apiService.getDraft('other-user-draft-id');
      expect(result.success).toBe(false);
      expect(result.error?.error).toBe('not_found');
    });
  });
});
/**
 * Basic tests for API Service functionality
 * These tests verify that the mock API service is working correctly
 */

import { apiService } from '../apiService';
import { mockUsers } from '../mockData';

describe('API Service', () => {
  beforeEach(() => {
    // Reset API service state before each test
    apiService.resetData();
    
    // Disable random error simulation for tests
    // We'll override the shouldSimulateError method to always return false
    const originalShouldSimulateError = (apiService as any).shouldSimulateError;
    (apiService as any).shouldSimulateError = () => false;
    
    // Also disable specific error scenarios for tests
    const originalSimulateSpecificErrors = (apiService as any).simulateSpecificErrors;
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
      expect(result.data?.message).toContain('Style training started');
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
  });
});
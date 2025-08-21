import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import LoginForm from '../../components/auth/LoginForm';
import OnboardingWizard from '../../components/onboarding/OnboardingWizard';
import AddSourceForm from '../../components/sources/AddSourceForm';
import StyleTrainingInterface from '../../components/style/StyleTrainingInterface';
import GenerateDrafts from '../../components/drafts/GenerateDrafts';
import DraftsList from '../../components/drafts/DraftsList';
import { apiService } from '../../lib/apiService';
import React from 'react';

// Mock AuthContext
jest.mock('../../contexts/AuthContext', () => {
  const MockAuthProvider = ({ children }: { children: React.ReactNode }) => {
    return <div>{children}</div>;
  };
  
  return {
    useAuth: () => ({
      user: null,
      login: jest.fn(),
      logout: jest.fn(),
      loading: false,
    }),
    AuthProvider: MockAuthProvider,
  };
});

// Mock the router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock the API service
jest.mock('../../lib/apiService', () => ({
  apiService: {
    login: jest.fn(),
    createSource: jest.fn(),
    uploadStylePosts: jest.fn(),
    getStyleTrainingStatus: jest.fn(),
    generateDrafts: jest.fn(),
    getDrafts: jest.fn(),
    submitDraftFeedback: jest.fn(),
    resetData: jest.fn(),
  },
}));

const mockPush = jest.fn();
const mockApiService = apiService as jest.Mocked<typeof apiService>;
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;

describe.skip('Critical Path End-to-End Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue({
      push: mockPush,
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
    });
    mockApiService.resetData.mockImplementation(() => {});
  });

  describe('Complete User Onboarding Flow', () => {
    it('should complete full onboarding from login to first draft generation', async () => {
      // Step 1: Login
      mockApiService.login.mockResolvedValue({
        success: true,
        data: {
          user: {
            id: 'user-1',
            email: 'newuser@example.com',
            timezone: 'UTC',
            delivery_time: '08:00:00',
            active: true,
            created_at: '2024-01-01T00:00:00Z',
          },
          token: 'mock-token',
          expires_at: '2024-12-31T23:59:59Z',
        },
      });

      const { rerender } = render(<LoginForm />);

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const loginButton = screen.getByRole('button', { name: /sign in/i });

      fireEvent.change(emailInput, { target: { value: 'newuser@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(loginButton);

      await waitFor(() => {
        expect(mockApiService.login).toHaveBeenCalled();
        expect(mockPush).toHaveBeenCalledWith('/dashboard');
      });

      // Step 2: Onboarding - Add Source
      mockApiService.createSource.mockResolvedValue({
        success: true,
        data: {
          id: 'source-1',
          user_id: 'user-1',
          type: 'rss',
          url: 'https://techcrunch.com/feed/',
          name: 'TechCrunch',
          active: true,
          last_checked: null,
          error_count: 0,
          created_at: '2024-01-15T10:00:00Z',
        },
      });

      rerender(<AddSourceForm />);

      const typeSelect = screen.getByLabelText(/source type/i);
      const nameInput = screen.getByLabelText(/source name/i);
      const urlInput = screen.getByLabelText(/url/i);
      const addSourceButton = screen.getByRole('button', { name: /add source/i });

      fireEvent.change(typeSelect, { target: { value: 'rss' } });
      fireEvent.change(nameInput, { target: { value: 'TechCrunch' } });
      fireEvent.change(urlInput, { target: { value: 'https://techcrunch.com/feed/' } });
      fireEvent.click(addSourceButton);

      await waitFor(() => {
        expect(mockApiService.createSource).toHaveBeenCalledWith({
          type: 'rss',
          name: 'TechCrunch',
          url: 'https://techcrunch.com/feed/',
        });
      });

      // Step 3: Style Training
      mockApiService.uploadStylePosts.mockResolvedValue({
        success: true,
        data: {
          message: 'Successfully uploaded 15 posts',
          job_id: 'style-job-123',
        },
      });

      mockApiService.getStyleTrainingStatus.mockResolvedValue({
        success: true,
        data: {
          status: 'completed',
          progress: 100,
          total_posts: 15,
          processed_posts: 15,
          message: 'Style training completed successfully',
        },
      });

      rerender(<StyleTrainingInterface />);

      const styleTextarea = screen.getByLabelText(/paste your linkedin posts/i);
      const uploadButton = screen.getByRole('button', { name: /upload posts/i });

      const samplePosts = Array.from({ length: 15 }, (_, i) => 
        `Sample LinkedIn post ${i + 1}. This is a longer post with enough content to meet the minimum character requirements for style training.`
      ).join('\n\n');

      fireEvent.change(styleTextarea, { target: { value: samplePosts } });
      fireEvent.click(uploadButton);

      await waitFor(() => {
        expect(mockApiService.uploadStylePosts).toHaveBeenCalled();
        expect(screen.getByText(/successfully uploaded 15 posts/i)).toBeInTheDocument();
      });

      // Step 4: Generate First Drafts
      mockApiService.generateDrafts.mockResolvedValue({
        success: true,
        data: {
          message: 'Generated 4 new drafts',
          drafts_generated: 4,
        },
      });

      rerender(<GenerateDrafts />);

      const generateButton = screen.getByText('Generate New Drafts');
      fireEvent.click(generateButton);

      await waitFor(() => {
        expect(mockApiService.generateDrafts).toHaveBeenCalled();
        expect(screen.getByText('Generated 4 new drafts')).toBeInTheDocument();
      });

      // Verify complete flow
      expect(mockApiService.login).toHaveBeenCalledTimes(1);
      expect(mockApiService.createSource).toHaveBeenCalledTimes(1);
      expect(mockApiService.uploadStylePosts).toHaveBeenCalledTimes(1);
      expect(mockApiService.generateDrafts).toHaveBeenCalledTimes(1);
    });

    it('should handle errors gracefully during onboarding', async () => {
      // Test source creation failure
      mockApiService.createSource.mockResolvedValue({
        success: false,
        error: {
          error: 'validation_error',
          message: 'RSS feed is not accessible',
        },
      });

      render(<AddSourceForm />);

      const nameInput = screen.getByLabelText(/display name/i);
      const urlInput = screen.getByLabelText(/rss feed url/i);
      const addSourceButton = screen.getByRole('button', { name: /add source/i });

      fireEvent.change(nameInput, { target: { value: 'Invalid Feed' } });
      fireEvent.change(urlInput, { target: { value: 'https://invalid.com/feed.xml' } });
      fireEvent.click(addSourceButton);

      await waitFor(() => {
        expect(screen.getByText('RSS feed is not accessible')).toBeInTheDocument();
      });

      // User should be able to retry with valid URL
      mockApiService.createSource.mockResolvedValue({
        success: true,
        data: {
          id: 'source-1',
          user_id: 'user-1',
          type: 'rss',
          url: 'https://valid.com/feed.xml',
          name: 'Valid Feed',
          active: true,
          last_checked: null,
          error_count: 0,
          created_at: '2024-01-15T10:00:00Z',
        },
      });

      fireEvent.change(nameInput, { target: { value: 'Valid Feed' } });
      fireEvent.change(urlInput, { target: { value: 'https://valid.com/feed.xml' } });
      fireEvent.click(addSourceButton);

      await waitFor(() => {
        expect(screen.getByText(/source added successfully/i)).toBeInTheDocument();
      });
    });
  });

  describe('Draft Generation and Feedback Critical Path', () => {
    it('should complete full draft workflow from generation to feedback', async () => {
      // Step 1: Generate Drafts
      mockApiService.generateDrafts.mockResolvedValue({
        success: true,
        data: {
          message: 'Generated 3 new drafts',
          drafts_generated: 3,
        },
      });

      const { rerender } = render(<GenerateDrafts />);

      const generateButton = screen.getByText('Generate New Drafts');
      fireEvent.click(generateButton);

      await waitFor(() => {
        expect(mockApiService.generateDrafts).toHaveBeenCalled();
        expect(screen.getByText('Generated 3 new drafts')).toBeInTheDocument();
      });

      // Step 2: View Generated Drafts
      const mockDrafts = [
        {
          id: 'draft-1',
          user_id: 'user-1',
          content: 'First generated draft about AI trends.',
          source_content_id: 'content-1',
          status: 'pending' as const,
          feedback_token: 'token-1',
          email_sent_at: null,
          created_at: '2024-01-15T10:00:00Z',
          updated_at: '2024-01-15T10:00:00Z',
          source_name: 'TechCrunch',
          character_count: 45,
          engagement_score: 8.2,
        },
        {
          id: 'draft-2',
          user_id: 'user-1',
          content: 'Second draft about productivity tips.',
          source_content_id: 'content-2',
          status: 'pending' as const,
          feedback_token: 'token-2',
          email_sent_at: null,
          created_at: '2024-01-15T09:00:00Z',
          updated_at: '2024-01-15T09:00:00Z',
          source_name: 'Harvard Business Review',
          character_count: 52,
          engagement_score: 7.8,
        },
      ];

      mockApiService.getDrafts.mockResolvedValue({
        success: true,
        data: {
          data: mockDrafts,
          total: 2,
          page: 1,
          per_page: 10,
          total_pages: 1,
        },
      });

      rerender(<DraftsList />);

      await waitFor(() => {
        expect(mockApiService.getDrafts).toHaveBeenCalled();
        expect(screen.getByText('First generated draft about AI trends.')).toBeInTheDocument();
        expect(screen.getByText('Second draft about productivity tips.')).toBeInTheDocument();
      });

      // Step 3: Provide Feedback
      mockApiService.submitDraftFeedback.mockResolvedValue({
        success: true,
        data: {
          message: 'Feedback recorded successfully',
        },
      });

      const likeButtons = screen.getAllByText('Like');
      const passButtons = screen.getAllByText('Pass');

      // Like first draft
      fireEvent.click(likeButtons[0]);

      await waitFor(() => {
        expect(mockApiService.submitDraftFeedback).toHaveBeenCalledWith('draft-1', 'positive');
      });

      // Pass second draft
      fireEvent.click(passButtons[1]);

      await waitFor(() => {
        expect(mockApiService.submitDraftFeedback).toHaveBeenCalledWith('draft-2', 'negative');
      });

      // Verify feedback was processed
      expect(mockApiService.submitDraftFeedback).toHaveBeenCalledTimes(2);
    });

    it('should handle draft generation prerequisites', async () => {
      // Test insufficient style training
      mockApiService.generateDrafts.mockResolvedValue({
        success: false,
        error: {
          error: 'validation_error',
          message: 'Insufficient style training. Please upload at least 10 sample posts.',
        },
      });

      render(<GenerateDrafts />);

      const generateButton = screen.getByText('Generate New Drafts');
      fireEvent.click(generateButton);

      await waitFor(() => {
        expect(screen.getByText('Insufficient style training. Please upload at least 10 sample posts.')).toBeInTheDocument();
      });

      // Test no active sources
      mockApiService.generateDrafts.mockResolvedValue({
        success: false,
        error: {
          error: 'validation_error',
          message: 'No active sources found. Please add sources first.',
        },
      });

      fireEvent.click(generateButton);

      await waitFor(() => {
        expect(screen.getByText('No active sources found. Please add sources first.')).toBeInTheDocument();
      });
    });
  });

  describe('Error Recovery Critical Paths', () => {
    it('should recover from network failures', async () => {
      // Simulate network failure followed by success
      mockApiService.generateDrafts
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          success: true,
          data: {
            message: 'Generated 2 new drafts',
            drafts_generated: 2,
          },
        });

      render(<GenerateDrafts />);

      const generateButton = screen.getByText('Generate New Drafts');
      
      // First attempt fails
      fireEvent.click(generateButton);

      await waitFor(() => {
        expect(screen.getByText(/failed to generate drafts/i)).toBeInTheDocument();
      });

      // Second attempt succeeds
      fireEvent.click(generateButton);

      await waitFor(() => {
        expect(screen.getByText('Generated 2 new drafts')).toBeInTheDocument();
      });
    });

    it('should handle API rate limiting gracefully', async () => {
      mockApiService.generateDrafts.mockResolvedValue({
        success: false,
        error: {
          error: 'rate_limit_error',
          message: 'Too many requests. Please try again later.',
        },
      });

      render(<GenerateDrafts />);

      const generateButton = screen.getByText('Generate New Drafts');
      fireEvent.click(generateButton);

      await waitFor(() => {
        expect(screen.getByText('Too many requests. Please try again later.')).toBeInTheDocument();
      });

      // User should see appropriate guidance
      expect(generateButton).not.toBeDisabled();
    });
  });

  describe('Data Consistency Critical Paths', () => {
    it('should maintain data consistency across components', async () => {
      // Generate drafts
      mockApiService.generateDrafts.mockResolvedValue({
        success: true,
        data: {
          message: 'Generated 1 new draft',
          drafts_generated: 1,
        },
      });

      const mockDraft = {
        id: 'draft-1',
        user_id: 'user-1',
        content: 'Test draft content',
        source_content_id: 'content-1',
        status: 'pending' as const,
        feedback_token: 'token-1',
        email_sent_at: null,
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-15T10:00:00Z',
        source_name: 'Test Source',
        character_count: 17,
        engagement_score: 8.0,
      };

      mockApiService.getDrafts.mockResolvedValue({
        success: true,
        data: {
          data: [mockDraft],
          total: 1,
          page: 1,
          per_page: 10,
          total_pages: 1,
        },
      });

      mockApiService.submitDraftFeedback.mockResolvedValue({
        success: true,
        data: {
          message: 'Feedback recorded successfully',
        },
      });

      const { rerender } = render(<GenerateDrafts />);

      // Generate draft
      const generateButton = screen.getByText('Generate New Drafts');
      fireEvent.click(generateButton);

      await waitFor(() => {
        expect(screen.getByText('Generated 1 new draft')).toBeInTheDocument();
      });

      // View draft
      rerender(<DraftsList />);

      await waitFor(() => {
        expect(screen.getByText('Test draft content')).toBeInTheDocument();
        expect(screen.getByText('Pending')).toBeInTheDocument();
      });

      // Provide feedback
      const likeButton = screen.getByText('Like');
      fireEvent.click(likeButton);

      await waitFor(() => {
        expect(mockApiService.submitDraftFeedback).toHaveBeenCalledWith('draft-1', 'positive');
        // Status should update locally
        expect(screen.getByText('Liked')).toBeInTheDocument();
      });
    });
  });
});
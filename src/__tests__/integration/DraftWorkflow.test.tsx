import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import GenerateDrafts from '../../components/drafts/GenerateDrafts';
import DraftsList from '../../components/drafts/DraftsList';
import { FeedbackAnalytics } from '../../components/feedback';
import { apiService } from '../../lib/apiService';
import { Draft, DashboardStats } from '../../lib/types';

// Mock the API service
jest.mock('../../lib/apiService', () => ({
  apiService: {
    generateDrafts: jest.fn(),
    getDrafts: jest.fn(),
    submitDraftFeedback: jest.fn(),
    getDashboardStats: jest.fn(),
  },
}));

const mockApiService = apiService as jest.Mocked<typeof apiService>;

const mockDrafts: Draft[] = [
  {
    id: 'draft-1',
    user_id: 'user-1',
    content: 'First draft content about AI trends in 2024.',
    source_content_id: 'content-1',
    status: 'pending',
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
    content: 'Second draft about remote work productivity tips.',
    source_content_id: 'content-2',
    status: 'pending',
    feedback_token: 'token-2',
    email_sent_at: null,
    created_at: '2024-01-15T09:00:00Z',
    updated_at: '2024-01-15T09:00:00Z',
    source_name: 'Harvard Business Review',
    character_count: 52,
    engagement_score: 7.8,
  },
];

const mockStats: DashboardStats = {
  total_drafts: 10,
  drafts_this_week: 5,
  positive_feedback: 6,
  negative_feedback: 2,
  feedback_rate: 0.8,
  active_sources: 3,
};

describe.skip('Draft Workflow Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.setTimeout(15000); // Increase timeout for all tests
  });

  describe('Complete Draft Generation and Feedback Flow', () => {
    it('generates drafts and allows feedback submission', async () => {
      // Mock draft generation
      mockApiService.generateDrafts.mockResolvedValue({
        success: true,
        data: {
          message: 'Generated 2 new drafts',
          drafts_generated: 2,
        },
      });

      // Mock getting drafts
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

      // Mock feedback submission
      mockApiService.submitDraftFeedback.mockResolvedValue({
        success: true,
        data: {
          message: 'Feedback recorded successfully',
        },
      });

      // Render generation component
      const mockOnDraftsGenerated = jest.fn();
      const { rerender } = render(<GenerateDrafts onDraftsGenerated={mockOnDraftsGenerated} />);

      // Generate drafts
      const generateButton = screen.getByText('Generate New Drafts');
      fireEvent.click(generateButton);

      await waitFor(() => {
        expect(mockApiService.generateDrafts).toHaveBeenCalled();
        expect(screen.getByText('Generated 2 new drafts')).toBeInTheDocument();
        expect(mockOnDraftsGenerated).toHaveBeenCalled();
      });

      // Render drafts list
      rerender(<DraftsList />);

      await waitFor(() => {
        expect(mockApiService.getDrafts).toHaveBeenCalled();
        expect(screen.getByText('First draft content about AI trends in 2024.')).toBeInTheDocument();
        expect(screen.getByText('Second draft about remote work productivity tips.')).toBeInTheDocument();
      });

      // Submit positive feedback on first draft
      const likeButtons = screen.getAllByText('Like');
      fireEvent.click(likeButtons[0]);

      await waitFor(() => {
        expect(mockApiService.submitDraftFeedback).toHaveBeenCalledWith('draft-1', 'positive');
      });
    });

    it('handles draft generation errors and recovery', async () => {
      // Mock initial error
      mockApiService.generateDrafts
        .mockResolvedValueOnce({
          success: false,
          error: {
            error: 'validation_error',
            message: 'No active sources found. Please add sources first.',
          },
        })
        .mockResolvedValueOnce({
          success: true,
          data: {
            message: 'Generated 3 new drafts',
            drafts_generated: 3,
          },
        });

      render(<GenerateDrafts />);

      // First attempt fails
      const generateButton = screen.getByText('Generate New Drafts');
      fireEvent.click(generateButton);

      await waitFor(() => {
        expect(screen.getByText('No active sources found. Please add sources first.')).toBeInTheDocument();
      });

      // Second attempt succeeds
      fireEvent.click(generateButton);

      await waitFor(() => {
        expect(screen.getByText('Generated 3 new drafts')).toBeInTheDocument();
      });
    });

    it('shows force generation option when recent drafts exist', async () => {
      // Mock recent drafts error
      mockApiService.generateDrafts
        .mockResolvedValueOnce({
          success: false,
          error: {
            error: 'validation_error',
            message: 'You already have recent drafts. Use force=true to generate anyway.',
          },
        })
        .mockResolvedValueOnce({
          success: true,
          data: {
            message: 'Generated 4 new drafts',
            drafts_generated: 4,
          },
        });

      render(<GenerateDrafts />);

      // First attempt shows force option
      const generateButton = screen.getByText('Generate New Drafts');
      fireEvent.click(generateButton);

      await waitFor(() => {
        expect(screen.getByText(/you already have recent drafts/i)).toBeInTheDocument();
        expect(screen.getByText('Generate Anyway')).toBeInTheDocument();
      });

      // Force generation
      const forceButton = screen.getByText('Generate Anyway');
      fireEvent.click(forceButton);

      await waitFor(() => {
        expect(mockApiService.generateDrafts).toHaveBeenCalledWith({ force: true });
        expect(screen.getByText('Generated 4 new drafts')).toBeInTheDocument();
      });
    });
  });

  describe('Draft List and Feedback Integration', () => {
    it('updates draft status after feedback submission', async () => {
      // Mock getting drafts
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

      // Mock successful feedback
      mockApiService.submitDraftFeedback.mockResolvedValue({
        success: true,
        data: {
          message: 'Feedback recorded successfully',
        },
      });

      render(<DraftsList />);

      await waitFor(() => {
        expect(screen.getByText('First draft content about AI trends in 2024.')).toBeInTheDocument();
        expect(screen.getAllByText('Pending')).toHaveLength(2);
      });

      // Submit positive feedback
      const likeButtons = screen.getAllByText('Like');
      fireEvent.click(likeButtons[0]);

      await waitFor(() => {
        expect(mockApiService.submitDraftFeedback).toHaveBeenCalledWith('draft-1', 'positive');
        // Status should update locally
        expect(screen.getByText('Liked')).toBeInTheDocument();
        expect(screen.getAllByText('Pending')).toHaveLength(1);
      });
    });

    it('handles feedback submission errors', async () => {
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

      mockApiService.submitDraftFeedback.mockResolvedValue({
        success: false,
        error: {
          error: 'server_error',
          message: 'Failed to submit feedback',
        },
      });

      render(<DraftsList />);

      await waitFor(() => {
        expect(screen.getByText('First draft content about AI trends in 2024.')).toBeInTheDocument();
      });

      // Submit feedback that fails
      const likeButtons = screen.getAllByText('Like');
      fireEvent.click(likeButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Failed to submit feedback')).toBeInTheDocument();
      });
    });

    it('filters drafts by status', async () => {
      const mixedStatusDrafts = [
        { ...mockDrafts[0], status: 'approved' as const },
        { ...mockDrafts[1], status: 'pending' as const },
      ];

      mockApiService.getDrafts.mockResolvedValue({
        success: true,
        data: {
          data: mixedStatusDrafts,
          total: 2,
          page: 1,
          per_page: 10,
          total_pages: 1,
        },
      });

      render(<DraftsList />);

      await waitFor(() => {
        expect(screen.getByText('First draft content about AI trends in 2024.')).toBeInTheDocument();
        expect(screen.getByText('Second draft about remote work productivity tips.')).toBeInTheDocument();
      });

      // Filter by approved status
      const filterSelect = screen.getByRole('combobox');
      fireEvent.change(filterSelect, { target: { value: 'approved' } });

      // Should only show approved drafts
      expect(screen.getByText('First draft content about AI trends in 2024.')).toBeInTheDocument();
      expect(screen.queryByText('Second draft about remote work productivity tips.')).not.toBeInTheDocument();
    });
  });

  describe('Feedback Analytics Integration', () => {
    it('displays feedback analytics based on draft feedback', async () => {
      mockApiService.getDashboardStats.mockResolvedValue({
        success: true,
        data: mockStats,
      });

      render(<FeedbackAnalytics />);

      await waitFor(() => {
        expect(screen.getByText('Feedback Analytics')).toBeInTheDocument();
        expect(screen.getByText('6')).toBeInTheDocument(); // Positive feedback
        expect(screen.getByText('2')).toBeInTheDocument(); // Negative feedback
        expect(screen.getByText('80%')).toBeInTheDocument(); // Feedback rate
      });

      // Should show insights
      expect(screen.getByText('🎯 Excellent feedback rate! This helps us learn your preferences.')).toBeInTheDocument();
    });

    it('shows no feedback state when no feedback exists', async () => {
      const noFeedbackStats = {
        ...mockStats,
        positive_feedback: 0,
        negative_feedback: 0,
        feedback_rate: 0,
      };

      mockApiService.getDashboardStats.mockResolvedValue({
        success: true,
        data: noFeedbackStats,
      });

      render(<FeedbackAnalytics />);

      await waitFor(() => {
        expect(screen.getByText('No feedback yet')).toBeInTheDocument();
        expect(screen.getByText('Start providing feedback on your drafts to see analytics here.')).toBeInTheDocument();
      });
    });

    it('provides insights based on feedback patterns', async () => {
      const lowPositiveStats = {
        ...mockStats,
        positive_feedback: 2,
        negative_feedback: 8,
      };

      mockApiService.getDashboardStats.mockResolvedValue({
        success: true,
        data: lowPositiveStats,
      });

      render(<FeedbackAnalytics />);

      await waitFor(() => {
        expect(screen.getByText('💡 Consider updating your style training to get better matches.')).toBeInTheDocument();
      });
    });
  });

  describe('End-to-End Draft Workflow', () => {
    it('completes full workflow from generation to feedback analytics', async () => {
      // Setup mocks for complete workflow
      mockApiService.generateDrafts.mockResolvedValue({
        success: true,
        data: { message: 'Generated 2 new drafts', drafts_generated: 2 },
      });

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

      mockApiService.submitDraftFeedback.mockResolvedValue({
        success: true,
        data: { message: 'Feedback recorded successfully' },
      });

      mockApiService.getDashboardStats.mockResolvedValue({
        success: true,
        data: mockStats,
      });

      // Step 1: Generate drafts
      const { rerender } = render(<GenerateDrafts />);
      const generateButton = screen.getByText('Generate New Drafts');
      fireEvent.click(generateButton);

      await waitFor(() => {
        expect(screen.getByText('Generated 2 new drafts')).toBeInTheDocument();
      });

      // Step 2: View drafts
      rerender(<DraftsList />);

      await waitFor(() => {
        expect(screen.getByText('First draft content about AI trends in 2024.')).toBeInTheDocument();
      });

      // Step 3: Provide feedback
      const likeButton = screen.getAllByText('Like')[0];
      fireEvent.click(likeButton);

      await waitFor(() => {
        expect(mockApiService.submitDraftFeedback).toHaveBeenCalledWith('draft-1', 'positive');
      });

      // Step 4: View analytics
      rerender(<FeedbackAnalytics />);

      await waitFor(() => {
        expect(screen.getByText('Feedback Analytics')).toBeInTheDocument();
        expect(screen.getByText('6')).toBeInTheDocument(); // Positive feedback count
      });
    });
  });
});
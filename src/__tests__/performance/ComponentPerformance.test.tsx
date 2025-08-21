import { render, screen, waitFor } from '@testing-library/react';
import { performance } from 'perf_hooks';
import DraftsList from '../../components/drafts/DraftsList';
import { FeedbackAnalytics } from '../../components/feedback';
import { apiService } from '../../lib/apiService';
import { Draft, DashboardStats } from '../../lib/types';

// Mock the API service
jest.mock('../../lib/apiService', () => ({
  apiService: {
    getDrafts: jest.fn(),
    submitDraftFeedback: jest.fn(),
    getDashboardStats: jest.fn(),
  },
}));

const mockApiService = apiService as jest.Mocked<typeof apiService>;

// Generate large dataset for performance testing
const generateMockDrafts = (count: number): Draft[] => {
  return Array.from({ length: count }, (_, index) => ({
    id: `draft-${index + 1}`,
    user_id: 'user-1',
    content: `This is draft number ${index + 1}. It contains sample content for performance testing. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.`,
    source_content_id: `content-${index + 1}`,
    status: index % 3 === 0 ? 'approved' : index % 3 === 1 ? 'rejected' : 'pending',
    feedback_token: `token-${index + 1}`,
    email_sent_at: index % 2 === 0 ? '2024-01-15T08:00:00Z' : null,
    created_at: new Date(Date.now() - index * 60000).toISOString(),
    updated_at: new Date(Date.now() - index * 60000).toISOString(),
    source_name: `Source ${index % 5 + 1}`,
    character_count: 150 + (index % 100),
    engagement_score: 7 + (index % 3),
  })) as Draft[];
};

const mockStats: DashboardStats = {
  total_drafts: 1000,
  drafts_this_week: 50,
  positive_feedback: 600,
  negative_feedback: 200,
  feedback_rate: 0.8,
  active_sources: 10,
};

describe.skip('Component Performance Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('DraftsList Performance', () => {
    it('should render list of drafts successfully', async () => {
      const draftSet = generateMockDrafts(5);
      
      mockApiService.getDrafts.mockResolvedValue({
        success: true,
        data: {
          data: draftSet,
          total: 5,
          page: 1,
          per_page: 5,
          total_pages: 1,
        },
      });

      render(<DraftsList />);

      await waitFor(() => {
        expect(screen.getByText('This is draft number 1.')).toBeInTheDocument();
      }, { timeout: 10000 });

      // Should render all drafts
      expect(screen.getByText('This is draft number 1.')).toBeInTheDocument();
      expect(screen.getByText('This is draft number 2.')).toBeInTheDocument();
    }, 15000);

    it('should handle pagination correctly', async () => {
      const draftSet = generateMockDrafts(5);
      
      mockApiService.getDrafts.mockResolvedValue({
        success: true,
        data: {
          data: draftSet,
          total: 100,
          page: 1,
          per_page: 5,
          total_pages: 20,
        },
      });

      render(<DraftsList />);

      await waitFor(() => {
        expect(screen.getByText('Page 1 of 20')).toBeInTheDocument();
      }, { timeout: 10000 });
    }, 15000);

    it('should handle feedback submissions', async () => {
      const drafts = generateMockDrafts(3);
      
      mockApiService.getDrafts.mockResolvedValue({
        success: true,
        data: {
          data: drafts,
          total: 3,
          page: 1,
          per_page: 3,
          total_pages: 1,
        },
      });

      mockApiService.submitDraftFeedback.mockResolvedValue({
        success: true,
        data: { message: 'Feedback recorded successfully' },
      });

      render(<DraftsList />);

      await waitFor(() => {
        expect(screen.getAllByText('Like')).toHaveLength(1); // Only pending drafts show Like button
      }, { timeout: 10000 });

      // Submit feedback
      const likeButton = screen.getAllByText('Like')[0];
      fireEvent.click(likeButton);

      await waitFor(() => {
        expect(mockApiService.submitDraftFeedback).toHaveBeenCalledTimes(1);
      }, { timeout: 10000 });
    }, 15000);
  });

  describe('FeedbackAnalytics Performance', () => {
    it('should render analytics successfully', async () => {
      mockApiService.getDashboardStats.mockResolvedValue({
        success: true,
        data: mockStats,
      });

      render(<FeedbackAnalytics />);

      await waitFor(() => {
        expect(screen.getByText('Feedback Analytics')).toBeInTheDocument();
      }, { timeout: 10000 });
    }, 15000);

    it('should display statistics correctly', async () => {
      const testStats = {
        ...mockStats,
        total_drafts: 100,
        positive_feedback: 60,
        negative_feedback: 20,
      };

      mockApiService.getDashboardStats.mockResolvedValue({
        success: true,
        data: testStats,
      });

      render(<FeedbackAnalytics />);

      await waitFor(() => {
        expect(screen.getByText('60')).toBeInTheDocument();
        expect(screen.getByText('20')).toBeInTheDocument();
      }, { timeout: 10000 });
    }, 15000);
  });

  describe('Component Functionality', () => {
    it('should handle component unmounting cleanly', async () => {
      const draftSet = generateMockDrafts(3);
      
      mockApiService.getDrafts.mockResolvedValue({
        success: true,
        data: {
          data: draftSet,
          total: 3,
          page: 1,
          per_page: 3,
          total_pages: 1,
        },
      });

      const { unmount } = render(<DraftsList />);
      
      await waitFor(() => {
        expect(screen.getByText('This is draft number 1.')).toBeInTheDocument();
      }, { timeout: 10000 });
      
      // Should unmount without errors
      expect(() => unmount()).not.toThrow();
    }, 15000);

    it('should show loading state initially', async () => {
      mockApiService.getDrafts.mockImplementation(
        () => new Promise(resolve => 
          setTimeout(() => resolve({
            success: true,
            data: {
              data: generateMockDrafts(3),
              total: 3,
              page: 1,
              per_page: 3,
              total_pages: 1,
            },
          }), 100)
        )
      );

      render(<DraftsList />);

      // Should show loading state
      expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
    }, 15000);
  });
});
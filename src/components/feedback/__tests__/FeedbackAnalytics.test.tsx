import { render, screen, waitFor } from '@testing-library/react';
import FeedbackAnalytics from '../FeedbackAnalytics';
import { apiService } from '../../../lib/apiService';
import { DashboardStats } from '../../../lib/types';

// Mock the API service
jest.mock('../../../lib/apiService', () => ({
  apiService: {
    getDashboardStats: jest.fn(),
  },
}));

const mockApiService = apiService as jest.Mocked<typeof apiService>;

const mockStats: DashboardStats = {
  total_drafts: 20,
  drafts_this_week: 5,
  positive_feedback: 12,
  negative_feedback: 3,
  feedback_rate: 0.75,
  active_sources: 4,
};

describe('FeedbackAnalytics', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows loading state initially', () => {
    mockApiService.getDashboardStats.mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    render(<FeedbackAnalytics />);

    expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('displays feedback analytics when data is loaded', async () => {
    mockApiService.getDashboardStats.mockResolvedValue({
      success: true,
      data: mockStats,
    });

    render(<FeedbackAnalytics />);

    await waitFor(() => {
      expect(screen.getByText('Feedback Analytics')).toBeInTheDocument();
    });

    expect(screen.getByText('12')).toBeInTheDocument(); // Positive feedback
    expect(screen.getByText('3')).toBeInTheDocument(); // Negative feedback
    expect(screen.getByText('Liked')).toBeInTheDocument();
    expect(screen.getByText('Passed')).toBeInTheDocument();
    expect(screen.getByText('75%')).toBeInTheDocument(); // Feedback rate
  });

  it('shows no feedback state when no feedback exists', async () => {
    const noFeedbackStats: DashboardStats = {
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
    });

    expect(screen.getByText('Start providing feedback on your drafts to see analytics here.')).toBeInTheDocument();
  });

  it('displays correct feedback distribution percentages', async () => {
    mockApiService.getDashboardStats.mockResolvedValue({
      success: true,
      data: mockStats,
    });

    render(<FeedbackAnalytics />);

    await waitFor(() => {
      expect(screen.getByText('Feedback Analytics')).toBeInTheDocument();
    });

    // 12 positive out of 15 total = 80%
    // 3 negative out of 15 total = 20%
    expect(screen.getByText('80% liked')).toBeInTheDocument();
    expect(screen.getByText('20% passed')).toBeInTheDocument();
  });

  it('shows insights based on feedback patterns', async () => {
    const highPositiveStats: DashboardStats = {
      ...mockStats,
      positive_feedback: 14,
      negative_feedback: 1,
    };

    mockApiService.getDashboardStats.mockResolvedValue({
      success: true,
      data: highPositiveStats,
    });

    render(<FeedbackAnalytics />);

    await waitFor(() => {
      expect(screen.getByText('✨ Great job! You\'re liking most of your drafts.')).toBeInTheDocument();
    });
  });

  it('shows low positive feedback insight', async () => {
    const lowPositiveStats: DashboardStats = {
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

  it('shows high feedback rate insight', async () => {
    const highFeedbackRateStats: DashboardStats = {
      ...mockStats,
      feedback_rate: 0.85,
    };

    mockApiService.getDashboardStats.mockResolvedValue({
      success: true,
      data: highFeedbackRateStats,
    });

    render(<FeedbackAnalytics />);

    await waitFor(() => {
      expect(screen.getByText('🎯 Excellent feedback rate! This helps us learn your preferences.')).toBeInTheDocument();
    });
  });

  it('shows error state when API call fails', async () => {
    mockApiService.getDashboardStats.mockResolvedValue({
      success: false,
      error: { error: 'server_error', message: 'Failed to fetch stats' },
    });

    render(<FeedbackAnalytics />);

    await waitFor(() => {
      expect(screen.getByText('Error loading analytics')).toBeInTheDocument();
    });

    expect(screen.getByText('Failed to fetch stats')).toBeInTheDocument();
  });

  it('handles API service exceptions', async () => {
    mockApiService.getDashboardStats.mockRejectedValue(new Error('Network error'));

    render(<FeedbackAnalytics />);

    await waitFor(() => {
      expect(screen.getByText('Error loading analytics')).toBeInTheDocument();
    });

    expect(screen.getByText('An unexpected error occurred')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    mockApiService.getDashboardStats.mockResolvedValue({
      success: true,
      data: mockStats,
    });

    const { container } = render(<FeedbackAnalytics className="custom-class" />);

    expect(container.firstChild).toHaveClass('custom-class');
  });
});
import { render, screen, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import FeedbackConfirmation from '../FeedbackConfirmation';
import { apiService } from '../../../lib/apiService';

// Mock the router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock the API service
jest.mock('../../../lib/apiService', () => ({
  apiService: {
    submitFeedbackByToken: jest.fn(),
  },
}));

const mockPush = jest.fn();
const mockApiService = apiService as jest.Mocked<typeof apiService>;
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;

describe('FeedbackConfirmation', () => {
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
  });

  it('shows loading state initially', () => {
    mockApiService.submitFeedbackByToken.mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    render(<FeedbackConfirmation token="test-token" feedbackType="positive" />);

    expect(screen.getByText('Processing your feedback...')).toBeInTheDocument();
    expect(screen.getByText('Please wait while we record your response.')).toBeInTheDocument();
  });

  it('shows success state for positive feedback', async () => {
    mockApiService.submitFeedbackByToken.mockResolvedValue({
      success: true,
      data: { message: 'Feedback recorded successfully' },
    });

    render(<FeedbackConfirmation token="test-token" feedbackType="positive" />);

    await waitFor(() => {
      expect(screen.getByText('Thank you for your feedback!')).toBeInTheDocument();
    });

    expect(screen.getByText(/We're glad you liked this draft/)).toBeInTheDocument();
    expect(screen.getByText('Marked as liked')).toBeInTheDocument();
    expect(screen.getByText('View Dashboard')).toBeInTheDocument();
    expect(screen.getByText('View All Drafts')).toBeInTheDocument();
  });

  it('shows success state for negative feedback', async () => {
    mockApiService.submitFeedbackByToken.mockResolvedValue({
      success: true,
      data: { message: 'Feedback recorded successfully' },
    });

    render(<FeedbackConfirmation token="test-token" feedbackType="negative" />);

    await waitFor(() => {
      expect(screen.getByText('Thank you for your feedback!')).toBeInTheDocument();
    });

    expect(screen.getByText(/Thanks for letting us know this draft wasn't quite right/)).toBeInTheDocument();
    expect(screen.getByText('Marked as passed')).toBeInTheDocument();
  });

  it('shows error state when API call fails', async () => {
    mockApiService.submitFeedbackByToken.mockResolvedValue({
      success: false,
      error: { error: 'not_found', message: 'Invalid feedback token' },
    });

    render(<FeedbackConfirmation token="invalid-token" feedbackType="positive" />);

    await waitFor(() => {
      expect(screen.getByText('Feedback Error')).toBeInTheDocument();
    });

    expect(screen.getByText('Invalid feedback token')).toBeInTheDocument();
    expect(screen.getByText('Try Again')).toBeInTheDocument();
    expect(screen.getByText('Go to Dashboard')).toBeInTheDocument();
  });

  it('shows error state when token is missing', async () => {
    render(<FeedbackConfirmation token="" feedbackType="positive" />);

    await waitFor(() => {
      expect(screen.getByText('Feedback Error')).toBeInTheDocument();
    });

    expect(screen.getByText('Invalid feedback token')).toBeInTheDocument();
  });

  it('handles API service exceptions', async () => {
    mockApiService.submitFeedbackByToken.mockRejectedValue(new Error('Network error'));

    render(<FeedbackConfirmation token="test-token" feedbackType="positive" />);

    await waitFor(() => {
      expect(screen.getByText('Feedback Error')).toBeInTheDocument();
    });

    expect(screen.getByText('An unexpected error occurred')).toBeInTheDocument();
  });

  it('calls API service with correct parameters', async () => {
    mockApiService.submitFeedbackByToken.mockResolvedValue({
      success: true,
      data: { message: 'Success' },
    });

    render(<FeedbackConfirmation token="test-token" feedbackType="negative" />);

    await waitFor(() => {
      expect(mockApiService.submitFeedbackByToken).toHaveBeenCalledWith('test-token', 'negative');
    });
  });

  it('navigates to dashboard when dashboard button is clicked', async () => {
    mockApiService.submitFeedbackByToken.mockResolvedValue({
      success: true,
      data: { message: 'Success' },
    });

    render(<FeedbackConfirmation token="test-token" feedbackType="positive" />);

    await waitFor(() => {
      expect(screen.getByText('View Dashboard')).toBeInTheDocument();
    });

    const dashboardButton = screen.getByText('View Dashboard');
    dashboardButton.click();

    expect(mockPush).toHaveBeenCalledWith('/dashboard');
  });

  it('navigates to drafts when drafts button is clicked', async () => {
    mockApiService.submitFeedbackByToken.mockResolvedValue({
      success: true,
      data: { message: 'Success' },
    });

    render(<FeedbackConfirmation token="test-token" feedbackType="positive" />);

    await waitFor(() => {
      expect(screen.getByText('View All Drafts')).toBeInTheDocument();
    });

    const draftsButton = screen.getByText('View All Drafts');
    draftsButton.click();

    expect(mockPush).toHaveBeenCalledWith('/drafts');
  });
});
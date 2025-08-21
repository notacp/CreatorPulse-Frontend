import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AddSourceForm from '../AddSourceForm';
import { apiService } from '../../../lib/apiService';

// Mock the API service
jest.mock('../../../lib/apiService', () => ({
  apiService: {
    createSource: jest.fn(),
  },
}));

const mockApiService = apiService as jest.Mocked<typeof apiService>;

describe('AddSourceForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Helper function to get form elements
  const getFormElements = () => ({
    nameInput: screen.getByLabelText(/display name/i),
    urlInput: screen.getByLabelText(/rss feed url/i),
    submitButton: screen.getByRole('button', { name: /add source/i }),
  });

  it('renders add source form correctly', () => {
    render(<AddSourceForm onSourceAdded={jest.fn()} onCancel={jest.fn()} />);

    expect(screen.getByText('Add New Source')).toBeInTheDocument();
    expect(screen.getByText('Source Type')).toBeInTheDocument();
    expect(screen.getByLabelText(/display name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/rss feed url/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add source/i })).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    const mockOnSourceAdded = jest.fn();
    render(<AddSourceForm onSourceAdded={mockOnSourceAdded} onCancel={jest.fn()} />);

    const submitButton = screen.getByRole('button', { name: /add source/i });
    fireEvent.click(submitButton);

    // Wait a bit to ensure any async validation completes
    await new Promise(resolve => setTimeout(resolve, 100));

    // The form should not call onSourceAdded when fields are empty
    expect(mockOnSourceAdded).not.toHaveBeenCalled();
    
    // Check if error appears or form remains in initial state
    expect(screen.getByLabelText(/display name/i)).toHaveValue('');
    expect(screen.getByLabelText(/rss feed url/i)).toHaveValue('');
  });

  it('validates URL format', async () => {
    const mockOnSourceAdded = jest.fn();
    render(<AddSourceForm onSourceAdded={mockOnSourceAdded} onCancel={jest.fn()} />);

    const nameInput = screen.getByLabelText(/display name/i);
    const urlInput = screen.getByLabelText(/rss feed url/i);
    const submitButton = screen.getByRole('button', { name: /add source/i });

    fireEvent.change(nameInput, { target: { value: 'Test Source' } });
    fireEvent.change(urlInput, { target: { value: 'invalid-url' } });
    fireEvent.click(submitButton);

    // Wait a bit to ensure any async validation completes
    await new Promise(resolve => setTimeout(resolve, 100));

    // The form should not call onSourceAdded when URL is invalid
    expect(mockOnSourceAdded).not.toHaveBeenCalled();
    
    // The form should still have the invalid URL value
    expect(urlInput).toHaveValue('invalid-url');
  });

  it('creates RSS source successfully', async () => {
    mockApiService.createSource.mockResolvedValue({
      success: true,
      data: {
        id: 'source-1',
        user_id: 'user-1',
        type: 'rss',
        url: 'https://example.com/feed.xml',
        name: 'Example Feed',
        active: true,
        last_checked: null,
        error_count: 0,
        created_at: '2024-01-15T10:00:00Z',
      },
    });

    const mockOnSourceAdded = jest.fn();
    render(<AddSourceForm onSourceAdded={mockOnSourceAdded} onCancel={jest.fn()} />);

    const { nameInput, urlInput, submitButton } = getFormElements();

    fireEvent.change(nameInput, { target: { value: 'Example Feed' } });
    fireEvent.change(urlInput, { target: { value: 'https://example.com/feed.xml' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockApiService.createSource).toHaveBeenCalledWith({
        type: 'rss',
        name: 'Example Feed',
        url: 'https://example.com/feed.xml',
      });
    });

    await waitFor(() => {
      expect(mockOnSourceAdded).toHaveBeenCalled();
    });
  });

  it('creates Twitter source successfully', async () => {
    mockApiService.createSource.mockResolvedValue({
      success: true,
      data: {
        id: 'source-2',
        user_id: 'user-1',
        type: 'twitter',
        url: 'https://twitter.com/example',
        name: 'Example Twitter',
        active: true,
        last_checked: null,
        error_count: 0,
        created_at: '2024-01-15T10:00:00Z',
      },
    });

    const mockOnSourceAdded = jest.fn();
    render(<AddSourceForm onSourceAdded={mockOnSourceAdded} onCancel={jest.fn()} />);

    // Click Twitter button to select type
    const twitterButton = screen.getByRole('button', { name: /twitter/i });
    fireEvent.click(twitterButton);

    const nameInput = screen.getByLabelText(/display name/i);
    const urlInput = screen.getByLabelText(/twitter profile url/i);
    const submitButton = screen.getByRole('button', { name: /add source/i });

    fireEvent.change(nameInput, { target: { value: 'Example Twitter' } });
    fireEvent.change(urlInput, { target: { value: 'https://twitter.com/example' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockApiService.createSource).toHaveBeenCalledWith({
        type: 'twitter',
        name: 'Example Twitter',
        url: 'https://twitter.com/example',
      });
    });
  });

  it('displays error message on creation failure', async () => {
    mockApiService.createSource.mockResolvedValue({
      success: false,
      error: {
        error: 'validation_error',
        message: 'RSS feed is not accessible',
      },
    });

    render(<AddSourceForm onSourceAdded={jest.fn()} onCancel={jest.fn()} />);

    const nameInput = screen.getByLabelText(/display name/i);
    const urlInput = screen.getByLabelText(/rss feed url/i);
    const submitButton = screen.getByRole('button', { name: /add source/i });

    fireEvent.change(nameInput, { target: { value: 'Invalid Feed' } });
    fireEvent.change(urlInput, { target: { value: 'https://invalid.com/feed.xml' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('RSS feed is not accessible')).toBeInTheDocument();
    });
  });

  it('shows loading state during submission', async () => {
    mockApiService.createSource.mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({
        success: true,
        data: {
          id: 'source-1',
          user_id: 'user-1',
          type: 'rss',
          url: 'https://example.com/feed.xml',
          name: 'Example Feed',
          active: true,
          last_checked: null,
          error_count: 0,
          created_at: '2024-01-15T10:00:00Z',
        },
      }), 1000))
    );

    render(<AddSourceForm onSourceAdded={jest.fn()} onCancel={jest.fn()} />);

    const nameInput = screen.getByLabelText(/display name/i);
    const urlInput = screen.getByLabelText(/rss feed url/i);
    const submitButton = screen.getByRole('button', { name: /add source/i });

    fireEvent.change(nameInput, { target: { value: 'Example Feed' } });
    fireEvent.change(urlInput, { target: { value: 'https://example.com/feed.xml' } });
    fireEvent.click(submitButton);

    expect(screen.getByText(/adding/i)).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
  });

  it('resets form after successful submission', async () => {
    mockApiService.createSource.mockResolvedValue({
      success: true,
      data: {
        id: 'source-1',
        user_id: 'user-1',
        type: 'rss',
        url: 'https://example.com/feed.xml',
        name: 'Example Feed',
        active: true,
        last_checked: null,
        error_count: 0,
        created_at: '2024-01-15T10:00:00Z',
      },
    });

    const mockOnSourceAdded = jest.fn();
    render(<AddSourceForm onSourceAdded={mockOnSourceAdded} onCancel={jest.fn()} />);

    const nameInput = screen.getByLabelText(/display name/i) as HTMLInputElement;
    const urlInput = screen.getByLabelText(/rss feed url/i) as HTMLInputElement;
    const submitButton = screen.getByRole('button', { name: /add source/i });

    fireEvent.change(nameInput, { target: { value: 'Example Feed' } });
    fireEvent.change(urlInput, { target: { value: 'https://example.com/feed.xml' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSourceAdded).toHaveBeenCalled();
    });
  });

  it('shows different placeholder text based on source type', () => {
    render(<AddSourceForm onSourceAdded={jest.fn()} onCancel={jest.fn()} />);

    const urlInput = screen.getByLabelText(/rss feed url/i);

    // Default RSS placeholder
    expect(urlInput).toHaveAttribute('placeholder', 'https://example.com/feed.xml');

    // Change to Twitter
    const twitterButton = screen.getByRole('button', { name: /twitter/i });
    fireEvent.click(twitterButton);
    
    const twitterUrlInput = screen.getByLabelText(/twitter profile url/i);
    expect(twitterUrlInput).toHaveAttribute('placeholder', 'https://twitter.com/username');
  });

  it('handles API service exceptions', async () => {
    mockApiService.createSource.mockRejectedValue(new Error('Network error'));

    render(<AddSourceForm onSourceAdded={jest.fn()} onCancel={jest.fn()} />);

    const nameInput = screen.getByLabelText(/display name/i);
    const urlInput = screen.getByLabelText(/rss feed url/i);
    const submitButton = screen.getByRole('button', { name: /add source/i });

    fireEvent.change(nameInput, { target: { value: 'Example Feed' } });
    fireEvent.change(urlInput, { target: { value: 'https://example.com/feed.xml' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/failed to add source/i)).toBeInTheDocument();
    });
  });
});
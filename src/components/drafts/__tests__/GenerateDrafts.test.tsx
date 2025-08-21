import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import GenerateDrafts from '../GenerateDrafts';
import { apiService } from '../../../lib/apiService';

// Mock the API service
jest.mock('../../../lib/apiService', () => ({
  apiService: {
    generateDrafts: jest.fn(),
  },
}));

const mockApiService = apiService as jest.Mocked<typeof apiService>;

describe('GenerateDrafts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.setTimeout(10000); // Increase timeout for all tests
  });

  it('renders generate drafts button', () => {
    render(<GenerateDrafts />);

    expect(screen.getByText('Generate New Drafts')).toBeInTheDocument();
    expect(screen.getByText('Create LinkedIn post drafts based on your sources and writing style')).toBeInTheDocument();
    expect(screen.getByText('Generate Drafts')).toBeInTheDocument();
  });

  it('generates drafts successfully', async () => {
    mockApiService.generateDrafts.mockResolvedValue({
      success: true,
      data: {
        message: 'Generated 4 new drafts',
        drafts_generated: 4,
      },
    });

    const mockOnDraftsGenerated = jest.fn();
    render(<GenerateDrafts onDraftsGenerated={mockOnDraftsGenerated} />);

    const generateButton = screen.getByText('Generate Drafts');
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(mockApiService.generateDrafts).toHaveBeenCalledWith({ force: false });
    }, { timeout: 10000 });

    await waitFor(() => {
      expect(screen.getByText('Generated 4 new drafts!')).toBeInTheDocument();
      expect(mockOnDraftsGenerated).toHaveBeenCalled();
    }, { timeout: 10000 });
  }, 15000);

  it('shows loading state during generation', async () => {
    mockApiService.generateDrafts.mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({
        success: true,
        data: {
          message: 'Generated 3 new drafts',
          drafts_generated: 3,
        },
      }), 100)) // Reduced timeout
    );

    render(<GenerateDrafts />);

    const generateButton = screen.getByText('Generate Drafts');
    fireEvent.click(generateButton);

    expect(screen.getByText('Generating...')).toBeInTheDocument();
    expect(generateButton).toBeDisabled();
  });

  it('displays error message on generation failure', async () => {
    mockApiService.generateDrafts.mockResolvedValue({
      success: false,
      error: {
        error: 'validation_error',
        message: 'No active sources found. Please add sources first.',
      },
    });

    render(<GenerateDrafts />);

    const generateButton = screen.getByText('Generate Drafts');
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(screen.getByText('No active sources found. Please add sources first.')).toBeInTheDocument();
    });
  });

  it('handles API service exceptions', async () => {
    mockApiService.generateDrafts.mockRejectedValue(new Error('Network error'));

    render(<GenerateDrafts />);

    const generateButton = screen.getByText('Generate Drafts');
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(screen.getByText('An unexpected error occurred')).toBeInTheDocument();
    });
  });

  it('shows force generation option when recent drafts exist', async () => {
    mockApiService.generateDrafts.mockResolvedValue({
      success: false,
      error: {
        error: 'validation_error',
        message: 'You already have recent drafts. Use force=true to generate anyway.',
      },
    });

    render(<GenerateDrafts />);

    const generateButton = screen.getByText('Generate Drafts');
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(screen.getByText(/you already have recent drafts/i)).toBeInTheDocument();
      expect(screen.getByText('Force generate anyway')).toBeInTheDocument();
    });
  });

  it('forces generation when force button is clicked', async () => {
    // First call returns recent drafts error
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
          message: 'Generated 3 new drafts',
          drafts_generated: 3,
        },
      });

    render(<GenerateDrafts />);

    // First generation attempt
    const generateButton = screen.getByText('Generate Drafts');
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(screen.getByText('Force generate anyway')).toBeInTheDocument();
    });

    // Force generation
    const forceButton = screen.getByText('Force generate anyway');
    fireEvent.click(forceButton);

    await waitFor(() => {
      expect(mockApiService.generateDrafts).toHaveBeenCalledWith({ force: true });
    });

    await waitFor(() => {
      expect(screen.getByText('Generated 3 new drafts!')).toBeInTheDocument();
    });
  });

  it('handles no new content scenario', async () => {
    mockApiService.generateDrafts.mockResolvedValue({
      success: true,
      data: {
        message: 'No new content available from your sources',
        drafts_generated: 0,
      },
    });

    render(<GenerateDrafts />);

    const generateButton = screen.getByText('Generate Drafts');
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(screen.getByText('No new content available from your sources')).toBeInTheDocument();
    });
  });
});
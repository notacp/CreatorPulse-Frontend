import { render, screen, fireEvent } from '@testing-library/react';
import DraftCard from '../DraftCard';
import { Draft } from '../../../lib/types';

const mockDraft: Draft = {
  id: 'draft-1',
  user_id: 'user-1',
  content: 'This is a sample LinkedIn post content that demonstrates the draft card functionality.',
  source_content_id: 'content-1',
  status: 'pending',
  feedback_token: 'token-123',
  email_sent_at: null,
  created_at: '2024-01-15T10:00:00Z',
  updated_at: '2024-01-15T10:00:00Z',
  source_name: 'TechCrunch',
  character_count: 95,
  engagement_score: 8.5,
};

describe('DraftCard', () => {
  it('renders draft content correctly', () => {
    render(<DraftCard draft={mockDraft} />);

    expect(screen.getByText(mockDraft.content)).toBeInTheDocument();
    expect(screen.getByText('from TechCrunch')).toBeInTheDocument();
    expect(screen.getByText('95 characters')).toBeInTheDocument();
    expect(screen.getByText('8.5/10')).toBeInTheDocument();
    expect(screen.getByText('Engagement')).toBeInTheDocument();
  });

  it('displays correct status for pending draft', () => {
    render(<DraftCard draft={mockDraft} />);

    expect(screen.getByText('Pending')).toBeInTheDocument();
    expect(screen.getByText('Like')).toBeInTheDocument();
    expect(screen.getByText('Pass')).toBeInTheDocument();
  });

  it('displays correct status for approved draft', () => {
    const approvedDraft = { ...mockDraft, status: 'approved' as const };
    render(<DraftCard draft={approvedDraft} />);

    expect(screen.getByText('Liked')).toBeInTheDocument();
    expect(screen.queryByText('Like')).not.toBeInTheDocument();
    expect(screen.queryByText('Pass')).not.toBeInTheDocument();
  });

  it('displays correct status for rejected draft', () => {
    const rejectedDraft = { ...mockDraft, status: 'rejected' as const };
    render(<DraftCard draft={rejectedDraft} />);

    expect(screen.getByText('Passed')).toBeInTheDocument();
    expect(screen.queryByText('Like')).not.toBeInTheDocument();
    expect(screen.queryByText('Pass')).not.toBeInTheDocument();
  });

  it('calls onFeedback when like button is clicked', () => {
    const mockOnFeedback = jest.fn();
    render(<DraftCard draft={mockDraft} onFeedback={mockOnFeedback} />);

    const likeButton = screen.getByText('Like');
    fireEvent.click(likeButton);

    expect(mockOnFeedback).toHaveBeenCalledWith('draft-1', 'positive');
  });

  it('calls onFeedback when pass button is clicked', () => {
    const mockOnFeedback = jest.fn();
    render(<DraftCard draft={mockDraft} onFeedback={mockOnFeedback} />);

    const passButton = screen.getByText('Pass');
    fireEvent.click(passButton);

    expect(mockOnFeedback).toHaveBeenCalledWith('draft-1', 'negative');
  });

  it('hides actions when showActions is false', () => {
    render(<DraftCard draft={mockDraft} showActions={false} />);

    expect(screen.queryByText('Like')).not.toBeInTheDocument();
    expect(screen.queryByText('Pass')).not.toBeInTheDocument();
  });

  it('shows email sent indicator when email was sent', () => {
    const emailSentDraft = { 
      ...mockDraft, 
      email_sent_at: '2024-01-15T08:00:00Z' 
    };
    render(<DraftCard draft={emailSentDraft} />);

    expect(screen.getByText('Sent via email')).toBeInTheDocument();
  });

  it('handles draft without source name', () => {
    const draftWithoutSource = { 
      ...mockDraft, 
      source_name: undefined 
    };
    render(<DraftCard draft={draftWithoutSource} />);

    expect(screen.queryByText(/from/)).not.toBeInTheDocument();
    expect(screen.getByText(mockDraft.content)).toBeInTheDocument();
  });

  it('handles draft without engagement score', () => {
    const draftWithoutScore = { 
      ...mockDraft, 
      engagement_score: undefined 
    };
    render(<DraftCard draft={draftWithoutScore} />);

    expect(screen.queryByText(/\/10/)).not.toBeInTheDocument();
    expect(screen.queryByText('Engagement')).not.toBeInTheDocument();
  });

  it('handles draft without character count', () => {
    const draftWithoutCount = { 
      ...mockDraft, 
      character_count: undefined 
    };
    render(<DraftCard draft={draftWithoutCount} />);

    expect(screen.queryByText(/characters/)).not.toBeInTheDocument();
  });

  it('formats relative time correctly', () => {
    const recentDraft = { 
      ...mockDraft, 
      created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
    };
    render(<DraftCard draft={recentDraft} />);

    expect(screen.getByText(/2 hours ago/)).toBeInTheDocument();
  });

  it('preserves line breaks in content', () => {
    const multilineDraft = { 
      ...mockDraft, 
      content: 'Line 1\n\nLine 2\nLine 3' 
    };
    render(<DraftCard draft={multilineDraft} />);

    // Find the content element that contains the multiline text
    const contentElement = screen.getByText(/Line 1.*Line 2.*Line 3/s);
    expect(contentElement).toHaveClass('whitespace-pre-wrap');
    
    // Check that the element contains all the expected text parts
    expect(contentElement).toHaveTextContent('Line 1');
    expect(contentElement).toHaveTextContent('Line 2');
    expect(contentElement).toHaveTextContent('Line 3');
  });
});
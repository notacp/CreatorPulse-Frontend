import { render, screen } from '@testing-library/react';
import FeedbackStatusIndicator from '../FeedbackStatusIndicator';

describe('FeedbackStatusIndicator', () => {
  it('renders approved status correctly', () => {
    render(<FeedbackStatusIndicator status="approved" />);
    
    expect(screen.getByText('Liked')).toBeInTheDocument();
    expect(document.querySelector('svg')).toBeInTheDocument(); // SVG icon
  });

  it('renders rejected status correctly', () => {
    render(<FeedbackStatusIndicator status="rejected" />);
    
    expect(screen.getByText('Passed')).toBeInTheDocument();
    expect(document.querySelector('svg')).toBeInTheDocument(); // SVG icon
  });

  it('renders pending status correctly', () => {
    render(<FeedbackStatusIndicator status="pending" />);
    
    expect(screen.getByText('Pending')).toBeInTheDocument();
    expect(document.querySelector('svg')).toBeInTheDocument(); // SVG icon
  });

  it('renders without text when showText is false', () => {
    render(<FeedbackStatusIndicator status="approved" showText={false} />);
    
    expect(screen.queryByText('Liked')).not.toBeInTheDocument();
    expect(document.querySelector('svg')).toBeInTheDocument(); // SVG icon should still be there
  });

  it('applies correct CSS classes for different sizes', () => {
    const { rerender } = render(<FeedbackStatusIndicator status="approved" size="sm" />);
    let element = screen.getByText('Liked').closest('span');
    expect(element).toHaveClass('px-2', 'py-0.5', 'text-xs');

    rerender(<FeedbackStatusIndicator status="approved" size="md" />);
    element = screen.getByText('Liked').closest('span');
    expect(element).toHaveClass('px-2.5', 'py-0.5', 'text-xs');

    rerender(<FeedbackStatusIndicator status="approved" size="lg" />);
    element = screen.getByText('Liked').closest('span');
    expect(element).toHaveClass('px-3', 'py-1', 'text-sm');
  });

  it('applies correct color classes for approved status', () => {
    render(<FeedbackStatusIndicator status="approved" />);
    
    const element = screen.getByText('Liked').closest('span');
    expect(element).toHaveClass('bg-green-100', 'text-green-800');
  });

  it('applies correct color classes for rejected status', () => {
    render(<FeedbackStatusIndicator status="rejected" />);
    
    const element = screen.getByText('Passed').closest('span');
    expect(element).toHaveClass('bg-red-100', 'text-red-800');
  });

  it('applies correct color classes for pending status', () => {
    render(<FeedbackStatusIndicator status="pending" />);
    
    const element = screen.getByText('Pending').closest('span');
    expect(element).toHaveClass('bg-yellow-100', 'text-yellow-800');
  });

  it('shows tooltip when text is hidden', () => {
    render(<FeedbackStatusIndicator status="approved" showText={false} />);
    
    const element = document.querySelector('div[title="Liked"]');
    expect(element).toHaveAttribute('title', 'Liked');
  });

  it('uses medium size by default', () => {
    render(<FeedbackStatusIndicator status="approved" />);
    
    const element = screen.getByText('Liked').closest('span');
    expect(element).toHaveClass('px-2.5', 'py-0.5', 'text-xs');
  });

  it('shows text by default', () => {
    render(<FeedbackStatusIndicator status="approved" />);
    
    expect(screen.getByText('Liked')).toBeInTheDocument();
  });
});
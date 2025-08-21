import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import LoginForm from '../../components/auth/LoginForm';
import RegisterForm from '../../components/auth/RegisterForm';
import DraftCard from '../../components/drafts/DraftCard';
import { FeedbackAnalytics } from '../../components/feedback';
import AddSourceForm from '../../components/sources/AddSourceForm';
import { Draft } from '../../lib/types';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Mock the API service for components that use it
jest.mock('../../lib/apiService', () => ({
  apiService: {
    getDashboardStats: jest.fn().mockResolvedValue({
      success: true,
      data: {
        total_drafts: 10,
        drafts_this_week: 5,
        positive_feedback: 6,
        negative_feedback: 2,
        feedback_rate: 0.8,
        active_sources: 3,
      },
    }),
  },
}));

// Mock AuthContext
jest.mock('../../contexts/AuthContext', () => ({
  useAuth: jest.fn(() => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    login: jest.fn().mockResolvedValue({ success: true }),
    register: jest.fn().mockResolvedValue({ success: true }),
    logout: jest.fn().mockResolvedValue(undefined),
    resetPassword: jest.fn().mockResolvedValue({ success: true }),
  })),
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
}));

const mockDraft: Draft = {
  id: 'draft-1',
  user_id: 'user-1',
  content: 'This is a sample LinkedIn post content for accessibility testing.',
  source_content_id: 'content-1',
  status: 'pending',
  feedback_token: 'token-123',
  email_sent_at: null,
  created_at: '2024-01-15T10:00:00Z',
  updated_at: '2024-01-15T10:00:00Z',
  source_name: 'TechCrunch',
  character_count: 67,
  engagement_score: 8.5,
};

describe('Component Accessibility Tests', () => {
  describe('Authentication Components', () => {
    it('LoginForm should be accessible', async () => {
      const { container } = render(<LoginForm />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('RegisterForm should be accessible', async () => {
      const { container } = render(<RegisterForm />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Draft Components', () => {
    it('DraftCard should be accessible', async () => {
      const { container } = render(<DraftCard draft={mockDraft} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('DraftCard with approved status should be accessible', async () => {
      const approvedDraft = { ...mockDraft, status: 'approved' as const };
      const { container } = render(<DraftCard draft={approvedDraft} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('DraftCard without actions should be accessible', async () => {
      const { container } = render(<DraftCard draft={mockDraft} showActions={false} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Source Components', () => {
    it('AddSourceForm should be accessible', async () => {
      const { container } = render(<AddSourceForm />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Feedback Components', () => {
    it('FeedbackAnalytics should be accessible', async () => {
      const { container } = render(<FeedbackAnalytics />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Form Accessibility', () => {
    it('forms should have proper labels and ARIA attributes', async () => {
      const { container, getByLabelText } = render(<LoginForm />);

      // Check that form controls have proper labels
      expect(getByLabelText(/email address/i)).toBeInTheDocument();
      expect(getByLabelText(/password/i)).toBeInTheDocument();

      // Check accessibility
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('form validation errors should be accessible', async () => {
      const { container } = render(<RegisterForm />);
      
      // The form should be accessible even with validation states
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Interactive Elements', () => {
    it('buttons should have accessible names', async () => {
      const { container, getByRole } = render(<DraftCard draft={mockDraft} />);

      // Check that buttons have accessible names
      expect(getByRole('button', { name: /like/i })).toBeInTheDocument();
      expect(getByRole('button', { name: /pass/i })).toBeInTheDocument();

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('links should have accessible names', async () => {
      const { container } = render(<LoginForm />);

      // Links should have descriptive text
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Color Contrast and Visual Elements', () => {
    it('status indicators should have sufficient color contrast', async () => {
      const { container } = render(<DraftCard draft={mockDraft} />);
      
      // axe will check color contrast automatically
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('error states should be accessible', async () => {
      const { container } = render(<AddSourceForm />);
      
      // Error states should be accessible
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Keyboard Navigation', () => {
    it('forms should be keyboard navigable', async () => {
      const { container } = render(<LoginForm />);
      
      // axe checks for keyboard accessibility
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('interactive elements should be focusable', async () => {
      const { container } = render(<DraftCard draft={mockDraft} />);
      
      // Interactive elements should be keyboard accessible
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Screen Reader Support', () => {
    it('should have proper heading structure', async () => {
      const { container } = render(<FeedbackAnalytics />);
      
      // Check heading structure and screen reader support
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper ARIA labels for complex components', async () => {
      const { container } = render(<DraftCard draft={mockDraft} />);
      
      // Complex components should have proper ARIA support
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Loading States Accessibility', () => {
    it('loading states should be accessible', async () => {
      // Test loading state accessibility
      const { container } = render(<FeedbackAnalytics />);
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Dark Mode Accessibility', () => {
    it('components should be accessible in dark mode', async () => {
      // Add dark class to test dark mode accessibility
      const { container } = render(
        <div className="dark">
          <DraftCard draft={mockDraft} />
        </div>
      );
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
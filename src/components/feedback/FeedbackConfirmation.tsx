'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiService } from '@/lib/apiService';

interface FeedbackConfirmationProps {
  token: string;
  feedbackType: 'positive' | 'negative';
}

export default function FeedbackConfirmation({ token, feedbackType }: FeedbackConfirmationProps) {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    const submitFeedback = async () => {
      try {
        const response = await apiService.submitFeedbackByToken(token, feedbackType);
        
        if (response.success) {
          setStatus('success');
          setMessage(response.data?.message || 'Feedback submitted successfully');
        } else {
          setStatus('error');
          setError(response.error?.message || 'Failed to submit feedback');
        }
      } catch (err) {
        setStatus('error');
        setError('An unexpected error occurred');
        console.error('Error submitting feedback:', err);
      }
    };

    if (token) {
      submitFeedback();
    } else {
      setStatus('error');
      setError('Invalid feedback token');
    }
  }, [token, feedbackType]);

  const getFeedbackIcon = () => {
    if (feedbackType === 'positive') {
      return (
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
          <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
          </svg>
        </div>
      );
    } else {
      return (
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
          <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018c.163 0 .326.02.485.06L17 4m-7 10v2a2 2 0 002 2h.095c.5 0 .905-.405.905-.905 0-.714.211-1.412.608-2.006L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
          </svg>
        </div>
      );
    }
  };

  const getSuccessIcon = () => (
    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
      <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
      </svg>
    </div>
  );

  const getErrorIcon = () => (
    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
      <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </div>
  );

  const getLoadingIcon = () => (
    <div className="mx-auto flex items-center justify-center h-12 w-12">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="text-center">
              {getLoadingIcon()}
              <h2 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                Processing your feedback...
              </h2>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Please wait while we record your response.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="text-center">
              {getErrorIcon()}
              <h2 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                Feedback Error
              </h2>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                {error}
              </p>
              <div className="mt-6 space-y-3">
                <button
                  onClick={() => window.location.reload()}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Try Again
                </button>
                <button
                  onClick={() => router.push('/dashboard')}
                  className="w-full flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Go to Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            {getSuccessIcon()}
            <h2 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
              Thank you for your feedback!
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {feedbackType === 'positive' 
                ? "We're glad you liked this draft. Your positive feedback helps us understand what content resonates with you."
                : "Thanks for letting us know this draft wasn't quite right. Your feedback helps us improve future suggestions."
              }
            </p>
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
              <div className="flex items-center">
                {getFeedbackIcon()}
                <div className="ml-3 text-left">
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    Feedback recorded
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    {feedbackType === 'positive' ? 'Marked as liked' : 'Marked as passed'}
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-6 space-y-3">
              <button
                onClick={() => router.push('/dashboard')}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                View Dashboard
              </button>
              <button
                onClick={() => router.push('/drafts')}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                View All Drafts
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
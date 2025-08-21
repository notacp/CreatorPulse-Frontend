'use client';

import { use } from 'react';
import FeedbackConfirmation from '@/components/feedback/FeedbackConfirmation';

interface FeedbackPageProps {
  params: Promise<{
    token: string;
    type: string;
  }>;
}

export default function FeedbackPage({ params }: FeedbackPageProps) {
  const { token, type } = use(params);

  // Validate feedback type
  if (type !== 'positive' && type !== 'negative') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                Invalid Feedback Type
              </h2>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                The feedback type provided is not valid. Please use the links from your email.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <FeedbackConfirmation 
      token={token} 
      feedbackType={type as 'positive' | 'negative'} 
    />
  );
}
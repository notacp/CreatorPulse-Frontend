'use client';

import React from 'react';

import { OnboardingStep } from './OnboardingWizard';

interface OnboardingData {
  timezone?: string;
  sources: Array<{ type: 'rss' | 'twitter'; url: string; name: string }>;
  stylePosts: string[];
  skippedSteps: OnboardingStep[];
}

interface CompletionStepProps {
  onboardingData: OnboardingData;
  onComplete: () => void;
  onBack: () => void;
}

export default function CompletionStep({ onboardingData, onComplete, onBack }: CompletionStepProps) {
  const sourcesCount = onboardingData.sources.length;
  const stylePostsCount = onboardingData.stylePosts.length;

  const getNextSteps = () => {
    const steps = [];
    
    if (sourcesCount === 0) {
      steps.push({
        title: 'Add Content Sources',
        description: 'Connect RSS feeds or Twitter handles to start receiving relevant content.',
        action: 'Add sources from your dashboard'
      });
    }
    
    if (stylePostsCount < 10) {
      steps.push({
        title: 'Complete Style Training',
        description: 'Upload more sample posts to improve AI-generated draft quality.',
        action: 'Add more posts in settings'
      });
    }
    
    if (steps.length === 0) {
      steps.push({
        title: 'Check Your Email Tomorrow',
        description: 'Your first batch of personalized drafts will arrive in the morning.',
        action: 'Look for your daily CreatorPulse email'
      });
    }
    
    return steps;
  };

  const nextSteps = getNextSteps();

  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8">
      <div className="text-center mb-8">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/20 mb-6">
          <svg className="h-8 w-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          🎉 You&apos;re All Set!
        </h1>
        
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Welcome to CreatorPulse! Your account is ready and configured.
        </p>
      </div>

      <div className="space-y-6">
        {/* Setup Summary */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Setup Summary
          </h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Timezone</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {onboardingData.timezone || 'UTC'}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Content Sources</span>
              <span className={`font-medium ${
                sourcesCount > 0 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-orange-600 dark:text-orange-400'
              }`}>
                {sourcesCount > 0 ? `${sourcesCount} connected` : 'None added'}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Style Training</span>
              <span className={`font-medium ${
                stylePostsCount >= 10 
                  ? 'text-green-600 dark:text-green-400' 
                  : stylePostsCount > 0
                  ? 'text-orange-600 dark:text-orange-400'
                  : 'text-gray-600 dark:text-gray-400'
              }`}>
                {stylePostsCount >= 10 
                  ? `${stylePostsCount} posts (Complete)` 
                  : stylePostsCount > 0
                  ? `${stylePostsCount} posts (Partial)`
                  : 'Not started'
                }
              </span>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            What&apos;s Next?
          </h3>
          
          <div className="space-y-4">
            {nextSteps.map((step, index) => (
              <div key={index} className="flex items-start p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium mr-4">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                    {step.title}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {step.description}
                  </p>
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                    → {step.action}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Key Features Reminder */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Remember: CreatorPulse Features
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start">
              <svg className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">Daily Email Drafts</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">3-5 personalized LinkedIn posts every morning</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <svg className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">AI-Powered Content</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Generated from your sources in your style</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <svg className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              </svg>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">Easy Feedback</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Thumbs up/down directly from your email</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <svg className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">Dashboard Control</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Manage sources, view history, adjust settings</p>
              </div>
            </div>
          </div>
        </div>

        {/* Support Information */}
        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          <p>
            Need help? Visit your dashboard settings or contact support at{' '}
            <a href="mailto:support@creatorpulse.com" className="text-blue-600 dark:text-blue-400 hover:underline">
              support@creatorpulse.com
            </a>
          </p>
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-6">
          <button
            onClick={onBack}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium"
          >
            <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          
          <button
            onClick={onComplete}
            className="px-8 py-3 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
          >
            Go to Dashboard
            <svg className="ml-2 -mr-1 w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
'use client';

import React, { useState } from 'react';
import { User } from '@/lib/types';

import { OnboardingStep } from './OnboardingWizard';

interface OnboardingData {
  timezone?: string;
  sources: Array<{ type: 'rss' | 'twitter'; url: string; name: string }>;
  stylePosts: string[];
  skippedSteps: OnboardingStep[];
}

interface WelcomeStepProps {
  user: User | null;
  onboardingData: OnboardingData;
  updateOnboardingData: (updates: Partial<OnboardingData>) => void;
  onNext: () => void;
}

const timezones = [
  { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'Europe/London', label: 'London (GMT/BST)' },
  { value: 'Europe/Paris', label: 'Paris (CET/CEST)' },
  { value: 'Europe/Berlin', label: 'Berlin (CET/CEST)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
  { value: 'Asia/Shanghai', label: 'Shanghai (CST)' },
  { value: 'Asia/Kolkata', label: 'India (IST)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEST/AEDT)' },
];

export default function WelcomeStep({ user, onboardingData, updateOnboardingData, onNext }: WelcomeStepProps) {
  const [selectedTimezone, setSelectedTimezone] = useState(
    onboardingData.timezone || user?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
  );

  const handleNext = () => {
    updateOnboardingData({ timezone: selectedTimezone });
    onNext();
  };

  const userName = user?.email ? user.email.split('@')[0] : 'there';

  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8">
      <div className="text-center mb-8">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900/20 mb-6">
          <svg className="h-8 w-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Welcome to CreatorPulse, {userName}! 🚀
        </h1>
        
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
          Let&apos;s get you set up to receive personalized LinkedIn post drafts every day.
        </p>
      </div>

      <div className="space-y-6">
        {/* Product Introduction */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            How CreatorPulse Works
          </h3>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium mr-3">
                1
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">Connect Your Sources</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Add RSS feeds and Twitter handles from your industry to monitor relevant content.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium mr-3">
                2
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">Train Your Writing Style</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Upload sample posts so our AI can learn your unique voice and tone.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium mr-3">
                3
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">Receive Daily Drafts</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Get 3-5 personalized LinkedIn post drafts delivered to your inbox every morning.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Timezone Selection */}
        <div>
          <label htmlFor="timezone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Select Your Timezone
          </label>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
            We&apos;ll use this to send your drafts at the perfect time each morning.
          </p>
          <select
            id="timezone"
            value={selectedTimezone}
            onChange={(e) => setSelectedTimezone(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          >
            {timezones.map((tz) => (
              <option key={tz.value} value={tz.value}>
                {tz.label}
              </option>
            ))}
          </select>
        </div>

        {/* Time Estimate */}
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium text-green-800 dark:text-green-200">
              Setup takes just 3-5 minutes
            </span>
          </div>
        </div>

        {/* Next Button */}
        <div className="flex justify-end pt-4">
          <button
            onClick={handleNext}
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Get Started
            <svg className="ml-2 -mr-1 w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
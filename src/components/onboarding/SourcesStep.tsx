'use client';

import React, { useState } from 'react';

interface Source {
  type: 'rss' | 'twitter';
  url: string;
  name: string;
}

import { OnboardingStep } from './OnboardingWizard';

interface OnboardingData {
  timezone?: string;
  sources: Source[];
  stylePosts: string[];
  skippedSteps: OnboardingStep[];
}

interface SourcesStepProps {
  onboardingData: OnboardingData;
  updateOnboardingData: (updates: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}

export default function SourcesStep({ onboardingData, updateOnboardingData, onNext, onBack, onSkip }: SourcesStepProps) {
  const [sourceType, setSourceType] = useState<'rss' | 'twitter'>('rss');
  const [url, setUrl] = useState('');
  const [name, setName] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isAdding, setIsAdding] = useState(false);

  const validateSource = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!url.trim()) {
      newErrors.url = 'URL is required';
    } else if (sourceType === 'rss') {
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        newErrors.url = 'RSS feed URL must start with http:// or https://';
      }
    } else if (sourceType === 'twitter') {
      const twitterPattern = /^@?[A-Za-z0-9_]+$/;
      if (!twitterPattern.test(url.replace('@', ''))) {
        newErrors.url = 'Please enter a valid Twitter handle (e.g., @username or username)';
      }
    }

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const addSource = async () => {
    if (!validateSource()) return;

    setIsAdding(true);
    
    // Simulate API validation delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const newSource: Source = {
      type: sourceType,
      url: sourceType === 'twitter' ? url.replace('@', '') : url,
      name: name.trim()
    };

    const updatedSources = [...onboardingData.sources, newSource];
    updateOnboardingData({ sources: updatedSources });

    // Reset form
    setUrl('');
    setName('');
    setErrors({});
    setIsAdding(false);
  };

  const removeSource = (index: number) => {
    const updatedSources = onboardingData.sources.filter((_, i) => i !== index);
    updateOnboardingData({ sources: updatedSources });
  };

  const handleNext = () => {
    onNext();
  };

  const suggestedSources = {
    rss: [
      { name: 'TechCrunch', url: 'https://techcrunch.com/feed/' },
      { name: 'Harvard Business Review', url: 'https://hbr.org/feed' },
      { name: 'Fast Company', url: 'https://www.fastcompany.com/rss' },
      { name: 'Wired', url: 'https://www.wired.com/feed/rss' }
    ],
    twitter: [
      { name: 'Gary Vaynerchuk', url: 'garyvee' },
      { name: 'Seth Godin', url: 'sethgodin' },
      { name: 'Reid Hoffman', url: 'reidhoffman' },
      { name: 'Arianna Huffington', url: 'ariannahuff' }
    ]
  };

  const addSuggestedSource = (suggested: { name: string; url: string }) => {
    setUrl(suggested.url);
    setName(suggested.name);
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Connect Your Content Sources
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Add RSS feeds and Twitter handles from your industry. We&apos;ll monitor these sources to generate relevant post ideas for you.
        </p>
      </div>

      <div className="space-y-6">
        {/* Source Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Source Type
          </label>
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => setSourceType('rss')}
              className={`flex-1 p-4 border-2 rounded-lg text-left transition-colors ${
                sourceType === 'rss'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
              }`}
            >
              <div className="flex items-center">
                <svg className="h-6 w-6 text-orange-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3.429 2.571c0-.952.771-1.714 1.714-1.714.952 0 1.714.762 1.714 1.714 0 .943-.762 1.714-1.714 1.714-.943 0-1.714-.771-1.714-1.714zM3.429 7.429c0-.952.771-1.714 1.714-1.714.952 0 1.714.762 1.714 1.714 0 .952-.762 1.714-1.714 1.714-.943 0-1.714-.762-1.714-1.714zM8.571 2.571c0-.952.762-1.714 1.714-1.714.943 0 1.714.762 1.714 1.714 0 .943-.771 1.714-1.714 1.714-.952 0-1.714-.771-1.714-1.714z"/>
                </svg>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">RSS Feeds</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Blogs, news sites, publications</div>
                </div>
              </div>
            </button>
            
            <button
              type="button"
              onClick={() => setSourceType('twitter')}
              className={`flex-1 p-4 border-2 rounded-lg text-left transition-colors ${
                sourceType === 'twitter'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
              }`}
            >
              <div className="flex items-center">
                <svg className="h-6 w-6 text-blue-400 mr-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">Twitter Handles</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Industry leaders, influencers</div>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Add Source Form */}
        <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Add {sourceType === 'rss' ? 'RSS Feed' : 'Twitter Handle'}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {sourceType === 'rss' ? 'RSS Feed URL' : 'Twitter Handle'}
              </label>
              <input
                type="text"
                id="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder={sourceType === 'rss' ? 'https://example.com/feed' : '@username or username'}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white ${
                  errors.url ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                }`}
              />
              {errors.url && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.url}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Display Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., TechCrunch, Gary Vee"
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white ${
                  errors.name ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                }`}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
              )}
            </div>
          </div>
          
          <button
            onClick={addSource}
            disabled={isAdding}
            className="w-full md:w-auto px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isAdding ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Adding...
              </div>
            ) : (
              `Add ${sourceType === 'rss' ? 'RSS Feed' : 'Twitter Handle'}`
            )}
          </button>
        </div>

        {/* Suggested Sources */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Popular {sourceType === 'rss' ? 'RSS Feeds' : 'Twitter Handles'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {suggestedSources[sourceType].map((suggested, index) => (
              <button
                key={index}
                onClick={() => addSuggestedSource(suggested)}
                className="p-3 text-left border border-gray-200 dark:border-gray-600 rounded-lg hover:border-blue-300 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
              >
                <div className="font-medium text-gray-900 dark:text-white">{suggested.name}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {sourceType === 'rss' ? suggested.url : `@${suggested.url}`}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Added Sources */}
        {Array.isArray(onboardingData.sources) && onboardingData.sources.length > 0 && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Your Sources ({Array.isArray(onboardingData.sources) ? onboardingData.sources.length : 0})
            </h3>
            <div className="space-y-3">
              {Array.isArray(onboardingData.sources) && onboardingData.sources.map((source, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center">
                    {source.type === 'rss' ? (
                      <svg className="h-5 w-5 text-orange-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M3.429 2.571c0-.952.771-1.714 1.714-1.714.952 0 1.714.762 1.714 1.714 0 .943-.762 1.714-1.714 1.714-.943 0-1.714-.771-1.714-1.714z"/>
                      </svg>
                    ) : (
                      <svg className="h-5 w-5 text-blue-400 mr-3" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                      </svg>
                    )}
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">{source.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {source.type === 'rss' ? source.url : `@${source.url}`}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => removeSource(index)}
                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

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
          
          <div className="space-x-3">
            <button
              onClick={onSkip}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium"
            >
              Skip for now
            </button>
            <button
              onClick={handleNext}
              className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Continue
              <svg className="ml-2 -mr-1 w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
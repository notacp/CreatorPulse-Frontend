'use client';

import React, { useState } from 'react';

import { OnboardingStep } from './OnboardingWizard';

interface OnboardingData {
  timezone?: string;
  sources: Array<{ type: 'rss' | 'twitter'; url: string; name: string }>;
  stylePosts: string[];
  skippedSteps: OnboardingStep[];
}

interface StyleTrainingStepProps {
  onboardingData: OnboardingData;
  updateOnboardingData: (updates: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}

export default function StyleTrainingStep({ onboardingData, updateOnboardingData, onNext, onBack, onSkip }: StyleTrainingStepProps) {
  const [currentPost, setCurrentPost] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const addPost = () => {
    if (currentPost.trim() && currentPost.length >= 50) {
      const updatedPosts = [...onboardingData.stylePosts, currentPost.trim()];
      updateOnboardingData({ stylePosts: updatedPosts });
      setCurrentPost('');
    }
  };

  const removePost = (index: number) => {
    const updatedPosts = onboardingData.stylePosts.filter((_, i) => i !== index);
    updateOnboardingData({ stylePosts: updatedPosts });
  };

  const handleNext = async () => {
    if (onboardingData.stylePosts.length >= 10) {
      setIsProcessing(true);
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2000));
      setIsProcessing(false);
    }
    onNext();
  };

  const samplePosts = [
    "Just wrapped up an incredible quarter with my team! 🚀 The key to our success? Consistent communication and celebrating small wins along the way. What strategies have helped your team stay motivated during challenging projects?",
    
    "Hot take: The best leaders aren't the ones with all the answers—they're the ones who ask the right questions. 🤔 I've learned more from my team by staying curious than by trying to be the smartest person in the room. What's the best question a leader has asked you?",
    
    "Failure isn't the opposite of success—it's a stepping stone to it. 💪 Last year's 'failed' product launch taught us more about our customers than any survey ever could. Now we're building something they actually want. What's your biggest learning from a setback?",
    
    "The future of work isn't about working harder—it's about working smarter. ⚡ Automation handles the routine, humans handle the creative. The companies that figure this balance out first will dominate the next decade. How is your industry adapting?",
    
    "Networking isn't about collecting business cards—it's about planting seeds. 🌱 The best opportunities come from relationships you've nurtured over time, not from people you just met. Focus on giving value first, and the rest follows naturally."
  ];

  const addSamplePost = (post: string) => {
    if (!onboardingData.stylePosts.includes(post)) {
      const updatedPosts = [...onboardingData.stylePosts, post];
      updateOnboardingData({ stylePosts: updatedPosts });
    }
  };

  const characterCount = currentPost.length;
  const isValidPost = characterCount >= 50 && characterCount <= 3000;
  const canProceed = onboardingData.stylePosts.length >= 10;

  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Train Your Writing Style
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Upload 10-20 sample LinkedIn posts that represent your voice and tone. Our AI will learn your style to generate drafts that sound like you.
        </p>
        
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <div className="flex items-start">
            <svg className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Tip:</strong> Include posts with different tones (professional, casual, inspirational) and topics relevant to your industry for the best results.
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Add Post Form */}
        <div>
          <label htmlFor="post-content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Add a Sample Post
          </label>
          <div className="relative">
            <textarea
              id="post-content"
              value={currentPost}
              onChange={(e) => setCurrentPost(e.target.value)}
              placeholder="Paste one of your LinkedIn posts here... (minimum 50 characters)"
              rows={6}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white resize-none ${
                characterCount > 0 && !isValidPost 
                  ? 'border-red-300 dark:border-red-600' 
                  : 'border-gray-300 dark:border-gray-600'
              }`}
            />
            <div className="absolute bottom-2 right-2 text-xs text-gray-500 dark:text-gray-400">
              {characterCount}/3000
              {characterCount > 0 && characterCount < 50 && (
                <span className="text-red-500 ml-2">Minimum 50 characters</span>
              )}
            </div>
          </div>
          
          <button
            onClick={addPost}
            disabled={!isValidPost}
            className="mt-3 px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Add Post
          </button>
        </div>

        {/* Sample Posts */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Need inspiration? Try these sample posts:
          </h3>
          <div className="space-y-3">
            {samplePosts.map((post, index) => (
              <div key={index} className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 line-clamp-3">
                  {post}
                </p>
                <button
                  onClick={() => addSamplePost(post)}
                  disabled={onboardingData.stylePosts.includes(post)}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {onboardingData.stylePosts.includes(post) ? 'Added ✓' : 'Add this post'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Added Posts */}
        {onboardingData.stylePosts.length > 0 && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Your Sample Posts ({onboardingData.stylePosts.length}/20)
            </h3>
            
            {/* Progress indicator */}
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                <span>Progress</span>
                <span>{Math.min(onboardingData.stylePosts.length, 20)}/20 posts</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    canProceed ? 'bg-green-600' : 'bg-blue-600'
                  }`}
                  style={{ width: `${Math.min((onboardingData.stylePosts.length / 20) * 100, 100)}%` }}
                />
              </div>
              {canProceed && (
                <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                  ✓ Great! You have enough posts to train your style.
                </p>
              )}
              {onboardingData.stylePosts.length < 10 && (
                <p className="text-sm text-orange-600 dark:text-orange-400 mt-2">
                  Add {10 - onboardingData.stylePosts.length} more posts to continue (minimum 10 required).
                </p>
              )}
            </div>

            <div className="space-y-3 max-h-64 overflow-y-auto">
              {Array.isArray(onboardingData.stylePosts) && onboardingData.stylePosts.map((post, index) => (
                <div key={index} className="flex justify-between items-start p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex-1 mr-4">
                    <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                      {post}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {post.length} characters
                    </p>
                  </div>
                  <button
                    onClick={() => removePost(index)}
                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 flex-shrink-0"
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

        {/* Processing State */}
        {isProcessing && (
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Processing Your Writing Style...
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Our AI is analyzing your posts to learn your unique voice and tone. This may take a moment.
            </p>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between pt-6">
          <button
            onClick={onBack}
            disabled={isProcessing}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium disabled:opacity-50"
          >
            <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          
          <div className="space-x-3">
            <button
              onClick={onSkip}
              disabled={isProcessing}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium disabled:opacity-50"
            >
              Skip for now
            </button>
            <button
              onClick={handleNext}
              disabled={!canProceed || isProcessing}
              className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isProcessing ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </div>
              ) : (
                <>
                  Continue
                  <svg className="ml-2 -mr-1 w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
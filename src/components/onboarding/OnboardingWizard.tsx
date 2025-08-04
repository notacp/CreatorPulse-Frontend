'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import WelcomeStep from './WelcomeStep';
import SourcesStep from './SourcesStep';
import StyleTrainingStep from './StyleTrainingStep';
import CompletionStep from './CompletionStep';

export type OnboardingStep = 'welcome' | 'sources' | 'style' | 'completion';

interface OnboardingData {
  timezone?: string;
  sources: Array<{ type: 'rss' | 'twitter'; url: string; name: string }>;
  stylePosts: string[];
  skippedSteps: OnboardingStep[];
}

export default function OnboardingWizard() {
  const router = useRouter();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    sources: [],
    stylePosts: [],
    skippedSteps: []
  });

  const steps: OnboardingStep[] = ['welcome', 'sources', 'style', 'completion'];
  const currentStepIndex = steps.indexOf(currentStep);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  const updateOnboardingData = (updates: Partial<OnboardingData>) => {
    setOnboardingData(prev => ({ ...prev, ...updates }));
  };

  const goToNextStep = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex]);
    }
  };

  const goToPreviousStep = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex]);
    }
  };

  const skipStep = () => {
    const skippedSteps = [...onboardingData.skippedSteps, currentStep];
    updateOnboardingData({ skippedSteps });
    goToNextStep();
  };

  const completeOnboarding = () => {
    // In a real app, this would save the onboarding data to the backend
    console.log('Onboarding completed with data:', onboardingData);
    router.push('/dashboard');
  };

  const getStepTitle = (step: OnboardingStep): string => {
    switch (step) {
      case 'welcome': return 'Welcome';
      case 'sources': return 'Connect Sources';
      case 'style': return 'Train Your Style';
      case 'completion': return 'All Set!';
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'welcome':
        return (
          <WelcomeStep
            user={user}
            onboardingData={onboardingData}
            updateOnboardingData={updateOnboardingData}
            onNext={goToNextStep}
          />
        );
      case 'sources':
        return (
          <SourcesStep
            onboardingData={onboardingData}
            updateOnboardingData={updateOnboardingData}
            onNext={goToNextStep}
            onBack={goToPreviousStep}
            onSkip={skipStep}
          />
        );
      case 'style':
        return (
          <StyleTrainingStep
            onboardingData={onboardingData}
            updateOnboardingData={updateOnboardingData}
            onNext={goToNextStep}
            onBack={goToPreviousStep}
            onSkip={skipStep}
          />
        );
      case 'completion':
        return (
          <CompletionStep
            onboardingData={onboardingData}
            onComplete={completeOnboarding}
            onBack={goToPreviousStep}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Progress Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <div
                key={step}
                className={`flex items-center ${
                  index < steps.length - 1 ? 'flex-1' : ''
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    index <= currentStepIndex
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {index < currentStepIndex ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </div>
                <span className={`ml-2 text-sm font-medium ${
                  index <= currentStepIndex
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {getStepTitle(step)}
                </span>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-4 ${
                    index < currentStepIndex
                      ? 'bg-blue-600'
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`} />
                )}
              </div>
            ))}
          </div>
          
          {/* Progress percentage */}
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-in-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-center mt-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Step {currentStepIndex + 1} of {steps.length}
            </span>
          </div>
        </div>

        {/* Current Step Content */}
        <div className="max-w-2xl mx-auto">
          {renderCurrentStep()}
        </div>
      </div>
    </div>
  );
}
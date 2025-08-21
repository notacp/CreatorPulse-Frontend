'use client';

import { useState, useEffect } from 'react';
import { apiService } from '@/lib/apiService';
import { DashboardStats } from '@/lib/types';

interface FeedbackAnalyticsProps {
  className?: string;
}

export default function FeedbackAnalytics({ className = '' }: FeedbackAnalyticsProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await apiService.getDashboardStats();
        
        if (response.success && response.data) {
          setStats(response.data);
        } else {
          setError(response.error?.message || 'Failed to fetch feedback analytics');
        }
      } catch (err) {
        setError('An unexpected error occurred');
        console.error('Error fetching feedback analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
            </div>
            <div className="space-y-2">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
            </div>
          </div>
          <div className="mt-4 h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
          <div className="mt-2 h-2 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow p-6 ${className}`}>
        <div className="text-center">
          <svg className="mx-auto h-8 w-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
            Error loading analytics
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {error}
          </p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const totalFeedback = stats.positive_feedback + stats.negative_feedback;
  const positivePercentage = totalFeedback > 0 ? (stats.positive_feedback / totalFeedback) * 100 : 0;
  const negativePercentage = totalFeedback > 0 ? (stats.negative_feedback / totalFeedback) * 100 : 0;

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow p-6 ${className}`}>
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
        Feedback Analytics
      </h3>
      
      {totalFeedback === 0 ? (
        <div className="text-center py-8">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <h4 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
            No feedback yet
          </h4>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Start providing feedback on your drafts to see analytics here.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Feedback Overview */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {stats.positive_feedback}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Liked
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {stats.negative_feedback}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Passed
              </div>
            </div>
          </div>

          {/* Feedback Rate */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Feedback Rate
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {Math.round(stats.feedback_rate * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.round(stats.feedback_rate * 100)}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {totalFeedback} of {stats.total_drafts} drafts have feedback
            </p>
          </div>

          {/* Feedback Distribution */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Feedback Distribution
              </span>
            </div>
            <div className="flex rounded-full overflow-hidden h-3">
              <div 
                className="bg-green-500 transition-all duration-300"
                style={{ width: `${positivePercentage}%` }}
                title={`${Math.round(positivePercentage)}% positive`}
              ></div>
              <div 
                className="bg-red-500 transition-all duration-300"
                style={{ width: `${negativePercentage}%` }}
                title={`${Math.round(negativePercentage)}% negative`}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>{Math.round(positivePercentage)}% liked</span>
              <span>{Math.round(negativePercentage)}% passed</span>
            </div>
          </div>

          {/* Insights */}
          <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
              Insights
            </h4>
            <div className="space-y-1 text-sm text-blue-700 dark:text-blue-300">
              {positivePercentage >= 70 && (
                <p>✨ Great job! You're liking most of your drafts.</p>
              )}
              {positivePercentage < 30 && totalFeedback >= 5 && (
                <p>💡 Consider updating your style training to get better matches.</p>
              )}
              {stats.feedback_rate < 0.3 && stats.total_drafts >= 10 && (
                <p>📝 Try providing more feedback to help improve future drafts.</p>
              )}
              {stats.feedback_rate >= 0.8 && (
                <p>🎯 Excellent feedback rate! This helps us learn your preferences.</p>
              )}
              {totalFeedback < 5 && (
                <p>🚀 Provide feedback on a few more drafts to see detailed insights.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
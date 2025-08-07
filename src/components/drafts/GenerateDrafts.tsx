'use client';

import { useState } from 'react';
import { apiService } from '@/lib/apiService';

interface GenerateDraftsProps {
  onDraftsGenerated?: () => void;
}

export default function GenerateDrafts({ onDraftsGenerated }: GenerateDraftsProps) {
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleGenerate = async (force: boolean = false) => {
    try {
      setGenerating(true);
      setError(null);
      setSuccess(null);

      const response = await apiService.generateDrafts({ force });

      if (response.success && response.data) {
        if (response.data.drafts_generated > 0) {
          setSuccess(`Generated ${response.data.drafts_generated} new drafts!`);
          if (onDraftsGenerated) {
            onDraftsGenerated();
          }
        } else {
          setSuccess(response.data.message);
        }
      } else {
        setError(response.error?.message || 'Failed to generate drafts');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Error generating drafts:', err);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Generate New Drafts
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Create LinkedIn post drafts based on your sources and writing style
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleGenerate(false)}
            disabled={generating}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed dark:focus:ring-offset-gray-800"
          >
            {generating ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
              </>
            ) : (
              <>
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                </svg>
                Generate Drafts
              </>
            )}
          </button>
        </div>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="mb-4 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex">
            <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                Generation Failed
              </h3>
              <p className="mt-1 text-sm text-red-700 dark:text-red-300">
                {error}
              </p>
              {error.includes('recent drafts') && (
                <button
                  onClick={() => handleGenerate(true)}
                  disabled={generating}
                  className="mt-2 text-sm font-medium text-red-800 dark:text-red-200 hover:text-red-900 dark:hover:text-red-100 disabled:opacity-50"
                >
                  Force generate anyway
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="mb-4 bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex">
            <svg className="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800 dark:text-green-200">
                Success!
              </h3>
              <p className="mt-1 text-sm text-green-700 dark:text-green-300">
                {success}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Generation Info */}
      <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex">
          <svg className="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
              How it works
            </h3>
            <div className="mt-1 text-sm text-blue-700 dark:text-blue-300">
              <ul className="list-disc list-inside space-y-1">
                <li>Analyzes content from your connected sources</li>
                <li>Matches your writing style using AI</li>
                <li>Generates 3-5 personalized LinkedIn post drafts</li>
                <li>Includes source attribution and engagement optimization</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
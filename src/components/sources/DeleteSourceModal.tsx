'use client';

import { useState } from 'react';
import { Source } from '@/lib/types';
import { apiService } from '@/lib/apiService';
import { XMarkIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface DeleteSourceModalProps {
  source: Source;
  onSourceDeleted: (sourceId: string) => void;
  onCancel: () => void;
}

export default function DeleteSourceModal({ source, onSourceDeleted, onCancel }: DeleteSourceModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.deleteSource(source.id);
      
      if (response.success) {
        onSourceDeleted(source.id);
      } else {
        setError(response.error?.message || 'Failed to delete source');
      }
    } catch (err) {
      setError('Failed to delete source');
      console.error('Error deleting source:', err);
    } finally {
      setLoading(false);
    }
  };

  const getSourceIcon = () => {
    if (source.type === 'rss') {
      return (
        <svg className="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M6.503 20.752c0 1.794-1.456 3.248-3.251 3.248S0 22.546 0 20.752s1.456-3.248 3.252-3.248 3.251 1.454 3.251 3.248zM1.677 6.082v4.15c6.988 0 12.65 5.662 12.65 12.65h4.15c0-9.271-7.529-16.8-16.8-16.8zM1.677.014v4.151C14.236 4.165 24.322 14.251 24.336 26.81h4.15C28.472 12.474 16.013.014 1.677.014z"/>
        </svg>
      );
    } else {
      return (
        <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
        </svg>
      );
    }
  };

  const formatUrl = (url: string) => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch {
      return url;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="flex-shrink-0 w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mr-3">
              <ExclamationTriangleIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Delete Source
            </h2>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          <div className="mb-6">
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Are you sure you want to delete this source? This action cannot be undone.
            </p>

            {/* Source Info */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="flex items-center mb-2">
                {getSourceIcon()}
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                    {source.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {formatUrl(source.url)}
                  </p>
                </div>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                <span className="capitalize">{source.type === 'rss' ? 'RSS Feed' : 'Twitter'}</span>
                {source.error_count > 0 && (
                  <span className="ml-2 text-red-600 dark:text-red-400">
                    • {source.error_count} errors
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
            <div className="flex">
              <ExclamationTriangleIcon className="w-5 h-5 text-yellow-400 flex-shrink-0" />
              <div className="ml-3">
                <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  What happens when you delete this source:
                </h4>
                <ul className="mt-2 text-sm text-yellow-700 dark:text-yellow-300 list-disc list-inside space-y-1">
                  <li>The source will stop being monitored for new content</li>
                  <li>Existing drafts generated from this source will remain</li>
                  <li>This action cannot be undone</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={loading}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg transition-colors disabled:cursor-not-allowed flex items-center"
            >
              {loading && (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {loading ? 'Deleting...' : 'Delete Source'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
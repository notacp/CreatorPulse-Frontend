'use client';

import { useState } from 'react';
import { Source, UpdateSourceRequest } from '@/lib/types';
import { apiService } from '@/lib/apiService';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface EditSourceModalProps {
  source: Source;
  onSourceUpdated: (source: Source) => void;
  onCancel: () => void;
}

export default function EditSourceModal({ source, onSourceUpdated, onCancel }: EditSourceModalProps) {
  const [formData, setFormData] = useState<UpdateSourceRequest>({
    name: source.name,
    active: source.active
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name?.trim()) {
      setError('Please enter a display name');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.updateSource(source.id, formData);
      
      if (response.success && response.data) {
        onSourceUpdated(response.data);
      } else {
        setError(response.error?.message || 'Failed to update source');
      }
    } catch (err) {
      setError('Failed to update source');
      console.error('Error updating source:', err);
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
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Edit Source
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          {/* Source Info Display */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="flex items-center mb-2">
              {getSourceIcon()}
              <span className="ml-2 text-sm font-medium text-gray-900 dark:text-white capitalize">
                {source.type === 'rss' ? 'RSS Feed' : 'Twitter'}
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 break-all">
              {formatUrl(source.url)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              URL cannot be changed after creation
            </p>
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Display Name
            </label>
            <input
              type="text"
              id="name"
              value={formData.name || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter a friendly name for this source"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              required
            />
          </div>

          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.active ?? true}
                onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Active source
              </span>
            </label>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Inactive sources won&apos;t be monitored for new content
            </p>
          </div>

          {/* Source Stats */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-2">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">Source Statistics</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500 dark:text-gray-400">Error Count:</span>
                <span className={`ml-2 font-medium ${source.error_count > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                  {source.error_count}
                </span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Last Checked:</span>
                <span className="ml-2 font-medium text-gray-900 dark:text-white">
                  {source.last_checked 
                    ? new Date(source.last_checked).toLocaleDateString()
                    : 'Never'
                  }
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors disabled:cursor-not-allowed flex items-center"
            >
              {loading && (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {loading ? 'Updating...' : 'Update Source'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
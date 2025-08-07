'use client';

import { useState, useEffect, useCallback } from 'react';
import { Source } from '@/lib/types';
import { apiService } from '@/lib/apiService';
import { 
  PencilIcon, 
  TrashIcon, 
  ArrowPathIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

interface SourceCardProps {
  source: Source;
  onEdit: () => void;
  onDelete: () => void;
  onRefresh: () => void;
}

export default function SourceCard({ source, onEdit, onDelete }: SourceCardProps) {
  const [status, setStatus] = useState<{
    status: string;
    last_error?: string;
  } | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(false);

  const loadSourceStatus = useCallback(async () => {
    try {
      setLoadingStatus(true);
      const response = await apiService.getSourceStatus(source.id);
      
      if (response.success && response.data) {
        setStatus(response.data);
      }
    } catch (err) {
      console.error('Error loading source status:', err);
    } finally {
      setLoadingStatus(false);
    }
  }, [source.id]);

  useEffect(() => {
    loadSourceStatus();
  }, [loadSourceStatus]);

  const getSourceIcon = () => {
    if (source.type === 'rss') {
      return (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M6.503 20.752c0 1.794-1.456 3.248-3.251 3.248S0 22.546 0 20.752s1.456-3.248 3.252-3.248 3.251 1.454 3.251 3.248zM1.677 6.082v4.15c6.988 0 12.65 5.662 12.65 12.65h4.15c0-9.271-7.529-16.8-16.8-16.8zM1.677.014v4.151C14.236 4.165 24.322 14.251 24.336 26.81h4.15C28.472 12.474 16.013.014 1.677.014z"/>
        </svg>
      );
    } else {
      return (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
        </svg>
      );
    }
  };

  const getStatusIndicator = () => {
    if (loadingStatus) {
      return (
        <div className="flex items-center text-gray-500 dark:text-gray-400">
          <ArrowPathIcon className="w-4 h-4 mr-1 animate-spin" />
          <span className="text-sm">Checking...</span>
        </div>
      );
    }

    if (!status) {
      return (
        <div className="flex items-center text-gray-500 dark:text-gray-400">
          <span className="text-sm">Unknown</span>
        </div>
      );
    }

    switch (status.status) {
      case 'active':
        return (
          <div className="flex items-center text-green-600 dark:text-green-400">
            <CheckCircleIcon className="w-4 h-4 mr-1" />
            <span className="text-sm">Active</span>
          </div>
        );
      case 'inactive':
        return (
          <div className="flex items-center text-gray-500 dark:text-gray-400">
            <XCircleIcon className="w-4 h-4 mr-1" />
            <span className="text-sm">Inactive</span>
          </div>
        );
      case 'error':
        return (
          <div className="flex items-center text-red-600 dark:text-red-400">
            <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
            <span className="text-sm">Error</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center text-gray-500 dark:text-gray-400">
            <span className="text-sm">Unknown</span>
          </div>
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

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
      
      if (diffInHours < 1) return 'Just now';
      if (diffInHours < 24) return `${diffInHours}h ago`;
      if (diffInHours < 48) return 'Yesterday';
      
      return date.toLocaleDateString();
    } catch {
      return 'Invalid date';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <div className="flex-shrink-0 p-2 bg-gray-100 dark:bg-gray-700 rounded-lg mr-3">
            <div className="text-gray-600 dark:text-gray-300">
              {getSourceIcon()}
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white truncate">
              {source.name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
              {formatUrl(source.url)}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 ml-4">
          <button
            onClick={onEdit}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            title="Edit source"
          >
            <PencilIcon className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
            title="Delete source"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500 dark:text-gray-400">Status</span>
          {getStatusIndicator()}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500 dark:text-gray-400">Type</span>
          <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
            {source.type === 'rss' ? 'RSS Feed' : 'Twitter'}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500 dark:text-gray-400">Last checked</span>
          <span className="text-sm text-gray-900 dark:text-white">
            {formatDate(source.last_checked)}
          </span>
        </div>

        {source.error_count > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500 dark:text-gray-400">Errors</span>
            <span className="text-sm text-red-600 dark:text-red-400 font-medium">
              {source.error_count}
            </span>
          </div>
        )}

        {status?.last_error && (
          <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-800 dark:text-red-200">
              {status.last_error}
            </p>
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={loadSourceStatus}
          disabled={loadingStatus}
          className="inline-flex items-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowPathIcon className={`w-4 h-4 mr-1 ${loadingStatus ? 'animate-spin' : ''}`} />
          Refresh Status
        </button>
      </div>
    </div>
  );
}
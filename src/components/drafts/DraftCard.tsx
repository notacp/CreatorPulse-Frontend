'use client';

import { Draft } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';

interface DraftCardProps {
  draft: Draft;
  onFeedback?: (draftId: string, feedbackType: 'positive' | 'negative') => void;
  showActions?: boolean;
}

export default function DraftCard({ draft, onFeedback, showActions = true }: DraftCardProps) {
  const getStatusColor = (status: Draft['status']) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    }
  };

  const getStatusText = (status: Draft['status']) => {
    switch (status) {
      case 'approved':
        return 'Liked';
      case 'rejected':
        return 'Passed';
      default:
        return 'Pending';
    }
  };

  const handleFeedback = (feedbackType: 'positive' | 'negative') => {
    if (onFeedback) {
      onFeedback(draft.id, feedbackType);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(draft.status)}`}>
              {getStatusText(draft.status)}
            </span>
            {draft.source_name && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                from {draft.source_name}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {formatDistanceToNow(new Date(draft.created_at), { addSuffix: true })}
          </p>
        </div>
        
        {draft.engagement_score && (
          <div className="text-right">
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {draft.engagement_score}/10
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Engagement
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="mb-4">
        <p className="text-gray-900 dark:text-white whitespace-pre-wrap leading-relaxed">
          {draft.content}
        </p>
      </div>

      {/* Metadata */}
      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
        <div className="flex items-center gap-4">
          {draft.character_count && (
            <span>{draft.character_count} characters</span>
          )}
          {draft.email_sent_at && (
            <span>Sent via email</span>
          )}
        </div>
      </div>

      {/* Actions */}
      {showActions && draft.status === 'pending' && (
        <div className="flex items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => handleFeedback('positive')}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 dark:bg-green-900 dark:text-green-200 dark:hover:bg-green-800 rounded-lg transition-colors"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
            </svg>
            Like
          </button>
          <button
            onClick={() => handleFeedback('negative')}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 dark:bg-red-900 dark:text-red-200 dark:hover:bg-red-800 rounded-lg transition-colors"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018c.163 0 .326.02.485.06L17 4m-7 10v2a2 2 0 002 2h.095c.5 0 .905-.405.905-.905 0-.714.211-1.412.608-2.006L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
            </svg>
            Pass
          </button>
        </div>
      )}
    </div>
  );
}
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Draft } from '@/lib/types';
import { apiService } from '@/lib/apiService';
import DraftCard from './DraftCard';

interface DraftsListProps {
  limit?: number;
  showPagination?: boolean;
  showFilters?: boolean;
  title?: string;
}

export default function DraftsList({ 
  limit, 
  showPagination = true, 
  showFilters = true,
  title = "Recent Drafts"
}: DraftsListProps) {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [submittingFeedback, setSubmittingFeedback] = useState<string | null>(null);

  const perPage = limit || 10;

  const fetchDrafts = useCallback(async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.getDrafts(page, perPage);
      
      if (response.success && response.data) {
        let filteredDrafts = response.data.data || [];
        
        // Ensure filteredDrafts is an array
        if (!Array.isArray(filteredDrafts)) {
          filteredDrafts = [];
        }
        
        // Apply status filter
        if (statusFilter !== 'all') {
          filteredDrafts = filteredDrafts.filter(draft => draft.status === statusFilter);
        }
        
        setDrafts(filteredDrafts);
        setTotalPages(response.data.total_pages || 1);
      } else {
        setError(response.error?.message || 'Failed to fetch drafts');
        setDrafts([]); // Ensure drafts is always an array
      }
    } catch (err) {
      setError('An unexpected error occurred');
      setDrafts([]); // Ensure drafts is always an array
      console.error('Error fetching drafts:', err);
    } finally {
      setLoading(false);
    }
  }, [perPage, statusFilter]);

  const handleFeedback = async (draftId: string, feedbackType: 'positive' | 'negative') => {
    try {
      setSubmittingFeedback(draftId);
      
      const response = await apiService.submitDraftFeedback(draftId, feedbackType);
      
      if (response.success) {
        // Update the draft status locally
        setDrafts(prevDrafts => 
          prevDrafts.map(draft => 
            draft.id === draftId 
              ? { ...draft, status: feedbackType === 'positive' ? 'approved' : 'rejected' }
              : draft
          )
        );
      } else {
        setError(response.error?.message || 'Failed to submit feedback');
      }
    } catch (err) {
      setError('Failed to submit feedback');
      console.error('Error submitting feedback:', err);
    } finally {
      setSubmittingFeedback(null);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchDrafts(page);
  };

  const handleFilterChange = (filter: typeof statusFilter) => {
    setStatusFilter(filter);
    setCurrentPage(1);
  };

  useEffect(() => {
    fetchDrafts(currentPage);
  }, [currentPage, statusFilter, fetchDrafts]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {title}
          </h2>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 animate-pulse">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                  <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
                <div className="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
              <div className="space-y-2 mb-4">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
              <div className="flex gap-2">
                <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <div className="flex">
          <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
              Error loading drafts
            </h3>
            <p className="mt-1 text-sm text-red-700 dark:text-red-300">
              {error}
            </p>
            <button
              onClick={() => fetchDrafts(currentPage)}
              className="mt-2 text-sm font-medium text-red-800 dark:text-red-200 hover:text-red-900 dark:hover:text-red-100"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          {title}
        </h2>
        
        {showFilters && (
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Filter:
            </label>
            <select
              value={statusFilter}
              onChange={(e) => handleFilterChange(e.target.value as typeof statusFilter)}
              className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="approved">Liked</option>
              <option value="rejected">Passed</option>
            </select>
          </div>
        )}
      </div>

      {/* Drafts List */}
      {!drafts || drafts.length === 0 ? (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
            No drafts found
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {statusFilter === 'all' 
              ? "Generate your first drafts to get started"
              : `No ${statusFilter} drafts found`
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {drafts?.map((draft) => (
            <DraftCard
              key={draft.id}
              draft={draft}
              onFeedback={handleFeedback}
              showActions={draft.status === 'pending' && submittingFeedback !== draft.id}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {showPagination && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Navigation from '@/components/layout/Navigation';
import Breadcrumb from '@/components/layout/Breadcrumb';
import { Source } from '@/lib/types';
import { apiService } from '@/lib/apiService';
import SourcesList from '@/components/sources/SourcesList';
import AddSourceForm from '@/components/sources/AddSourceForm';
import { PlusIcon } from '@heroicons/react/24/outline';

export default function SourcesPage() {
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const loadSources = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getSources();
      
      if (response.success && response.data) {
        // Ensure sources is always an array
        const sourcesData = Array.isArray(response.data) ? response.data : [];
        setSources(sourcesData);
      } else {
        setError(response.error?.message || 'Failed to load sources');
      }
    } catch (err) {
      setError('Failed to load sources');
      console.error('Error loading sources:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSources();
  }, []);

  const handleSourceAdded = (newSource: Source) => {
    setSources(prev => {
      const currentSources = Array.isArray(prev) ? prev : [];
      return [...currentSources, newSource];
    });
    setShowAddForm(false);
  };

  const handleSourceUpdated = (updatedSource: Source) => {
    setSources(prev => {
      const currentSources = Array.isArray(prev) ? prev : [];
      return currentSources.map(source => 
        source.id === updatedSource.id ? updatedSource : source
      );
    });
  };

  const handleSourceDeleted = (deletedSourceId: string) => {
    setSources(prev => {
      const currentSources = Array.isArray(prev) ? prev : [];
      return currentSources.filter(source => source.id !== deletedSourceId);
    });
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <Navigation />
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-4 py-8">
            <Breadcrumb />
            <div className="animate-pulse">
              <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-48 mb-8"></div>
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Navigation />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <Breadcrumb />
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Content Sources
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                Manage your RSS feeds and Twitter handles for content generation
              </p>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Add Source
            </button>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                </div>
                <div className="ml-auto pl-3">
                  <button
                    onClick={() => setError(null)}
                    className="inline-flex text-red-400 hover:text-red-600 dark:hover:text-red-300"
                  >
                    <span className="sr-only">Dismiss</span>
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}

          <SourcesList
            sources={sources}
            onSourceUpdated={handleSourceUpdated}
            onSourceDeleted={handleSourceDeleted}
            onRefresh={loadSources}
          />

          {showAddForm && (
            <AddSourceForm
              onSourceAdded={handleSourceAdded}
              onCancel={() => setShowAddForm(false)}
            />
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
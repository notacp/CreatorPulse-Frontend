'use client';

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Navigation from '@/components/layout/Navigation';
import { DraftsList, GenerateDrafts } from '@/components/drafts';
import { useState } from 'react';

export default function DraftsPage() {
  const [refreshDrafts, setRefreshDrafts] = useState(0);

  const handleDraftsGenerated = () => {
    // Trigger refresh of drafts list
    setRefreshDrafts(prev => prev + 1);
  };

  return (
    <ProtectedRoute>
      <Navigation />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Draft History
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              View and manage all your generated LinkedIn post drafts
            </p>
          </div>

          {/* Draft Generation */}
          <div className="mb-8">
            <GenerateDrafts onDraftsGenerated={handleDraftsGenerated} />
          </div>

          {/* All Drafts */}
          <DraftsList 
            key={refreshDrafts} // Force refresh when drafts are generated
            showPagination={true} 
            showFilters={true}
            title="All Drafts"
          />
        </div>
      </div>
    </ProtectedRoute>
  );
}
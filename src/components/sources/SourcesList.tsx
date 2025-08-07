'use client';

import { useState } from 'react';
import { Source } from '@/lib/types';
import SourceCard from './SourceCard';
import EditSourceModal from './EditSourceModal';
import DeleteSourceModal from './DeleteSourceModal';

interface SourcesListProps {
  sources: Source[];
  onSourceUpdated: (source: Source) => void;
  onSourceDeleted: (sourceId: string) => void;
  onRefresh: () => void;
}

export default function SourcesList({ 
  sources, 
  onSourceUpdated, 
  onSourceDeleted, 
  onRefresh 
}: SourcesListProps) {
  const [editingSource, setEditingSource] = useState<Source | null>(null);
  const [deletingSource, setDeletingSource] = useState<Source | null>(null);

  const handleEditSource = (source: Source) => {
    setEditingSource(source);
  };

  const handleDeleteSource = (source: Source) => {
    setDeletingSource(source);
  };

  const handleSourceUpdated = (updatedSource: Source) => {
    onSourceUpdated(updatedSource);
    setEditingSource(null);
  };

  const handleSourceDeleted = (sourceId: string) => {
    onSourceDeleted(sourceId);
    setDeletingSource(null);
  };

  if (sources.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          No sources yet
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">
          Add your first RSS feed or Twitter handle to start generating personalized content drafts.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {sources.map((source) => (
          <SourceCard
            key={source.id}
            source={source}
            onEdit={() => handleEditSource(source)}
            onDelete={() => handleDeleteSource(source)}
            onRefresh={onRefresh}
          />
        ))}
      </div>

      {editingSource && (
        <EditSourceModal
          source={editingSource}
          onSourceUpdated={handleSourceUpdated}
          onCancel={() => setEditingSource(null)}
        />
      )}

      {deletingSource && (
        <DeleteSourceModal
          source={deletingSource}
          onSourceDeleted={handleSourceDeleted}
          onCancel={() => setDeletingSource(null)}
        />
      )}
    </>
  );
}
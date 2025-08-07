'use client';

import { useState } from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Navigation from '@/components/layout/Navigation';
import { DraftsList, GenerateDrafts } from '@/components/drafts';
import DashboardStats from '@/components/dashboard/DashboardStats';
import Link from 'next/link';

export default function DashboardPage() {
  const [refreshDrafts, setRefreshDrafts] = useState(0);

  const handleDraftsGenerated = () => {
    // Trigger refresh of drafts list
    setRefreshDrafts(prev => prev + 1);
  };

  const quickActions = [
    {
      title: 'Style Training',
      description: 'Manage your writing samples and train the AI to match your voice',
      href: '/style-training',
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      color: 'bg-purple-600 hover:bg-purple-700'
    },
    {
      title: 'Content Sources',
      description: 'Add and manage RSS feeds and Twitter handles for content inspiration',
      href: '/sources',
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      ),
      color: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      title: 'Draft History',
      description: 'View all your generated drafts and manage feedback',
      href: '/drafts',
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      color: 'bg-green-600 hover:bg-green-700'
    },
    {
      title: 'Settings',
      description: 'Update your preferences, timezone, and account settings',
      href: '/settings',
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      color: 'bg-gray-600 hover:bg-gray-700'
    }
  ];

  return (
    <ProtectedRoute>
      <Navigation />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your content generation and AI training
            </p>
          </div>

          {/* Quick Actions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                href={action.href}
                className="group block"
              >
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg text-white mb-4 ${action.color} group-hover:scale-110 transition-transform`}>
                    {action.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {action.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {action.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          {/* Draft Generation */}
          <div className="mb-8">
            <GenerateDrafts onDraftsGenerated={handleDraftsGenerated} />
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Drafts - Takes up 2 columns */}
            <div className="lg:col-span-2">
              <DraftsList 
                key={refreshDrafts} // Force refresh when drafts are generated
                limit={5} 
                showPagination={false} 
                showFilters={false}
                title="Recent Drafts (Last 7 Days)"
              />
            </div>

            {/* Stats Sidebar */}
            <div className="lg:col-span-1">
              <DashboardStats />
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
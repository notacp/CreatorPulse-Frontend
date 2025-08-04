'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function Home() {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Navigation */}
      <nav className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            CreatorPulse
          </div>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <span className="text-gray-600 dark:text-gray-300">
                  Welcome, {user?.email}
                </span>
                <Link
                  href="/dashboard"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  Dashboard
                </Link>
                <button
                  onClick={logout}
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white font-semibold py-2 px-4 transition-colors"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white font-semibold py-2 px-4 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/register"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
            CreatorPulse
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Transform hours of content ideation into minutes of review time with
            AI-powered LinkedIn post drafts delivered to your inbox.
          </p>
          <div className="flex gap-4 justify-center">
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/auth/register"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  Get Started
                </Link>
                <Link
                  href="/auth/login"
                  className="border border-gray-300 hover:border-gray-400 text-gray-700 dark:text-gray-300 font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>

        <div className="mt-16 grid md:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Connect Your Sources
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Add RSS feeds and Twitter handles to monitor industry content and
              trends.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Train Your Style
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Upload sample posts to teach AI your unique voice and writing
              style.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Receive Daily Drafts
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Get 3-5 personalized LinkedIn post drafts delivered to your inbox
              daily.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Navigation from '@/components/layout/Navigation';
import UserSettingsForm from '@/components/settings/UserSettingsForm';
import AccountManagement from '@/components/settings/AccountManagement';

export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <Navigation />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Settings
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your account preferences and delivery settings
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* User Preferences */}
            <div>
              <UserSettingsForm />
            </div>

            {/* Account Management */}
            <div>
              <AccountManagement />
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
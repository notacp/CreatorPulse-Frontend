import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Navigation from '@/components/layout/Navigation';
import Breadcrumb from '@/components/layout/Breadcrumb';
import StyleTrainingInterface from '@/components/style/StyleTrainingInterface';

export default function StyleTrainingPage() {
  return (
    <ProtectedRoute>
      <Navigation />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Breadcrumb />
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Style Training
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage your writing samples to help AI generate drafts that match your unique voice and tone.
              </p>
            </div>
            
            <StyleTrainingInterface />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
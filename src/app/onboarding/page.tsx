import OnboardingWizard from '@/components/onboarding/OnboardingWizard';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function OnboardingPage() {
  return (
    <ProtectedRoute requireAuth={true}>
      <OnboardingWizard />
    </ProtectedRoute>
  );
}
'use client';

import { useSearchParams } from 'next/navigation';
import EmailVerification from '@/components/auth/EmailVerification';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  return <EmailVerification token={token || undefined} />;
}
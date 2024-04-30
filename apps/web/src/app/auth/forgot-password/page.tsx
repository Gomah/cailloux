import { validateRequest } from '@/lib/auth/validateRequest';
import { redirect } from 'next/navigation';
import { TriggerResetPasswordForm } from './TriggerResetPasswordForm';

export const metadata = {
  title: 'Forgot Password',
  description: 'Forgot Password Page',
};

export default async function ForgotPasswordPage() {
  const { user } = await validateRequest();
  if (user && !user?.emailVerified) redirect('/auth/verify-email');
  if (user?.emailVerified) redirect('/');

  return (
    <div>
      <TriggerResetPasswordForm />
    </div>
  );
}

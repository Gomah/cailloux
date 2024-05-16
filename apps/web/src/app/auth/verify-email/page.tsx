import { validateRequest } from '@/lib/auth/validateRequest';
import { redirect } from 'next/navigation';
import { VerifyCodeForm } from './VerifyCodeForm';

export const metadata = {
  title: 'Verify Email',
  description: 'Verify Email Page',
};

export default async function VerifyEmailPage() {
  const { user } = await validateRequest();

  if (!user) redirect('/auth/login');
  if (user.emailVerified) redirect('/');

  return (
    <div>
      <VerifyCodeForm />
    </div>
  );
}

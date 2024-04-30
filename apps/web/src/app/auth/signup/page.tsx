import { validateRequest } from '@/lib/auth/validateRequest';
import { redirect } from 'next/navigation';
import { SignupForm } from './SignupForm';

export const metadata = {
  title: 'Sign Up',
  description: 'Signup Page',
};

export default async function SignUpPage() {
  const { user } = await validateRequest();

  if (user && !user.emailVerified) redirect('/auth/verify-email');
  if (user?.emailVerified) redirect('/');

  return <SignupForm />;
}

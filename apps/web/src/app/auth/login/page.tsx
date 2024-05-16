import { validateRequest } from '@/lib/auth/validateRequest';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { LoginForm } from './LoginForm';

export const metadata: Metadata = {
  title: 'Login',
  description: 'Login page',
};

export default async function LoginPage() {
  const { user } = await validateRequest();

  if (user && !user?.emailVerified) redirect('/auth/verify-email');
  if (user?.emailVerified) redirect('/');

  return (
    <main>
      <LoginForm />
    </main>
  );
}

import { getUserSession } from '@/lib/auth/utils';
import { api } from '@/trpc/server';
import { redirect } from 'next/navigation';
import { Dashboard } from './Dashboard';

async function handleLogout() {
  'use server';
  await api.auth.logout();
  redirect('/auth/login?loggedOut=true');
}

export default async function HomePage() {
  const { user } = await getUserSession();

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center">
      <div className="container space-y-4 sm:max-w-md">
        <Dashboard user={user} />
        <form className="text-center text-sm" action={handleLogout}>
          <button type="submit">Log out</button>
        </form>
      </div>
    </main>
  );
}

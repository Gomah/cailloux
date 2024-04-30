import { lucia } from '@/lib/auth';
import { getUserSession } from '@/lib/auth/utils';
import { api } from '@/trpc/server';
import { revalidatePath } from 'next/cache';

export const metadata = {
  title: 'Account / Sessions',
  description: 'Account sessions Page',
};

export default async function HomePage() {
  const { session: currentSession, user } = await getUserSession();

  const sessions = await api.account.sessions();

  async function handleDelete(formData: FormData) {
    'use server';
    const sessionId = formData.get('sessionId') as string;
    await lucia.invalidateSession(sessionId);
    revalidatePath('/account/sessions');
  }

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center">
      <div className="container space-y-4 sm:max-w-lg">
        <div className="space-y-2 text-center">
          <h1 className="font-bold text-3xl">Your sessions</h1>
          <p className="text-balance text-muted-foreground">
            This is a list of devices that have logged into your account. Revoke any sessions that
            you do not recognize.
          </p>
        </div>
        {sessions.map((session) => (
          <div key={session.id} className="flex">
            <div>
              <p>{session.ip}</p>

              <p>{session.browser}</p>
              <p>{session.os}</p>
            </div>

            {session.id === currentSession.id && <div className="ml-auto">Current</div>}

            {session.id !== currentSession.id && (
              <form className="ml-auto" action={handleDelete}>
                <input name="sessionId" type="hidden" value={session.id} />
                <button type="submit">Delete</button>
              </form>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}

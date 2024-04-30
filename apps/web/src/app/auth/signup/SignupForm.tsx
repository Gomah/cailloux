'use client';

import Link from '@/app/_components/Link';
import { useProgressBar } from '@/hooks/useProgressBar';
import { useZodForm } from '@/hooks/useZodForm';
import { signupSchema } from '@/server/modules/auth/validators';
import { api } from '@/trpc/react';
import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from '@acme/ui';
import { useRouter } from 'next/navigation';
import { startTransition } from 'react';
import { toast } from 'sonner';

export function SignupForm() {
  const router = useRouter();
  const progress = useProgressBar();

  const signup = api.auth.signup.useMutation({
    onSuccess: async () => {
      progress.start();
      startTransition(() => {
        router.push('/auth/verify-email');
        progress.done();
        router.refresh();
      });
    },

    onError: (err) => {
      toast.error('Error', {
        description: err.message,
        position: 'top-center',
        closeButton: true,
      });
    },
  });

  const form = useZodForm({
    schema: signupSchema,

    defaultValues: {
      email: '',
      password: '',
    },

    mode: 'onBlur',
    reValidateMode: 'onChange',
  });

  const onSubmit = form.handleSubmit((values) => {
    return signup.mutate(values);
  });

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="font-bold text-3xl">Sign up</h1>
        <p className="text-balance text-muted-foreground">
          Enter your information to create an account
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={onSubmit} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>

                <FormControl>
                  <Input
                    required
                    autoComplete="email"
                    placeholder="Email"
                    type="email"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>

                <FormControl>
                  <Input {...field} type="password" required placeholder="********" />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />

          <Button className="w-full" type="submit" disabled={signup.isPending}>
            {signup.isPending ? 'Signin up' : 'Sign up'}
          </Button>
        </form>
      </Form>

      <div className="text-center text-sm">
        <p>
          Already have an account? <Link href="/auth/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

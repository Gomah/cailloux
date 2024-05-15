'use client';

import { Link } from '@/app/_components/Link';
import { useProgressBar } from '@/hooks/useProgressBar';
import { useZodForm } from '@/hooks/useZodForm';
import { loginSchema } from '@/server/modules/auth/validators';
import { api } from '@/trpc/react';
import {
  Button,
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from '@acme/ui';
import { useRouter } from 'next/navigation';
import { startTransition } from 'react';
import { Controller } from 'react-hook-form';
import { toast } from 'sonner';

export function LoginForm() {
  const router = useRouter();
  const progress = useProgressBar();

  const login = api.auth.login.useMutation({
    onSuccess: async () => {
      progress.start();
      startTransition(() => {
        router.push('/');
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
    schema: loginSchema,

    defaultValues: {
      email: '',
      password: '',
    },

    mode: 'onBlur',
    reValidateMode: 'onChange',
  });

  const onSubmit = form.handleSubmit((values) => {
    return login.mutate(values);
  });

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="font-bold text-3xl">Login</h1>
        <p className="text-balance text-muted-foreground">
          Enter your email below to login to your account
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

          <Button className="w-full" type="submit" disabled={login.isPending}>
            {login.isPending ? 'Signin in' : 'Sign in'}
          </Button>
        </form>
      </Form>

      <div className="space-y-2 text-center text-sm">
        <p className="text-primary">
          Don&apos;t have an account yet? <Link href="/auth/signup">Sign up</Link>
        </p>

        <p>
          <Link href="/auth/forgot-password">Forgot password</Link>
        </p>
      </div>
    </div>
  );
}

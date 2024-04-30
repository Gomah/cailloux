'use client';

import { useProgressBar } from '@/hooks/useProgressBar';
import { useZodForm } from '@/hooks/useZodForm';
import { resetPasswordSchema } from '@/server/modules/auth/validators';
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
import { Controller } from 'react-hook-form';
import { toast } from 'sonner';

export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const progress = useProgressBar();

  const resetPassword = api.auth.resetPassword.useMutation({
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
    schema: resetPasswordSchema,

    defaultValues: {
      token,
      password: '',
    },

    mode: 'onBlur',
    reValidateMode: 'onChange',
  });

  const onSubmit = form.handleSubmit((values) => {
    return resetPassword.mutate(values);
  });

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="font-bold text-3xl">Set new password</h1>
        <p className="text-balance text-muted-foreground">Enter your new password</p>
      </div>

      <Form {...form}>
        <form onSubmit={onSubmit} className="space-y-4">
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

          <Button className="w-full" type="submit" disabled={resetPassword.isPending}>
            Reset Password
          </Button>
        </form>
      </Form>
    </div>
  );
}

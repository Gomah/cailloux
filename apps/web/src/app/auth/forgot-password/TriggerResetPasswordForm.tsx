'use client';

import Link from '@/app/_components/Link';
import { useZodForm } from '@/hooks/useZodForm';
import { triggerPasswordResetSchema } from '@/server/modules/auth/validators';
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
import { useState } from 'react';
import { toast } from 'sonner';

export function TriggerResetPasswordForm() {
  const [emailSent, setEmailSent] = useState(false);

  const triggerPasswordReset = api.auth.triggerPasswordReset.useMutation({
    onSuccess: async () => {
      toast.success('Success', {
        description: 'Password reset link sent, please check your email',
        position: 'top-center',
        closeButton: true,
      });

      setEmailSent(true);
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
    schema: triggerPasswordResetSchema,

    defaultValues: {
      email: '',
    },

    mode: 'onBlur',
    reValidateMode: 'onChange',
  });

  const onSubmit = form.handleSubmit((values) => {
    return triggerPasswordReset.mutate(values);
  });

  return (
    <div className="space-y-6">
      {emailSent ? (
        <>
          <div className="space-y-2 text-center">
            <h1 className="font-bold text-3xl">Check your email</h1>
            <p className="text-balance text-muted-foreground">
              We sent you a link to reset your password
            </p>
          </div>
        </>
      ) : (
        <>
          <div className="space-y-2 text-center">
            <h1 className="font-bold text-3xl">Forgot password?</h1>
            <p className="text-balance text-muted-foreground">
              We&apos;ll send you a link to reset your password
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
                        placeholder="Enter your email"
                        type="email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button className="w-full" disabled={triggerPasswordReset.isPending} type="submit">
                {triggerPasswordReset.isPending ? 'Resetting Password' : 'Reset Password'}
              </Button>
            </form>

            <div className="text-center text-sm">
              <Link href="/auth/login">Back to login</Link>
            </div>
          </Form>
        </>
      )}
    </div>
  );
}

'use client';
import { REGEXP_ONLY_DIGITS } from 'input-otp';

import { useProgressBar } from '@/hooks/useProgressBar';
import { useZodForm } from '@/hooks/useZodForm';
import { VERIFICATION_CODE_RESEND_DELAY } from '@/lib/constants';
import { verifyEmailSchema } from '@/server/modules/auth/validators';
import { api } from '@/trpc/react';
import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@acme/ui';
import { useRouter } from 'next/navigation';
import { startTransition, useEffect, useState } from 'react';
import { toast } from 'sonner';

export function VerifyCodeForm() {
  const [secondsToWait, setSecondsToWait] = useState(0);
  const router = useRouter();
  const progress = useProgressBar();

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (secondsToWait > 0) {
      interval = setInterval(() => {
        setSecondsToWait(secondsToWait - 1);
      }, 1000);
    }

    return () => !!interval && clearInterval(interval);
  }, [secondsToWait]);

  const resendVerificationCode = api.auth.resendVerificationEmail.useMutation({
    onSuccess: async () => {
      toast.success('Success', {
        description: 'Verification code sent, please check your email',
        position: 'top-center',
        closeButton: true,
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

  const verifyEmail = api.auth.verifyEmail.useMutation({
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

  const logout = api.auth.logout.useMutation({
    onSuccess: () => {
      router.push('/auth/login');
      router.refresh();
    },
  });

  const form = useZodForm({
    schema: verifyEmailSchema,

    defaultValues: {
      code: '',
    },

    // mode: 'onBlur',
    // reValidateMode: 'onChange',
  });

  const onSubmit = form.handleSubmit((values) => {
    return verifyEmail.mutate(values);
  });

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={onSubmit} className="space-y-4">
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Code</FormLabel>

                <FormControl className="text-center">
                  <InputOTP maxLength={6} pattern={REGEXP_ONLY_DIGITS} {...field}>
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button className="w-full" type="submit" disabled={verifyEmail.isPending}>
            {verifyEmail.isPending ? 'Verifying' : 'Verify'}
          </Button>
        </form>
      </Form>

      <div className="text-center">
        <p className="text-sm">
          Didn&apos;t receive the email?{' '}
          <Button
            size="sm"
            type="button"
            variant="link"
            disabled={resendVerificationCode.isPending || secondsToWait > 0}
            onClick={() => {
              resendVerificationCode.mutate();

              setSecondsToWait(VERIFICATION_CODE_RESEND_DELAY * 60);
            }}
          >
            Resend code {secondsToWait > 0 && `in ${secondsToWait} seconds`}
          </Button>
        </p>

        <p className="text-sm">
          want to use another email?
          <Button size="sm" variant="link" type="button" onClick={() => logout.mutate()}>
            Log out now.
          </Button>
        </p>
      </div>
    </div>
  );
}

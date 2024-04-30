'use client';

import { useZodForm } from '@/hooks/useZodForm';
import { updateProfileSchema } from '@/server/modules/account/validators';
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
import type { User } from 'lucia';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

type DashboardProps = {
  user: User;
};

export function Dashboard({ user }: DashboardProps) {
  const router = useRouter();
  const updateProfile = api.account.updateProfile.useMutation({
    onSuccess: async () => {
      toast.success('Success', {
        description: 'Profile updated',
        position: 'top-center',
        closeButton: true,
      });

      router.refresh();
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
    schema: updateProfileSchema,

    defaultValues: {
      name: user.name || '',
    },

    mode: 'onBlur',
    reValidateMode: 'onChange',
  });

  const onSubmit = form.handleSubmit((values) => {
    return updateProfile.mutate(values);
  });

  return (
    <div className="rounded-sm border-2 p-6 shadow-sm">
      <Form {...form}>
        <form onSubmit={onSubmit} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>

                <FormControl>
                  <Input required autoComplete="name" placeholder="" type="text" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={updateProfile.isPending}>
            Save
          </Button>
        </form>
      </Form>
    </div>
  );
}

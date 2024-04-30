import { z } from 'zod';

export const updateProfileSchema = z.object({
  name: z.string().min(1, 'Name must be at least 1 character long'),
});

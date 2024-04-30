import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string(),
});

export const signupSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string(),
});

export const verifyEmailSchema = z.object({
  code: z.string().length(6, 'The code must be 6 characters long'),
});

export const triggerPasswordResetSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
});

export const resetPasswordSchema = z.object({
  token: z.string(),
  password: z.string(),
});

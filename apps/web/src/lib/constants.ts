import { TimeSpan } from 'lucia';
import type { Resend } from 'resend';

// * Auth related
export const SESSION_NAME = 'acme_session';
export const SESSION_EXPIRES_IN = new TimeSpan(30, 'd');
export const VERIFICATION_CODE_EXPIRES_IN = 15; // minutes
export const VERIFICATION_CODE_RESEND_DELAY = 1; // minutes
export const PASSWORD_RESET_EXPIRES_IN = 120; // minutes

// * Email related
export const EMAIL_FROM: Parameters<Resend['emails']['send']>['0']['from'] =
  'Acme <onboarding@resend.dev>';

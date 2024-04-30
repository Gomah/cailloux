import { env } from '@/env';
import pino from 'pino';

export const logger = pino({
  redact: {
    paths: ['*.password'],
    censor: '[Redacted]',
  },

  level: env.NODE_ENV === 'production' ? 'info' : 'debug',

  formatters: {
    bindings: (bindings) => {
      return {
        pid: bindings.pid,
        host: bindings.hostname,
        node_version: process.version,
      };
    },
  },

  timestamp: pino.stdTimeFunctions.isoTime,
});

import sharedConfig from '@acme/tailwind-config';
import type { Config } from 'tailwindcss';

const config: Pick<Config, 'darkMode' | 'content' | 'presets'> = {
  darkMode: ['class'],
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  presets: [sharedConfig],
};

export default config;

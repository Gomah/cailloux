import type { useProgress } from '@/app/_components/providers/ProgressBarProvider';
import { createContext, useContext } from 'react';

export const ProgressBarContext = createContext<ReturnType<typeof useProgress> | null>(null);

export function useProgressBar() {
  const progress = useContext(ProgressBarContext);

  if (progress === null) {
    throw new Error('Need to be inside provider');
  }

  return progress;
}

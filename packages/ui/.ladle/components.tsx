import type { GlobalProvider } from '@ladle/react';
import Inspect from 'inspx';
import * as React from 'react';
import './styles.css';

export const Provider: GlobalProvider = ({ children, globalState }) => {
  // Hook to update the html class to reflect the current theme
  React.useEffect(() => {
    if (globalState.theme === 'light') {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add(globalState.theme);
    } else {
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add(globalState.theme);
    }
  }, [globalState.theme]);

  return (
    <Inspect>
      <div className="h-full p-4">{children}</div>
    </Inspect>
  );
};

import { useEffect, useRef } from 'react';

/**
 * Custom hook to reload data when window/tab gains focus or becomes visible.
 * @param {boolean} reloadOnFocus - Flag to enable/disable reload behavior.
 * @param {() => void} reloadFn - Callback to invoke when reload should occur.
 */
export function useReloadOnFocus(
  reloadOnFocus: boolean,
  reloadFn: () => void,
): void {
  const lastLoadRef = useRef<number>(Date.now());
  const reloadTimeout = 15000;

  function throttledLoad() {
    const now = Date.now();
    if (now - lastLoadRef.current > reloadTimeout) {
      lastLoadRef.current = now;
      reloadFn();
    } else {
      console.log('Skipping reload; too soon since last one');
    }
  }

  useEffect(() => {
    if (!reloadOnFocus) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('Window is visible - triggering reload');
        throttledLoad();
      }
    };

    const handleWindowFocus = () => {
      console.log('Window focus - triggering reload');
      throttledLoad();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleWindowFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [reloadOnFocus, reloadFn]);
}

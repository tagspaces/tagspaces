import { useEffect, useRef, useState } from 'react';

type UseCancelableResult = {
  signal: AbortSignal;
  abort: () => void;
};

export const useCancelable = (): UseCancelableResult => {
  const [controller, setController] = useState(new AbortController());

  // Abort it automatically in the destructor
  useEffect(() => {
    return () => controller.abort();
  }, [controller]);

  return {
    signal: controller.signal,
    abort: () => {
      controller.abort();
      setController(new AbortController());
    },
  };
};

import { useState, useCallback, useMemo } from 'react';

export default function useValidation() {
  // Use a Set for fast add/remove/has
  const [errors, setErrors] = useState<Set<string>>(() => new Set());

  // Stable handler to add/remove an error key
  const setError = useCallback((errorKey: string, add: boolean = true) => {
    setErrors((prev) => {
      const next = new Set(prev);
      if (add) {
        next.add(errorKey);
      } else {
        next.delete(errorKey);
      }
      return next;
    });
  }, []);

  /**
   * @param errorKey - if have error for the specified key
   * if not set errorKey return if its have errors at general
   */
  const haveError = useCallback(
    (errorKey?: string): boolean => {
      if (errorKey) {
        return errors.has(errorKey);
      }
      return errors.size > 0;
    },
    [errors],
  );

  return useMemo(() => ({ setError, haveError }), [setError, haveError]);
}

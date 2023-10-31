import { useState } from 'react';

export default function useValidation() {
  const [errorInput, setErrorInput] = useState<Array<string>>([]);

  /**
   * @param errorKey
   * @param add; if false = remove it
   */
  const setError = (errorKey: string, add = true): void => {
    if (add) {
      if (errorInput.length === 0) {
        setErrorInput([errorKey]);
      } else if (errorInput.indexOf(errorKey) === -1) {
        setErrorInput([...errorInput, errorKey]);
      }
    } else if (errorInput.indexOf(errorKey) > -1) {
      setErrorInput(errorInput.filter((err) => err !== errorKey));
    }
  };

  /**
   * @param errorKey - if have error for the specified key
   * if not set errorKey return if its have errors at general
   */
  const haveError = (errorKey?: string): boolean => {
    if (errorKey) {
      return errorInput.some((err) => err === errorKey);
    }
    return errorInput.length > 0;
  };

  return { setError, haveError };
}

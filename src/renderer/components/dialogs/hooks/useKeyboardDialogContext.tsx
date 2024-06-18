import { useContext } from 'react';

import { KeyboardDialogContext } from '-/components/dialogs/hooks/KeyboardDialogContextProvider';

export const useKeyboardDialogContext = () => useContext(KeyboardDialogContext);

import { useContext } from 'react';

import { ProgressDialogContext } from '-/components/dialogs/hooks/ProgressDialogContextProvider';

export const useProgressDialogContext = () => useContext(ProgressDialogContext);

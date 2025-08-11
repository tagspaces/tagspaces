import { useContext } from 'react';

import { ImportMacTagDialogContext } from '-/components/dialogs/hooks/ImportMacTagDialogContextProvider';

export const useImportMacTagDialogContext = () =>
  useContext(ImportMacTagDialogContext);

import { useContext } from 'react';

import { EntryExistDialogContext } from '-/components/dialogs/hooks/EntryExistDialogContextProvider';

export const useEntryExistDialogContext = () =>
  useContext(EntryExistDialogContext);

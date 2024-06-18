import { useContext } from 'react';

import { DeleteMultipleEntriesDialogContext } from '-/components/dialogs/hooks/DeleteMultipleEntriesDialogContextProvider';

export const useDeleteMultipleEntriesDialogContext = () =>
  useContext(DeleteMultipleEntriesDialogContext);

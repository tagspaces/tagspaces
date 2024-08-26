import { useContext } from 'react';

import { CreateEditLocationDialogContext } from '-/components/dialogs/hooks/CreateEditLocationDialogContextProvider';

export const useCreateEditLocationDialogContext = () =>
  useContext(CreateEditLocationDialogContext);

import { useContext } from 'react';

import { EditEntryTagDialogContext } from '-/components/dialogs/hooks/EditEntryTagDialogContextProvider';

export const useEditEntryTagDialogContext = () =>
  useContext(EditEntryTagDialogContext);

import { useContext } from 'react';

import { CreateDirectoryDialogContext } from '-/components/dialogs/hooks/CreateDirectoryDialogContextProvider';

export const useCreateDirectoryDialogContext = () =>
  useContext(CreateDirectoryDialogContext);

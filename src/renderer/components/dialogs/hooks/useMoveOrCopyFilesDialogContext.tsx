import { useContext } from 'react';

import { MoveOrCopyFilesDialogContext } from '-/components/dialogs/hooks/MoveOrCopyFilesDialogContextProvider';

export const useMoveOrCopyFilesDialogContext = () =>
  useContext(MoveOrCopyFilesDialogContext);

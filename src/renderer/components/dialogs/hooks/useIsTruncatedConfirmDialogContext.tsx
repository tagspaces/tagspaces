import { useContext } from 'react';

import { IsTruncatedConfirmDialogContext } from '-/components/dialogs/hooks/IsTruncatedConfirmDialogContextProvider';

export const useIsTruncatedConfirmDialogContext = () =>
  useContext(IsTruncatedConfirmDialogContext);

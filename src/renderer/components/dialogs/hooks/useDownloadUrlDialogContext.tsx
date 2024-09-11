import { useContext } from 'react';

import { DownloadUrlDialogContext } from '-/components/dialogs/hooks/DownloadUrlDialogContextProvider';

export const useDownloadUrlDialogContext = () =>
  useContext(DownloadUrlDialogContext);

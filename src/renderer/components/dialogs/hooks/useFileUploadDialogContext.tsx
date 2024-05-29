import { useContext } from 'react';

import { FileUploadDialogContext } from '-/components/dialogs/hooks/FileUploadDialogContextProvider';

export const useFileUploadDialogContext = () =>
  useContext(FileUploadDialogContext);

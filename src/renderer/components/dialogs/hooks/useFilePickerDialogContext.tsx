import { useContext } from 'react';

import { FilePickerDialogContext } from '-/components/dialogs/hooks/FilePickerDialogContextProvider';

export const useFilePickerDialogContext = () =>
  useContext(FilePickerDialogContext);

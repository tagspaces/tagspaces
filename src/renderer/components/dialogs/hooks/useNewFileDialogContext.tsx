import { useContext } from 'react';

import { NewFileDialogContext } from '-/components/dialogs/hooks/NewFileDialogContextProvider';

export const useNewFileDialogContext = () => useContext(NewFileDialogContext);

import { useContext } from 'react';

import { AboutDialogContext } from '-/components/dialogs/hooks/AboutDialogContextProvider';

export const useAboutDialogContext = () => useContext(AboutDialogContext);

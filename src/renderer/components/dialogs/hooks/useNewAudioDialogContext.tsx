import { useContext } from 'react';

import { NewAudioDialogContext } from '-/components/dialogs/hooks/NewAudioDialogContextProvider';

export const useNewAudioDialogContext = () => useContext(NewAudioDialogContext);

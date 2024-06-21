import { useContext } from 'react';

import { SettingsDialogContext } from '-/components/dialogs/hooks/SettingsDialogContextProvider';

export const useSettingsDialogContext = () => useContext(SettingsDialogContext);

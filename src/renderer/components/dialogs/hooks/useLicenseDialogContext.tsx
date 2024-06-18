import { useContext } from 'react';

import { LicenseDialogContext } from '-/components/dialogs/hooks/LicenseDialogContextProvider';

export const useLicenseDialogContext = () => useContext(LicenseDialogContext);

import { useContext } from 'react';

import { ThirdPartyLibsDialogContext } from '-/components/dialogs/hooks/ThirdPartyLibsDialogContextProvider';

export const useThirdPartyLibsDialogContext = () =>
  useContext(ThirdPartyLibsDialogContext);

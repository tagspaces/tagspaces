import { useContext } from 'react';

import { ProTeaserDialogContext } from '-/components/dialogs/hooks/ProTeaserDialogContextProvider';

export const useProTeaserDialogContext = () =>
  useContext(ProTeaserDialogContext);

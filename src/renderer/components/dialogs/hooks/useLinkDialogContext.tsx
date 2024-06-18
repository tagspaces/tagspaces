import { useContext } from 'react';

import { LinkDialogContext } from '-/components/dialogs/hooks/LinkDialogContextProvider';

export const useLinkDialogContext = () => useContext(LinkDialogContext);

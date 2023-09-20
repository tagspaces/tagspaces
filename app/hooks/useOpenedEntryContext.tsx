import { useContext } from 'react';

import { OpenedEntryContext } from '-/hooks/OpenedEntryContextProvider';

export const useOpenedEntryContext = () => useContext(OpenedEntryContext);

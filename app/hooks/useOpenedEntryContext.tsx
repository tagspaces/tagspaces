import { useContext } from 'react';

import { OpenedEntryContext } from './OpenedEntryContextProvider';

export const useOpenedEntryContext = () => useContext(OpenedEntryContext);

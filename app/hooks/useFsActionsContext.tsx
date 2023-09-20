import { useContext } from 'react';

import { FsActionsContext } from '-/hooks/FsActionsContextProvider';

export const useFsActionsContext = () => useContext(FsActionsContext);

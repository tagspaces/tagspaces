import { useContext } from 'react';

import { SortedDirContext } from './SortedDirContextProvider';

export const useSortedDirContext = () => useContext(SortedDirContext);

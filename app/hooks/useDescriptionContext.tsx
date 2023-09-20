import { useContext } from 'react';

import { DescriptionContext } from './DescriptionContextProvider';

export const useDescriptionContext = () => useContext(DescriptionContext);

import { useContext } from 'react';

import { TargetPathContext } from '-/components/dialogs/hooks/TargetPathContextProvider';

export const useTargetPathContext = () => useContext(TargetPathContext);

import { useContext } from 'react';

import { ResolveConflictContext } from '-/components/dialogs/hooks/ResolveConflictContextProvider';

export const useResolveConflictContext = () =>
  useContext(ResolveConflictContext);

import { useContext } from 'react';

import { TaggingActionsContext } from '-/hooks/TaggingActionsContextProvider';

export const useTaggingActionsContext = () => useContext(TaggingActionsContext);

import { useContext } from 'react';

import { DirectoryMenuContext } from '-/components/dialogs/hooks/DirectoryMenuContextProvider';

export const useDirectoryMenuContext = () => useContext(DirectoryMenuContext);

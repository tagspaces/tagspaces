import { useContext } from 'react';

import { MenuContext } from '-/components/dialogs/hooks/MenuContextProvider';

export const useMenuContext = () => useContext(MenuContext);

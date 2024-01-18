import { useContext } from 'react';

import { ListCellsStyleContext } from './ListCellsStyleProvider';

export const useListCellsStyleContext = () => useContext(ListCellsStyleContext);

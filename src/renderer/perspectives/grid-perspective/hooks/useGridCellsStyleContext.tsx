import { useContext } from 'react';

import { GridCellsStyleContext } from './GridCellsStyleProvider';

export const useGridCellsStyleContext = () => useContext(GridCellsStyleContext);

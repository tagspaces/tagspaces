import React from 'react';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import { useTranslation } from 'react-i18next';
import { useSelectedEntriesContext } from '-/hooks/useSelectedEntriesContext';

export interface Props {
  // entriesLength: number;
  //entries: Array<any>;
  //path: string;
}

export function FilesDragPreview(props: Props) {
  //const { entriesLength } = props;
  const { selectedEntries } = useSelectedEntriesContext();
  const { t } = useTranslation();
  const entriesLength = selectedEntries.length > 0 ? selectedEntries.length : 1;
  return (
    <Chip
      size="small"
      avatar={<Avatar>{entriesLength}</Avatar>}
      style={{ marginLeft: 15 }}
      label={t('core:selectedFiles')}
      color="primary"
    />
  );
}
//const areEqual = (prevProp, nextProp) => nextProp.entriesLength === prevProp.entriesLength;
//export default React.memo(FilesDragPreview, areEqual);
export default React.memo(FilesDragPreview);

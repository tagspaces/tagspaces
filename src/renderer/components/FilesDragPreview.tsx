import { useSelectedEntriesContext } from '-/hooks/useSelectedEntriesContext';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import React from 'react';
import { useTranslation } from 'react-i18next';

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
      sx={{ marginLeft: '15px' }}
      label={t('core:selectedFiles')}
      color="primary"
    />
  );
}

export default React.memo(FilesDragPreview);

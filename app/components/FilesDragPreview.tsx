import React from 'react';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import i18n from '-/services/i18n';

export interface Props {
  entries: Array<any>;
  path: string;
}

export function FilesDragPreview(props: Props) {
  const { entries, path } = props;
  return (
    <Chip
      size="small"
      avatar={<Avatar>{entries.length}</Avatar>}
      style={{ marginLeft: 15 }}
      label={i18n.t('core:selectedFiles')}
      color="primary"
    />
  );
}
const areEqual = (prevProp, nextProp) => nextProp.path === prevProp.path;
export default React.memo(FilesDragPreview, areEqual);

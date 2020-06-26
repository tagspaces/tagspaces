import React, { memo } from 'react';

export interface Props {
  entries: Array<any>;
  path: string;
}

export const BoxDragPreview = memo((props: Props) => {
  const { entries, path } = props;
  return (
    <div style={{ display: 'inline-block' }}>
      {entries.length > 0 ? entries.map(entry => <h4>{entry.name}</h4>) : path}
    </div>
  );
});

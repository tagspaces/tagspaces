import React, { memo } from 'react';
import TagContainer from '-/components/TagContainer';
import { TS } from '-/tagspaces.namespace';

export interface Props {
  tag: TS.Tag;
}

export const TagDragPreview = memo((props: Props) => {
  const { tag } = props;
  return <TagContainer tag={tag} isDragging={true} />;
});

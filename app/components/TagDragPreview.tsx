import React, { memo } from 'react';
import TagContainer from '-/components/TagContainer';
import { Tag } from '-/reducers/taglibrary';

export interface Props {
  tag: Tag;
}

export const TagDragPreview = memo((props: Props) => {
  const { tag } = props;
  return <TagContainer tag={tag} isDragging={true} />;
});

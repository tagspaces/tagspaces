/* global TagSpaces */
/* eslint no-undef: "error" */
import React, { memo } from 'react';
import TagContainer from '-/components/TagContainer';

export interface Props {
  tag: TagSpaces.Tag;
}

export const TagDragPreview = memo((props: Props) => {
  const { tag } = props;
  return <TagContainer tag={tag} isDragging={true} />;
});

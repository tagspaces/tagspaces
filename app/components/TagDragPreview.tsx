import React from 'react';
import TagContainer from '-/components/TagContainer';
import { TS } from '-/tagspaces.namespace';

export interface Props {
  tag: TS.Tag;
}

function TagDragPreview(props: Props) {
  const { tag } = props;
  return <TagContainer tag={tag} isDragging={true} />;
}
const areEqual = (prevProp, nextProp) =>
  nextProp.tag.title === prevProp.tag.title;
export default React.memo(TagDragPreview, areEqual);

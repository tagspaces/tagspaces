const onDragEnd = (result: DropResult) => {
  const { source, destination } = result;

  if (!destination) {
    return;
  }

  if (source.droppableId !== destination.droppableId) {
    return;
  }

  if (source.index === destination.index) {
    return;
  }

  setTags((prevTags) => {
    if (!Array.isArray(prevTags) || prevTags.length === 0) {
      return prevTags;
    }

    if (
      source.index < 0 ||
      destination.index < 0 ||
      source.index >= prevTags.length ||
      destination.index > prevTags.length
    ) {
      return prevTags;
    }

    const nextTags = [...prevTags];
    const [movedTag] = nextTags.splice(source.index, 1);

    if (movedTag === undefined) {
      return prevTags;
    }

    nextTags.splice(destination.index, 0, movedTag);
    return nextTags;
  });
};

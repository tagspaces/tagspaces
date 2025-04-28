import React from 'react';
import TagDropContainer from '-/components/TagDropContainer';

export const fileOperationsEnabled = (selectedEntries) => {
  let selectionContainsDirectories = false;
  if (selectedEntries && selectedEntries.length > 0) {
    selectionContainsDirectories = selectedEntries.some(
      (entry) => entry !== undefined && !entry.isFile,
    );
    return !selectionContainsDirectories;
  }
  return false;
};

export const folderOperationsEnabled = (selectedEntries) => {
  let selectionContainsFiles = false;
  if (selectedEntries && selectedEntries.length > 0) {
    selectionContainsFiles = selectedEntries.some(
      (entry) => entry !== undefined && entry.isFile,
    );
  }
  return !selectionContainsFiles;
};

export const renderCellPlaceholder = () => {
  return (
    <div
      style={{
        position: 'relative',
      }}
    >
      <TagDropContainer>
        <div></div>
      </TagDropContainer>
    </div>
  );
};

import React from 'react';
export { default } from './components/MainContainer';

// interface PerspectiveSettings {
//   settingsKey: string;
//   orderBy: boolean;
//   sortBy: string; // 'byName',
//   layoutType: string; // 'grid', // list grid
//   singleClickAction: string; // openInternal openExternal
//   entrySize: string; // small, normal, big
//   thumbnailMode: string; // cover contain
//   showDirectories: boolean;
//   showTags: boolean;
// }

export const defaultSettings = {
  settingsKey: 'tsPerspectiveGrid',
  orderBy: true,
  sortBy: 'byName',
  layoutType: 'grid', // list grid
  singleClickAction: 'openInternal', // openInternal openExternal
  entrySize: 'small',
  thumbnailMode: 'contain', // cover contain
  showDirectories: true,
  showDetails: true,
  showDescription: false,
  showEntriesDescription: true,
  showTags: true,
  gridPageLimit: 100,
  // Cap the number of tag chips rendered per cell. Files with more tags show
  // the first N + a "+M more" chip that opens the rest in a popover. Reduces
  // worst-case per-cell render cost on heavily-tagged files. 0 disables the
  // cap (render all tags inline).
  maxVisibleTags: 4,
  maxDescriptionPreviewLength: 100,
};

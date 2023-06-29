/**
 * TagSpaces - universal file and folder organizer
 * Copyright (C) 2017-present TagSpaces UG (haftungsbeschraenkt)
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License (version 3) as
 * published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 */

import React from 'react';
import { FileTypeGroups } from '-/services/search';

interface Props {
  isFile: boolean;
  fileExtension?: string;
}

const folderIcon = (
  <path d="M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V8h16v10z" />
);
const genericFileIcon = (
  <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zM6 20V4h7v5h5v11H6z" />
);
const audioFileIcon = (
  <path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z" />
);
const videoFileIcon = (
  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-2.5-3.5 7-4.5-7-4.5v9z" />
);
const imageFileIcon = (
  <path d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-4.86 8.86-3 3.87L9 13.14 6 17h12l-3.86-5.14z"></path>
);
const noteFileIcon = (
  <>
    <path d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"></path>
    <path d="M14 17H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"></path>
  </>
);

function EntryIcon(props: Props) {
  const { isFile, fileExtension = '' } = props;
  let iconSVGPath = genericFileIcon;
  if (!isFile) {
    iconSVGPath = folderIcon;
  }
  if (FileTypeGroups.audio.includes(fileExtension)) {
    iconSVGPath = audioFileIcon;
  }
  if (FileTypeGroups.video.includes(fileExtension)) {
    iconSVGPath = videoFileIcon;
  }
  if (FileTypeGroups.images.includes(fileExtension)) {
    iconSVGPath = imageFileIcon;
  }
  if (FileTypeGroups.notes.includes(fileExtension)) {
    iconSVGPath = noteFileIcon;
  }

  return (
    <svg
      style={{
        width: '60%',
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        height: 150
      }}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="#bbbbbb22"
    >
      {iconSVGPath}
    </svg>
  );
}
export default EntryIcon;

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
import ParentFolder from '@mui/icons-material/ReplyOutlined';
import Help from '@mui/icons-material/Help';
import Settings from '@mui/icons-material/Settings';
import InfoIcon from '@mui/icons-material/Info';

export const ParentFolderIcon = () => (
  // <ParentDirIcon style={{ transform: 'rotate(-90deg)' }} /> SubdirectoryArrowLeft
  <ParentFolder />
);

export const HelpIcon = () => <Help />;

export const PerspectiveSettingsIcon = () => <Settings />;

export const FolderPropertiesIcon = () => <InfoIcon />;

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
import Info from '@mui/icons-material/Info';
import AnnouncementIcon from '@mui/icons-material/Announcement';
import Remove from '@mui/icons-material/RemoveCircleOutline';
import History from '@mui/icons-material/ChangeHistoryTwoTone';
import Settings from '@mui/icons-material/Settings';
import AddIcon from '@mui/icons-material/Add';
import Suitcase from '@mui/icons-material/WorkOutline';
import Link from '@mui/icons-material/Link';
import KeyShortcuts from '@mui/icons-material/Keyboard';

export const ParentFolderIcon = props => (
  // <ParentDirIcon style={{ transform: 'rotate(-90deg)' }} /> SubdirectoryArrowLeft
  <ParentFolder {...props} />
);

export const HelpIcon = props => <Help {...props} />;

export const InfoIcon = props => <AnnouncementIcon {...props} />;

export const FolderPropertiesIcon = props => <Info {...props} />;

export const RemoveIcon = props => <Remove {...props} />;

export const HistoryIcon = props => <History {...props} />;

export const PerspectiveSettingsIcon = props => <Settings {...props} />;

export const CreateFileIcon = props => <AddIcon {...props} />;

export const LocalLocationIcon = props => <Suitcase {...props} />;

export const OpenLinkIcon = props => <Link {...props} />;

export const KeyShortcutsIcon = props => <KeyShortcuts {...props} />;

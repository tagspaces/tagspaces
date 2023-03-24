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
import InfoOutlined from '@mui/icons-material/InfoOutlined';
import Info from '@mui/icons-material/Info';
import AnnouncementIcon from '@mui/icons-material/AnnouncementOutlined';
import Remove from '@mui/icons-material/RemoveCircleOutline';
import History from '@mui/icons-material/ChangeHistoryTwoTone';
import Settings from '@mui/icons-material/Settings';
import AddIcon from '@mui/icons-material/Add';
import Suitcase from '@mui/icons-material/WorkOutline';
import Link from '@mui/icons-material/Link';
import KeyShortcuts from '@mui/icons-material/Keyboard';
import Menu from '@mui/icons-material/Menu';
import ArrowBack from '@mui/icons-material/ArrowBack';
import ArrowForward from '@mui/icons-material/ArrowForward';
import Folder from '@mui/icons-material/Folder';
import File from '@mui/icons-material/InsertDriveFile';
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';
import SubdirectoryArrowLeftIcon from '@mui/icons-material/SubdirectoryArrowLeft';
import Cancel from '@mui/icons-material/DoDisturbOn';

export const ParentFolderIcon = props => (
  <KeyboardReturnIcon style={{ transform: 'rotate(90deg)' }} />
  // <ParentFolder {...props} />
);

export const NavigateToFolderIcon = props => <KeyboardReturnIcon />;

export const FolderIcon = props => <Folder {...props} />;

export const FileIcon = props => <File {...props} />;

export const MainMenuIcon = props => <Menu {...props} />;

export const GoBackIcon = props => <ArrowBack {...props} />;

export const GoForwardIcon = props => <ArrowForward {...props} />;

export const HelpIcon = props => <Help {...props} />;

export const InfoIcon = props => <AnnouncementIcon {...props} />;

export const InfoTooltipIcon = props => <InfoOutlined {...props} />;

export const FolderPropertiesIcon = props => <Info {...props} />;

export const RemoveIcon = props => <Remove {...props} />;

export const HistoryIcon = props => <History {...props} />;

export const PerspectiveSettingsIcon = props => <Settings {...props} />;

export const CreateFileIcon = props => <AddIcon {...props} />;

export const LocalLocationIcon = props => <Suitcase {...props} />;

export const OpenLinkIcon = props => <Link {...props} />;

export const KeyShortcutsIcon = props => <KeyShortcuts {...props} />;

export const CancelIcon = props => <Cancel {...props} />;

/**
 * TagSpaces - universal file and folder organizer
 * Copyright (C) 2026-present TagSpaces GmbH
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

import AppConfig from '-/AppConfig';
import { isDesktopMode } from '-/reducers/settings';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import React from 'react';
import { useSelector } from 'react-redux';
import TsTooltip from './TsTooltip';

// Static styles live at module level, so they are not rebuilt per row/render.
// The action button shows on hover / keyboard focus only, but stays visible
// on touch devices and while e.g. its menu is open. Desktop mode is the
// primary touch check: some Android WebViews and iPads with a trackpad
// report hover support
const ACTION_SELECTOR = '& .MuiListItemSecondaryAction-root';
const rowSxHoverAction = {
  [ACTION_SELECTOR]: { opacity: 0, transition: 'opacity 150ms' },
  '&:hover .MuiListItemSecondaryAction-root, &:focus-within .MuiListItemSecondaryAction-root':
    { opacity: 1 },
  '@media (hover: none)': { [ACTION_SELECTOR]: { opacity: 1 } },
};
const rowSxVisibleAction = {
  [ACTION_SELECTOR]: { opacity: 1, transition: 'opacity 150ms' },
};
const buttonSx = {
  borderRadius: AppConfig.defaultCSSRadius,
  py: '2px',
  pl: 1,
  height: 40,
  minHeight: 40,
};
const iconSx = { minWidth: 30, color: 'text.secondary' };
const textSx = { my: '2px' };
const textSlotProps = {
  primary: { noWrap: true, variant: 'body2' as const },
  secondary: {
    noWrap: true,
    variant: 'caption' as const,
    sx: { display: 'block', lineHeight: 1.5 },
  },
};

interface Props {
  icon: React.ReactNode;
  primary: React.ReactNode;
  secondary?: React.ReactNode;
  tooltip?: React.ReactNode;
  dataTid: string;
  onClick: () => void;
  // trailing button, e.g. a menu or edit button
  action?: React.ReactNode;
  // keep the action visible, e.g. while the menu it opened is shown
  actionVisible?: boolean;
}

/**
 * A row of the quick access lists (saved searches, bookmarks, history):
 * icon, name with an optional muted second line, and a trailing action
 * button revealed on hover
 */
function QuickAccessRow({
  icon,
  primary,
  secondary,
  tooltip,
  dataTid,
  onClick,
  action,
  actionVisible = false,
}: Props) {
  const desktopMode = useSelector(isDesktopMode);
  const button = (
    <ListItemButton dense data-tid={dataTid} onClick={onClick} sx={buttonSx}>
      <ListItemIcon sx={iconSx}>{icon}</ListItemIcon>
      <ListItemText
        primary={primary}
        secondary={secondary || undefined}
        sx={textSx}
        slotProps={textSlotProps}
      />
    </ListItemButton>
  );
  return (
    <ListItem
      disablePadding
      sx={!desktopMode || actionVisible ? rowSxVisibleAction : rowSxHoverAction}
      secondaryAction={action}
    >
      {tooltip ? (
        <TsTooltip placement="right" enterDelay={600} title={tooltip}>
          {button}
        </TsTooltip>
      ) : (
        button
      )}
    </ListItem>
  );
}

export default QuickAccessRow;

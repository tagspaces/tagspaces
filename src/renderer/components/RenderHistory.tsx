/**
 * TagSpaces - universal file and folder organizer
 * Copyright (C) 2017-present TagSpaces GmbH
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
import {
  CloudLocationIcon,
  CopyToClipboardIcon,
  EntryBookmarkIcon,
  FileIcon,
  FolderIcon,
  MoreMenuIcon,
  OpenFileIcon,
  OpenNewWindowIcon,
  RemoveIcon,
} from '-/components/CommonIcons';
import TsIconButton from '-/components/TsIconButton';
import { historyKeys } from '-/hooks/HistoryContextProvider';
import { useBrowserHistoryContext } from '-/hooks/useBrowserHistoryContext';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import { useHistoryContext } from '-/hooks/useHistoryContext';
import { Pro } from '-/pro';
import { dataTidFormat } from '-/services/test';
import { createNewInstance } from '-/services/utils-io';
import { TS } from '-/tagspaces.namespace';
import { CommonLocation } from '-/utils/CommonLocation';
import Box from '@mui/material/Box';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { locationType } from '@tagspaces/tagspaces-common/misc';
import {
  extractContainingDirectoryPath,
  extractDirectoryName,
  extractFileName,
} from '@tagspaces/tagspaces-common/paths';
import React, { useCallback, useContext, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import QuickAccessRow from './QuickAccessRow';
import TsMenuList from './TsMenuList';

type HistoryEntry = TS.HistoryItem | TS.BookmarkItem;

const cloudBadgeWrapperSx = { position: 'relative', display: 'inline-flex' };
const cloudBadgeSx = {
  position: 'absolute',
  right: -5,
  bottom: -3,
  fontSize: 12,
  padding: '1px',
  borderRadius: '50%',
  color: 'primary.main',
  backgroundColor: 'background.paper',
};

/**
 * History items carry the location id in `lid`, bookmarks only in the tslid
 * parameter of their url
 */
function getItemLocationId(item: HistoryEntry): string | undefined {
  const lid =
    (item as TS.HistoryItem).lid ?? item.url?.match(/[?&]tslid=([^&]+)/)?.[1];
  return lid ? decodeURIComponent(lid) : undefined;
}

interface HistoryRowProps {
  item: HistoryEntry;
  historyKey: string;
  location: CommonLocation | undefined;
  showMenu: boolean;
  menuVisible: boolean;
  onOpen: (item: TS.HistoryItem) => void;
  onMenuOpen: (
    event: React.MouseEvent<HTMLElement>,
    item: HistoryEntry,
  ) => void;
}

/**
 * Memoized, so a row re-renders only when its own item, location or menu
 * state changes, e.g. opening one item's menu does not re-render the others
 */
const HistoryRow = React.memo(function HistoryRow({
  item,
  historyKey,
  location,
  showMenu,
  menuVisible,
  onOpen,
  onMenuOpen,
}: HistoryRowProps) {
  const { t } = useTranslation();
  // cloud paths always use '/', also on Windows
  const dirSeparator = location?.getDirSeparator() ?? AppConfig.dirSeparator;
  // folder history paths are stored without a trailing separator
  const isFolder =
    historyKey === historyKeys.folderOpenKey ||
    item.path.endsWith(dirSeparator);
  const itemName = isFolder
    ? extractDirectoryName(item.path, dirSeparator)
    : extractFileName(item.path, dirSeparator);
  const parentName = extractDirectoryName(
    extractContainingDirectoryPath(item.path, dirSeparator),
    dirSeparator,
  );

  let itemIcon = isFolder ? (
    <FolderIcon fontSize="small" />
  ) : (
    <FileIcon fontSize="small" />
  );
  if (historyKey === Pro?.keys.bookmarksKey) {
    itemIcon = <EntryBookmarkIcon fontSize="small" />;
  }
  if (location?.type === locationType.TYPE_CLOUD) {
    itemIcon = (
      <Box sx={cloudBadgeWrapperSx}>
        {itemIcon}
        <CloudLocationIcon
          data-tid="historyItemCloudBadgeTID"
          sx={cloudBadgeSx}
        />
      </Box>
    );
  }

  return (
    <QuickAccessRow
      icon={itemIcon}
      primary={itemName}
      // secondary={parentName}
      dataTid={historyKey + 'TID' + dataTidFormat(itemName)}
      onClick={() => onOpen(item as TS.HistoryItem)}
      actionVisible={menuVisible}
      action={
        showMenu && (
          <TsIconButton
            tooltip={t('options')}
            aria-label={t('options')}
            onClick={(e) => onMenuOpen(e, item)}
            data-tid={'historyItemMenuTID' + dataTidFormat(itemName)}
            size="small"
          >
            <MoreMenuIcon fontSize="small" />
          </TsIconButton>
        )
      }
      tooltip={
        <span>
          <b>{t('core:filePath')}:</b> {item.path}
          <br />
          {location && (
            <>
              <b>{t('core:location')}:</b> {location.name}
              <br />
            </>
          )}
          <b>{t('creationDate')}:&nbsp;</b>
          {new Date(item.creationTimeStamp)
            .toISOString()
            .substring(0, 19)
            .replace('T', ' ')}
        </span>
      }
    />
  );
});

interface Props {
  historyKey: string;
  items: Array<TS.HistoryItem> | Array<TS.BookmarkItem>;
  update: () => void;
  maxItems?: number;
  showMenu?: boolean;
}

function RenderHistory({
  historyKey,
  items,
  update,
  maxItems,
  showMenu = true,
}: Props) {
  const { t } = useTranslation();
  const { openHistoryItem } = useBrowserHistoryContext();
  const { delHistory } = useHistoryContext();
  const { locations } = useCurrentLocationContext();
  const bookmarksContext = Pro?.contextProviders?.BookmarksContext
    ? useContext<TS.BookmarksContextData>(Pro.contextProviders.BookmarksContext)
    : undefined;

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedItem, setSelectedItem] = useState<HistoryEntry | null>(null);

  const menuOpen = Boolean(anchorEl);

  const handleMenuOpen = useCallback(
    (event: React.MouseEvent<HTMLElement>, item: HistoryEntry) => {
      setAnchorEl(event.currentTarget);
      setSelectedItem(item);
    },
    [],
  );

  const handleMenuClose = useCallback(() => {
    setAnchorEl(null);
    setSelectedItem(null);
  }, []);

  const handleOpen = useCallback(() => {
    if (selectedItem) {
      openHistoryItem(selectedItem as TS.HistoryItem);
    }
    handleMenuClose();
  }, [selectedItem, openHistoryItem, handleMenuClose]);

  const handleOpenInNewWindow = useCallback(async () => {
    if (!selectedItem) {
      handleMenuClose();
      return;
    }
    try {
      let newInstanceLink = window.location.href.split('?')[0];
      const queryIndex = selectedItem.url.indexOf('?');
      if (queryIndex !== -1) {
        newInstanceLink += selectedItem.url.substring(queryIndex);
      }
      createNewInstance(newInstanceLink);
    } catch (err) {
      console.error('Open in new window failed', err);
    } finally {
      handleMenuClose();
    }
  }, [selectedItem, handleMenuClose]);

  const handleCopyLink = useCallback(async () => {
    if (!selectedItem) {
      handleMenuClose();
      return;
    }
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(selectedItem.url);
      }
    } catch (err) {
      console.error('Copy failed', err);
    } finally {
      handleMenuClose();
    }
  }, [selectedItem, handleMenuClose]);

  const handleRemove = useCallback(() => {
    if (!selectedItem) {
      handleMenuClose();
      return;
    }
    if (historyKey === Pro?.keys.bookmarksKey) {
      bookmarksContext?.delBookmark(selectedItem.path);
    } else {
      delHistory(historyKey, selectedItem.creationTimeStamp);
    }
    update();
    handleMenuClose();
  }, [
    selectedItem,
    historyKey,
    bookmarksContext,
    delHistory,
    update,
    handleMenuClose,
  ]);

  // Keyed on the locations array instead of findLocation: the location
  // context changes for unrelated reasons (e.g. a location menu opening),
  // which would otherwise hand every row a new location and re-render it.
  // Items without a location id get no location, as findLocation would fall
  // back to the current one.
  const locationsById = useMemo(() => {
    const map = new Map<string, CommonLocation>();
    locations?.forEach((location) => map.set(location.uuid, location));
    return map;
  }, [locations]);

  const displayedItems = useMemo(
    () => items?.slice(0, maxItems ?? items.length) ?? [],
    [items, maxItems],
  );

  return (
    <>
      {displayedItems.map((item) => {
        const lid = getItemLocationId(item);
        return (
          <HistoryRow
            key={item.creationTimeStamp}
            item={item}
            historyKey={historyKey}
            location={lid ? locationsById.get(lid) : undefined}
            showMenu={showMenu}
            menuVisible={selectedItem === item}
            onOpen={openHistoryItem}
            onMenuOpen={handleMenuOpen}
          />
        );
      })}

      <Menu
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <TsMenuList>
          <MenuItem onClick={handleOpen} data-tid="historyMenuOpen">
            <ListItemIcon>
              <OpenFileIcon />
            </ListItemIcon>
            <ListItemText primary={t('openEntry')} />
          </MenuItem>
          <MenuItem
            onClick={handleOpenInNewWindow}
            data-tid="historyMenuOpenNewWindow"
          >
            <ListItemIcon>
              <OpenNewWindowIcon />
            </ListItemIcon>
            <ListItemText primary={t('openInWindow')} />
          </MenuItem>
          <MenuItem onClick={handleCopyLink} data-tid="historyMenuCopyLink">
            <ListItemIcon>
              <CopyToClipboardIcon />
            </ListItemIcon>
            <ListItemText primary={t('copyLinkToClipboard')} />
          </MenuItem>
          <MenuItem onClick={handleRemove} data-tid="historyMenuRemove">
            <ListItemIcon>
              <RemoveIcon />
            </ListItemIcon>
            <ListItemText primary={t('remove')} />
          </MenuItem>
        </TsMenuList>
      </Menu>
    </>
  );
}

export default React.memo(RenderHistory);

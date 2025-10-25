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
  CopyToClipboardIcon,
  EntryBookmarkIcon,
  HistoryIcon,
  MoreMenuIcon,
  OpenFileIcon,
  OpenNewWindowIcon,
  RemoveIcon,
} from '-/components/CommonIcons';
import TsButton from '-/components/TsButton';
import TsIconButton from '-/components/TsIconButton';
import { useBrowserHistoryContext } from '-/hooks/useBrowserHistoryContext';
import { useHistoryContext } from '-/hooks/useHistoryContext';
import { Pro } from '-/pro';
import { dataTidFormat } from '-/services/test';
import { createNewInstance } from '-/services/utils-io';
import { TS } from '-/tagspaces.namespace';
import { Box } from '@mui/material';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import {
  extractDirectoryName,
  extractFileName,
} from '@tagspaces/tagspaces-common/paths';
import React, { useCallback, useContext, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import TooltipTS from './Tooltip';
import TsMenuList from './TsMenuList';

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
  const bookmarksContext = Pro?.contextProviders?.BookmarksContext
    ? useContext<TS.BookmarksContextData>(Pro.contextProviders.BookmarksContext)
    : undefined;

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedItem, setSelectedItem] = useState<
    TS.HistoryItem | TS.BookmarkItem | null
  >(null);

  const menuOpen = Boolean(anchorEl);

  const handleMenuOpen = useCallback(
    (
      event: React.MouseEvent<HTMLElement>,
      item: TS.HistoryItem | TS.BookmarkItem,
    ) => {
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

  // Memoize the sliced items for performance
  const displayedItems = useMemo(
    () => items?.slice(0, maxItems ?? items.length) ?? [],
    [items, maxItems],
  );

  return (
    <>
      {displayedItems.map((item) => {
        const itemName = item.path.endsWith(AppConfig.dirSeparator)
          ? extractDirectoryName(item.path, AppConfig.dirSeparator)
          : extractFileName(item.path, AppConfig.dirSeparator);
        return (
          <ListItem
            dense
            sx={{ paddingLeft: 0, height: 40 }}
            key={item.creationTimeStamp}
          >
            <TsButton
              data-tid={historyKey + 'TID' + dataTidFormat(itemName)}
              variant="text"
              sx={{
                textTransform: 'none',
                fontWeight: 'normal',
                justifyContent: 'start',
                minWidth: 260,
                maxWidth: 260,
              }}
              onClick={() => openHistoryItem(item as TS.HistoryItem)}
            >
              <TooltipTS
                title={
                  <span>
                    <b>{t('core:filePath')}:</b> {item.path}
                    <br />
                    <br />
                    <b>{t('dateCreatedSearchTitle')}:&nbsp;</b>
                    {new Date(item.creationTimeStamp)
                      .toISOString()
                      .substring(0, 19)
                      .replace('T', ' ')}
                  </span>
                }
              >
                {historyKey === Pro?.keys.bookmarksKey ? (
                  <EntryBookmarkIcon />
                ) : (
                  <HistoryIcon />
                )}
              </TooltipTS>
              <TooltipTS title={itemName}>
                <Box
                  sx={{
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                    maxWidth: 220,
                    marginLeft: '5px',
                  }}
                >
                  {itemName}
                </Box>
              </TooltipTS>
            </TsButton>
            {showMenu && (
              <TsIconButton
                tooltip={t('options')}
                aria-label={t('options')}
                onClick={(e) => handleMenuOpen(e, item)}
                data-tid={'historyItemMenuTID' + dataTidFormat(itemName)}
                size="small"
              >
                <MoreMenuIcon />
              </TsIconButton>
            )}
          </ListItem>
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

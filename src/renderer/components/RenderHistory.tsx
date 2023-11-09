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

import { TS } from '-/tagspaces.namespace';
import Grid from '@mui/material/Grid';
import React from 'react';
import Button from '@mui/material/Button';
import ListItem from '@mui/material/ListItem';
import PlatformIO from '-/services/platform-facade';
import { Tooltip } from '@mui/material';
import { Pro } from '-/pro';
import BookmarkTwoToneIcon from '@mui/icons-material/BookmarkTwoTone';
import {
  extractDirectoryName,
  extractFileName,
} from '@tagspaces/tagspaces-common/paths';
import IconButton from '@mui/material/IconButton';
import { RemoveIcon, HistoryIcon } from '-/components/CommonIcons';
import { dataTidFormat } from '-/services/test';
import { useTranslation } from 'react-i18next';
import { useOpenedEntryContext } from '-/hooks/useOpenedEntryContext';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';

interface Props {
  historyKey: string;
  items: Array<TS.HistoryItem> | Array<TS.BookmarkItem>;
  update: () => void;
  maxItems?: number | undefined;
  showDelete?: boolean;
}
function RenderHistory(props: Props) {
  const { t } = useTranslation();
  // const dispatch: AppDispatch = useDispatch();
  const { openEntry, openLink } = useOpenedEntryContext();
  const { openLocationById, currentLocation } = useCurrentLocationContext();
  const { historyKey, items, update, maxItems, showDelete = true } = props;

  const openLinkDispatch = (link) => openLink(link, { fullWidth: false });

  return (
    <>
      {items &&
        items.slice(0, maxItems || items.length).map((item) => {
          const itemName = item.path.endsWith(PlatformIO.getDirSeparator())
            ? extractDirectoryName(item.path, PlatformIO.getDirSeparator())
            : extractFileName(item.path, PlatformIO.getDirSeparator());
          return (
            <ListItem
              dense
              style={{ paddingLeft: 0 }}
              key={item.creationTimeStamp}
            >
              <Grid item xs={10} style={{ minWidth: 245, maxWidth: 245 }}>
                <Button
                  data-tid={historyKey + 'TID' + dataTidFormat(itemName)}
                  style={{
                    textTransform: 'none',
                    fontWeight: 'normal',
                    justifyContent: 'start',
                  }}
                  onClick={() =>
                    Pro.history.openItem(
                      item,
                      currentLocation && currentLocation.uuid,
                      openLinkDispatch,
                      openLocationById,
                      openEntry,
                    )
                  }
                >
                  <Tooltip
                    title={
                      <span style={{ fontSize: 14 }}>
                        <b>{t('core:filePath')}:</b> {item.path}
                        <br />
                        <br />
                        {/* <b>Opened on: </b>{' '} */}
                        {new Date(item.creationTimeStamp)
                          .toISOString()
                          .substring(0, 19)
                          .split('T')
                          .join(' ')}
                      </span>
                    }
                  >
                    {historyKey === Pro.bookmarks.bookmarksKey ? (
                      <BookmarkTwoToneIcon fontSize="small" />
                    ) : (
                      <HistoryIcon fontSize="small" />
                    )}
                  </Tooltip>
                  &nbsp;
                  <span
                    style={{
                      whiteSpace: 'nowrap',
                      textOverflow: 'ellipsis',
                      overflow: 'hidden',
                      maxWidth: 220,
                    }}
                  >
                    {itemName}
                  </span>
                </Button>
              </Grid>
              {showDelete && (
                <Grid item xs={2}>
                  <IconButton
                    aria-label={t('core:clearHistory')}
                    onClick={() => {
                      Pro.history.delItem(item, historyKey);
                      update();
                    }}
                    data-tid="deleteHistoryItemTID"
                    size="small"
                  >
                    <RemoveIcon />
                  </IconButton>
                </Grid>
              )}
            </ListItem>
          );
        })}
    </>
  );
}

export default RenderHistory;

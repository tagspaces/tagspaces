import { TS } from '-/tagspaces.namespace';
import Grid from '@mui/material/Grid';
import React from 'react';
import Button from '@mui/material/Button';
import PlatformIO from '-/services/platform-facade';
import { Tooltip } from '@mui/material';
import i18n from '-/services/i18n';
import { Pro } from '-/pro';
import BookmarkTwoToneIcon from '@mui/icons-material/BookmarkTwoTone';
import HistoryIcon from '@mui/icons-material/ChangeHistoryTwoTone';
import {
  extractDirectoryName,
  extractFileName
} from '@tagspaces/tagspaces-platforms/paths';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/RemoveCircleOutline';

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

export const renderHistory = (
  key: string,
  items: Array<TS.HistoryItem> | Array<TS.BookmarkItem>,
  openItem: (item: TS.HistoryItem) => void,
  delItem: (item: TS.HistoryItem, key: string) => void
) => (
  <Grid container direction="row">
    {items &&
      items.map(item => (
        <React.Fragment key={item.creationTimeStamp}>
          <Grid item xs={10} style={{ display: 'flex' }}>
            <Button
              style={{
                textTransform: 'none',
                fontWeight: 'normal',
                width: '240px',
                justifyContent: 'start',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
                overflow: 'hidden'
              }}
              onClick={() => openItem(item)}
            >
              <Tooltip
                title={
                  <span style={{ fontSize: 14 }}>
                    <b>{i18n.t('core:filePath')}:</b> {item.path}
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
                {key === Pro.bookmarks.bookmarksKey ? (
                  <BookmarkTwoToneIcon fontSize="small" />
                ) : (
                  <HistoryIcon fontSize="small" />
                )}
              </Tooltip>
              &nbsp;
              {item.path.endsWith(PlatformIO.getDirSeparator())
                ? extractDirectoryName(item.path, PlatformIO.getDirSeparator())
                : extractFileName(item.path, PlatformIO.getDirSeparator())}
            </Button>
          </Grid>
          <Grid item xs={2} style={{ display: 'flex' }}>
            <IconButton
              aria-label={i18n.t('core:clearHistory')}
              onClick={() => delItem(item, key)}
              data-tid="editSearchTID"
              size="small"
            >
              <DeleteIcon />
            </IconButton>
          </Grid>
        </React.Fragment>
      ))}
  </Grid>
);

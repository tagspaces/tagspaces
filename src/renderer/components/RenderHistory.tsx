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
import { HistoryIcon, RemoveIcon } from '-/components/CommonIcons';
import TsButton from '-/components/TsButton';
import TsIconButton from '-/components/TsIconButton';
import { useBrowserHistoryContext } from '-/hooks/useBrowserHistoryContext';
import { Pro } from '-/pro';
import { dataTidFormat } from '-/services/test';
import { TS } from '-/tagspaces.namespace';
import BookmarkTwoToneIcon from '@mui/icons-material/BookmarkTwoTone';
import { Tooltip } from '@mui/material';
import ListItem from '@mui/material/ListItem';
import {
  extractDirectoryName,
  extractFileName,
} from '@tagspaces/tagspaces-common/paths';
import { useContext } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  historyKey: string;
  items: Array<TS.HistoryItem> | Array<TS.BookmarkItem>;
  update: () => void;
  maxItems?: number | undefined;
  showDelete?: boolean;
}
function RenderHistory(props: Props) {
  const { t } = useTranslation();
  const { openHistoryItem } = useBrowserHistoryContext();
  const bookmarksContext = Pro?.contextProviders?.BookmarksContext
    ? useContext<TS.BookmarksContextData>(Pro.contextProviders.BookmarksContext)
    : undefined;
  const historyContext = Pro?.contextProviders?.HistoryContext
    ? useContext<TS.HistoryContextData>(Pro.contextProviders.HistoryContext)
    : undefined;
  const { historyKey, items, update, maxItems, showDelete = true } = props;

  return (
    <>
      {items &&
        items.slice(0, maxItems || items.length).map((item) => {
          const itemName = item.path.endsWith(AppConfig.dirSeparator)
            ? extractDirectoryName(item.path, AppConfig.dirSeparator)
            : extractFileName(item.path, AppConfig.dirSeparator);
          return (
            <ListItem
              dense
              style={{ paddingLeft: 0 }}
              key={item.creationTimeStamp}
            >
              <TsButton
                data-tid={historyKey + 'TID' + dataTidFormat(itemName)}
                variant="text"
                style={{
                  textTransform: 'none',
                  fontWeight: 'normal',
                  justifyContent: 'start',
                  minWidth: 245,
                  maxWidth: 245,
                }}
                onClick={() => openHistoryItem(item as TS.HistoryItem)}
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
                  {historyKey === Pro.keys.bookmarksKey ? (
                    <BookmarkTwoToneIcon />
                  ) : (
                    <HistoryIcon />
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
              </TsButton>
              {showDelete && (
                <TsIconButton
                  tooltip={t('delete')}
                  aria-label={t('core:clearHistory')}
                  onClick={() => {
                    if (historyKey === Pro.keys.bookmarksKey) {
                      //del bookmarks
                      bookmarksContext.delBookmark(item.path);
                    } else {
                      historyContext.delHistory(
                        historyKey,
                        item.creationTimeStamp,
                      );
                    }
                    update();
                  }}
                  data-tid="deleteHistoryItemTID"
                >
                  <RemoveIcon />
                </TsIconButton>
              )}
            </ListItem>
          );
        })}
    </>
  );
}

export default RenderHistory;

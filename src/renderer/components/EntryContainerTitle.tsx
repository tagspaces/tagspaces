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
  ArrowBackIcon,
  EncryptedIcon,
  EntryBookmarkAddIcon,
  EntryBookmarkIcon,
  FolderIcon,
  MoreMenuIcon,
} from '-/components/CommonIcons';
import EntryContainerMenu from '-/components/EntryContainerMenu';
import FileExtBadge from '-/components/FileExtBadge';
import { ProTooltip } from '-/components/HelperComponents';
import TagsPreview from '-/components/TagsPreview';
import Tooltip from '-/components/Tooltip';
import TsIconButton from '-/components/TsIconButton';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import { useNotificationContext } from '-/hooks/useNotificationContext';
import { useOpenedEntryContext } from '-/hooks/useOpenedEntryContext';
import { Pro } from '-/pro';
import { getSupportedFileTypes, getTagDelimiter } from '-/reducers/settings';
import { dataTidFormat } from '-/services/test';
import { findColorForEntry, getAllTags } from '-/services/utils-io';
import { TS } from '-/tagspaces.namespace';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import {
  extractDirectoryName,
  extractFileExtension,
  extractFileName,
  extractTitle,
} from '@tagspaces/tagspaces-common/paths';
import React, { useContext, useReducer } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

interface Props {
  reloadDocument: () => void;
  startClosingEntry: (event) => void;
  isEntryInFullWidth: boolean;
  desktopMode: boolean;
  smallScreen: boolean;
  fileViewerContainer: HTMLDivElement;
}

function EntryContainerTitle(props: Props) {
  const {
    reloadDocument,
    startClosingEntry,
    isEntryInFullWidth,
    desktopMode,
    smallScreen,
    fileViewerContainer,
  } = props;
  const { t } = useTranslation();
  const theme = useTheme();
  const { openedEntry, sharingLink, fileChanged } = useOpenedEntryContext();
  const { findLocation } = useCurrentLocationContext();
  const { showNotification } = useNotificationContext();
  //const locations = useSelector(getLocations);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [ignored, forceUpdate] = useReducer((x) => x + 1, 0, undefined);
  const supportedFileTypes = useSelector(getSupportedFileTypes);
  const tagDelimiter: string = useSelector(getTagDelimiter);
  const fileSystemEntryColor = findColorForEntry(
    openedEntry,
    supportedFileTypes,
  );
  const bookmarksContext = Pro?.contextProviders?.BookmarksContext
    ? useContext<TS.BookmarksContextData>(Pro.contextProviders.BookmarksContext)
    : undefined;

  const bookmarkClick = () => {
    if (Pro && bookmarksContext) {
      if (bookmarksContext.haveBookmark(openedEntry.path)) {
        bookmarksContext.delBookmark(openedEntry.path);
      } else {
        bookmarksContext.setBookmark(openedEntry.path, sharingLink);
      }
      forceUpdate();
    } else {
      showNotification(
        t('core:toggleBookmark') +
          ' - ' +
          t('thisFunctionalityIsAvailableInPro'),
      );
    }
  };

  const currentLocation = findLocation(openedEntry.locationID);
  let fileTitle: string = openedEntry.path
    ? extractTitle(
        openedEntry.path,
        !openedEntry.isFile,
        currentLocation?.getDirSeparator(),
      )
    : '';

  let fileName: string;
  if (openedEntry.path) {
    if (openedEntry.isFile) {
      fileName = extractFileName(
        openedEntry.path,
        currentLocation?.getDirSeparator(),
      );
    } else {
      fileName = extractDirectoryName(
        openedEntry.path,
        currentLocation?.getDirSeparator(),
      );
    }
  }
  if (!fileName) {
    if (currentLocation) {
      fileName = currentLocation.name;
    }
  }

  const addMacMargin =
    AppConfig.isMacLike && desktopMode && (smallScreen || isEntryInFullWidth);

  const rightMargin = smallScreen ? '35px' : '70px';

  return (
    <Box
      sx={
        {
          paddingLeft: '5px',
          display: 'flex',
          alignItems: 'center',
          marginRight: openedEntry.isFile ? rightMargin : 0,
          flexDirection: 'row',
          flex: '1 1',
          overflowX: 'auto',
          overflowY: 'hidden',
          marginLeft: addMacMargin ? '60px' : 0,
          WebkitAppRegion: 'drag',
        } as React.CSSProperties
      }
    >
      {smallScreen && (
        <TsIconButton
          title={t('closeButtonDialog')}
          aria-label="close"
          tabIndex={-1}
          sx={
            {
              WebkitAppRegion: 'no-drag',
            } as React.CSSProperties & { WebkitAppRegion?: string }
          }
          data-tid="fileContainerCloseOpenedFile"
          onClick={startClosingEntry}
        >
          <ArrowBackIcon />
        </TsIconButton>
      )}
      {openedEntry.isFile ? (
        <>
          {fileChanged ? (
            <Tooltip title={t('core:fileChanged')}>
              <Box
                style={{
                  color: theme.palette.text.primary,
                  margin: '3px',
                }}
              >
                {String.fromCharCode(0x25cf)}
              </Box>
            </Tooltip>
          ) : (
            ''
          )}
          <FileExtBadge
            title={t('core:toggleEntryProperties')}
            data-tid="propsActionsMenuTID"
            aria-controls={Boolean(anchorEl) ? 'basic-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={Boolean(anchorEl) ? 'true' : undefined}
            onClick={(event: React.MouseEvent<HTMLElement>) => {
              setAnchorEl(event.currentTarget);
            }}
            sx={
              {
                backgroundColor: fileSystemEntryColor,
                paddingLeft: '10px',
                WebkitAppRegion: 'no-drag',
              } as React.CSSProperties & { WebkitAppRegion?: string }
            }
          >
            {
              //'.' +
              extractFileExtension(
                openedEntry.path,
                currentLocation?.getDirSeparator(),
              )
            }
            <MoreMenuIcon sx={{ fontSize: '20px' }} />
          </FileExtBadge>
        </>
      ) : (
        <FileExtBadge
          title={t('core:toggleEntryProperties')}
          data-tid="propsActionsMenuTID"
          aria-controls={Boolean(anchorEl) ? 'basic-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={Boolean(anchorEl) ? 'true' : undefined}
          onClick={(event: React.MouseEvent<HTMLElement>) => {
            setAnchorEl(event.currentTarget);
          }}
          sx={
            {
              backgroundColor: AppConfig.defaultFolderColor,
              paddingLeft: '10px',
              WebkitAppRegion: 'no-drag',
            } as React.CSSProperties & { WebkitAppRegion?: string }
          }
        >
          <FolderIcon sx={{ fontSize: '20px' }} />
          <MoreMenuIcon sx={{ fontSize: '20px' }} />
        </FileExtBadge>
      )}
      <Tooltip title={openedEntry.isFile && fileName}>
        <Box
          data-tid={'OpenedTID' + dataTidFormat(fileName)}
          style={{
            color: theme.palette.text.primary,
            display: 'inline',
            fontSize: 17,
            marginLeft: 5,
            maxHeight: 40,
            overflowY: 'auto',
            overflowX: 'hidden',
          }}
        >
          {fileTitle}
        </Box>
      </Tooltip>
      <ProTooltip tooltip={t('core:toggleBookmark')}>
        <TsIconButton
          data-tid="toggleBookmarkTID"
          aria-label="bookmark"
          onClick={bookmarkClick}
          sx={
            {
              WebkitAppRegion: 'no-drag',
            } as React.CSSProperties & { WebkitAppRegion?: string }
          }
        >
          {bookmarksContext &&
          bookmarksContext.haveBookmark(openedEntry.path) ? (
            <EntryBookmarkIcon
              sx={{
                color: 'primary.main',
              }}
            />
          ) : (
            <EntryBookmarkAddIcon
              sx={{
                color: 'text.secondary',
              }}
            />
          )}
        </TsIconButton>
      </ProTooltip>
      <TagsPreview tags={getAllTags(openedEntry, tagDelimiter)} />
      {openedEntry.isEncrypted && (
        <Tooltip title={t('core:encryptedTooltip')}>
          <EncryptedIcon
            sx={{
              color: 'primary.main',
            }}
          />
        </Tooltip>
      )}
      <EntryContainerMenu
        anchorEl={anchorEl}
        startClosingEntry={startClosingEntry}
        handleClose={() => setAnchorEl(null)}
        reloadDocument={reloadDocument}
        fileViewerContainer={fileViewerContainer}
      />
    </Box>
  );
}

export default EntryContainerTitle;

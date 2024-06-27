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

import React, { MutableRefObject, useEffect } from 'react';
import { rgbToHex, useTheme } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import useEventListener from '-/utils/useEventListener';
import { useTranslation } from 'react-i18next';
import { useDirectoryContentContext } from '-/hooks/useDirectoryContentContext';
import { useOpenedEntryContext } from '-/hooks/useOpenedEntryContext';
import { useFilePropertiesContext } from '-/hooks/useFilePropertiesContext';
import AppConfig from '-/AppConfig';
import { actions as SettingsActions } from '-/reducers/settings';

interface Props {
  isFullscreen?: boolean;
  fileViewer: MutableRefObject<HTMLIFrameElement>;
  fileViewerContainer: MutableRefObject<HTMLDivElement>;
  toggleFullScreen?: () => void;
  height?: string;
  eventID: string;
}

function FileView(props: Props) {
  const { i18n } = useTranslation();
  const theme = useTheme();
  const { openedEntry } = useOpenedEntryContext();
  const { isEditMode } = useFilePropertiesContext();
  const {
    fileViewer,
    isFullscreen,
    fileViewerContainer,
    toggleFullScreen,
    height,
    eventID,
  } = props;

  const { searchQuery } = useDirectoryContentContext();

  useEffect(() => {
    if (AppConfig.isElectron) {
      window.electronIO.ipcRenderer.on('cmd', (arg) => {
        if (arg === 'play-pause') {
          // @ts-ignore
          fileViewer?.current?.contentWindow?.togglePlay();
        }
      });

      return () => {
        if (window.electronIO.ipcRenderer) {
          window.electronIO.ipcRenderer.removeAllListeners('cmd');
        }
      };
    }
  }, []);

  function getFileOpenerURL(): string {
    if (openedEntry && openedEntry.path) {
      // if (fileTitle.length > maxCharactersTitleLength) {
      //   fileTitle = fileTitle.substr(0, maxCharactersTitleLength) + '...';
      // }

      const textColor = theme.palette.text.primary;
      const primaryColor = theme.palette.primary.main;
      const bgndColor = theme.palette.background.default;

      const extPrimaryColor =
        '&primecolor=' +
        encodeURIComponent(
          primaryColor.startsWith('#') ? primaryColor : rgbToHex(primaryColor),
        );
      const extTextColor =
        '&textcolor=' +
        encodeURIComponent(
          textColor.startsWith('#') ? textColor : rgbToHex(textColor),
        );
      const extBgndColor =
        '&bgndcolor=' +
        encodeURIComponent(
          bgndColor.startsWith('#') ? bgndColor : rgbToHex(bgndColor),
        );

      const event = eventID ? '&eventID=' + eventID : '';
      const extQuery = searchQuery.textQuery
        ? '&query=' + encodeURIComponent(searchQuery.textQuery)
        : '';
      const locale = '&locale=' + i18n.language;
      const theming =
        '&theme=' +
        theme.palette.mode +
        extPrimaryColor +
        extTextColor +
        extBgndColor;

      if (isEditMode && openedEntry.editingExtensionPath) {
        return (
          openedEntry.editingExtensionPath +
          '/index.html?file=' +
          encodeURIComponent(
            openedEntry.url ? openedEntry.url : openedEntry.path,
          ) +
          locale +
          theming +
          extQuery +
          event +
          '&edit=true'
          // '&t=' + openedEntry.lmdt
        );
      } else {
        return (
          openedEntry.viewingExtensionPath +
          '/index.html?file=' +
          encodeURIComponent(
            openedEntry.url ? openedEntry.url : openedEntry.path,
          ) +
          locale +
          theming +
          extQuery +
          event +
          '&t=' +
          openedEntry.lmdt
        );
      }
    }
    return 'about:blank';
  }

  return (
    <div
      ref={fileViewerContainer}
      style={{
        width: '100%',
        height: height || '100%',
        display: 'flex',
        flex: '1 1 100%',
        backgroundColor: theme.palette.background.default,
      }}
    >
      {isFullscreen && (
        <div
          data-tid="fullscreenTID"
          style={{
            position: 'absolute',
            textAlign: 'center',
            top: 20,
            right: 20,
            zIndex: 10000,
            color: theme.palette.primary.main,
          }}
          onClick={toggleFullScreen}
        >
          <CloseIcon />
          <br />
          <span>ESC</span>
        </div>
      )}
      {openedEntry.isFile && (
        <iframe
          ref={fileViewer}
          style={{
            width: '100%',
            height: '100%',
            zIndex: 3,
            border: 0,
          }}
          allow="clipboard-write *"
          src={getFileOpenerURL() /*fileOpenerURL.current*/}
          allowFullScreen
          sandbox="allow-same-origin allow-scripts allow-modals allow-downloads"
          id={'FileViewer' + eventID}
        />
      )}
    </div>
  );
}

export default FileView;

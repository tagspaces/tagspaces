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
import { CloseIcon } from '-/components/CommonIcons';
import { useResolveConflictContext } from '-/components/dialogs/hooks/useResolveConflictContext';
import { useDirectoryContentContext } from '-/hooks/useDirectoryContentContext';
import { useFilePropertiesContext } from '-/hooks/useFilePropertiesContext';
import { useFullScreenContext } from '-/hooks/useFullScreenContext';
import { useOpenedEntryContext } from '-/hooks/useOpenedEntryContext';
import useEventListener from '-/utils/useEventListener';
import { rgbToHex, useTheme } from '@mui/material/styles';
import { getUuid } from '@tagspaces/tagspaces-common/utils-io';
import fscreen from 'fscreen';
import {
  MutableRefObject,
  useCallback,
  useEffect,
  useReducer,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';

interface Props {
  fileViewer: MutableRefObject<HTMLIFrameElement>;
  fileViewerContainer: MutableRefObject<HTMLDivElement>;
  handleMessage: (obj: any) => void;
  setSavingInProgress?: (isSaving: boolean) => void;
  height?: string;
}

function FileView(props: Props) {
  const { i18n } = useTranslation();
  const theme = useTheme();
  const { openedEntry, fileChanged, setFileChanged } = useOpenedEntryContext();
  const { saveFileOpen } = useResolveConflictContext();
  const { isEditMode } = useFilePropertiesContext();
  const { setFullscreen, isFullscreen, toggleFullScreen } =
    useFullScreenContext();
  const { searchQuery, isSearchMode } = useDirectoryContentContext();
  const { findLocation } = useCurrentLocationContext();
  const {
    fileViewer,
    fileViewerContainer,
    height,
    setSavingInProgress,
    handleMessage,
  } = props;

  const eventID = useRef<string>(getUuid());
  const [thumb, setThumb] = useState<string | null>(null);
  const [loadingThumb, setLoadingThumb] = useState(true);
  const [ignored, forceUpdate] = useReducer((x) => x + 1, 0, undefined);

  useEffect(() => {
    if (AppConfig.isElectron) {
      window.electronIO.ipcRenderer.on('play-pause', () => {
        // @ts-ignore
        fileViewer?.current?.contentWindow?.togglePlay();
      });

      return () => {
        if (window.electronIO.ipcRenderer) {
          window.electronIO.ipcRenderer.removeAllListeners('play-pause');
        }
      };
    }
    if (fscreen.fullscreenEnabled) {
      fscreen.addEventListener(
        'fullscreenchange',
        handleFullscreenChange,
        false,
      );
      fscreen.addEventListener('fullscreenerror', handleFullscreenError, false);
    }

    return () => {
      if (AppConfig.isElectron && window.electronIO.ipcRenderer) {
        window.electronIO.ipcRenderer.removeAllListeners('play-pause');
      }
      fscreen.removeEventListener('fullscreenchange', handleFullscreenChange);
      fscreen.removeEventListener('fullscreenerror', handleFullscreenError);
    };
  }, []);

  useEffect(() => {
    setLoadingThumb(true);
    const loc = findLocation(openedEntry.locationID);
    loc
      ?.getThumbPath(openedEntry.meta.thumbPath, openedEntry.meta.lastUpdated)
      .then((t) => {
        setThumb(t);
      })
      .finally(() => {
        setLoadingThumb(false);
      });
  }, [openedEntry]);

  const handleFullscreenChange = useCallback((e) => {
    let change = '';
    if (fscreen.fullscreenElement !== null) {
      change = 'Entered fullscreen mode';
      setFullscreen(true);
      if (
        fileViewer &&
        fileViewer.current &&
        fileViewer.current.contentWindow
      ) {
        try {
          // @ts-ignore
          fileViewer.current.contentWindow.enterFullscreen();
        } catch (ex) {
          console.log('err:', ex);
        }
      }
    } else {
      change = 'Exited fullscreen mode';
      setFullscreen(false);
      if (
        fileViewer &&
        fileViewer.current &&
        fileViewer.current.contentWindow
      ) {
        try {
          // @ts-ignore
          fileViewer.current.contentWindow.exitFullscreen();
        } catch (ex) {
          console.log('err:', ex);
        }
      }
    }
    console.log(change, e);
  }, []);

  const handleFullscreenError = useCallback((e) => {
    console.log('Fullscreen Error', e);
  }, []);

  useEventListener('message', (e) => {
    if (typeof e.data === 'string') {
      // console.log(e.data);
      try {
        const dataObj = JSON.parse(e.data);
        if (dataObj.eventID === eventID.current) {
          handleMessage(dataObj);
        }
      } catch (ex) {
        console.debug(
          'useEventListener message:' + e.data + ' parse error:',
          ex,
        );
      }
    }
  });

  const savingFile = (force = false) => {
    try {
      if (
        fileViewer &&
        fileViewer.current &&
        fileViewer.current.contentWindow &&
        // @ts-ignore
        fileViewer.current.contentWindow.getContent
      ) {
        // @ts-ignore
        const fileContent = fileViewer.current.contentWindow.getContent();
        //check if file is changed
        if (fileChanged || force) {
          setSavingInProgress(true);
          forceUpdate();
          saveFileOpen(openedEntry, fileContent).then((success) => {
            if (success) {
              setFileChanged(false);
              // showNotification(
              //   t('core:fileSavedSuccessfully'),
              //   NotificationTypes.default
              // );
            }
            // change state will not render DOT before file name too
            setSavingInProgress(false);
          });
        }
      }
    } catch (e) {
      setSavingInProgress(false);
      console.debug('function getContent not exist for file:', e);
    }
  };

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

      const event = eventID.current ? '&eventID=' + eventID.current : '';
      const extQuery =
        searchQuery.textQuery && isSearchMode
          ? '&query=' + encodeURIComponent(searchQuery.textQuery)
          : '';
      const locale = '&locale=' + i18n.language;

      const thumbParam = thumb ? '&thumb=' + encodeURIComponent(thumb) : '';
      const theming =
        '&theme=' +
        theme.palette.mode +
        extPrimaryColor +
        extTextColor +
        extBgndColor;

      const encrypted = openedEntry.isEncrypted ? '&encrypted=true' : '';
      const getParams =
        '/index.html?file=' +
        encodeURIComponent(
          openedEntry.url ? openedEntry.url : openedEntry.path,
        ) +
        thumbParam +
        locale +
        theming +
        extQuery +
        event +
        encrypted;

      if (isEditMode && openedEntry.editingExtensionPath) {
        return openedEntry.editingExtensionPath + getParams + '&edit=true';
      } else {
        return (
          openedEntry.viewingExtensionPath +
          getParams +
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
          onClick={() => toggleFullScreen(fileViewerContainer.current)}
        >
          <CloseIcon />
          <br />
          <span>ESC</span>
        </div>
      )}
      {openedEntry.isFile && !loadingThumb && (
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
          id={'FileViewer' + eventID.current}
        />
      )}
    </div>
  );
}

export default FileView;

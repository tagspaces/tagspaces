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
import { useDirectoryContentContext } from '-/hooks/useDirectoryContentContext';
import { useFilePropertiesContext } from '-/hooks/useFilePropertiesContext';
import { useFullScreenContext } from '-/hooks/useFullScreenContext';
import { useOpenedEntryContext } from '-/hooks/useOpenedEntryContext';
import { isDesktopMode } from '-/reducers/settings';
import { suspendContainingBlocks } from '-/utils/cssContainment';
import useEventListener from '-/utils/useEventListener';
import { Box } from '@mui/material';
import { rgbToHex, useTheme } from '@mui/material/styles';
import { getUuid } from '@tagspaces/tagspaces-common/utils-io';
import fscreen from 'fscreen';
import {
  MutableRefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

interface Props {
  fileViewer: MutableRefObject<HTMLIFrameElement>;
  fileViewerContainer: MutableRefObject<HTMLDivElement>;
  handleMessage: (obj: any) => void;
  height?: string;
}

function FileView(props: Props) {
  const { i18n } = useTranslation();
  const theme = useTheme();
  const desktopMode = useSelector(isDesktopMode);
  const { openedEntry } = useOpenedEntryContext();
  const { isEditMode } = useFilePropertiesContext();
  const { setFullscreen, isFullscreen, toggleFullScreen } =
    useFullScreenContext();
  const { searchQuery, isSearchMode } = useDirectoryContentContext();
  const { fileViewer, fileViewerContainer, height, handleMessage } = props;
  const eventID = useRef<string>(getUuid());

  useEffect(() => {
    if (AppConfig.isElectron) {
      window.electronIO.ipcRenderer.on('play-pause', () => {
        // @ts-ignore
        fileViewer?.current?.contentWindow?.togglePlay();
      });
    }
    // Track native fullscreen so `isFullscreen` (close/ESC button, viewer
    // enter/exitFullscreen notifications) follows enter AND exit — including
    // exits the browser performs itself (ESC key). Electron needs this too:
    // an early `return` here used to skip the registration in the desktop
    // app, leaving `isFullscreen` stuck on false so the close button never
    // appeared. iOS is excluded — it uses CSS fullscreen, which flips the
    // state directly without native fullscreen events.
    const useFscreen = !AppConfig.isIOS && fscreen.fullscreenEnabled;
    if (useFscreen) {
      fscreen.addEventListener(
        'fullscreenchange',
        handleFullscreenChange,
        false,
      );
      fscreen.addEventListener('fullscreenerror', handleFullscreenError, false);
    }

    return () => {
      if (AppConfig.isElectron && window.electronIO?.ipcRenderer) {
        window.electronIO.ipcRenderer.removeAllListeners('play-pause');
      }
      if (useFscreen) {
        fscreen.removeEventListener('fullscreenchange', handleFullscreenChange);
        fscreen.removeEventListener('fullscreenerror', handleFullscreenError);
      }
    };
  }, []);

  const handleFullscreenChange = useCallback((_e: Event) => {
    const entered = fscreen.fullscreenElement !== null;
    setFullscreen(entered);
    const contentWindow = fileViewer?.current?.contentWindow as any;
    if (contentWindow) {
      try {
        entered
          ? contentWindow.enterFullscreen()
          : contentWindow.exitFullscreen();
      } catch (ex) {
        console.debug('Fullscreen transition error:', ex);
      }
    }
  }, []);

  const handleFullscreenError = useCallback((e: Event) => {
    console.debug('Fullscreen Error', e);
  }, []);

  const handleWindowMessage = useCallback(
    (e: MessageEvent) => {
      // Security: reject messages from untrusted origins to prevent cross-origin injection
      const trusted =
        e.origin === window.location.origin || e.origin === 'null';
      if (!trusted) return;
      if (typeof e.data === 'string') {
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
    },
    [handleMessage],
  );

  useEventListener('message', handleWindowMessage);

  const fileOpenerURL: string = useMemo(() => {
    if (openedEntry && openedEntry.path) {
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

      const thumbParam = openedEntry?.meta?.thumbPath
        ? '&thumb=' + encodeURIComponent(openedEntry.meta.thumbPath)
        : '';
      const theming =
        '&theme=' +
        theme.palette.mode +
        extPrimaryColor +
        extTextColor +
        extBgndColor;

      const encrypted = openedEntry.isEncrypted ? '&encrypted=true' : '';
      // On Capacitor (iOS/Android) the WKWebView origin is capacitor:// (iOS)
      // or https://localhost (Android) and cannot read raw file:// resources
      // out of the sandbox — extensions trying `<img src="file://...">` get
      // "Not allowed to load local resource". Convert raw paths through
      // Capacitor.convertFileSrc() so the iframe receives a same-scheme URL
      // (capacitor://localhost/_capacitor_file_/... on iOS).
      let fileUrl = openedEntry.url ? openedEntry.url : openedEntry.path;
      if (AppConfig.isCapacitor && !/^[a-z][a-z0-9+\-.]*:\/\//i.test(fileUrl)) {
        const Cap = (window as any).Capacitor;
        if (Cap && Cap.convertFileSrc) {
          const abs = fileUrl.startsWith('/') ? fileUrl : '/' + fileUrl;
          fileUrl = Cap.convertFileSrc('file://' + abs);
        }
      }
      const getParams =
        '/index.html?file=' +
        encodeURIComponent(fileUrl) +
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
  }, [
    openedEntry?.lmdt,
    openedEntry?.path,
    isEditMode,
    theme.palette,
    searchQuery?.textQuery,
    isSearchMode,
  ]);

  // iOS uses CSS fullscreen (the native Fullscreen API leaves WKWebView with a
  // stale inset after exit). When fullscreen there, turn the container into a
  // fixed, full-viewport overlay above the app chrome instead of relying on the
  // :fullscreen pseudo-class. Other platforms use the real Fullscreen API.
  const cssFullscreen = isFullscreen && AppConfig.isCapacitoriOS;

  // While CSS-fullscreen is active, neutralize containing-block properties up
  // the ancestor chain so the fixed overlay fills the real viewport instead of
  // being trapped inside the file-view pane, and restore them on exit. (See
  // suspendContainingBlocks; portaling to <body> would escape the trap too,
  // but moving the iframe in the DOM reloads it and loses editor state.)
  useEffect(() => {
    if (!cssFullscreen) return undefined;
    return suspendContainingBlocks(fileViewerContainer.current?.parentElement);
  }, [cssFullscreen]);

  return (
    <Box
      ref={fileViewerContainer}
      sx={{
        width: '100%',
        height: height || '100%',
        display: 'flex',
        flex: '1 1 100%',
        backgroundColor: theme.palette.background.default,
        ...(cssFullscreen && {
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          height: '100%',
          zIndex: 5000,
        }),
      }}
    >
      {isFullscreen && (
        <Box
          data-tid="fullscreenTID"
          sx={{
            position: 'absolute',
            textAlign: 'center',
            top: '20px',
            right: '20px',
            zIndex: 10000,
            color: theme.palette.primary.main,
          }}
          onClick={() => toggleFullScreen(fileViewerContainer.current)}
        >
          <CloseIcon />
          {desktopMode && (
            <>
              <br />
              <span>ESC</span>
            </>
          )}
        </Box>
      )}
      {/* Note: allow-same-origin + allow-scripts is intentional — viewers are
          trusted same-origin extensions that require direct app access. */}
      <iframe
        ref={fileViewer}
        style={{
          width: '100%',
          height: '100%',
          zIndex: 3,
          border: 0,
        }}
        allow="clipboard-write 'src'; fullscreen 'src'; camera 'none'; microphone 'none'; geolocation 'none'; payment 'none'"
        referrerPolicy="no-referrer"
        src={fileOpenerURL}
        sandbox="allow-same-origin allow-scripts allow-modals allow-downloads"
        id={'FileViewer' + eventID.current}
      />
    </Box>
  );
}

export default FileView;

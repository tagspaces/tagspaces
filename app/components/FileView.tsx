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

import React, { MutableRefObject } from 'react';
import withStyles from '@mui/styles/withStyles';
import CloseIcon from '@mui/icons-material/Close';
import i18n from '-/services/i18n';
import { OpenedEntry } from '-/reducers/app';
import useEventListener from '-/utils/useEventListener';
import { connect } from 'react-redux';
import { getCurrentLanguage } from '-/reducers/settings';

interface Props {
  openedFile: OpenedEntry;
  isFullscreen: boolean;
  fileViewer: MutableRefObject<HTMLIFrameElement>;
  fileViewerContainer: MutableRefObject<HTMLDivElement>;
  toggleFullScreen: () => void;
  theme: any;
  currentTheme: string;
}

function FileView(props: Props) {
  const {
    openedFile,
    theme,
    fileViewer,
    isFullscreen,
    fileViewerContainer,
    toggleFullScreen,
    currentTheme
  } = props; // .openedFiles[0];

  useEventListener('toggle-resume', () => {
    if (
      fileViewer &&
      fileViewer.current &&
      fileViewer.current.contentWindow &&
      // @ts-ignore
      fileViewer.current.contentWindow.togglePlay
    ) {
      // @ts-ignore
      fileViewer.current.contentWindow.togglePlay();
    }
  });

  let fileOpenerURL: string;

  if (openedFile.path) {
    // if (fileTitle.length > maxCharactersTitleLength) {
    //   fileTitle = fileTitle.substr(0, maxCharactersTitleLength) + '...';
    // }

    const locale = '&locale=' + i18n.language;
    const theme = '&theme=' + currentTheme;

    if (openedFile.editMode && openedFile.editingExtensionPath) {
      fileOpenerURL =
        openedFile.editingExtensionPath +
        '/index.html?file=' +
        encodeURIComponent(openedFile.url ? openedFile.url : openedFile.path) +
        locale +
        theme +
        '&edit=true' +
        (openedFile.shouldReload === true ? '&t=' + new Date().getTime() : '');
      // } else if (!currentEntry.isFile) { // TODO needed for loading folder's default html
      //   fileOpenerURL = 'node_modules/@tagspaces/html-viewer/index.html?locale=' + i18n.language;
    } else {
      fileOpenerURL =
        openedFile.viewingExtensionPath +
        '/index.html?file=' +
        encodeURIComponent(openedFile.url ? openedFile.url : openedFile.path) +
        locale +
        theme +
        (openedFile.shouldReload === true ? '&t=' + new Date().getTime() : '');
    }
  } else {
    fileOpenerURL = 'about:blank';
  }
  return (
    <div
      ref={fileViewerContainer}
      style={{
        width: '100%',
        height: '100%',
        flex: '1 1 100%',
        display: 'flex',
        backgroundColor: theme.palette.background.default
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
            color: theme.palette.primary.main
          }}
          onClick={toggleFullScreen}
        >
          <CloseIcon />
          <br />
          <span>ESC</span>
        </div>
      )}
      {openedFile.isFile && (
        <iframe
          ref={fileViewer}
          style={{
            width: '100%',
            zIndex: 3,
            border: 0
          }}
          src={fileOpenerURL}
          allowFullScreen
          sandbox="allow-same-origin allow-scripts allow-modals allow-downloads"
          title={i18n.t('core:fileViewer')}
          id="FileViewer"
        />
      )}
    </div>
  );
}

const areEqual = (prevProp, nextProp) =>
  nextProp.language === prevProp.language &&
  nextProp.openedFile.path === prevProp.openedFile.path &&
  nextProp.openedFile.url === prevProp.openedFile.url &&
  nextProp.openedFile.editMode === prevProp.openedFile.editMode &&
  nextProp.openedFile.shouldReload === prevProp.openedFile.shouldReload &&
  nextProp.isFullscreen === prevProp.isFullscreen;
// nextProp.currentTheme === prevProp.currentTheme; // Commented due to reloading of the editors with changed content
/* ((nextProp.openedFile.editMode === undefined &&
    prevProp.openedFile.editMode === true) ||
    nextProp.openedFile.editMode === prevProp.openedFile.editMode); */

function mapStateToProps(state) {
  return { language: getCurrentLanguage(state) };
}

export default connect(mapStateToProps)(
  React.memo(withStyles(undefined, { withTheme: true })(FileView), areEqual)
);

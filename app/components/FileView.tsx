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
import { connect } from 'react-redux';

import Fab from '@material-ui/core/Fab';
import CloseIcon from '@material-ui/icons/Close';
import i18n from '-/services/i18n';
import { OpenedEntry } from '-/reducers/app';
import useEventListener from '-/utils/useEventListener';

interface Props {
  openedFile: OpenedEntry;
  fileContentClass: string;
  theme: string;
  isFullscreen: boolean;
  fileViewer: MutableRefObject<HTMLIFrameElement>;
  fileViewerContainer: MutableRefObject<HTMLDivElement>;
  toggleFullScreen: () => void;
}

const FileView = (props: Props) => {

  const { openedFile } = props; // .openedFiles[0];

  useEventListener('toggle-resume', () => {
    if (
      props.fileViewer &&
      props.fileViewer.current &&
      props.fileViewer.current.contentWindow &&
      // @ts-ignore
      props.fileViewer.current.contentWindow.togglePlay
    ) {
      // @ts-ignore
      props.fileViewer.current.contentWindow.togglePlay();
    }
  });

  let fileOpenerURL: string;

  if (openedFile.path) {
    // if (fileTitle.length > maxCharactersTitleLength) {
    //   fileTitle = fileTitle.substr(0, maxCharactersTitleLength) + '...';
    // }

    const locale = '&locale=' + i18n.language;
    const theme = '&theme=' + props.theme;

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
    <div ref={props.fileViewerContainer} className={props.fileContentClass}>
      {props.isFullscreen && (
        <Fab
          data-tid="fullscreenTID"
          color="primary"
          style={{
            position: 'absolute',
            top: 20,
            right: 20,
            zIndex: 10000
          }}
          onClick={props.toggleFullScreen}
        >
          <CloseIcon />
        </Fab>
      )}
      <iframe
        ref={props.fileViewer}
        style={{
          width: '100%',
          zIndex: 3,
          border: 0
        }}
        src={fileOpenerURL}
        allowFullScreen
        sandbox="allow-same-origin allow-scripts allow-modals"
        title={i18n.t('core:fileViewer')}
        id="FileViewer"
      />
    </div>
  );
};

function mapStateToProps(state) {
  return {
    theme: state.settings.currentTheme
  };
}
const areEqual = (prevProp, nextProp) =>
  nextProp.theme === prevProp.theme &&
  JSON.stringify(nextProp.openedFile) === JSON.stringify(prevProp.openedFile);

export default connect(mapStateToProps)(React.memo(FileView, areEqual));

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

import React, { MutableRefObject, useRef } from 'react';
import { getUuid } from '@tagspaces/tagspaces-common/utils-io';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import DialogCloseButton from '-/components/dialogs/DialogCloseButton';
import { extractContainingDirectoryPath } from '@tagspaces/tagspaces-common/paths';
import { actions as AppActions, OpenedEntry } from '-/reducers/app';
import { TS } from '-/tagspaces.namespace';
import { findExtensionsForEntry } from '-/services/utils-io';
import {
  getCurrentLanguage,
  getCurrentTheme,
  getSupportedFileTypes
} from '-/reducers/settings';
import { connect } from 'react-redux';
import i18n from '-/services/i18n';
import FileView from '-/components/FileView';
import useEventListener from '-/utils/useEventListener';
import PlatformIO from '-/services/platform-facade';
import AppConfig from '-/AppConfig';
import { bindActionCreators } from 'redux';
import { actions as LocationActions } from '-/reducers/locations';

interface Props {
  open: boolean;
  onClose: () => void;
  fsEntry: TS.FileSystemEntry;
  supportedFileTypes: Array<any>;
  currentTheme: string;
  switchCurrentLocationType: (currentLocationId) => Promise<boolean>;
  switchLocationType: (locationId: string) => Promise<string | null>;
}

function FilePreviewDialog(props: Props) {
  const { open = false, onClose, fsEntry } = props;
  // const [fileOpenerURL, setFileOpenerURL] = useState<string>('about:blank');
  const fileViewer: MutableRefObject<HTMLIFrameElement> = useRef<
    HTMLIFrameElement
  >(null);
  const fileViewerContainer: MutableRefObject<HTMLDivElement> = useRef<
    HTMLDivElement
  >(null);
  const eventID = useRef<string>(getUuid());

  const openedFile: OpenedEntry = fsEntry
    ? findExtensionsForEntry(
        fsEntry.uuid,
        props.supportedFileTypes,
        fsEntry.path,
        fsEntry.isFile
      )
    : undefined;

  useEventListener('message', e => {
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
          ex
        );
      }
    }
  });

  const handleMessage = (data: any) => {
    let message;
    let textFilePath;
    switch (
      data.command // todo use diff command
    ) {
      case 'loadDefaultTextContent':
        if (!openedFile || !openedFile.path) {
          // || openedFile.changed) {
          break;
        }
        textFilePath = openedFile.path;

        if (
          fileViewer &&
          fileViewer.current &&
          fileViewer.current.contentWindow &&
          // @ts-ignore
          fileViewer.current.contentWindow.setTheme
        ) {
          // @ts-ignore call setContent from iframe
          fileViewer.current.contentWindow.setTheme(props.currentTheme);
        }
        // TODO make loading index.html for folders configurable
        // if (!this.state.currentEntry.isFile) {
        //   textFilePath += '/index.html';
        // }
        props
          .switchLocationType(openedFile.locationId)
          .then(currentLocationId => {
            PlatformIO.loadTextFilePromise(
              textFilePath,
              data.preview ? data.preview : false
            )
              .then(content => {
                const UTF8_BOM = '\ufeff';
                if (content.indexOf(UTF8_BOM) === 0) {
                  // eslint-disable-next-line no-param-reassign
                  content = content.substr(1);
                }
                let fileDirectory = extractContainingDirectoryPath(
                  textFilePath,
                  PlatformIO.getDirSeparator()
                );
                if (AppConfig.isWeb) {
                  fileDirectory =
                    extractContainingDirectoryPath(
                      // eslint-disable-next-line no-restricted-globals
                      location.href,
                      PlatformIO.getDirSeparator()
                    ) +
                    '/' +
                    fileDirectory;
                }
                if (
                  fileViewer &&
                  fileViewer.current &&
                  fileViewer.current.contentWindow &&
                  // @ts-ignore
                  fileViewer.current.contentWindow.setContent
                ) {
                  // @ts-ignore call setContent from iframe
                  fileViewer.current.contentWindow.setContent(
                    content,
                    fileDirectory,
                    !openedFile.editMode
                  );
                }
                if (currentLocationId) {
                  return props.switchCurrentLocationType(currentLocationId);
                }
              })
              .catch(err => {
                console.warn('Error loading text content ' + err);
                if (currentLocationId) {
                  return props.switchCurrentLocationType(currentLocationId);
                }
              });
          });
        break;
    }
  };

  if (!fsEntry) {
    return null;
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      keepMounted
      scroll="paper"
      fullWidth
      maxWidth="md"
      PaperProps={{ sx: { width: '100%', height: '100%' } }}
      BackdropProps={{ style: { backgroundColor: 'transparent' } }}
    >
      <DialogTitle data-tid="importDialogTitle">
        {/*{i18n.t('core:importDialogTitle')}*/}
        <DialogCloseButton onClose={onClose} />
      </DialogTitle>
      <DialogContent
        style={{
          marginLeft: 'auto',
          marginRight: 'auto',
          overflowY: 'hidden',
          width: '90%',
          flexGrow: 1
        }}
      >
        <p>{props.fsEntry.path}</p>
        <FileView
          key="FileViewPreviewID"
          openedFile={openedFile}
          fileViewer={fileViewer}
          fileViewerContainer={fileViewerContainer}
          height={'90%'}
          currentTheme={props.currentTheme}
          eventID={eventID.current}
        />
      </DialogContent>
    </Dialog>
  );
}

function mapStateToProps(state) {
  return {
    language: getCurrentLanguage(state),
    supportedFileTypes: getSupportedFileTypes(state),
    currentTheme: getCurrentTheme(state)
  };
}

function mapActionCreatorsToProps(dispatch) {
  return bindActionCreators(
    {
      switchCurrentLocationType: AppActions.switchCurrentLocationType,
      switchLocationType: LocationActions.switchLocationType
    },
    dispatch
  );
}

export default connect(
  mapStateToProps,
  mapActionCreatorsToProps
  // @ts-ignore
)(FilePreviewDialog);

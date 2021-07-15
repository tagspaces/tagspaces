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

import React, { useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { GlobalHotKeys } from 'react-hotkeys';
import Button from '@material-ui/core/Button';
import Fab from '@material-ui/core/Fab';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import SaveIcon from '@material-ui/icons/Save';
import CloseIcon from '@material-ui/icons/Close';
import BackIcon from '@material-ui/icons/RemoveRedEye';
import FullScreenIcon from '@material-ui/icons/ZoomOutMap';
import OpenNativelyIcon from '@material-ui/icons/Launch';
import ArrowLeftIcon from '@material-ui/icons/KeyboardArrowLeft';
import ArrowRightIcon from '@material-ui/icons/KeyboardArrowRight';
import FileDownloadIcon from '@material-ui/icons/AssignmentReturned';
import DetailsIcon from '@material-ui/icons/Info';
import ExpandIcon from '@material-ui/icons/SettingsEthernet';
import SplitPane from 'react-split-pane';
import DeleteIcon from '@material-ui/icons/Delete';
import ShareIcon from '@material-ui/icons/Share';
import { withStyles } from '@material-ui/core/styles';
import RefreshIcon from '@material-ui/icons/Refresh';
import Box from '@material-ui/core/Box';
import EntryProperties from '-/components/EntryProperties';
import ConfirmDialog from '-/components/dialogs/ConfirmDialog';
import AppConfig from '-/config';
import PlatformIO from '-/services/platform-io';
import AddRemoveTagsDialog from '-/components/dialogs/AddRemoveTagsDialog';
import i18n from '-/services/i18n';
import {
  extractContainingDirectoryPath,
  extractTitle,
  extractFileExtension,
  baseName,
  extractFileName,
  extractDirectoryName
} from '-/utils/paths';
import { buffer } from '-/utils/misc';
import {
  actions as SettingsActions,
  isDesktopMode,
  getKeyBindingObject,
  getMapTileServer
} from '-/reducers/settings';
import TaggingActions from '-/reducers/tagging-actions';
import {
  OpenedEntry,
  NotificationTypes,
  isReadOnlyMode,
  actions as AppActions
} from '-/reducers/app';
import useEventListener from '-/utils/useEventListener';
import { TS } from '-/tagspaces.namespace';

const defaultSplitSize = 103;
const openedSplitSize = AppConfig.isElectron ? 560 : 360;
const fullSplitSize = 750;
// const maxCharactersTitleLength = 50;
const bufferedSplitResize = buffer({
  timeout: 300,
  id: 'buffered-split-resize'
});

const styles: any = (theme: any) => ({
  panel: {
    width: '100%',
    flexDirection: 'column',
    flex: '1 1 100%',
    display: 'flex',
    backgroundColor: theme.palette.background.default
  },
  fileContent: {
    width: '100%',
    flex: '1 1 100%',
    display: 'flex',
    backgroundColor: theme.palette.background.default
  },
  entryProperties: {
    display: 'inline',
    flex: '1 1 100%',
    backgroundColor: theme.palette.background.default,
    zIndex: 1,
    padding: '0 0 60px 0',
    height: '50%'
  },
  fileOpener: {
    width: '100%',
    zIndex: 3,
    border: 0
  },
  toolbar: {
    paddingLeft: 5,
    paddingRight: 5,
    paddingTop: 0,
    minHeight: 50,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start'
  },
  toolbar2: {
    width: '100%',
    paddingLeft: 5,
    paddingRight: 5,
    paddingTop: 5,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    zIndex: 2,
    borderBottom: '1px solid ' + theme.palette.divider,
    overflowX: AppConfig.isFirefox ? 'auto' : 'overlay'
  },
  flexLeft: {
    flexDirection: 'row',
    flex: '1 1',
    display: 'flex',
    overflowX: 'auto'
    // marginRight: 100
  },
  fileBadge: {
    color: 'white',
    backgroundColor: AppConfig.defaultFileColor,
    padding: '2px 5px 0px 5px',
    minHeight: 18,
    fontSize: 13,
    marginLeft: 3,
    marginTop: -2,
    borderRadius: 3
  },
  entryNameButton: {
    paddingTop: 1,
    paddingRight: 0,
    paddingLeft: 6,
    paddingBottom: 0,
    minWidth: 20,
    height: 44,
    justifyContent: 'unset',
    color: 'inherit !important',
    whiteSpace: 'nowrap'
  },
  entryCloseSection: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: theme.palette.background.default,
    boxShadow: '-15px 0px 24px 3px ' + theme.palette.background.default
  },
  entryNavigationSection: {
    position: 'absolute',
    top: 55,
    right: 0,
    backgroundColor: theme.palette.background.default,
    boxShadow: '-15px 0px 24px 3px ' + theme.palette.background.default
  }
});

interface Props {
  classes: any;
  theme: any;
  openedFiles: Array<OpenedEntry>;
  settings: any;
  keyBindings: any;
  closeAllFiles: () => void;
  renameFile: () => void;
  renameDirectory: () => void;
  addTags: () => void;
  removeTags: () => void;
  // editTagForEntry: () => void;
  openFsEntry: (fsEntry: TS.FileSystemEntry) => void;
  openPrevFile: (path: string) => void;
  openNextFile: (path: string) => void;
  openFileNatively: (path: string) => void;
  openLink: (url: string) => void;
  openDirectory: (path: string) => void;
  showNotification: (
    text: string,
    notificationType?: string, // NotificationTypes
    autohide?: boolean
  ) => void;
  removeAllTags: () => void;
  deleteFile: (path: string) => void;
  toggleEntryFullWidth: () => void;
  isReadOnlyMode: boolean;
  setEntryPropertiesSplitSize: (size: number) => void;
  entryPropertiesSplitSize?: number;
  updateOpenedFile: (
    entryPath: string,
    fsEntryMeta: any // FileSystemEntryMeta
  ) => void;
  // reflectUpdateSidecarMeta: (path: string, entryMeta: Object) => void;
  updateThumbnailUrl: (path: string, thumbUrl: string) => void;
  // setLastSelectedEntry: (path: string) => void;
  setSelectedEntries: (selectedEntries: Array<Object>) => void;
  currentDirectoryPath: string | null;
  isDesktopMode: boolean;
  tileServer: TS.MapTileServer;
}

const EntryContainer = (props: Props) => {
  const openedFile = props.openedFiles[0];
  // const [currentEntry, setCurrentEntry] = useState<OpenedEntry>(openedFile);

  const [isPropertiesPanelVisible, setPropertiesPanelVisible] = useState<
    boolean
  >(false);
  const [isFullscreen, setFullscreen] = useState<boolean>(false);
  // const [editingSupported, setEditingSupported] = useState<boolean>(true);
  const [
    isSaveBeforeCloseConfirmDialogOpened,
    setSaveBeforeCloseConfirmDialogOpened
  ] = useState<boolean>(false);
  const [
    isSaveBeforeReloadConfirmDialogOpened,
    setSaveBeforeReloadConfirmDialogOpened
  ] = useState<boolean>(false);
  const [isEditTagsModalOpened, setEditTagsModalOpened] = useState<boolean>(
    false
  );
  const [isDeleteEntryModalOpened, setDeleteEntryModalOpened] = useState<
    boolean
  >(false);
  // const [selectedItem, setSelectedItem] = useState<any>({});
  // const [shouldCopyFile, setShouldCopyFile] = useState<boolean>(false);
  // const entryPropertiesKey: string = uuidv1();

  const fileViewer = useRef<HTMLIFrameElement>(null);
  const fileViewerContainer = useRef<HTMLDivElement>(null);

  useEventListener('toggle-resume', () => {
    // if (AppConfig.isElectron && this.fileViewer) {
    //   this.fileViewer.executeJavaScript(
    //     'window.dispatchEvent(new Event("resume"));'
    //   );
    // } else
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

  useEventListener('message', e => {
    if (typeof e.data === 'string') {
      // console.log(e.data);
      try {
        const dataObj = JSON.parse(e.data);
        handleMessage(dataObj);
      } catch (ex) {
        console.debug(
          'useEventListener message:' + e.data + ' parse error:',
          ex
        );
      }
    }
  });

  useEffect(() => {
    if (props.openedFiles.length > 0) {
      // / setPropertiesPanelVisible
      /* if (!openedFile.isFile && !isPropertiesPanelVisible) {
        // always open for dirs
        setPropertiesPanelVisible(true);
      } */
      if (
        openedFile.editMode &&
        openedFile.changed &&
        openedFile.shouldReload === false
      ) {
        setSaveBeforeReloadConfirmDialogOpened(true);
      }
    }
  }, [props.openedFiles, props.isReadOnlyMode, props.settings]);

  /**
   *  always open for dirs
   */
  const isPropPanelVisible = openedFile.isFile
    ? isPropertiesPanelVisible
    : true;

  useEffect(() => {
    //  TODO rethink this
    if (props.settings.entryPropertiesSplitSize === defaultSplitSize) {
      props.setEntryPropertiesSplitSize(openedSplitSize);
    }
  }, [isPropertiesPanelVisible]);

  const editingSupported: boolean =
    !props.isReadOnlyMode &&
    openedFile.editingExtensionId !== undefined &&
    openedFile.editingExtensionId.length > 3;

  const handleMessage = (data: any) => {
    let message;
    let textFilePath;
    switch (data.command) {
      case 'showAlertDialog':
        message = data.title ? data.title : '';
        if (data.message) {
          message = message + ': ' + data.message;
        }
        props.showNotification(message, NotificationTypes.default);
        break;
      case 'saveDocument':
        startSavingFile();
        break;
      case 'editDocument':
        editFile();
        break;
      case 'playbackEnded':
        props.openNextFile(openedFile.path);
        break;
      case 'openLinkExternally':
        // console.log('Open link externally: ' + data.link);
        props.openLink(data.link);
        break;
      case 'loadDefaultTextContent':
        if (!openedFile || !openedFile.path) {
          // || openedFile.changed) {
          break;
        }
        textFilePath = openedFile.path;
        // TODO make loading index.html for folders configurable
        // if (!this.state.currentEntry.isFile) {
        //   textFilePath += '/index.html';
        // }
        PlatformIO.loadTextFilePromise(
          textFilePath,
          data.preview ? data.preview : false
        )
          .then(content => {
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
            // if (AppConfig.isElectron && this.fileViewer) {
            //   this.fileViewer.executeJavaScript(
            //     'setContent(' +
            //       JSON.stringify(content) +
            //       ',' +
            //       JSON.stringify(fileDirectory) +
            //       ',' +
            //       !this.state.currentEntry.editMode +
            //       ')',
            //     false
            //   );
            // } else
            if (
              fileViewer &&
              fileViewer.current &&
              fileViewer.current.contentWindow &&
              // @ts-ignore
              fileViewer.current.contentWindow.setContent
            ) {
              // @ts-ignore
              fileViewer.current.contentWindow.setContent(
                content,
                fileDirectory,
                !openedFile.editMode
              );
            }
            return true;
          })
          .catch(err => {
            console.warn('Error loading text content ' + err);
          });
        break;
      case 'contentChangedInEditor': {
        if (openedFile.editMode && !openedFile.changed) {
          // dummy state change to render DOT before file name (only first time)
          props.updateOpenedFile(openedFile.path, {
            ...openedFile,
            changed: true,
            editMode: true,
            shouldReload: undefined
          });
        }
        break;
      }
      default:
        console.log(
          'Not recognized messaging command: ' + JSON.stringify(data)
        );
        break;
    }
  };

  const reloadDocument = () => {
    if (openedFile) {
      if (openedFile.editMode && openedFile.changed) {
        setSaveBeforeReloadConfirmDialogOpened(true);
      } else {
        props.updateOpenedFile(openedFile.path, {
          ...openedFile,
          editMode: false,
          shouldReload: true
        });
      }
    }
  };

  /* const cancelEditing = () => {
    if (currentEntry && isChanged) {
      props.showNotification(
        i18n.t('core:currentlyFileChangedSaveOrClose')
      );
      return true;
    }
    shouldReload = true;
    setCurrentEntry({
      ...currentEntry,
      editMode: false
    });
  }; */

  const startClosingFile = event => {
    if (event) {
      event.preventDefault(); // Let's stop this event.
      event.stopPropagation();
    }
    if (openedFile && openedFile.changed && openedFile.editMode) {
      setSaveBeforeCloseConfirmDialogOpened(true);
    } else {
      closeFile();
    }
  };

  const closeFile = () => {
    props.closeAllFiles();
    // setEditingSupported(false);
  };

  const startSavingFile = () => {
    // if (AppConfig.isElectron) {
    //   if (this.fileViewer) {
    //     this.fileViewer.executeJavaScript(
    //       'getContent()',
    //       false,
    //       textContent => {
    //         this.saveFile(textContent);
    //       }
    //     );
    //   }
    // } else
    if (
      fileViewer &&
      fileViewer.current &&
      fileViewer.current.contentWindow &&
      // @ts-ignore
      fileViewer.current.contentWindow.getContent
    ) {
      try {
        // @ts-ignore
        const textContent = fileViewer.current.contentWindow.getContent();
        saveFile(textContent);
      } catch (e) {
        console.debug('function getContent not exist for video file:', e);
      }
    }
  };

  const saveFile = (textContent: string) => {
    PlatformIO.saveTextFilePromise(openedFile.path, textContent, true)
      .then(result => {
        // isChanged = false;
        props.updateOpenedFile(openedFile.path, {
          ...openedFile,
          editMode: false,
          changed: false,
          shouldReload: undefined
        });
        props.showNotification(
          i18n.t('core:fileSavedSuccessfully'),
          NotificationTypes.default
        );
        return result;
      })
      .catch(error => {
        props.showNotification(
          i18n.t('core:errorSavingFile'),
          NotificationTypes.error
        );
        console.log('Error saving file ' + openedFile.path + ' - ' + error);
      });
  };

  const editFile = () => {
    props.updateOpenedFile(openedFile.path, {
      ...openedFile,
      editMode: true,
      shouldReload: undefined
    });
  };

  const shareFile = (filePath: string) => {
    PlatformIO.shareFiles([filePath]);
  };

  const toggleFullScreen = () => {
    // this.fileViewerContainer.addEventListener('onfullscreenchange', () => {
    //   alert('Fullscreen change');
    //   if (this.state.isFullscreen) {
    //     this.setState({ isFullscreen: false });
    //   } else {
    //     this.fileViewerContainer.removeEventListener('onfullscreenchange');
    //   }
    // });

    if (isFullscreen && document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
      setFullscreen(false);
      return;
    }
    if (isFullscreen && document.exitFullscreen) {
      // TODO exit fullscreen firefox does not work
      document
        .exitFullscreen()
        .then(() => {
          console.log('Fullscreen exit successful');
          return true;
        })
        .catch(e => {
          console.log('Error exiting fullscreen', e);
        });
      setFullscreen(false);
      return;
    } /* else if (this.state.isFullscreen && document.mozExitFullscreen) {
      document.mozExitFullscreen();
      this.setState({ isFullscreen: false });
      return;
    } */
    if (!isFullscreen && fileViewerContainer) {
      if (
        fileViewerContainer &&
        // @ts-ignore
        fileViewerContainer.current.webkitRequestFullscreen
      ) {
        // @ts-ignore
        fileViewerContainer.current.webkitRequestFullscreen();
        setFullscreen(true);
      } else if (
        fileViewerContainer &&
        fileViewerContainer.current.requestFullscreen
      ) {
        fileViewerContainer.current.requestFullscreen();
        setFullscreen(true);
      } else if (
        fileViewerContainer &&
        // @ts-ignore
        fileViewerContainer.current.mozRequestFullScreen
      ) {
        // @ts-ignore
        fileViewerContainer.current.mozRequestFullScreen();
        setFullscreen(true);
      }
    }
  };

  const openPanel = () => {
    setPropertiesPanelVisible(true);
  };

  const closePanel = () => {
    setPropertiesPanelVisible(false);
  };

  const togglePanel = () => {
    if (isPropPanelVisible) {
      closePanel();
    } else {
      openPanel();
    }
  };

  const openNextFile = () => {
    props.openNextFile(openedFile.path);
  };

  const openPrevFile = () => {
    props.openPrevFile(openedFile.path);
  };

  const openNatively = () => {
    if (openedFile.path) {
      if (openedFile.isFile) {
        props.openFileNatively(openedFile.path);
      } else {
        props.openDirectory(openedFile.path);
      }
    }
  };

  const downloadCordova = (uri, filename) => {
    const { Downloader } = window.plugins;

    const downloadSuccessCallback = result => {
      // result is an object
      /* {
        path: "file:///storage/sdcard0/documents/My Pdf.pdf", // Returns full file path
        file: "My Pdf.pdf", // Returns Filename
        folder: "documents" // Returns folder name
      } */
      console.log(result.file); // My Pdf.pdf
    };

    const downloadErrorCallback = error => {
      console.log(error);
    };

    const options = {
      title: 'Downloading File:' + filename, // Download Notification Title
      url: uri, // File Url
      path: filename, // The File Name with extension
      description: 'The file is downloading', // Download description Notification String
      visible: true, // This download is visible and shows in the notifications while in progress and after completion.
      folder: 'documents' // Folder to save the downloaded file, if not exist it will be created
    };

    Downloader.download(
      options,
      downloadSuccessCallback,
      downloadErrorCallback
    );
  };

  const renderFileToolbar = classes => (
    <div className={classes.toolbar2}>
      <div className={classes.flexLeft}>
        <Tooltip title={i18n.t('core:toggleProperties')}>
          <IconButton
            aria-label={i18n.t('core:toggleProperties')}
            onClick={togglePanel}
            data-tid="fileContainerToggleProperties"
          >
            <DetailsIcon color={isPropPanelVisible ? 'primary' : 'action'} />
          </IconButton>
        </Tooltip>
        <Tooltip title={i18n.t('core:switchToFullscreen')}>
          <IconButton
            aria-label={i18n.t('core:switchToFullscreen')}
            data-tid="fileContainerSwitchToFullScreen"
            onClick={toggleFullScreen}
          >
            <FullScreenIcon />
          </IconButton>
        </Tooltip>
        {AppConfig.isCordova && (
          <Tooltip title={i18n.t('core:shareFile')}>
            <IconButton
              aria-label={i18n.t('core:shareFile')}
              data-tid="shareFile"
              onClick={() => shareFile(`file:///${openedFile.path}`)}
            >
              <ShareIcon />
            </IconButton>
          </Tooltip>
        )}
        {!(PlatformIO.haveObjectStoreSupport() || AppConfig.isWeb) && (
          <Tooltip title={i18n.t('core:openFileExternally')}>
            <IconButton
              aria-label={i18n.t('core:openFileExternally')}
              onClick={openNatively}
            >
              <OpenNativelyIcon />
            </IconButton>
          </Tooltip>
        )}
        <Tooltip title={i18n.t('core:downloadFile')}>
          <IconButton
            aria-label={i18n.t('core:downloadFile')}
            onClick={() => {
              const entryName = `${baseName(
                openedFile.path,
                PlatformIO.getDirSeparator()
              )}`;
              const fileName = extractFileName(
                entryName,
                PlatformIO.getDirSeparator()
              );

              if (AppConfig.isCordova) {
                if (openedFile.url) {
                  downloadCordova(openedFile.url, entryName);
                } else {
                  console.log('Can only download HTTP/HTTPS URIs');
                  props.showNotification(
                    i18n.t('core:cantDownloadLocalFile'),
                    NotificationTypes.default
                  );
                }
              } else {
                const downloadLink = document.getElementById('downloadFile');
                if (downloadLink) {
                  if (AppConfig.isWeb) {
                    // eslint-disable-next-line no-restricted-globals
                    const { protocol } = location;
                    // eslint-disable-next-line no-restricted-globals
                    const { hostname } = location;
                    // eslint-disable-next-line no-restricted-globals
                    const { port } = location;
                    const link = `${protocol}//${hostname}${
                      port !== '' ? `:${port}` : ''
                    }/${openedFile.path}`;
                    downloadLink.setAttribute('href', link);
                  } else {
                    downloadLink.setAttribute(
                      'href',
                      `file:///${openedFile.path}`
                    );
                  }

                  if (openedFile.url) {
                    // mostly the s3 case
                    downloadLink.setAttribute('target', '_blank');
                    downloadLink.setAttribute('href', openedFile.url);
                  }

                  downloadLink.setAttribute('download', fileName); // works only for same origin
                  downloadLink.click();
                }
              }
            }}
          >
            <FileDownloadIcon />
          </IconButton>
        </Tooltip>
        {!props.isReadOnlyMode && (
          <Tooltip title={i18n.t('core:deleteEntry')}>
            <IconButton
              data-tid="deleteEntryTID"
              aria-label={i18n.t('core:deleteEntry')}
              onClick={() => setDeleteEntryModalOpened(true)}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        )}
        <Tooltip title={i18n.t('core:reloadFile')}>
          <IconButton
            data-tid="reloadFileTID"
            aria-label={i18n.t('core:reloadFile')}
            onClick={reloadDocument}
          >
            <RefreshIcon />
          </IconButton>
        </Tooltip>
        {props.isDesktopMode && (
          <Tooltip title={i18n.t('core:openInFullWidth')}>
            <IconButton
              data-tid="openInFullWidthTID"
              aria-label={i18n.t('core:openInFullWidth')}
              onClick={props.toggleEntryFullWidth}
            >
              <ExpandIcon />
            </IconButton>
          </Tooltip>
        )}
      </div>
      <div className={classes.entryNavigationSection}>
        <Tooltip title={i18n.t('core:openPrevFileTooltip')}>
          <IconButton
            aria-label={i18n.t('core:openPrevFileTooltip')}
            data-tid="fileContainerPrevFile"
            onClick={openPrevFile}
          >
            <ArrowLeftIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title={i18n.t('core:openNextFileTooltip')}>
          <IconButton
            aria-label={i18n.t('core:openNextFileTooltip')}
            data-tid="fileContainerNextFile"
            onClick={openNextFile}
          >
            <ArrowRightIcon />
          </IconButton>
        </Tooltip>
      </div>
    </div>
  );

  const renderFolderToolbar = () => (
    <div className={props.classes.toolbar2}>
      <div className={props.classes.flexLeft}>
        {!(PlatformIO.haveObjectStoreSupport() || AppConfig.isWeb) && (
          <Tooltip title={i18n.t('core:openDirectoryExternally')}>
            <IconButton
              aria-label={i18n.t('core:openDirectoryExternally')}
              onClick={openNatively}
            >
              <OpenNativelyIcon />
            </IconButton>
          </Tooltip>
        )}
        <Tooltip title={i18n.t('core:reloadDirectory')}>
          <IconButton
            aria-label={i18n.t('core:reloadDirectory')}
            onClick={reloadDocument}
          >
            <RefreshIcon />
          </IconButton>
        </Tooltip>
        {!props.isReadOnlyMode && (
          <Tooltip title={i18n.t('core:deleteDirectory')}>
            <IconButton
              aria-label={i18n.t('core:deleteDirectory')}
              onClick={() => setDeleteEntryModalOpened(true)}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        )}
      </div>
    </div>
  );

  const renderFileView = fileOpenerURL => (
    <iframe
      ref={fileViewer}
      className={props.classes.fileOpener}
      src={fileOpenerURL}
      allowFullScreen
      sandbox="allow-same-origin allow-scripts allow-modals"
      title={i18n.t('core:fileViewer')}
      id="FileViewer"
    />
  );

  /* const setPropertiesEditMode = (editMode: boolean) => {
    this.isPropertiesEditMode = editMode;
  }; */

  /* TODO rethink this
  const resetState = key => {
    // this.isPropertiesEditMode = false;
    // @ts-ignore
    this.setState({
      [key]: uuidv1()
    });
  }; */

  const { classes, keyBindings } = props;
  let fileOpenerURL: string;
  let fileTitle: string = '';

  if (openedFile.path) {
    fileTitle = extractTitle(
      openedFile.path,
      !openedFile.isFile,
      PlatformIO.getDirSeparator()
    );
    // if (fileTitle.length > maxCharactersTitleLength) {
    //   fileTitle = fileTitle.substr(0, maxCharactersTitleLength) + '...';
    // }

    const locale = '&locale=' + i18n.language;
    const theme = '&theme=' + props.settings.currentTheme;

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
    // this.shouldReload = false;

    // if (!currentEntry.isFile) {
    //   fileOpenerURL = currentEntry.path + '/index.html';
    // }

    // // Idea for using mhtml native browser in chrome
    // if (
    //   !AppConfig.isFirefox && (
    //     currentEntry.path.endsWith('mht') ||
    //     currentEntry.path.endsWith('mhtml')
    //   )
    // ) {
    //   fileOpenerURL = currentEntry.path;
    // }
  } else {
    fileOpenerURL = 'about:blank';
  }

  function getSplitPanelSize() {
    if (isPropPanelVisible) {
      return openedFile.isFile
        ? props.settings.entryPropertiesSplitSize
        : '100%';
    }
    return defaultSplitSize;
  }

  return (
    <GlobalHotKeys
      handlers={{
        closeViewer: startClosingFile,
        saveDocument: startSavingFile,
        editDocument: editFile,
        nextDocument: openNextFile,
        prevDocument: openPrevFile
      }}
      keyMap={{
        nextDocument: keyBindings.nextDocument,
        prevDocument: keyBindings.prevDocument,
        closeViewer: keyBindings.closeViewer,
        saveDocument: keyBindings.saveDocument,
        editDocument: keyBindings.editDocument
      }}
    >
      {isSaveBeforeCloseConfirmDialogOpened && (
        <ConfirmDialog
          open={isSaveBeforeCloseConfirmDialogOpened}
          onClose={() => {
            setSaveBeforeCloseConfirmDialogOpened(false);
          }}
          title={i18n.t('core:confirm')}
          content={i18n.t('core:saveFileBeforeClosingFile')}
          confirmCallback={result => {
            if (result) {
              startSavingFile();
            } else {
              closeFile();
              setSaveBeforeCloseConfirmDialogOpened(false);
            }
          }}
          cancelDialogTID="cancelSaveBeforeCloseDialog"
          confirmDialogTID="confirmSaveBeforeCloseDialog"
          confirmDialogContentTID="confirmDialogContent"
        />
      )}
      {isSaveBeforeReloadConfirmDialogOpened && (
        <ConfirmDialog
          open={isSaveBeforeReloadConfirmDialogOpened}
          onClose={() => {
            setSaveBeforeReloadConfirmDialogOpened(false);
          }}
          title={i18n.t('core:confirm')}
          content="File was modified, do you want to save the changes?"
          confirmCallback={result => {
            if (result) {
              setSaveBeforeReloadConfirmDialogOpened(false);
              startSavingFile();
            } else {
              setSaveBeforeReloadConfirmDialogOpened(false);
              props.updateOpenedFile(openedFile.path, {
                ...openedFile,
                editMode: false,
                changed: false,
                shouldReload: true
              });
            }
          }}
          cancelDialogTID="cancelSaveBeforeCloseDialog"
          confirmDialogTID="confirmSaveBeforeCloseDialog"
          confirmDialogContentTID="confirmDialogContent"
        />
      )}
      {isDeleteEntryModalOpened && (
        <ConfirmDialog
          open={isDeleteEntryModalOpened}
          onClose={() => {
            setDeleteEntryModalOpened(false);
          }}
          title={
            openedFile.isFile
              ? i18n.t('core:deleteConfirmationTitle')
              : i18n.t('core:deleteDirectory')
          }
          content={
            openedFile.isFile
              ? i18n.t('core:doYouWantToDeleteFile')
              : i18n.t('core:deleteDirectoryContentConfirm', {
                  dirPath: openedFile.path
                    ? extractDirectoryName(
                        decodeURIComponent(openedFile.path),
                        PlatformIO.getDirSeparator()
                      )
                    : ''
                })
          }
          confirmCallback={result => {
            if (result) {
              props.deleteFile(openedFile.path);
            }
          }}
          cancelDialogTID="cancelSaveBeforeCloseDialog"
          confirmDialogTID="confirmSaveBeforeCloseDialog"
          confirmDialogContentTID="confirmDialogContent"
        />
      )}
      {isEditTagsModalOpened && (
        <AddRemoveTagsDialog
          open={isEditTagsModalOpened}
          onClose={() => setEditTagsModalOpened(false)}
          addTags={props.addTags}
          removeTags={props.removeTags}
          removeAllTags={props.removeAllTags}
          selectedEntries={openedFile ? [openedFile] : []}
        />
      )}
      <a href="#" id="downloadFile">
        &nbsp;
      </a>
      <SplitPane
        split="horizontal"
        resizerStyle={{
          backgroundColor: props.theme.palette.divider
        }}
        style={{ zIndex: 1300 }}
        size={getSplitPanelSize()}
        minSize={openedFile.isFile ? defaultSplitSize : '100%'}
        maxSize={openedFile.isFile ? fullSplitSize : '100%'}
        defaultSize={
          openedFile.isFile ? props.settings.entryPropertiesSplitSize : '100%'
        }
        onChange={size => {
          const propertiesPanelVisible = size > defaultSplitSize;
          if (isPropPanelVisible !== propertiesPanelVisible) {
            setPropertiesPanelVisible(propertiesPanelVisible);
          }
          bufferedSplitResize(() => props.setEntryPropertiesSplitSize(size));
        }}
      >
        {openedFile.path ? (
          <Box className={classes.panel}>
            <Box className={classes.toolbar}>
              <Box className={classes.flexLeft}>
                {openedFile.isFile ? (
                  <Button
                    disabled
                    title={openedFile.url || openedFile.path}
                    aria-label={i18n.t('core:toggleEntryProperties')}
                    className={classes.entryNameButton}
                  >
                    <Box
                      style={{
                        color: props.theme.palette.text.primary
                      }}
                    >
                      {openedFile.editMode && openedFile.changed
                        ? String.fromCharCode(0x25cf) + ' '
                        : ''}
                      {fileTitle}
                    </Box>
                    <Box
                      className={classes.fileBadge}
                      title={i18n.t('core:toggleEntryProperties')}
                      style={{
                        backgroundColor: openedFile.color
                      }}
                    >
                      {'.' +
                        extractFileExtension(
                          openedFile.path,
                          PlatformIO.getDirSeparator()
                        )}
                    </Box>
                  </Button>
                ) : (
                  <Button
                    disabled
                    title={openedFile.url || openedFile.path}
                    aria-label={i18n.t('core:toggleEntryProperties')}
                    className={classes.entryNameButton}
                  >
                    <Box
                      style={{
                        color: props.theme.palette.text.primary
                      }}
                    >
                      {fileTitle}
                    </Box>
                    <Box
                      className={classes.fileBadge}
                      title={i18n.t('core:toggleEntryProperties')}
                      style={{
                        backgroundColor: AppConfig.defaultFolderColor
                      }}
                    >
                      {i18n.t('core:folder')}
                    </Box>
                  </Button>
                )}
              </Box>
              {editingSupported && openedFile.editMode && (
                <div className={classes.entryCloseSection}>
                  <IconButton
                    disabled={false}
                    onClick={startSavingFile}
                    title={i18n.t('core:saveFile')}
                    aria-label={i18n.t('core:saveFile')}
                    data-tid="fileContainerSaveFile"
                  >
                    <SaveIcon />
                  </IconButton>
                  <IconButton
                    onClick={reloadDocument}
                    title="Preview"
                    aria-label={i18n.t('core:cancelEditing')}
                  >
                    <BackIcon />
                  </IconButton>
                  <IconButton
                    onClick={startClosingFile}
                    title={i18n.t('core:closeEntry')}
                    aria-label={i18n.t('core:closeEntry')}
                    data-tid="fileContainerCloseOpenedFile"
                  >
                    <CloseIcon />
                  </IconButton>
                </div>
              )}
              {editingSupported && !openedFile.editMode && (
                <div className={classes.entryCloseSection}>
                  <Button
                    disabled={false}
                    size="small"
                    variant="outlined"
                    color="primary"
                    onClick={editFile}
                    title={i18n.t('core:editFile')}
                    aria-label={i18n.t('core:editFile')}
                    data-tid="fileContainerEditFile"
                  >
                    {i18n.t('core:edit')}
                  </Button>
                  <IconButton
                    onClick={startClosingFile}
                    title={i18n.t('core:closeEntry')}
                    aria-label={i18n.t('core:closeEntry')}
                    data-tid="fileContainerCloseOpenedFile"
                  >
                    <CloseIcon />
                  </IconButton>
                </div>
              )}
              {!editingSupported && (
                <div className={classes.entryCloseSection}>
                  <IconButton
                    onClick={startClosingFile}
                    title={i18n.t('core:closeEntry')}
                    aria-label={i18n.t('core:closeEntry')}
                    data-tid="fileContainerCloseOpenedFile"
                  >
                    <CloseIcon />
                  </IconButton>
                </div>
              )}
            </Box>
            <div className={classes.entryProperties}>
              {openedFile.isFile
                ? renderFileToolbar(classes)
                : renderFolderToolbar()}
              {isPropPanelVisible && (
                <EntryProperties
                  key={openedFile.path}
                  // resetState={this.resetState}
                  // setPropertiesEditMode={this.setPropertiesEditMode}
                  // entryPath={openedFile.path}
                  // perspective={openedFile.perspective}
                  openedEntry={openedFile}
                  tagDelimiter={props.settings.tagDelimiter}
                  // entryURL={currentEntry.url}
                  // shouldReload={reload}
                  renameFile={props.renameFile}
                  renameDirectory={props.renameDirectory}
                  // editTagForEntry={props.editTagForEntry}
                  // shouldCopyFile={shouldCopyFile}
                  // normalizeShouldCopyFile={() => setShouldCopyFile(false)}
                  addTags={props.addTags}
                  removeTags={props.removeTags}
                  removeAllTags={props.removeAllTags}
                  updateOpenedFile={props.updateOpenedFile}
                  updateThumbnailUrl={props.updateThumbnailUrl}
                  showNotification={props.showNotification}
                  isReadOnlyMode={props.isReadOnlyMode}
                  currentDirectoryPath={props.currentDirectoryPath}
                  tileServer={props.tileServer}
                />
              )}
            </div>
          </Box>
        ) : (
          <div>{i18n.t('core:noEntrySelected')}</div>
        )}
        <div ref={fileViewerContainer} className={classes.fileContent}>
          {isFullscreen && (
            <Fab
              data-tid="fullscreenTID"
              color="primary"
              style={{
                position: 'absolute',
                top: 20,
                right: 20,
                zIndex: 10000
              }}
              onClick={toggleFullScreen}
            >
              <CloseIcon />
            </Fab>
          )}
          {renderFileView(fileOpenerURL)}
        </div>
      </SplitPane>
    </GlobalHotKeys>
  );
};

function mapStateToProps(state) {
  return {
    settings: state.settings,
    isReadOnlyMode: isReadOnlyMode(state),
    keyBindings: getKeyBindingObject(state),
    isDesktopMode: isDesktopMode(state),
    tileServer: getMapTileServer(state)
  };
}

function mapActionCreatorsToProps(dispatch) {
  return bindActionCreators(
    {
      setEntryPropertiesSplitSize: SettingsActions.setEntryPropertiesSplitSize,
      closeAllFiles: AppActions.closeAllFiles,
      renameFile: AppActions.renameFile,
      renameDirectory: AppActions.renameDirectory,
      openFsEntry: AppActions.openFsEntry,
      openFileNatively: AppActions.openFileNatively,
      openDirectory: AppActions.openDirectory,
      openLink: AppActions.openLink,
      showNotification: AppActions.showNotification,
      openNextFile: AppActions.openNextFile,
      openPrevFile: AppActions.openPrevFile,
      deleteFile: AppActions.deleteFile,
      toggleEntryFullWidth: AppActions.toggleEntryFullWidth,
      addTags: TaggingActions.addTags,
      removeTags: TaggingActions.removeTags,
      removeAllTags: TaggingActions.removeAllTags,
      updateOpenedFile: AppActions.updateOpenedFile,
      updateThumbnailUrl: AppActions.updateThumbnailUrl,
      setSelectedEntries: AppActions.setSelectedEntries
    },
    dispatch
  );
}

export default connect(
  mapStateToProps,
  mapActionCreatorsToProps
  // @ts-ignore
)(withStyles(styles, { withTheme: true })(EntryContainer));

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
import IconButton from '@material-ui/core/IconButton';
import uuidv1 from 'uuid';
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
import FolderIcon from '@material-ui/icons/FolderOpen';
import SplitPane from 'react-split-pane';
import DeleteIcon from '@material-ui/icons/Delete';
import ShareIcon from '@material-ui/icons/Share';
import { withStyles } from '@material-ui/core/styles';
import RefreshIcon from '@material-ui/icons/Refresh';
import memoize from 'memoize-one';
import EntryProperties from '-/components/EntryProperties';
import ConfirmDialog from '-/components/dialogs/ConfirmDialog';
import AppConfig from '-/config';
import PlatformIO from '-/services/platform-io';
import AddRemoveTagsDialog from '-/components/dialogs/AddRemoveTagsDialog';
import { FileSystemEntry } from '-/services/utils-io';
import i18n from '-/services/i18n';
import {
  extractContainingDirectoryPath,
  extractTitle,
  extractFileExtension,
  extractTagsAsObjects,
  baseName,
  extractFileName,
  extractDirectoryName
} from '-/utils/paths';
import { buffer } from '-/utils/misc';
import {
  actions as SettingsActions,
  getKeyBindingObject
} from '-/reducers/settings';
import TaggingActions from '-/reducers/tagging-actions';
import {
  OpenedEntry,
  NotificationTypes,
  getOpenedFiles,
  isReadOnlyMode,
  getDirectoryContent,
  actions as AppActions
} from '-/reducers/app';
import useEventListener from '-/utils/useEventListener';

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
    padding: '0 0 60px 0',
    height: '50%'
  },
  fileOpener: {
    width: '100%',
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
    padding: '2px 6px 0px 6px',
    minHeight: 22,
    marginRight: 5,
    borderRadius: 5
  },
  entryNameButton: {
    paddingTop: 0,
    paddingRight: 0,
    paddingLeft: 0,
    paddingBottom: 0,
    minWidth: 20,
    height: 44,
    justifyContent: 'unset',
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
  editTagForEntry: () => void;
  openFile: (filePath: string) => void;
  getNextFile: (path: string) => string;
  getPrevFile: (path: string) => string;
  openFileNatively: (path: string) => void;
  openURLExternally: (url: string) => void;
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
  reflectUpdateSidecarMeta: (path: string, entryMeta: Object) => void;
  updateThumbnailUrl: (path: string, thumbUrl: string) => void;
  setLastSelectedEntry: (path: string) => void;
  setSelectedEntries: (selectedEntries: Array<Object>) => void;
  directoryContent: Array<Object>;
}

const EntryContainer = (props: Props) => {
  const entry = props.openedFiles.length > 0 ? props.openedFiles[0] : undefined;
  if (!entry) {
    return null;
  }
  const [currentEntry, setCurrentEntry] = useState<OpenedEntry>(entry);

  const [isPropertiesPanelVisible, setPropertiesPanelVisible] = useState<
    boolean
  >(false);
  const [isFullscreen, setFullscreen] = useState<boolean>(false);
  const [editingSupported, setEditingSupported] = useState<boolean>(false);
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

  useEventListener(
    'toggle-resume',
    () => {
      // if (AppConfig.isElectron && this.fileViewer) {
      //   this.fileViewer.executeJavaScript(
      //     'window.dispatchEvent(new Event("resume"));'
      //   );
      // } else
      if (fileViewer && fileViewer.current.contentWindow) {
        // @ts-ignore
        fileViewer.current.contentWindow.togglePlay();
      }
    },
    fileViewer
  );

  useEventListener('message', e => {
    if (typeof e.data === 'string') {
      // console.log(e.data);
      const dataObj = JSON.parse(e.data);
      handleMessage(dataObj);
    }
  });

  useEffect(() => {
    if (props.openedFiles.length > 0) {
      const openedFile = props.openedFiles[0];
      // / setPropertiesPanelVisible
      if (!openedFile.isFile) {
        // always open for dirs
        setPropertiesPanelVisible(true);
      }
      // / setEditingSupported
      if (props.isReadOnlyMode) {
        setEditingSupported(false);
      } else {
        setEditingSupported(
          openedFile.editingExtensionId &&
            openedFile.editingExtensionId.length > 3
        );
      }

      // set tags
      /* const tags = extractTagsAsObjects(
        openedFile.path,
        props.settings.tagDelimiter,
        PlatformIO.getDirSeparator()
      );
      setCurrentEntry({
        ...openedFile,
        tags
      }); */
    } else {
      setCurrentEntry(null);
    }
  }, [props.openedFiles, props.isReadOnlyMode, props.settings]);

  useEffect(() => {
    if (props.openedFiles && props.openedFiles.length > 0) {
      setCurrentEntry(props.openedFiles[0]);
    } else {
      setCurrentEntry(undefined);
    }
  }, [props.openedFiles]);

  useEffect(() => {
    if (currentEntry === null) {
      props.closeAllFiles();
    }
  }, [currentEntry]);

  useEffect(() => {
    if (props.settings.entryPropertiesSplitSize === defaultSplitSize) {
      props.setEntryPropertiesSplitSize(openedSplitSize);
    }
  }, [isPropertiesPanelVisible]);

  // isPropertiesEditMode = false; // TODO rethink this! why exist?

  let isChanged = false;
  let shouldReload = false;

  // logEventsFromExtensions = event => {
  //   console.log('Ext. Logging >>> ', event.message);
  // };

  // handleMessageProxy = event => {
  //   this.handleMessage(JSON.stringify(event.channel));
  // };

  const handleMessage = (data: any) => {
    let message;
    let textFilePath;
    let nextFilePath;
    let nextFile;
    let decodedURI;

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
        nextFilePath = props.getNextFile(currentEntry.path);
        nextFile = props.directoryContent.filter(
          (entry: any) => entry.path === nextFilePath
        );
        props.openFile(nextFilePath);
        props.setLastSelectedEntry(nextFilePath);
        props.setSelectedEntries(nextFile);
        break;
      case 'openLinkExternally':
        // console.log('Open link externally: ' + data.link);
        decodedURI = decodeURIComponent(data.link);
        if (
          decodedURI.startsWith('http://') ||
          decodedURI.startsWith('https://') ||
          decodedURI.startsWith('file://')
        ) {
          props.openURLExternally(decodedURI);
        } else {
          console.log('Not supported URL format: ' + decodedURI);
        }
        break;
      case 'openFileNatively':
        console.log('Open file natively: ' + data.link);
        props.openFileNatively(data.link);
        break;
      case 'loadDefaultTextContent':
        if (!currentEntry || !currentEntry.path) {
          break;
        }
        textFilePath = currentEntry.path;
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
            if (fileViewer) {
              // @ts-ignore
              fileViewer.current.contentWindow.setContent(
                content,
                fileDirectory,
                !currentEntry.editMode
              );
            }
            return true;
          })
          .catch(err => {
            console.warn('Error loading text content ' + err);
          });
        break;
      case 'contentChangedInEditor': {
        if (currentEntry.editMode && !isChanged) {
          isChanged = true;
          // dummy state change to rerender for DOT before file name (only first time)
          setCurrentEntry({
            ...currentEntry
            // changed: true
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
    if (currentEntry) {
      if (isChanged) {
        setSaveBeforeReloadConfirmDialogOpened(true);
      } else {
        shouldReload = true;
        setCurrentEntry({
          ...currentEntry,
          editMode: false
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
    if (currentEntry && isChanged) {
      setSaveBeforeCloseConfirmDialogOpened(true);
    } else {
      closeFile();
    }
  };

  const closeFile = () => {
    isChanged = false;
    setCurrentEntry(null);
    setEditingSupported(false);
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
    if (fileViewer) {
      // @ts-ignore
      const textContent = fileViewer.current.contentWindow.getContent();
      saveFile(textContent);
    }
  };

  const saveFile = (textContent: string) => {
    PlatformIO.saveTextFilePromise(currentEntry.path, textContent, true)
      .then(result => {
        isChanged = false;
        setCurrentEntry({
          ...currentEntry,
          editMode: false
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
        console.log('Error saving file ' + currentEntry.path + ' - ' + error);
      });
  };

  const editFile = () => {
    setCurrentEntry({ ...currentEntry, editMode: true });
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
    if (isPropertiesPanelVisible) {
      closePanel();
    } else {
      openPanel();
    }
  };

  const openNextFile = () => {
    if (currentEntry && currentEntry.path) {
      const nextFilePath = props.getNextFile(currentEntry.path);
      const nextFile = props.directoryContent.filter(
        (entry: FileSystemEntry) => entry.path === nextFilePath
      );
      props.openFile(nextFilePath);
      props.setLastSelectedEntry(nextFilePath);
      props.setSelectedEntries(nextFile);
    }
  };

  const openPrevFile = () => {
    if (currentEntry && currentEntry.path) {
      const prevFilePath = props.getPrevFile(currentEntry.path);
      const prevFile = props.directoryContent.filter(
        (entry: FileSystemEntry) => entry.path === prevFilePath
      );
      props.openFile(prevFilePath);
      props.setLastSelectedEntry(prevFilePath);
      props.setSelectedEntries(prevFile);
    }
  };

  const openNatively = () => {
    if (currentEntry) {
      props.openFileNatively(currentEntry.path);
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
        <IconButton
          title={i18n.t('core:toggleProperties')}
          aria-label={i18n.t('core:toggleProperties')}
          onClick={togglePanel}
          data-tid="fileContainerToggleProperties"
        >
          <DetailsIcon
            color={isPropertiesPanelVisible ? 'primary' : 'action'}
          />
        </IconButton>
        <IconButton
          title={i18n.t('core:switchToFullscreen')}
          aria-label={i18n.t('core:switchToFullscreen')}
          data-tid="fileContainerSwitchToFullScreen"
          onClick={toggleFullScreen}
        >
          <FullScreenIcon />
        </IconButton>
        {AppConfig.isCordova && (
          <IconButton
            title={i18n.t('core:shareFile')}
            aria-label={i18n.t('core:shareFile')}
            data-tid="shareFile"
            onClick={() => shareFile(`file:///${currentEntry.path}`)}
          >
            <ShareIcon />
          </IconButton>
        )}
        {!(PlatformIO.haveObjectStoreSupport() || AppConfig.isWeb) && (
          <IconButton
            title={i18n.t('core:openFileExternally')}
            aria-label={i18n.t('core:openFileExternally')}
            onClick={openNatively}
          >
            <OpenNativelyIcon />
          </IconButton>
        )}
        <IconButton
          title={i18n.t('core:downloadFile')}
          aria-label={i18n.t('core:downloadFile')}
          onClick={() => {
            const entryName = `${baseName(
              currentEntry.path,
              PlatformIO.getDirSeparator()
            )}`;
            const fileName = extractFileName(
              entryName,
              PlatformIO.getDirSeparator()
            );

            if (AppConfig.isCordova) {
              if (currentEntry.url) {
                downloadCordova(currentEntry.url, entryName);
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
                  }/${currentEntry.path}`;
                  downloadLink.setAttribute('href', link);
                } else {
                  downloadLink.setAttribute(
                    'href',
                    `file:///${currentEntry.path}`
                  );
                }

                if (currentEntry.url) {
                  // mostly the s3 case
                  downloadLink.setAttribute('target', '_blank');
                  downloadLink.setAttribute('href', currentEntry.url);
                }

                downloadLink.setAttribute('download', fileName); // works only for same origin
                downloadLink.click();
              }
            }
          }}
        >
          <FileDownloadIcon />
        </IconButton>
        {/* !this.props.isReadOnlyMode && (
          <IconButton
            aria-label={i18n.t('core:duplicateFile')}
            title={i18n.t('core:duplicateFile')}
            onClick={() => {
              this.setState({ shouldCopyFile: true });
            }}
          >
            <CopyContentIcon />
          </IconButton>
        ) */}
        {!props.isReadOnlyMode && (
          <IconButton
            title={i18n.t('core:deleteEntry')}
            aria-label={i18n.t('core:deleteEntry')}
            onClick={() => setDeleteEntryModalOpened(true)}
          >
            <DeleteIcon />
          </IconButton>
        )}
        <IconButton
          title={i18n.t('core:reloadFile')}
          aria-label={i18n.t('core:reloadFile')}
          onClick={reloadDocument}
        >
          <RefreshIcon />
        </IconButton>
        <IconButton
          title={i18n.t('core:openInFullWidth')}
          aria-label={i18n.t('core:openInFullWidth')}
          onClick={props.toggleEntryFullWidth}
        >
          <ExpandIcon />
        </IconButton>
      </div>
      <div className={classes.entryNavigationSection}>
        <IconButton
          title={i18n.t('core:openPrevFileTooltip')}
          aria-label={i18n.t('core:openPrevFileTooltip')}
          data-tid="fileContainerPrevFile"
          onClick={openPrevFile}
        >
          <ArrowLeftIcon />
        </IconButton>
        <IconButton
          title={i18n.t('core:openNextFileTooltip')}
          aria-label={i18n.t('core:openNextFileTooltip')}
          data-tid="fileContainerNextFile"
          onClick={openNextFile}
        >
          <ArrowRightIcon />
        </IconButton>
      </div>
    </div>
  );

  const renderFolderToolbar = () => (
    <div className={props.classes.toolbar2}>
      <div className={props.classes.flexLeft}>
        {!(PlatformIO.haveObjectStoreSupport() || AppConfig.isWeb) && (
          <IconButton
            title={i18n.t('core:openDirectoryExternally')}
            aria-label={i18n.t('core:openDirectoryExternally')}
            onClick={openNatively}
          >
            <OpenNativelyIcon />
          </IconButton>
        )}
        <IconButton
          title={i18n.t('core:reloadDirectory')}
          aria-label={i18n.t('core:reloadDirectory')}
          onClick={reloadDocument}
        >
          <RefreshIcon />
        </IconButton>
        {!props.isReadOnlyMode && (
          <div>
            <IconButton
              title={i18n.t('core:deleteDirectory')}
              aria-label={i18n.t('core:deleteDirectory')}
              onClick={() => setDeleteEntryModalOpened(true)}
            >
              <DeleteIcon />
            </IconButton>
          </div>
        )}
      </div>
    </div>
  );

  const renderFileView = fileOpenerURL => (
    // if (AppConfig.isElectron) {
    //   return (
    //     <webview
    //       id="webViewer"
    //       ref={fileViewer => {
    //         this.fileViewer = fileViewer;
    //       }}
    //       className={this.props.classes.fileOpener}
    //       src={fileOpenerURL}
    //       allowFullScreen
    //       preload="./node_modules/@tagspaces/legacy-ext/webview-preload.js"
    //     />
    //   );
    // }
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

  if (currentEntry && currentEntry.path) {
    fileTitle = extractTitle(
      currentEntry.path,
      !currentEntry.isFile,
      PlatformIO.getDirSeparator()
    );
    // if (fileTitle.length > maxCharactersTitleLength) {
    //   fileTitle = fileTitle.substr(0, maxCharactersTitleLength) + '...';
    // }

    if (currentEntry.editMode && currentEntry.editingExtensionPath) {
      fileOpenerURL =
        currentEntry.editingExtensionPath +
        '/index.html?file=' +
        encodeURIComponent(
          currentEntry.url ? currentEntry.url : currentEntry.path
        ) +
        '&locale=' +
        i18n.language +
        '&edit=true' +
        (shouldReload ? '&t=' + new Date().getTime() : '');
      // } else if (!currentEntry.isFile) { // TODO needed for loading folder's default html
      //   fileOpenerURL = 'node_modules/@tagspaces/html-viewer/index.html?locale=' + i18n.language;
    } else {
      fileOpenerURL =
        currentEntry.viewingExtensionPath +
        '/index.html?file=' +
        encodeURIComponent(
          currentEntry.url ? currentEntry.url : currentEntry.path
        ) +
        '&locale=' +
        i18n.language +
        (shouldReload ? '&t=' + new Date().getTime() : '');
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
    if (isPropertiesPanelVisible) {
      return currentEntry && currentEntry.isFile
        ? props.settings.entryPropertiesSplitSize
        : '100%';
    }
    return defaultSplitSize;
  }

  const renderEntryProperties = memoize(openEntry => (
    <div className={classes.entryProperties}>
      {currentEntry.isFile ? renderFileToolbar(classes) : renderFolderToolbar()}
      <EntryProperties
        key={uuidv1()}
        // resetState={this.resetState}
        // setPropertiesEditMode={this.setPropertiesEditMode}
        // entryPath={currentEntry.path}
        // entryURL={currentEntry.url}
        openedEntry={openEntry}
        // shouldReload={reload}
        renameFile={props.renameFile}
        renameDirectory={props.renameDirectory}
        editTagForEntry={props.editTagForEntry}
        // shouldCopyFile={shouldCopyFile}
        // normalizeShouldCopyFile={() => setShouldCopyFile(false)}
        addTags={props.addTags}
        removeTags={props.removeTags}
        removeAllTags={props.removeAllTags}
        reflectUpdateSidecarMeta={props.reflectUpdateSidecarMeta}
        updateThumbnailUrl={props.updateThumbnailUrl}
        showNotification={props.showNotification}
        isReadOnlyMode={props.isReadOnlyMode}
      />
    </div>
  ));

  return (
    <GlobalHotKeys
      handlers={{
        closeViewer: startClosingFile,
        saveDocument: startSavingFile,
        editDocument: editFile,
        nextDocument: openNextFile,
        prevDocument: openPrevFile
        // reloadDocument: this.reloadDocument,
      }}
      keyMap={{
        nextDocument: keyBindings.nextDocument,
        prevDocument: keyBindings.prevDocument,
        closeViewer: keyBindings.closeViewer,
        saveDocument: keyBindings.saveDocument,
        editDocument: keyBindings.editDocument
        // reloadDocument: settings.keyBindings.reloadDocument,
      }}
    >
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
            isChanged = false;
            shouldReload = true;
            setSaveBeforeReloadConfirmDialogOpened(false);
            setCurrentEntry({
              ...currentEntry,
              editMode: false
            });
          }
        }}
        cancelDialogTID="cancelSaveBeforeCloseDialog"
        confirmDialogTID="confirmSaveBeforeCloseDialog"
        confirmDialogContentTID="confirmDialogContent"
      />
      <ConfirmDialog
        open={isDeleteEntryModalOpened}
        onClose={() => {
          setDeleteEntryModalOpened(false);
        }}
        title={
          currentEntry && currentEntry.isFile
            ? i18n.t('core:deleteConfirmationTitle')
            : i18n.t('core:deleteDirectory')
        }
        content={
          currentEntry && currentEntry.isFile
            ? i18n.t('core:doYouWantToDeleteFile')
            : i18n.t('core:deleteDirectoryContentConfirm', {
                dirPath: currentEntry
                  ? extractDirectoryName(
                      currentEntry.path,
                      PlatformIO.getDirSeparator()
                    )
                  : ''
              })
        }
        confirmCallback={result => {
          if (result && currentEntry) {
            props.deleteFile(currentEntry.path);
          }
        }}
        cancelDialogTID="cancelSaveBeforeCloseDialog"
        confirmDialogTID="confirmSaveBeforeCloseDialog"
        confirmDialogContentTID="confirmDialogContent"
      />
      <AddRemoveTagsDialog
        open={isEditTagsModalOpened}
        onClose={() => setEditTagsModalOpened(false)}
        addTags={props.addTags}
        removeTags={props.removeTags}
        removeAllTags={props.removeAllTags}
        selectedEntries={currentEntry ? [currentEntry] : []}
      />
      {/* <a href="#" id="downloadFile">
      </a> */}
      <SplitPane
        split="horizontal"
        resizerStyle={{ backgroundColor: props.theme.palette.divider }}
        // size={this.state.entryPropertiesSplitSize}
        // minSize={defaultSplitSize}
        // maxSize={fullSplitSize}
        // defaultSize={this.state.entryPropertiesSplitSize}
        size={getSplitPanelSize()}
        minSize={
          currentEntry && currentEntry.isFile ? defaultSplitSize : '100%'
        }
        maxSize={currentEntry && currentEntry.isFile ? fullSplitSize : '100%'}
        defaultSize={
          currentEntry && currentEntry.isFile
            ? props.settings.entryPropertiesSplitSize
            : '100%'
        }
        onChange={size => {
          const propertiesPanelVisible = size > defaultSplitSize;
          if (isPropertiesPanelVisible !== propertiesPanelVisible) {
            setPropertiesPanelVisible(propertiesPanelVisible);
          }
          bufferedSplitResize(() => props.setEntryPropertiesSplitSize(size));
        }}
      >
        {currentEntry ? (
          <div className={classes.panel}>
            <div className={classes.toolbar}>
              <div className={classes.flexLeft}>
                {currentEntry.isFile ? (
                  <Button
                    onClick={togglePanel}
                    title={currentEntry.url || currentEntry.path}
                    aria-label={i18n.t('core:toggleEntryProperties')}
                    className={classes.entryNameButton}
                  >
                    <div
                      className={classes.fileBadge}
                      title={i18n.t('core:toggleEntryProperties')}
                      style={{ backgroundColor: currentEntry.color }}
                    >
                      {'.' +
                        extractFileExtension(
                          currentEntry.path,
                          PlatformIO.getDirSeparator()
                        )}
                    </div>
                    {isChanged // currentEntry.changed
                      ? String.fromCharCode(0x25cf) + ' '
                      : ''}
                    {fileTitle}
                  </Button>
                ) : (
                  <Button
                    onClick={togglePanel}
                    title={currentEntry.url || currentEntry.path}
                    aria-label={i18n.t('core:toggleEntryProperties')}
                    className={classes.entryNameButton}
                  >
                    <div
                      className={classes.fileBadge}
                      title={i18n.t('core:toggleEntryProperties')}
                      style={{
                        backgroundColor: AppConfig.defaultFolderColor,
                        paddingTop: 5
                      }}
                    >
                      <FolderIcon />
                    </div>
                    {fileTitle}
                  </Button>
                )}
              </div>
              {editingSupported && currentEntry.editMode && (
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
              {editingSupported && !currentEntry.editMode && (
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
            </div>
            {renderEntryProperties(currentEntry)}
          </div>
        ) : (
          <div>{i18n.t('core:noEntrySelected')}</div>
        )}
        <div ref={fileViewerContainer} className={classes.fileContent}>
          {isFullscreen && (
            <Fab
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
    openedFiles: getOpenedFiles(state),
    settings: state.settings,
    isReadOnlyMode: isReadOnlyMode(state),
    directoryContent: getDirectoryContent(state),
    keyBindings: getKeyBindingObject(state)
  };
}

function mapActionCreatorsToProps(dispatch) {
  return bindActionCreators(
    {
      setEntryPropertiesSplitSize: SettingsActions.setEntryPropertiesSplitSize,
      closeAllFiles: AppActions.closeAllFiles,
      renameFile: AppActions.renameFile,
      renameDirectory: AppActions.renameDirectory,
      openFile: AppActions.openFile,
      openFileNatively: AppActions.openFileNatively,
      openURLExternally: AppActions.openURLExternally,
      showNotification: AppActions.showNotification,
      getNextFile: AppActions.getNextFile,
      getPrevFile: AppActions.getPrevFile,
      deleteFile: AppActions.deleteFile,
      toggleEntryFullWidth: AppActions.toggleEntryFullWidth,
      addTags: TaggingActions.addTags,
      removeTags: TaggingActions.removeTags,
      removeAllTags: TaggingActions.removeAllTags,
      editTagForEntry: TaggingActions.editTagForEntry,
      reflectUpdateSidecarMeta: AppActions.reflectUpdateSidecarMeta,
      updateThumbnailUrl: AppActions.updateThumbnailUrl,
      setLastSelectedEntry: AppActions.setLastSelectedEntry,
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

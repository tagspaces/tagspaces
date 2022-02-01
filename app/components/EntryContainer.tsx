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

import React, {
  MutableRefObject,
  useCallback,
  useEffect,
  useReducer,
  useRef,
  useState
} from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { GlobalHotKeys } from 'react-hotkeys';
import fscreen from 'fscreen';
import Button from '@material-ui/core/Button';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import SaveIcon from '@material-ui/icons/Save';
import CloseIcon from '@material-ui/icons/Close';
import BackIcon from '@material-ui/icons/RemoveRedEye';
import FullScreenIcon from '@material-ui/icons/ZoomOutMap';
import OpenNativelyIcon from '@material-ui/icons/Launch';
import PrevDocumentIcon from '@material-ui/icons/KeyboardArrowUp';
import NextDocumentIcon from '@material-ui/icons/KeyboardArrowDown';
import FileDownloadIcon from '@material-ui/icons/AssignmentReturned';
import DetailsIcon from '@material-ui/icons/Info';
import ExpandIcon from '@material-ui/icons/SettingsEthernet';
import DeleteIcon from '@material-ui/icons/Delete';
import ShareIcon from '@material-ui/icons/Share';
import { withStyles } from '@material-ui/core/styles';
import RefreshIcon from '@material-ui/icons/Refresh';
import Box from '@material-ui/core/Box';
import { Split } from 'ts-react-splitter';
import EntryProperties from '-/components/EntryProperties';
import ConfirmDialog from '-/components/dialogs/ConfirmDialog';
import AppConfig from '-/config';
import PlatformIO from '-/services/platform-facade';
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
// import { buffer } from '-/utils/misc';
import {
  actions as SettingsActions,
  isDesktopMode,
  getKeyBindingObject,
  getTagColor,
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
import FileView from '-/components/FileView';
import { buffer } from '-/utils/misc';

const defaultSplitSize = '7.86%'; // '7.2%'; // 103;
// const openedSplitSize = AppConfig.isElectron ? 560 : 360;
/* const fullSplitSize = 750;
// const maxCharactersTitleLength = 50;
*/
const bufferedSplitResize = buffer({
  timeout: 300,
  id: 'buffered-split-resize'
});

const styles: any = (theme: any) => ({
  toolbar2: {
    width: '100%',
    paddingLeft: 0,
    paddingRight: 5,
    paddingTop: 0,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    zIndex: 2
    // borderBottom: '1px solid ' + theme.palette.divider
  },
  flexLeft: {
    flexDirection: 'row',
    flex: '1 1',
    display: 'flex',
    overflowX: AppConfig.isFirefox ? 'auto' : 'overlay',
    paddingRight: 100
  },
  fileBadge: {
    color: 'white',
    backgroundColor: AppConfig.defaultFileColor,
    padding: '2px 5px 0px 5px',
    textShadow: '1px 1px #8f8f8f',
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
    right: 0,
    backgroundColor: theme.palette.background.default,
    boxShadow: '-15px -2px 24px 3px ' + theme.palette.background.default
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
  setEntryPropertiesSplitSize: (size: string) => void;
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
  defaultTagColor?: string;
}

const EntryContainer = (props: Props) => {
  // const [percent, setPercent] = React.useState<number | undefined>(undefined);
  const percent = useRef<number | undefined>(undefined);
  const openedFile = props.openedFiles[0];
  // const [currentEntry, setCurrentEntry] = useState<OpenedEntry>(openedFile);

  const [isPropertiesPanelVisible, setPropertiesPanelVisible] = useState<
    boolean
  >(false);
  const [isFullscreen, setFullscreen] = useState<boolean>(false);
  // eslint-disable-next-line no-unused-vars
  const [ignored, forceUpdate] = useReducer(x => x + 1, 0);
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
  const fileViewer: MutableRefObject<HTMLIFrameElement> = useRef<
    HTMLIFrameElement
  >(null);
  const fileViewerContainer: MutableRefObject<HTMLDivElement> = useRef<
    HTMLDivElement
  >(null);

  const fileChanged = useRef<Boolean>(false);

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

  const handleFullscreenChange = useCallback(e => {
    let change = '';
    if (fscreen.fullscreenElement !== null) {
      change = 'Entered fullscreen mode';
      setFullscreen(true);
    } else {
      change = 'Exited fullscreen mode';
      setFullscreen(false);
    }
    console.log(change, e);
  }, []);

  const handleFullscreenError = useCallback(e => {
    console.log('Fullscreen Error', e);
  }, []);

  const toggleFullScreen = useCallback(() => {
    if (isFullscreen) {
      fscreen.exitFullscreen();
    } else {
      fscreen.requestFullscreen(fileViewerContainer.current);
    }
  }, [isFullscreen]);

  useEffect(() => {
    if (fscreen.fullscreenEnabled) {
      fscreen.addEventListener(
        'fullscreenchange',
        handleFullscreenChange,
        false
      );
      fscreen.addEventListener('fullscreenerror', handleFullscreenError, false);
      return () => {
        fscreen.removeEventListener('fullscreenchange', handleFullscreenChange);
        fscreen.removeEventListener('fullscreenerror', handleFullscreenError);
      };
    }
  });

  useEffect(() => {
    if (
      fileViewer &&
      fileViewer.current &&
      fileViewer.current.contentWindow &&
      // @ts-ignore
      fileViewer.current.contentWindow.setTheme
    ) {
      // @ts-ignore call setContent from iframe
      fileViewer.current.contentWindow.setTheme(props.settings.currentTheme);
    }
  }, [props.settings.currentTheme]);

  useEffect(() => {
    if (props.openedFiles.length > 0) {
      if (
        // openedFile.editMode &&
        // openedFile.changed &&
        fileChanged.current
        // openedFile.shouldReload === false
      ) {
        setSaveBeforeReloadConfirmDialogOpened(true);
      }
    }
  }, [props.openedFiles, props.isReadOnlyMode]); // , props.settings]);

  /**
   *  always open for dirs
   */
  const isPropPanelVisible = openedFile.isFile
    ? isPropertiesPanelVisible
    : true;

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
        if (editingSupported) {
          editFile();
        }
        break;
      case 'playbackEnded':
        props.openNextFile(openedFile.path);
        break;
      case 'openLinkExternally':
        props.openLink(data.link);
        break;
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
          fileViewer.current.contentWindow.setTheme(
            props.settings.currentTheme
          );
        }
        // TODO make loading index.html for folders configurable
        // if (!this.state.currentEntry.isFile) {
        //   textFilePath += '/index.html';
        // }
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
            return true;
          })
          .catch(err => {
            console.warn('Error loading text content ' + err);
          });
        break;
      case 'contentChangedInEditor': {
        if (!fileChanged.current) {
          fileChanged.current = true;
          // to render DOT before file name (only first time)
          forceUpdate();
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
      if (openedFile.editMode && fileChanged.current) {
        // openedFile.changed) {
        setSaveBeforeReloadConfirmDialogOpened(true);
      } else {
        props.updateOpenedFile(openedFile.path, {
          ...openedFile,
          editMode: false,
          shouldReload: !openedFile.shouldReload
        });
      }
    }
  };

  const startClosingFile = event => {
    if (event) {
      event.preventDefault(); // Let's stop this event.
      event.stopPropagation();
    }
    if (openedFile && fileChanged.current && openedFile.editMode) {
      // openedFile.changed
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
          // changed: false,
          shouldReload: undefined
        });
        fileChanged.current = false;
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
    // setFileView(renderFileView());
  };

  const shareFile = (filePath: string) => {
    PlatformIO.shareFiles([filePath]);
  };

  const setPercent = (p: number | undefined) => {
    percent.current = p;
    // console.log('Percent ' + percent.current);
    if (p !== undefined) {
      bufferedSplitResize(() => {
        // Threshold >10% for automatically close Properties panel
        if (p <= 10) {
          // parseInt(defaultSplitSize, 10)) {
          closePanel();
        } else {
          if (props.settings.entrySplitSize !== p + '%') {
            props.setEntryPropertiesSplitSize(p + '%');
          }
          openPanel();
        }
      });
    }
    forceUpdate();
  };

  const openPanel = () => {
    if (!isPropertiesPanelVisible) {
      percent.current = parseFloat(props.settings.entrySplitSize);
      setPropertiesPanelVisible(true);
    }
  };

  const closePanel = () => {
    if (isPropertiesPanelVisible) {
      percent.current = undefined;
      setPropertiesPanelVisible(false);
    }
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
              onClick={() => {
                props.toggleEntryFullWidth();
                closePanel();
              }}
            >
              <ExpandIcon />
            </IconButton>
          </Tooltip>
        )}
      </div>
      <div
        style={{
          position: 'absolute',
          top: 50,
          right: 0,
          backgroundColor: theme.palette.background.default,
          boxShadow: '-11px -2px 20px 3px ' + theme.palette.background.default
        }}
      >
        <Tooltip title={i18n.t('core:openPrevFileTooltip')}>
          <IconButton
            aria-label={i18n.t('core:openPrevFileTooltip')}
            data-tid="fileContainerPrevFile"
            onClick={openPrevFile}
          >
            <PrevDocumentIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title={i18n.t('core:openNextFileTooltip')}>
          <IconButton
            aria-label={i18n.t('core:openNextFileTooltip')}
            data-tid="fileContainerNextFile"
            onClick={openNextFile}
          >
            <NextDocumentIcon />
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
        {props.isDesktopMode && (
          <Tooltip title={i18n.t('core:openInFullWidth')}>
            <IconButton
              data-tid="openInFullWidthTID"
              aria-label={i18n.t('core:openInFullWidth')}
              onClick={() => {
                props.toggleEntryFullWidth();
                closePanel();
              }}
            >
              <ExpandIcon />
            </IconButton>
          </Tooltip>
        )}
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

  const previewTags = () => {
    if (!openedFile.tags || openedFile.tags.length < 1) {
      return;
    }
    let tagNames = i18n.t('core:searchTags') + ': ';
    openedFile.tags.forEach(tag => {
      tagNames = tagNames + tag.title + '; ';
    });
    const firstTagColor = openedFile.tags[0].color || defaultTagColor;
    let secondTagColor = defaultTagColor;
    if (openedFile.tags[1] && openedFile.tags[1].color) {
      secondTagColor = openedFile.tags[1].color;
    }
    return (
      <Tooltip title={tagNames}>
        <span
          style={{
            width: 15,
            height: 15,
            marginTop: 13,
            marginLeft: 5,
            borderRadius: 6,
            boxShadow: '4px 0px 0px 0px ' + secondTagColor,
            backgroundColor: firstTagColor
          }}
        />
      </Tooltip>
    );
  };

  const { classes, keyBindings, theme, defaultTagColor } = props;

  const fileTitle: string = openedFile.path
    ? extractTitle(
        openedFile.path,
        !openedFile.isFile,
        PlatformIO.getDirSeparator()
      )
    : '';

  const filePropsHeight =
    Math.floor((percent.current * window.innerHeight) / 100) - 125;
  // console.log('filePropsHeight: ' + filePropsHeight);

  const renderPanels = () => {
    const closeButton = (
      <Tooltip title={i18n.t('core:closeEntry')}>
        <IconButton
          onClick={startClosingFile}
          aria-label={i18n.t('core:closeEntry')}
          data-tid="fileContainerCloseOpenedFile"
        >
          <CloseIcon />
        </IconButton>
      </Tooltip>
    );

    const toolbarButtons = () => {
      if (openedFile.path) {
        return (
          <Box
            key="toolbarButtonsID"
            style={{
              width: '100%',
              flexDirection: 'column',
              flex: '1 1 100%',
              display: 'flex',
              backgroundColor: theme.palette.background.default,
              height: filePropsHeight || 'initial'
            }}
          >
            <Box
              style={{
                paddingLeft: 0,
                paddingRight: 50,
                paddingTop: 0,
                minHeight: 50,
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'flex-start'
              }}
            >
              <Box className={classes.flexLeft} style={{ paddingRight: 20 }}>
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
                      {fileChanged.current // openedFile.editMode && openedFile.changed
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
                {previewTags()}
              </Box>
              <div className={classes.entryCloseSection}>
                {editingSupported && openedFile.editMode && (
                  <>
                    <Tooltip title={i18n.t('core:saveFile')}>
                      <IconButton
                        disabled={false}
                        onClick={startSavingFile}
                        aria-label={i18n.t('core:saveFile')}
                        data-tid="fileContainerSaveFile"
                      >
                        <SaveIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Preview">
                      <IconButton
                        onClick={reloadDocument}
                        aria-label={i18n.t('core:cancelEditing')}
                      >
                        <BackIcon />
                      </IconButton>
                    </Tooltip>
                    {closeButton}
                  </>
                )}
                {editingSupported && !openedFile.editMode && (
                  <>
                    <Tooltip title={i18n.t('core:editFile')}>
                      <Button
                        disabled={false}
                        size="small"
                        variant="outlined"
                        color="primary"
                        onClick={editFile}
                        aria-label={i18n.t('core:editFile')}
                        data-tid="fileContainerEditFile"
                      >
                        {i18n.t('core:edit')}
                      </Button>
                    </Tooltip>
                    {closeButton}
                  </>
                )}
                {!editingSupported && closeButton}
              </div>
            </Box>
            {entryProperties}
          </Box>
        );
      }
      return <div>{i18n.t('core:noEntrySelected')}</div>;
    };

    const entryProperties = (
      <div
        style={{
          display: 'inline',
          flex: '1 1 100%',
          backgroundColor: theme.palette.background.default,
          padding: '0',
          height: '100%'
        }}
      >
        {openedFile.isFile ? renderFileToolbar(classes) : renderFolderToolbar()}
        <EntryProperties
          key={openedFile.path}
          openedEntry={openedFile}
          tagDelimiter={props.settings.tagDelimiter}
          renameFile={props.renameFile}
          renameDirectory={props.renameDirectory}
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
      </div>
    );

    let initSize;
    if (isPropPanelVisible) {
      initSize = openedFile.isFile ? props.settings.entrySplitSize : '100%';
    } else {
      initSize = defaultSplitSize; // '0%';
    }

    return (
      <Split
        horizontal
        minPrimarySize="100px"
        initialPrimarySize={initSize}
        percent={percent.current}
        setPercent={setPercent}
      >
        {toolbarButtons()}
        <FileView
          key="FileViewID"
          openedFile={props.openedFiles[0]}
          isFullscreen={isFullscreen}
          fileViewer={fileViewer}
          fileViewerContainer={fileViewerContainer}
          toggleFullScreen={toggleFullScreen}
          currentTheme={props.settings.currentTheme}
        />
      </Split>
    );
  };

  return (
    <GlobalHotKeys
      handlers={{
        closeViewer: startClosingFile,
        saveDocument: startSavingFile,
        editDocument: editFile,
        nextDocument: openNextFile,
        prevDocument: openPrevFile,
        toggleFullScreen
      }}
      keyMap={{
        nextDocument: keyBindings.nextDocument,
        prevDocument: keyBindings.prevDocument,
        closeViewer: keyBindings.closeViewer,
        saveDocument: keyBindings.saveDocument,
        editDocument: keyBindings.editDocument,
        toggleFullScreen: keyBindings.toggleFullScreen
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
                // changed: false,
                shouldReload: true
              });
              fileChanged.current = false;
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
      {/* eslint-disable-next-line jsx-a11y/anchor-has-content,jsx-a11y/anchor-is-valid */}
      <a href="#" id="downloadFile" />
      {renderPanels()}
    </GlobalHotKeys>
  );
};

function mapStateToProps(state) {
  return {
    settings: state.settings,
    defaultTagColor: getTagColor(state),
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
const areEqual = (prevProp, nextProp) =>
  // JSON.stringify(nextProp.theme) === JSON.stringify(prevProp.theme) &&
  nextProp.settings.currentTheme === prevProp.settings.currentTheme &&
  nextProp.settings.entrySplitSize === prevProp.settings.entrySplitSize &&
  JSON.stringify(nextProp.openedFiles) === JSON.stringify(prevProp.openedFiles);
/* nextProp.openedFiles[0].path === prevProp.openedFiles[0].path &&
  nextProp.openedFiles[0].shouldReload ===
    prevProp.openedFiles[0].shouldReload &&
  nextProp.openedFiles[0].editMode === prevProp.openedFiles[0].editMode; */

export default connect(
  mapStateToProps,
  mapActionCreatorsToProps
)(
  // @ts-ignore
  React.memo(withStyles(styles, { withTheme: true })(EntryContainer), areEqual)
);

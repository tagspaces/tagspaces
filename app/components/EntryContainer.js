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
 * @flow
 */

import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import EditIcon from '@material-ui/icons/Edit';
import moment from 'moment';
import SaveIcon from '@material-ui/icons/Save';
import CloseIcon from '@material-ui/icons/Close';
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
import CopyContentIcon from '@material-ui/icons/FileCopy';
import { withStyles } from '@material-ui/core/styles';
import RefreshIcon from '@material-ui/icons/Refresh';
import EntryProperties from './EntryProperties';
import ConfirmDialog from './dialogs/ConfirmDialog';
import AppConfig from '../config';
import PlatformIO from '../services/platform-io';
import AddRemoveTagsDialog from './dialogs/AddRemoveTagsDialog';
import {
  getAllPropertiesPromise,
  openLinkExternally
} from '../services/utils-io';
import i18n from '../services/i18n';
import {
  extractContainingDirectoryPath,
  extractTitle,
  extractFileExtension,
  extractTagsAsObjects,
  baseName,
  extractFileNameWithoutExt,
  extractDirectoryName
} from '../utils/paths';
import { buffer } from '../utils/misc';
import { actions as SettingsActions } from '../reducers/settings';
import TaggingActions from '../reducers/tagging-actions';
import {
  type OpenedEntry,
  NotificationTypes,
  getOpenedFiles,
  isReadOnlyMode,
  actions as AppActions
} from '../reducers/app';

const defaultSplitSize = 103;
const openedSplitSize = 360;
const fullSplitSize = 600;
const maxCharactersTitleLength = 50;
const bufferedSplitResize = buffer({ timeout: 300, id: 'buffered-split-resize' });

const styles = theme => ({
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
    padding: '0 0 60px 0'
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
    borderBottom: '1px solid ' + theme.palette.divider
  },
  flexLeft: {
    flexDirection: 'row',
    flex: '1 1',
    display: 'flex'
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
    whiteSpace: 'nowrap',
  }
});

type Props = {
  classes: Object,
  openedFiles: Array<OpenedEntry>,
  settings: Object,
  closeAllFiles: () => void,
  renameFile: () => void,
  renameDirectory: () => void,
  addTags: () => void,
  removeTags: () => void,
  editTagForEntry: () => void,
  openFile: (filePath: string) => void,
  getNextFile: (path: string) => string,
  getPrevFile: (path: string) => string,
  openFileNatively: (path: string) => void,
  showNotification: (
    text: string,
    notificationType?: string, // NotificationTypes
    autohide?: boolean
  ) => void,
  removeAllTags: () => void,
  deleteFile: (path: string) => void,
  toggleEntryFullWidth: () => void,
  isReadOnlyMode: boolean,
  setEntryPropertiesSplitSize: (size: number) => void
};

type State = {
  isPropertiesPanelVisible?: boolean,
  isFullscreen: boolean,
  currentEntry?: OpenedEntry | null,
  entryProps?: Object | null,
  editingSupported?: boolean,
  isSaveBeforeCloseConfirmDialogOpened?: boolean,
  openedSplitSize?: number,
  isEditTagsModalOpened?: boolean,
  selectedItem?: Object,
  isDeleteEntryModalOpened?: boolean,
  shouldCopyFile?: boolean,
  entryPropertiesSplitSize?: number
};

class EntryContainer extends React.Component<Props, State> {
  state = {
    isPropertiesPanelVisible: false,
    isFullscreen: false,
    editingSupported: false,
    isSaveBeforeCloseConfirmDialogOpened: false,
    openedSplitSize,
    isEditTagsModalOpened: false,
    isDeleteEntryModalOpened: false,
    currentEntry: null,
    selectedItem: {},
    shouldCopyFile: false,
    entryPropertiesSplitSize: 0
  };

  componentDidMount() {
    window.addEventListener('toggle-resume', () => {
      // console.log('Play pause');
      if (AppConfig.isElectron && this.fileViewer) {
        // this.fileViewer.dispatchEvent(audioEvent);
        this.fileViewer.executeJavaScript(
          'window.dispatchEvent(new Event("resume"));',
        );
      } else if (this.fileViewer) {
        this.fileViewer.dispatchEvent(new Event('resume'));
      }
    });
    if (AppConfig.isElectron) {
      if (this.fileViewer) {
        this.fileViewer.addEventListener('console-message', e => {
          console.log('Ext. Logging >>> ', e.message);
        });

        this.fileViewer.addEventListener('ipc-message', event => {
          this.handleMessage(JSON.stringify(event.channel));
        });
      }
    } else {
      window.addEventListener(
        'message',
        e => {
          this.handleMessage(e);
        },
        false
      );
    }
  }

  componentWillReceiveProps(nextProps: Props) {
    if (nextProps.openedFiles.length > 0) {
      const nextEntry = nextProps.openedFiles[0];
      if (
        this.state.currentEntry &&
        this.state.currentEntry.changed
      ) {
        this.props.showNotification(i18n.t('core:currentlyFileChangedSaveOrClose'));
        return true;
      }

      this.setState({ currentEntry: nextEntry });

      if (nextEntry.editingExtensionId && nextEntry.editingExtensionId.length > 3) {
        this.setState({ editingSupported: true });
      } else {
        this.setState({ editingSupported: false });
      }

      const { settings } = nextProps;

      const currentEntry = nextProps.openedFiles[0];
      const tags = extractTagsAsObjects(currentEntry.path, settings.tagDelimiter);
      this.setState({
        selectedItem: {
          ...currentEntry,
          tags
        }
      });

      this.setState({
        entryPropertiesSplitSize: settings.entryPropertiesSplitSize,
        isPropertiesPanelVisible: settings.entryPropertiesSplitSize > defaultSplitSize
      });
    } else {
      this.setState({ currentEntry: null });
    }
  }

  /* componentDidUpdate(prevProps, prevState) {
    if (!this.state.currentEntry || !this.state.currentEntry.path) {
      return;
    }
    if (prevState.currentEntry == null || this.state.currentEntry.path !== prevState.currentEntry.path) {
      if (AppConfig.isElectron) {
        if (this.fileViewer) {
          // this.fileViewer.addEventListener('console-message', e => {
          //  console.log('Ext. Logging >>> ', e.message);
          // });

          window.addEventListener('toggle-resume', e => {
            const audioEvent = new CustomEvent('resume', { detail: e.detail });
            this.fileViewer.dispatchEvent(audioEvent);
          });

          this.fileViewer.addEventListener('ipc-message', event => {
            this.handleMessage(JSON.stringify(event.channel));
          });
        }
      } else {
        window.addEventListener(
          'message',
          this.handleMessage,
          false
        );
      }
    }
  } */

  componentWillUnmount() {
    if (AppConfig.isElectron) {
      if (this.fileViewer) {
        this.fileViewer.removeEventListener('console-message');
        this.fileViewer.removeEventListener('ipc-message');
      }
    } else {
      window.removeEventListener('message', this.handleMessage);
    }
  }

  fileViewer;
  fileViewerContainer;

  handleMessage = (msg: Object | string) => {
    let data;
    let message;
    if (msg.data) {
      data = JSON.parse(msg.data);
    } else {
      data = JSON.parse(msg); // electron case
    }
    switch (data.command) {
    case 'showAlertDialog':
      message = data.title ? data.title : '';
      if (data.message) {
        message = message + ': ' + data.message;
      }
      this.props.showNotification(message, NotificationTypes.default);
      break;
    case 'saveDocument':
      this.startSavingFile();
      break;
    case 'playbackEnded':
      this.props.openFile(this.props.getNextFile(this.state.currentEntry.path));
      break;
    case 'openLinkExternally':
      console.log('Open link externaly: ' + data.link);
      openLinkExternally(data.link);
      break;
    case 'openFileNatively':
      console.log('Open file natively: ' + data.link);
      this.props.openFileNatively(data.link);
      break;
    case 'loadDefaultTextContent':
      if (!this.state.currentEntry || !this.state.currentEntry.path) {
        break;
      }
      PlatformIO.loadTextFilePromise(
        this.state.currentEntry.path,
        data.preview ? data.preview : false
      )
        .then(content => {
          let fileDirectory = extractContainingDirectoryPath(
            this.state.currentEntry.path
          );
          if (AppConfig.isWeb) {
            fileDirectory =
              extractContainingDirectoryPath(location.href) +
              '/' +
              fileDirectory;
          }
          if (AppConfig.isElectron && this.fileViewer) {
            this.fileViewer.executeJavaScript(
              'setContent(' +
              JSON.stringify(content) +
              ',' +
              JSON.stringify(fileDirectory) +
              ',' +
              !this.state.currentEntry.editMode +
              ')',
              false
            );
          } else {
            this.fileViewer.contentWindow.setContent(
              content,
              fileDirectory,
              !this.state.currentEntry.editMode
            );
          }
          return true;
        })
        .catch(err => {
          console.warn('Error loading text content ' + err);
        });
      break;
    case 'contentChangedInEditor':
      if (this.state.currentEntry.editMode) {
        this.setState({
          currentEntry: {
            ...this.state.currentEntry,
            changed: true
          }
        });
      }
      break;
    default:
      console.log('Not recognized messaging command: ' + msg);
      break;
    }
  };

  startClosingFile = (event) => {
    event.preventDefault(); // Let's stop this event.
    event.stopPropagation();
    if (this.state.currentEntry && this.state.currentEntry.changed) {
      this.setState({ isSaveBeforeCloseConfirmDialogOpened: true });
    } else {
      this.closeFile();
    }
  };

  closeFile = () => {
    this.setState(
      {
        currentEntry: null,
        editingSupported: false
      },
      this.props.closeAllFiles
    );
    /* if (AppConfig.isElectron) {
      if (this.fileViewer) {
        this.fileViewer.removeEventListener('console-message');
        this.fileViewer.removeEventListener('ipc-message');
      }
    } else {
      window.removeEventListener('message', this.handleMessage);
    } */
  };

  startSavingFile = () => {
    if (AppConfig.isElectron) {
      if (this.fileViewer) {
        this.fileViewer.executeJavaScript(
          'getContent()',
          false,
          textContent => {
            this.saveFile(textContent);
          }
        );
      }
    } else {
      const textContent = this.fileViewer.contentWindow.getContent();
      this.saveFile(textContent);
    }
  };

  saveFile = (textContent: string) => {
    PlatformIO.saveTextFilePromise(
      this.state.currentEntry.path,
      textContent,
      true
    )
      .then(result => {
        this.setState({
          currentEntry: {
            ...this.state.currentEntry,
            changed: false
          }
        });
        this.props.showNotification(
          i18n.t('core:fileSavedSuccessfully'),
          NotificationTypes.default
        );
        return result;
      })
      .catch(error => {
        this.props.showNotification(
          i18n.t('core:errorSavingFile'),
          NotificationTypes.error
        );
        console.log(
          'Error saving file ' + this.state.currentEntry.path + ' - ' + error
        );
      });
  };

  editFile = () => {
    this.setState({
      currentEntry: { ...this.state.currentEntry, editMode: true }
    });
  };

  toggleFullScreen = () => {
    if (this.state.isFullscreen && document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
      this.setState({ isFullscreen: false });
      return;
    } else if (this.state.isFullscreen && document.exitFullscreen) { // TODO exit fullscreen firefox does not work
      document.exitFullscreen().then(() => {
        console.log('Fullscreen exit successful');
        return true;
      }).catch((e) => {
        console.log('Error exiting fullscreen');
      });
      this.setState({ isFullscreen: false });
      return;
    } /* else if (this.state.isFullscreen && document.mozExitFullscreen) {
      document.mozExitFullscreen();
      this.setState({ isFullscreen: false });
      return;
    } */
    if (!this.state.isFullscreen && this.fileViewerContainer) {
      if (this.fileViewerContainer && this.fileViewerContainer.webkitRequestFullscreen) {
        this.fileViewerContainer.webkitRequestFullscreen();
        this.setState({ isFullscreen: true });
      } else if (this.fileViewerContainer && this.fileViewerContainer.requestFullscreen) {
        this.fileViewerContainer.requestFullscreen();
        this.setState({ isFullscreen: true });
      } else if (this.fileViewerContainer && this.fileViewerContainer.mozRequestFullScreen) {
        this.fileViewerContainer.mozRequestFullScreen();
        this.setState({ isFullscreen: true });
      }
    }
  };

  openPanel = () => {
    /* if (this.state.currentEntry) {
      getAllPropertiesPromise(this.state.currentEntry.path)
        .then(entryProps => {
          console.log(JSON.stringify(entryProps));
          return true;
        })
        .catch(error => {
          console.warn('Error getting properties for entry: ' + error);
        });
    } */

    this.setState({
      openedSplitSize,
      isPropertiesPanelVisible: true
    }, () => this.props.setEntryPropertiesSplitSize(openedSplitSize));
  };

  closePanel = () => {
    this.setState({
      openedSplitSize: defaultSplitSize,
      entryPropertiesSplitSize: defaultSplitSize,
      isPropertiesPanelVisible: false
    }, () => this.props.setEntryPropertiesSplitSize(defaultSplitSize));
  };

  togglePanel = () => {
    if (this.state.isPropertiesPanelVisible) {
      this.closePanel();
    } else {
      this.openPanel();
    }
  };

  openNextFile = () => {
    if (this.state.currentEntry && this.state.currentEntry.path) {
      const nextFile = this.props.getNextFile(this.state.currentEntry.path);
      this.props.openFile(nextFile);
    }
  };

  openPrevFile = () => {
    if (this.state.currentEntry && this.state.currentEntry.path) {
      const prevFile = this.props.getPrevFile(this.state.currentEntry.path);
      this.props.openFile(prevFile);
    }
  };

  openNatively = () => {
    if (this.state.currentEntry) {
      this.props.openFileNatively(this.state.currentEntry.path);
    }
  };

  renderFileToolbar = classes => (
    <div className={classes.toolbar2}>
      <div className={classes.flexLeft}>
        <IconButton
          title={i18n.t('core:toggleProperties')}
          aria-label={i18n.t('core:toggleProperties')}
          onClick={this.togglePanel}
          data-tid="fileContainerToggleProperties"
        >
          <DetailsIcon
            color={this.state.isPropertiesPanelVisible ? 'primary' : 'action'}
          />
        </IconButton>
        <IconButton
          title={i18n.t('core:switchToFullscreen')}
          aria-label={i18n.t('core:switchToFullscreen')}
          data-tid="fileContainerSwitchToFullScreen"
          onClick={this.toggleFullScreen}
        >
          <FullScreenIcon />
        </IconButton>
        <IconButton
          title={i18n.t('core:openInFullWidth')}
          aria-label={i18n.t('core:openInFullWidth')}
          onClick={this.props.toggleEntryFullWidth}
        >
          <ExpandIcon />
        </IconButton>
        {!PlatformIO.haveObjectStoreSupport() && (
          <IconButton
            title={i18n.t('core:openFileExternally')}
            aria-label={i18n.t('core:openFileExternally')}
            onClick={this.openNatively}
          >
            <OpenNativelyIcon />
          </IconButton>
        )}
        <IconButton
          title={i18n.t('core:downloadFile')}
          aria-label={i18n.t('core:downloadFile')}
          onClick={() => {
            const { currentEntry } = this.state;
            const date = new Date();
            const downloadLink = document.getElementById('downloadFile');
            const entryName = `${baseName(currentEntry.path)}`;
            const fileExtension = extractFileExtension(entryName);
            const fileName = extractFileNameWithoutExt(entryName);
            const modifiedEntryName = `${fileName}_${moment(date).format('YYYYMMDD')}~${moment(date).format('hhmmss')}.${fileExtension}`;

            if (downloadLink) {
              if (AppConfig.isWeb) {
                const link = `${location.protocol}//${location.hostname}${location.port !== '' ? `:${location.port}` : ''}${modifiedEntryName}`;
                downloadLink.setAttribute('href', link);
              } else {
                downloadLink.setAttribute('href', `file:///${currentEntry.path}`);
              }

              if (currentEntry.url) {
                downloadLink.setAttribute('href', currentEntry.url);
              }

              downloadLink.setAttribute('download', fileName); //
              downloadLink.click();
            }
          }}
        >
          <FileDownloadIcon />
        </IconButton>
        <IconButton
          title={i18n.t('core:reloadFile')}
          aria-label={i18n.t('core:reloadFile')}
          onClick={() => {
            const { currentEntry } = this.state;
            this.setState({
              currentEntry: {
                ...currentEntry,
                shouldReload: true
              }
            });
          }}
        >
          <RefreshIcon />
        </IconButton>
        <IconButton
          aria-label={i18n.t('core:duplicateFile')}
          title={i18n.t('core:duplicateFile')}
          onClick={() => {
            this.setState({ shouldCopyFile: true });
          }}
        >
          <CopyContentIcon />
        </IconButton>
        <IconButton
          title={i18n.t('core:deleteEntry')}
          aria-label={i18n.t('core:deleteEntry')}
          onClick={() => this.setState({ isDeleteEntryModalOpened: true })}
        >
          <DeleteIcon />
        </IconButton>
      </div>
      <IconButton
        title={i18n.t('core:openPrevFileTooltip')}
        aria-label={i18n.t('core:openPrevFileTooltip')}
        data-tid="fileContainerPrevFile"
        onClick={this.openPrevFile}
      >
        <ArrowLeftIcon />
      </IconButton>
      <IconButton
        title={i18n.t('core:openNextFileTooltip')}
        aria-label={i18n.t('core:openNextFileTooltip')}
        data-tid="fileContainerNextFile"
        onClick={this.openNextFile}
      >
        <ArrowRightIcon />
      </IconButton>
    </div>
  );

  renderFolderToolbar = () => (
    <div className={this.props.classes.toolbar2}>
      <div className={this.props.classes.flexLeft}>
        {!PlatformIO.haveObjectStoreSupport() && (
          <IconButton
            title={i18n.t('core:openDirectoryExternally')}
            aria-label={i18n.t('core:openDirectoryExternally')}
            onClick={this.openNatively}
          >
            <OpenNativelyIcon />
          </IconButton>
        )}
        <IconButton
          title={i18n.t('core:reloadDirectory')}
          aria-label={i18n.t('core:reloadDirectory')}
          onClick={() => {
            const { currentEntry } = this.state;
            this.setState({
              currentEntry: {
                ...currentEntry,
                shouldReload: true
              }
            });
          }}
        >
          <RefreshIcon />
        </IconButton>
        <IconButton
          title={i18n.t('core:deleteDirectory')}
          aria-label={i18n.t('core:deleteDirectory')}
          onClick={() => this.setState({ isDeleteEntryModalOpened: true })}
        >
          <DeleteIcon />
        </IconButton>
      </div>
    </div>
  );

  renderFileView = (fileOpenerURL) => {
    if (AppConfig.isElectron) {
      return (
        <webview
          id="webViewer"
          ref={fileViewer => {
            this.fileViewer = fileViewer;
          }}
          className={this.props.classes.fileOpener}
          src={fileOpenerURL}
          allowFullScreen
          preload="./node_modules/@tagspaces/legacy-ext/webview-preload.js"
        />
      );
    }
    return (
      <iframe
        ref={fileViewer => {
          this.fileViewer = fileViewer;
        }}
        className={this.props.classes.fileOpener}
        src={fileOpenerURL}
        allowFullScreen
        sandbox="allow-same-origin allow-scripts"
        title={i18n.t('core:fileViewer')}
        id="FileViewer"
      />
    );
  };

  render() {
    const { classes } = this.props;
    const { isEditTagsModalOpened, currentEntry, isFullscreen } = this.state;
    let fileOpenerURL: string;
    let fileTitle: string = '';

    if (currentEntry && currentEntry.path) {
      fileTitle = extractTitle(currentEntry.path, !currentEntry.isFile);
      if (fileTitle.length > maxCharactersTitleLength) {
        fileTitle = fileTitle.substr(0, maxCharactersTitleLength) + '...';
      }

      if (currentEntry.editMode && currentEntry.editingExtensionPath) {
        fileOpenerURL =
          currentEntry.editingExtensionPath +
          '/index.html?file=' +
          encodeURIComponent(currentEntry.url ? currentEntry.url : currentEntry.path) +
          '&locale=' +
          i18n.language +
          '&edit=true';
      } else {
        fileOpenerURL =
          currentEntry.viewingExtensionPath +
          '/index.html?file=' +
          encodeURIComponent(currentEntry.url ? currentEntry.url : currentEntry.path) +
          '&locale=' +
          i18n.language;
      }
    } else {
      fileOpenerURL = 'about:blank';
    }

    return (
      <div>
        <ConfirmDialog
          open={this.state.isSaveBeforeCloseConfirmDialogOpened}
          onClose={() => {
            this.setState({ isSaveBeforeCloseConfirmDialogOpened: false });
          }}
          title={i18n.t('core:confirm')}
          content={i18n.t('core:saveFileBeforeClosingFile')}
          confirmCallback={result => {
            if (result) {
              this.startSavingFile();
            } else {
              this.closeFile();
              this.setState({ isSaveBeforeCloseConfirmDialogOpened: false });
            }
          }}
          cancelDialogTID={'cancelSaveBeforeCloseDialog'}
          confirmDialogTID={'confirmSaveBeforeCloseDialog'}
          confirmDialogContent={'confirmDialogContent'}
        />
        <ConfirmDialog
          open={this.state.isDeleteEntryModalOpened}
          onClose={() => {
            this.setState({ isDeleteEntryModalOpened: false });
          }}
          title={currentEntry && currentEntry.isFile ? i18n.t('core:deleteConfirmationTitle') : i18n.t('core:deleteDirectory')}
          content={(currentEntry && currentEntry.isFile) ? i18n.t('core:doYouWantToDeleteFile') : i18n.t('core:deleteDirectoryContentConfirm', { dirPath: currentEntry ? extractDirectoryName(currentEntry.path) : '' })}
          confirmCallback={result => {
            if (result && currentEntry) {
              this.props.deleteFile(currentEntry.path);
            }
          }}
          cancelDialogTID={'cancelSaveBeforeCloseDialog'}
          confirmDialogTID={'confirmSaveBeforeCloseDialog'}
          confirmDialogContent={'confirmDialogContent'}
        />
        <AddRemoveTagsDialog
          open={isEditTagsModalOpened}
          onClose={() => this.setState({ isEditTagsModalOpened: false })}
          addTags={this.props.addTags}
          removeTags={this.props.removeTags}
          removeAllTags={this.props.removeAllTags}
          selectedEntries={[this.state.selectedItem]}
        />
        <a href="#" id="downloadFile">
          {/* Download link */}
        </a>
        <SplitPane
          split="horizontal"
          resizerStyle={{ backgroundColor: this.props.theme.palette.divider }}
          size={(currentEntry && currentEntry.isFile) ? this.state.entryPropertiesSplitSize : '100%'}
          minSize={(currentEntry && currentEntry.isFile) ? defaultSplitSize : '100%'}
          maxSize={(currentEntry && currentEntry.isFile) ? fullSplitSize : '100%'}
          defaultSize={(currentEntry && currentEntry.isFile) ? this.state.entryPropertiesSplitSize : '100%'}
          onChange={size => {
            this.setState({
              isPropertiesPanelVisible: size > defaultSplitSize,
              openedSplitSize: size,
              entryPropertiesSplitSize: size
            });
            bufferedSplitResize(() => this.props.setEntryPropertiesSplitSize(size));
          }}
        >
          {currentEntry ? (
            <div className={classes.panel}>
              <div className={classes.toolbar}>
                <div className={classes.flexLeft}>
                  {currentEntry.isFile ? (
                    <Button
                      onClick={this.togglePanel}
                      title={i18n.t('core:toggleEntryProperties')}
                      aria-label={i18n.t('core:toggleEntryProperties')}
                      className={classes.entryNameButton}
                    >
                      <div
                        className={classes.fileBadge}
                        style={{ backgroundColor: currentEntry.color }}
                      >
                        {extractFileExtension(currentEntry.path)}
                      </div>
                      {fileTitle}
                      {currentEntry.changed ? String.fromCharCode(0x25cf) : ''}
                    </Button>
                  ) : (
                    <Button
                      onClick={this.togglePanel}
                      title={i18n.t('core:toggleEntryProperties')}
                      aria-label={i18n.t('core:toggleEntryProperties')}
                      className={classes.entryNameButton}
                    >
                      <div
                        className={classes.fileBadge}
                        style={{ backgroundColor: AppConfig.defaultFolderColor }}
                      >
                        <FolderIcon />
                      </div>
                      {fileTitle}
                    </Button>
                  )}
                </div>
                {(this.state.editingSupported && currentEntry.editMode) && (
                  <IconButton
                    disabled={false}
                    onClick={this.startSavingFile}
                    title={i18n.t('core:saveFile')}
                    aria-label={i18n.t('core:saveFile')}
                    data-tid="fileContainerSaveFile"
                  >
                    <SaveIcon />
                  </IconButton>
                )}
                {(this.state.editingSupported && !currentEntry.editMode) && (
                  <IconButton
                    disabled={false}
                    onClick={this.editFile}
                    title={i18n.t('core:editFile')}
                    aria-label={i18n.t('core:editFile')}
                    data-tid="fileContainerEditFile"
                  >
                    <EditIcon />
                  </IconButton>
                )}
                <IconButton
                  onClick={this.startClosingFile}
                  title={i18n.t('core:closeEntry')}
                  aria-label={i18n.t('core:closeEntry')}
                  data-tid="fileContainerCloseOpenedFile"
                >
                  <CloseIcon />
                </IconButton>
              </div>
              <div className={classes.entryProperties}>
                { currentEntry.isFile ?
                  this.renderFileToolbar(classes) : this.renderFolderToolbar()
                }
                <div style={{ overflowY: 'overlay', maxHeight: '100%' }}>
                  <EntryProperties
                    entryPath={currentEntry.path}
                    shouldReload={currentEntry.shouldReload}
                    addTags={this.props.addTags}
                    renameFile={this.props.renameFile}
                    renameDirectory={this.props.renameDirectory}
                    removeTags={this.props.removeTags}
                    editTagForEntry={this.props.editTagForEntry}
                    settings={this.props.settings}
                    deleteFile={this.props.deleteFile}
                    showNotification={this.props.showNotification}
                    shouldCopyFile={this.state.shouldCopyFile}
                    normalizeShouldCopyFile={() => this.setState({ shouldCopyFile: false })}
                    onEditTags={() => {
                      const tags = extractTagsAsObjects(currentEntry.path, this.props.settings.tagDelimiter);
                      this.setState({
                        selectedItem: {
                          ...currentEntry,
                          tags
                        },
                        isEditTagsModalOpened: true
                      });
                    }}
                  />
                </div>
              </div>
            </div>
          ) : <div>{i18n.t('core:noEntrySelected')}</div> }
          <div
            ref={element => {
              this.fileViewerContainer = element;
            }}
            className={classes.fileContent}
          >
            {isFullscreen && (
              <IconButton
                variant="fab"
                color="primary"
                style={{
                  position: 'absolute',
                  top: 20,
                  right: 20,
                  zIndex: 10000
                }}
                onClick={this.toggleFullScreen}
              >
                <CloseIcon />
              </IconButton>
            )}
            {this.renderFileView(fileOpenerURL)}
          </div>
        </SplitPane>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    openedFiles: getOpenedFiles(state),
    settings: state.settings,
    isReadOnlyMode: isReadOnlyMode(state),
  };
}

function mapActionCreatorsToProps(dispatch) {
  return bindActionCreators({
    setEntryPropertiesSplitSize: SettingsActions.setEntryPropertiesSplitSize,
    closeAllFiles: AppActions.closeAllFiles,
    renameFile: AppActions.renameFile,
    renameDirectory: AppActions.renameDirectory,
    openFile: AppActions.openFile,
    openFileNatively: AppActions.openFileNatively,
    showNotification: AppActions.showNotification,
    getNextFile: AppActions.getNextFile,
    getPrevFile: AppActions.getPrevFile,
    deleteFile: AppActions.deleteFile,
    toggleEntryFullWidth: AppActions.toggleEntryFullWidth,
    addTags: TaggingActions.addTags,
    removeTags: TaggingActions.removeTags,
    editTagForEntry: TaggingActions.editTagForEntry,
    removeAllTags: TaggingActions.removeAllTags,
  }, dispatch);
}

export default connect(mapStateToProps, mapActionCreatorsToProps)(
  withStyles(styles, { withTheme: true })(EntryContainer)
);

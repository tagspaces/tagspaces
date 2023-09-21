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
import { useDispatch, useSelector } from 'react-redux';
import { GlobalHotKeys } from 'react-hotkeys';
import fscreen from 'fscreen';
import Button from '@mui/material/Button';
import LoadingButton from '@mui/lab/LoadingButton';
import Tooltip from '-/components/Tooltip';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import Box from '@mui/material/Box';
import ButtonGroup from '@mui/material/ButtonGroup';
import { CancelIcon, CloseEditIcon } from '-/components/CommonIcons';
import { getUuid } from '@tagspaces/tagspaces-common/utils-io';
import { buffer } from '@tagspaces/tagspaces-common/misc';
import AppConfig from '-/AppConfig';
import {
  extractContainingDirectoryPath,
  getBackupFileLocation,
  extractFileExtension
} from '@tagspaces/tagspaces-common/paths';
import ConfirmDialog from '-/components/dialogs/ConfirmDialog';
import PlatformIO from '-/services/platform-facade';
import AddRemoveTagsDialog from '-/components/dialogs/AddRemoveTagsDialog';
import {
  isDesktopMode,
  getKeyBindingObject,
  isRevisionsEnabled,
  getEntryContainerTab,
  getFileEditHistoryKey
} from '-/reducers/settings';
import {
  OpenedEntry,
  NotificationTypes,
  isReadOnlyMode,
  actions as AppActions,
  getDirectoryPath,
  AppDispatch
} from '-/reducers/app';
import useEventListener from '-/utils/useEventListener';
import { TS } from '-/tagspaces.namespace';
import FileView from '-/components/FileView';
import { Pro } from '-/pro';
import { Switch } from '@mui/material';
import useFirstRender from '-/utils/useFirstRender';
import ResolveConflictDialog from '-/components/dialogs/ResolveConflictDialog';
import { styled, useTheme } from '@mui/material/styles';
import EntryContainerTabs from '-/components/EntryContainerTabs';
import EntryContainerNav from '-/components/EntryContainerNav';
import EntryContainerTitle from '-/components/EntryContainerTitle';
import { useTranslation } from 'react-i18next';
import { useDescriptionContext } from '-/hooks/useDescriptionContext';
import { useOpenedEntryContext } from '-/hooks/useOpenedEntryContext';

//const defaultSplitSize = '7.86%'; // '7.2%'; // 103;

const bufferedSplitResize = buffer({
  timeout: 300,
  id: 'buffered-split-resize'
});

const PREFIX = 'EntryContainer';
const classes = {
  toolbar2: `${PREFIX}-toolbar2`,
  flexLeft: `${PREFIX}-flexLeft`
};

const Root = styled(Box)(({ theme }) => ({
  width: '100%',
  flexDirection: 'column',
  flex: '1 1 100%',
  display: 'flex',
  backgroundColor: theme.palette.background.default,
  borderBottom: '5px solid ' + theme.palette.background.default,
  overflow: 'hidden',
  // height: '100%', // filePropsHeight ||
  [`& .${classes.toolbar2}`]: {
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
  [`& .${classes.flexLeft}`]: {
    flexDirection: 'row',
    flex: '1 1',
    display: 'flex',
    alignItems: 'baseline',
    overflowX: 'auto',
    overflowY: 'hidden',
    paddingRight: 100
  }
}));

const historyKeys = Pro && Pro.history ? Pro.history.historyKeys : {};

function EntryContainer() {
  const { t } = useTranslation();
  const dispatch: AppDispatch = useDispatch();
  const {
    openedEntries,
    closeAllFiles,
    openNextFile,
    openPrevFile,
    updateOpenedFile,
    reloadOpenedFile
  } = useOpenedEntryContext();
  const { saveDescription } = useDescriptionContext();
  const tabIndex = useSelector(getEntryContainerTab);
  const currentDirectoryPath = useSelector(getDirectoryPath);
  const fileEditHistoryKey = useSelector(getFileEditHistoryKey);
  const readOnlyMode = useSelector(isReadOnlyMode);
  const keyBindings = useSelector(getKeyBindingObject);
  const desktopMode = useSelector(isDesktopMode);
  const revisionsEnabled = useSelector(isRevisionsEnabled);
  const theme = useTheme();
  // const [percent, setPercent] = React.useState<number | undefined>(undefined);
  // const percent = useRef<number | undefined>(undefined);
  const timer = useRef<NodeJS.Timeout>(null);
  const openedFile = openedEntries[0];
  //const openedFilePath = useRef(openedFile.path);

  const [propertiesStyles, setPropertiesStyles] = useState<React.CSSProperties>(
    { display: 'flex', flexDirection: 'column' }
  );

  const [isRevisionPanelVisible, setRevisionPanelVisible] = useState<boolean>(
    false
  );
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
  const [isConflictDialogOpen, setConflictDialogOpen] = useState<boolean>(
    false
  );
  const [isSavingInProgress, setSavingInProgress] = useState<boolean>(false);
  const fileViewer: MutableRefObject<HTMLIFrameElement> = useRef<
    HTMLIFrameElement
  >(null);
  const fileViewerContainer: MutableRefObject<HTMLDivElement> = useRef<
    HTMLDivElement
  >(null);
  const fileChanged = useRef<boolean>(false);
  const eventID = useRef<string>(getUuid());
  // const firstRender = useFirstRender();

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

  const handleFullscreenChange = useCallback(e => {
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
          console.error('err:', ex);
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
          console.error('err:', ex);
        }
      }
    }
    console.log(change, e);
  }, []);

  const handleFullscreenError = useCallback(e => {
    console.log('Fullscreen Error', e);
  }, []);

  const toggleFullScreen = useCallback(() => {
    if (openedFile.isFile) {
      if (isFullscreen) {
        fscreen.exitFullscreen();
      } else {
        fscreen.requestFullscreen(fileViewerContainer.current);
      }
    }
  }, [isFullscreen]);

  /*useEffect(() => {
    // description is saved as Preview
    if (isPropertiesPanelVisible && openedFile.description) {
      reloadOpenedFile();
    }
  }, [isPropertiesPanelVisible]);*/

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
    if (openedFile.isAutoSaveEnabled) {
      if (fileChanged.current) {
        timer.current = setInterval(() => {
          if (openedFile.isAutoSaveEnabled && fileChanged.current) {
            startSavingFile();
            console.debug('autosave');
          }
        }, AppConfig.autoSaveInterval);
      } else if (timer.current) {
        clearInterval(timer.current);
      }
    } else if (timer.current) {
      clearInterval(timer.current);
    }
    return () => {
      if (timer.current) {
        clearInterval(timer.current);
      }
    };
  }, [openedFile.isAutoSaveEnabled, fileChanged.current]);

  // editor is not loaded in this time - change theme after loadDefaultTextContent
  /*useEffect(() => {
    if (
      fileViewer &&
      fileViewer.current &&
      fileViewer.current.contentWindow &&
      // @ts-ignore
      fileViewer.current.contentWindow.setTheme
    ) {
      // @ts-ignore call setContent from iframe
      fileViewer.current.contentWindow.setTheme(settings.currentTheme);
    }
  }, [settings.currentTheme]);*/

  /*  useEffect(() => {
    // if (openedFiles.length > 0) {
    if (
      !firstRender &&
      // openedFile.editMode &&
      // openedFile.changed &&
      fileChanged.current
      // openedFile.shouldReload === false
    ) {
      setSaveBeforeReloadConfirmDialogOpened(true);
    }
  }, [openedFilePath.current, readOnlyMode]);*/

  // always open for dirs
  /*const isPropPanelVisible = openedFile.isFile
    ? isPropertiesPanelVisible
    : true;*/

  const editingSupported: boolean =
    !readOnlyMode &&
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
        dispatch(
          AppActions.showNotification(message, NotificationTypes.default)
        );
        break;
      case 'saveDocument':
        savingFile(data.force !== undefined ? data.force : false);
        break;
      case 'editDocument':
        if (editingSupported) {
          editOpenedFile();
        }
        break;
      case 'playbackEnded':
        openNextFileAction();
        break;
      // case 'openLinkExternally':
      //   // openLink(data.link);
      //   break;
      case 'loadDefaultTextContent':
        if (!openedFile || !openedFile.path) {
          // || openedFile.changed) {
          break;
        }
        textFilePath = openedFile.path;

        /*if (
          fileViewer &&
          fileViewer.current &&
          fileViewer.current.contentWindow &&
          // @ts-ignore
          fileViewer.current.contentWindow.setTheme
        ) {
          // @ts-ignore call setContent from iframe
          fileViewer.current.contentWindow.setTheme(settings.currentTheme);
        }*/
        // TODO make loading index.html for folders configurable
        // if (!this.state.currentEntry.isFile) {
        //   textFilePath += '/index.html';
        // }
        dispatch(AppActions.switchLocationTypeByID(openedFile.locationId)).then(
          currentLocationId => {
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
                    !openedFile.editMode,
                    theme.palette.mode
                  );
                }
                if (currentLocationId) {
                  return dispatch(
                    AppActions.switchCurrentLocationType(currentLocationId)
                  );
                }
              })
              .catch(err => {
                console.warn('Error loading text content ' + err);
                if (currentLocationId) {
                  return dispatch(
                    AppActions.switchCurrentLocationType(currentLocationId)
                  );
                }
              });
          }
        );
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

  /*const reloadOpenedFile = () => {
    if (openedFile) {
      const metaFilePath = openedFile.isFile
        ? getMetaFileLocationForFile(
            openedFile.path,
            PlatformIO.getDirSeparator()
          )
        : getMetaFileLocationForDir(
            openedFile.path,
            PlatformIO.getDirSeparator()
          );
      try {
        loadJSONFile(metaFilePath)
          .then(fsEntryMeta => {
            updateOpenedFile(openedFile.path, {
              ...fsEntryMeta,
              editMode: false,
              shouldReload: !openedFile.shouldReload
            });
          })
          .catch(() =>
            updateOpenedFile(openedFile.path, {
              ...openedFile,
              editMode: false,
              shouldReload: !openedFile.shouldReload
            })
          );
      } catch (e) {
        updateOpenedFile(openedFile.path, {
          ...openedFile,
          editMode: false,
          shouldReload: !openedFile.shouldReload
        });
      }
    }
  };*/

  const reloadDocument = () => {
    if (openedFile) {
      if (openedFile.editMode && fileChanged.current) {
        // openedFile.changed) {
        setSaveBeforeReloadConfirmDialogOpened(true);
      } else {
        reloadOpenedFile();
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
    closeAllFiles();
    // setEditingSupported(false);
  };

  const startSavingFile = () => {
    if (openedFile.editMode) {
      savingFile();
    } else {
      saveDescription();
    }
  };

  function savingFile(force = false) {
    if (
      fileViewer &&
      fileViewer.current &&
      fileViewer.current.contentWindow &&
      // @ts-ignore
      fileViewer.current.contentWindow.getContent
    ) {
      try {
        //check if file is changed
        if (fileChanged.current || force) {
          setSavingInProgress(true);
          saveFile().then(success => {
            if (success) {
              fileChanged.current = false;
              // showNotification(
              //   t('core:fileSavedSuccessfully'),
              //   NotificationTypes.default
              // );
            }
            // change state will not render DOT before file name too
            setSavingInProgress(false);
          });
        }
      } catch (e) {
        setSavingInProgress(false);
        console.debug('function getContent not exist for video file:', e);
      }
    }
  }

  const override = (): Promise<boolean> => {
    return dispatch(
      AppActions.switchLocationTypeByID(openedFile.locationId)
    ).then(currentLocationId =>
      PlatformIO.getPropertiesPromise(
        openedFile.path
      ).then((entryProp: TS.FileSystemEntry) =>
        save({ ...openedFile, lmdt: entryProp.lmdt }).then(() =>
          dispatch(AppActions.switchCurrentLocationType(currentLocationId))
        )
      )
    );
  };

  const saveAs = (newFilePath: string): Promise<boolean> => {
    return dispatch(
      AppActions.switchLocationTypeByID(openedFile.locationId)
    ).then(currentLocationId =>
      PlatformIO.copyFilePromise(openedFile.path, newFilePath).then(() =>
        PlatformIO.getPropertiesPromise(newFilePath).then(
          (entryProp: TS.FileSystemEntry) =>
            save({
              ...openedFile,
              path: entryProp.path,
              lmdt: entryProp.lmdt
            }).then(() => {
              const openedFileDir = extractContainingDirectoryPath(
                entryProp.path
              );
              if (currentDirectoryPath === openedFileDir) {
                dispatch(
                  AppActions.loadDirectoryContent(openedFileDir, true, true)
                ); /*
                  updateOpenedFile(openedFile.path, {
                    ...openedFile,
                    editMode: false,
                    shouldReload: !openedFile.shouldReload
                  });*/
              }
              return dispatch(
                AppActions.switchCurrentLocationType(currentLocationId)
              );
            })
        )
      )
    );
  };

  const saveFile = (): Promise<boolean> => {
    return dispatch(
      AppActions.switchLocationTypeByID(openedFile.locationId)
    ).then(currentLocationId =>
      save(openedFile).then(() =>
        dispatch(AppActions.switchCurrentLocationType(currentLocationId))
      )
    );
  };

  async function save(fileOpen: OpenedEntry): Promise<boolean> {
    // @ts-ignore
    const textContent = fileViewer.current.contentWindow.getContent();
    if (Pro && revisionsEnabled) {
      const id = await Pro.MetaOperations.getMetadataID(
        fileOpen.path,
        fileOpen.uuid
      );
      const targetPath = getBackupFileLocation(
        fileOpen.path,
        id,
        PlatformIO.getDirSeparator()
      );
      try {
        await PlatformIO.copyFilePromiseOverwrite(fileOpen.path, targetPath); // todo test what happened if remove await?
      } catch (error) {
        console.error('copyFilePromiseOverwrite', error);
      }
    }
    return PlatformIO.saveTextFilePromise(
      { path: fileOpen.path, lmdt: fileOpen.lmdt },
      textContent,
      true
    )
      .then(() => {
        if (Pro) {
          Pro.history.saveHistory(
            historyKeys.fileEditKey,
            {
              path: fileOpen.path,
              url: fileOpen.url,
              lid: fileOpen.locationId
            },
            fileEditHistoryKey
          );
        }

        return updateOpenedFile(fileOpen.path, {
          id: '',
          ...fileOpen,
          editMode: true,
          //changed: false,
          shouldReload: undefined
        }).then(() => true);
      })
      .catch(error => {
        setConflictDialogOpen(true);
        console.log('Error saving file ' + fileOpen.path + ' - ' + error);
        return false;
      });
  }

  const editOpenedFile = () => {
    dispatch(AppActions.switchLocationTypeByID(openedFile.locationId)).then(
      currentLocationId => {
        updateOpenedFile(openedFile.path, {
          id: '',
          ...openedFile,
          editMode: true,
          shouldReload: undefined
        }).then(() => {
          dispatch(AppActions.switchCurrentLocationType(currentLocationId));
        });
      }
    );
  };

  /*const setPercent = (p: number | undefined) => {
    percent.current = p;
    // console.log('Percent ' + percent.current);
    if (p !== undefined) {
      bufferedSplitResize(() => {
        // Threshold >10% for automatically close Properties panel
        if (p <= 10) {
          // parseInt(defaultSplitSize, 10)) {
          closePanel();
        } else {
          if (entrySplitSize !== p + '%') {
            setEntryPropertiesSplitSize(p + '%');
          }
          openPanel();
        }
      });
    }
    forceUpdate();
  };*/

  const openPanel = () => {
    setPropertiesStyles({ display: 'flex', flexDirection: 'column' });
    /*if (!isPropertiesPanelVisible) {
      percent.current = parseFloat(settings.entrySplitSize);
      setPropertiesPanelVisible(true);
    }*/
  };

  const closePanel = () => {
    /*if (isPropertiesPanelVisible) {
      percent.current = undefined;
      setPropertiesPanelVisible(false);
    }*/
  };

  const toggleProperties = () => {
    if (propertiesStyles !== undefined) {
      setPropertiesStyles(undefined);
    } else {
      setPropertiesStyles({ display: 'flex', flexDirection: 'column' });
    }
    /*if (isPropPanelVisible && !isRevisionPanelVisible) {
      closePanel();
    } else {
      openPanel();
    }

    if (isRevisionPanelVisible) {
      setRevisionPanelVisible(false);
    }*/
  };

  /*const toggleRevisions = () => {
    if (isRevisionPanelVisible) {
      setRevisionPanelVisible(false);
      closePanel();
    } else {
      setRevisionPanelVisible(true);
      openPanel();
    }
  };*/

  const openNextFileAction = () => {
    openNextFile(openedFile.path);
  };

  const openPrevFileAction = () => {
    openPrevFile(openedFile.path);
  };

  const fileExtension = extractFileExtension(
    openedFile.path,
    PlatformIO.getDirSeparator()
  );
  const isEditable =
    openedFile.isFile && AppConfig.editableFiles.includes(fileExtension);

  const toggleAutoSave = (event: React.ChangeEvent<HTMLInputElement>) => {
    const autoSave = event.target.checked;
    if (Pro && Pro.MetaOperations) {
      dispatch(AppActions.switchLocationTypeByID(openedFile.locationId)).then(
        currentLocationId => {
          Pro.MetaOperations.saveFsEntryMeta(openedFile.path, {
            autoSave
          }).then(entryMeta => {
            updateOpenedFile(openedFile.path, entryMeta).then(() => {
              dispatch(AppActions.switchCurrentLocationType(currentLocationId));
            });
          });
        }
      );
    } else {
      dispatch(
        AppActions.showNotification(
          t('core:thisFunctionalityIsAvailableInPro'),
          NotificationTypes.default
        )
      );
    }
  };

  const renderPanels = () => {
    const toolbarButtons = () => {
      return (
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
          <Box
            className={classes.flexLeft}
            style={{
              paddingLeft: 5,
              display: 'flex',
              alignItems: 'center',
              paddingRight: editingSupported ? 85 : 5
            }}
          >
            <EntryContainerTitle
              isFileChanged={fileChanged.current}
              openedFile={openedFile}
              reloadDocument={reloadDocument}
              toggleFullScreen={toggleFullScreen}
            />
          </Box>
          <EntryContainerNav
            isFile={openedFile.isFile}
            startClosingFile={startClosingFile}
          />
        </Box>
      );
    };

    const tabs = () => {
      const autoSave = isEditable && revisionsEnabled && (
        <Tooltip
          title={
            t('core:autosave') +
            (!Pro ? ' - ' + t('core:thisFunctionalityIsAvailableInPro') : '')
          }
        >
          <Switch
            data-tid="autoSaveTID"
            checked={
              openedFile.isAutoSaveEnabled !== undefined &&
              openedFile.isAutoSaveEnabled
            }
            onChange={toggleAutoSave}
            name="autoSave"
            color="primary"
          />
        </Tooltip>
      );

      let closeCancelIcon;
      if (desktopMode) {
        closeCancelIcon = fileChanged.current ? (
          <CancelIcon />
        ) : (
          <CloseEditIcon />
        );
      }

      let editFile = null;
      if (editingSupported) {
        if (openedFile.editMode) {
          editFile = (
            <ButtonGroup>
              <Tooltip title={t('core:cancelEditing')}>
                <Button
                  onClick={reloadDocument}
                  aria-label={t('core:cancelEditing')}
                  size="small"
                  variant="outlined"
                  color="primary"
                  startIcon={closeCancelIcon}
                >
                  {fileChanged.current
                    ? t('core:cancel')
                    : t('core:closeButton')}
                </Button>
              </Tooltip>
              <Tooltip
                title={
                  t('core:saveFile') +
                  ' (' +
                  (AppConfig.isMaclike ? '⌘' : 'CTRL') +
                  ' + S)'
                }
              >
                <LoadingButton
                  disabled={false}
                  onClick={startSavingFile}
                  aria-label={t('core:saveFile')}
                  data-tid="fileContainerSaveFile"
                  size="small"
                  variant="outlined"
                  color="primary"
                  startIcon={desktopMode && <SaveIcon />}
                  loading={isSavingInProgress}
                >
                  {t('core:save')}
                </LoadingButton>
              </Tooltip>
            </ButtonGroup>
          );
        } else {
          editFile = (
            <Tooltip title={t('core:editFile')}>
              <Button
                disabled={false}
                size="small"
                variant="outlined"
                color="primary"
                onClick={editOpenedFile}
                aria-label={t('core:editFile')}
                data-tid="fileContainerEditFile"
                startIcon={<EditIcon />}
              >
                {t('core:edit')}
              </Button>
            </Tooltip>
          );
        }
      }
      const tabsComponent = (marginRight = undefined) => (
        <EntryContainerTabs
          isEditable={isEditable}
          openedFile={openedFile}
          openPanel={openPanel}
          toggleProperties={toggleProperties}
          marginRight={marginRight}
        />
      );

      if (!autoSave && !editFile) {
        return tabsComponent();
      }

      return (
        <div
          style={{
            position: 'relative',
            overflow: 'hidden',
            height: '100%'
          }}
        >
          {tabsComponent('160px')}
          <div
            style={{
              zIndex: 1,
              position: 'absolute',
              right: 10,
              top: 8,
              backgroundColor: theme.palette.background.default,
              display: 'flex',
              alignItems: 'center'
            }}
          >
            {autoSave}
            {editFile}
          </div>
        </div>
      );
    };
    /*let initSize;
    if (isPropPanelVisible) {
      initSize = openedFile.isFile ? settings.entrySplitSize : '100%';
    } else {
      initSize = defaultSplitSize; // '0%';
    }*/

    return (
      <div
        style={{
          // height: 'calc(100% - 47px)',
          height: '100%',
          //minHeight: '100%',
          ...(tabIndex !== undefined && propertiesStyles)
        }}
      >
        <Root>
          {openedFile.path !== undefined ? (
            <>
              {toolbarButtons()}
              {tabs()}
            </>
          ) : (
            <div>{t('core:noEntrySelected')}</div>
          )}
        </Root>
        {openedFile.isFile && (
          <FileView
            key="FileViewID"
            openedFile={openedFile}
            isFullscreen={isFullscreen}
            fileViewer={fileViewer}
            fileViewerContainer={fileViewerContainer}
            toggleFullScreen={toggleFullScreen}
            eventID={eventID.current}
            height={tabIndex !== undefined ? '100%' : 'calc(100% - 100px)'}
          />
        )}
      </div>
    );
  };

  return (
    <GlobalHotKeys
      handlers={{
        closeViewer: startClosingFile,
        saveDocument: startSavingFile,
        editDocument: editOpenedFile,
        nextDocument: openNextFileAction,
        prevDocument: openPrevFileAction,
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
          title={t('core:confirm')}
          content={t('core:saveFileBeforeClosingFile')}
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
          title={t('core:confirm')}
          content="File was modified, do you want to save the changes?"
          confirmCallback={result => {
            if (result) {
              setSaveBeforeReloadConfirmDialogOpened(false);
              startSavingFile();
            } else {
              setSaveBeforeReloadConfirmDialogOpened(false);
              updateOpenedFile(openedFile.path, {
                id: '',
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
      {isEditTagsModalOpened && (
        <AddRemoveTagsDialog
          open={isEditTagsModalOpened}
          onClose={() => setEditTagsModalOpened(false)}
          selectedEntries={openedFile ? [openedFile] : []}
        />
      )}
      <ResolveConflictDialog
        open={isConflictDialogOpen}
        onClose={() => setConflictDialogOpen(false)}
        file={openedFile}
        saveAs={saveAs}
        override={override}
      />
      {/* eslint-disable-next-line jsx-a11y/anchor-has-content,jsx-a11y/anchor-is-valid */}
      <a href="#" id="downloadFile" />
      {renderPanels()}
    </GlobalHotKeys>
  );
}

export default EntryContainer;

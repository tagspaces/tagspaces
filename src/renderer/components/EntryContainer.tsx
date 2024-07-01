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
  useState,
} from 'react';
import { useSelector } from 'react-redux';
import { GlobalHotKeys } from 'react-hotkeys';
import fscreen from 'fscreen';
import Button from '@mui/material/Button';
import LoadingButton from '@mui/lab/LoadingButton';
import Tooltip from '-/components/Tooltip';
import Box from '@mui/material/Box';
import ButtonGroup from '@mui/material/ButtonGroup';
import { CancelIcon, CloseEditIcon } from '-/components/CommonIcons';
import { getUuid } from '@tagspaces/tagspaces-common/utils-io';
import AppConfig from '-/AppConfig';
import {
  extractContainingDirectoryPath,
  getBackupFileLocation,
  extractFileExtension,
} from '@tagspaces/tagspaces-common/paths';
import ConfirmDialog from '-/components/dialogs/ConfirmDialog';
import AddRemoveTagsDialog from '-/components/dialogs/AddRemoveTagsDialog';
import {
  isDesktopMode,
  getKeyBindingObject,
  isRevisionsEnabled,
  getEntryContainerTab,
} from '-/reducers/settings';
import useEventListener from '-/utils/useEventListener';
import { TS } from '-/tagspaces.namespace';
import FileView from '-/components/FileView';
import { Pro } from '-/pro';
import { Switch } from '@mui/material';
import ResolveConflictDialog from '-/components/dialogs/ResolveConflictDialog';
import { useTheme } from '@mui/material/styles';
import EntryContainerTabs from '-/components/EntryContainerTabs';
import EntryContainerNav from '-/components/EntryContainerNav';
import EntryContainerTitle from '-/components/EntryContainerTitle';
import { useTranslation } from 'react-i18next';
import { useFilePropertiesContext } from '-/hooks/useFilePropertiesContext';
import { useOpenedEntryContext } from '-/hooks/useOpenedEntryContext';
import { useDirectoryContentContext } from '-/hooks/useDirectoryContentContext';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import { useNotificationContext } from '-/hooks/useNotificationContext';
import { usePlatformFacadeContext } from '-/hooks/usePlatformFacadeContext';
import { SaveIcon, EditIcon } from '-/components/CommonIcons';
import { useIOActionsContext } from '-/hooks/useIOActionsContext';
import { usePerspectiveActionsContext } from '-/hooks/usePerspectiveActionsContext';
import { useEditedEntryContext } from '-/hooks/useEditedEntryContext';

//const historyKeys = Pro ? Pro.keys.historyKeys : {};

function EntryContainer() {
  const { t } = useTranslation();
  const {
    openedEntry,
    closeAllFiles,
    reloadOpenedFile,
    toggleEntryFullWidth,
    isEntryInFullWidth,
    reflectUpdateOpenedFileContent,
    fileChanged,
    setFileChanged,
  } = useOpenedEntryContext();
  const { setReflectActions } = useEditedEntryContext();
  const { setActions } = usePerspectiveActionsContext();
  const {
    saveDescription,
    description,
    isEditMode,
    setEditMode,
    isEditDescriptionMode,
  } = useFilePropertiesContext();
  const { setAutoSave, getMetadataID } = useIOActionsContext();
  const { findLocation, readOnlyMode } = useCurrentLocationContext();
  const { openDirectory, currentDirectoryPath } = useDirectoryContentContext();
  const { copyFilePromiseOverwrite, copyFilePromise, saveTextFilePromise } =
    usePlatformFacadeContext();
  const { showNotification } = useNotificationContext();
  const tabIndex = useSelector(getEntryContainerTab);
  const keyBindings = useSelector(getKeyBindingObject);
  const desktopMode = useSelector(isDesktopMode);
  const revisionsEnabled = useSelector(isRevisionsEnabled);
  const theme = useTheme();
  const timer = useRef<NodeJS.Timeout>(null);

  const openedPanelStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
  };
  const [isPanelOpened, setPanelOpened] = useState<boolean>(
    tabIndex !== undefined,
  );

  const [isFullscreen, setFullscreen] = useState<boolean>(false);
  // eslint-disable-next-line no-unused-vars
  const [ignored, forceUpdate] = useReducer((x) => x + 1, 0, undefined);
  const [
    isSaveBeforeCloseConfirmDialogOpened,
    setSaveBeforeCloseConfirmDialogOpened,
  ] = useState<boolean>(false);
  const [
    isSaveBeforeReloadConfirmDialogOpened,
    setSaveBeforeReloadConfirmDialogOpened,
  ] = useState<boolean>(false);
  const [isEditTagsModalOpened, setEditTagsModalOpened] =
    useState<boolean>(false);
  const [isConflictDialogOpen, setConflictDialogOpen] =
    useState<boolean>(false);
  const isSavingInProgress = useRef<boolean>(false);
  const [entryPropertiesHeight, setEntryPropertiesHeight] =
    useState<number>(100);
  const fileViewer: MutableRefObject<HTMLIFrameElement> =
    useRef<HTMLIFrameElement>(null);
  const fileViewerContainer: MutableRefObject<HTMLDivElement> =
    useRef<HTMLDivElement>(null);
  const eventID = useRef<string>(getUuid());
  const cLocation = findLocation(openedEntry.locationID);

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

  const toggleFullScreen = useCallback(() => {
    if (openedEntry.isFile) {
      if (isFullscreen) {
        fscreen.exitFullscreen();
      } else {
        fscreen.requestFullscreen(fileViewerContainer.current);
      }
    }
  }, [isFullscreen]);

  useEffect(() => {
    if (fscreen.fullscreenEnabled) {
      fscreen.addEventListener(
        'fullscreenchange',
        handleFullscreenChange,
        false,
      );
      fscreen.addEventListener('fullscreenerror', handleFullscreenError, false);
      return () => {
        fscreen.removeEventListener('fullscreenchange', handleFullscreenChange);
        fscreen.removeEventListener('fullscreenerror', handleFullscreenError);
      };
    }
  });

  useEffect(() => {
    if (openedEntry && openedEntry.meta && openedEntry.meta.autoSave) {
      if (fileChanged) {
        timer.current = setInterval(() => {
          if (openedEntry.meta.autoSave && fileChanged) {
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
  }, [openedEntry, fileChanged]);

  // editor is not loaded in this time - change theme after loadDefaultTextContent
  useEffect(() => {
    if (
      fileViewer &&
      fileViewer.current &&
      fileViewer.current.contentWindow &&
      // @ts-ignore
      fileViewer.current.contentWindow.setTheme
    ) {
      // @ts-ignore call setContent from iframe
      fileViewer.current.contentWindow.setTheme(theme.palette.mode);
    }
  }, [theme.palette.mode]); //settings.currentTheme

  /*  useEffect(() => {
    // if (openedEntrys.length > 0) {
    if (
      !firstRender &&
      // openedEntry.editMode &&
      // openedEntry.changed &&
      fileChanged.current
      // openedEntry.shouldReload === false
    ) {
      setSaveBeforeReloadConfirmDialogOpened(true);
    }
  }, [openedEntryPath.current, readOnlyMode]);*/

  // always open for dirs
  /*const isPropPanelVisible = openedEntry.isFile
    ? isPropertiesPanelVisible
    : true;*/

  const editingSupported: boolean =
    cLocation &&
    !cLocation.isReadOnly &&
    openedEntry &&
    openedEntry.editingExtensionId !== undefined &&
    openedEntry.editingExtensionId.length > 3;

  const handleMessage = (data: any) => {
    let message;
    let textFilePath;
    switch (data.command) {
      case 'showAlertDialog':
        message = data.title ? data.title : '';
        if (data.message) {
          message = message + ': ' + data.message;
        }
        showNotification(message);
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
        if (!openedEntry || !openedEntry.path) {
          // || openedEntry.changed) {
          break;
        }
        textFilePath = openedEntry.path;

        if (
          fileViewer &&
          fileViewer.current &&
          fileViewer.current.contentWindow &&
          // @ts-ignore
          fileViewer.current.contentWindow.setTheme
        ) {
          // @ts-ignore call setContent from iframe
          fileViewer.current.contentWindow.setTheme(theme.palette.mode);
        }
        // TODO make loading index.html for folders configurable
        // if (!this.state.currentEntry.isFile) {
        //   textFilePath += '/index.html';
        // }
        cLocation
          .loadTextFilePromise(
            textFilePath,
            data.preview ? data.preview : false,
          )
          .then((content) => {
            const UTF8_BOM = '\ufeff';
            if (content.indexOf(UTF8_BOM) === 0) {
              // eslint-disable-next-line no-param-reassign
              content = content.substr(1);
            }
            let fileDirectory = extractContainingDirectoryPath(
              textFilePath,
              cLocation?.getDirSeparator(),
            );
            if (AppConfig.isWeb) {
              fileDirectory =
                extractContainingDirectoryPath(
                  // eslint-disable-next-line no-restricted-globals
                  location.href,
                  cLocation?.getDirSeparator(),
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
                !isEditMode,
                theme.palette.mode,
              );
            }
            return true;
          })
          .catch((err) => {
            console.log('Error loading text content ' + err);
          });
        break;
      case 'contentChangedInEditor': {
        setFileChanged(true);
        break;
      }
      default:
        console.log(
          'Not recognized messaging command: ' + JSON.stringify(data),
        );
        break;
    }
  };

  const reloadDocument = () => {
    if (openedEntry) {
      if (isEditMode && fileChanged) {
        // openedEntry.changed) {
        setSaveBeforeReloadConfirmDialogOpened(true);
      } else {
        setEditMode(false);
        reloadOpenedFile();
      }
    }
  };

  const startClosingEntry = (event) => {
    if (event) {
      event.preventDefault(); // Let's stop this event.
      event.stopPropagation();
    }
    if (openedEntry && fileChanged && isEditMode) {
      // openedEntry.changed
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
    if (isEditMode) {
      savingFile();
    } else {
      saveDescription();
    }
  };

  const savingFile = (force = false) => {
    if (
      fileViewer &&
      fileViewer.current &&
      fileViewer.current.contentWindow &&
      // @ts-ignore
      fileViewer.current.contentWindow.getContent
    ) {
      try {
        //check if file is changed
        if (fileChanged || force) {
          isSavingInProgress.current = true;
          save(openedEntry).then((success) => {
            if (success) {
              setFileChanged(false);
              // showNotification(
              //   t('core:fileSavedSuccessfully'),
              //   NotificationTypes.default
              // );
            }
            // change state will not render DOT before file name too
            isSavingInProgress.current = false;
          });
        }
      } catch (e) {
        isSavingInProgress.current = false;
        console.debug('function getContent not exist for video file:', e);
      }
    }
  };

  const override = (): Promise<boolean> => {
    return cLocation
      .getPropertiesPromise(openedEntry.path)
      .then((entryProp: TS.FileSystemEntry) =>
        save({ ...openedEntry, lmdt: entryProp.lmdt }),
      );
  };

  const saveAs = (newFilePath: string): Promise<boolean> => {
    return copyFilePromise(openedEntry.path, newFilePath).then(() =>
      cLocation
        .getPropertiesPromise(newFilePath)
        .then((entryProp: TS.FileSystemEntry) =>
          save({
            ...openedEntry,
            path: entryProp.path,
            lmdt: entryProp.lmdt,
          }).then(() => {
            const openedEntryDir = extractContainingDirectoryPath(
              entryProp.path,
            );
            if (currentDirectoryPath === openedEntryDir) {
              openDirectory(openedEntryDir);
            }
            return true;
          }),
        ),
    );
  };

  async function save(fileOpen: TS.OpenedEntry): Promise<boolean> {
    // @ts-ignore
    const textContent = fileViewer.current.contentWindow.getContent();
    const location = findLocation(fileOpen.locationID);
    if (location) {
      if (
        Pro &&
        revisionsEnabled &&
        fileOpen.path.indexOf(
          location.getDirSeparator() +
            AppConfig.metaFolder +
            location.getDirSeparator(),
        ) === -1
      ) {
        const id = await getMetadataID(fileOpen.path, fileOpen.uuid, location);
        const targetPath = getBackupFileLocation(
          fileOpen.path,
          id,
          location.getDirSeparator(),
        );
        try {
          await copyFilePromiseOverwrite(
            fileOpen.path,
            targetPath,
            fileOpen.locationID,
            false,
          ); // todo test what happened if remove await?
        } catch (error) {
          console.log('copyFilePromiseOverwrite', error);
        }
      }
      return saveTextFilePromise(
        {
          path: fileOpen.path,
          lmdt: fileOpen.lmdt,
          locationID: fileOpen.locationID,
        },
        textContent,
        true,
      )
        .then((entry) => {
          reflectUpdateOpenedFileContent(entry);
          // send action to save in history
          const action: TS.EditAction = {
            action: 'edit',
            entry: entry,
          };
          setReflectActions(action);
          /*if (Pro) {
            const relativePath = getRelativeEntryPath(
              currentLocationPath,
              fileOpen.path,
            );
            historyContext.saveHistory(
              historyKeys.fileEditKey,
              {
                creationTimeStamp: new Date().getTime(),
                path: relativePath,
                url: generateSharingLink(fileOpen.locationID, relativePath),
                lid: fileOpen.locationID,
              },
              fileEditHistoryKey,
            );
          }*/
          return true;
          /*return updateOpenedFile(fileOpen.path, {
            id: '',
            ...fileOpen,
            editMode: true,
            //changed: false,
            shouldReload: undefined,
          }).then(() => true);*/
        })
        .catch((error) => {
          setConflictDialogOpen(true);
          console.log('Error saving file ' + fileOpen.path + ' - ' + error);
          return false;
        });
    }
  }

  const editOpenedFile = () => {
    // addToEntryContainer(openedEntry);
    setEditMode(true);
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
    if (!isPanelOpened) {
      setPanelOpened(true);
    }
  };

  const toggleProperties = () => {
    setPanelOpened(!isPanelOpened);
  };
  const openNextFileAction = () => {
    const action: TS.PerspectiveActions = { action: 'openNext' };
    setActions(action);
    // window.dispatchEvent(new Event('next-file'));
  };

  const openPrevFileAction = () => {
    const action: TS.PerspectiveActions = { action: 'openPrevious' };
    setActions(action);
    //window.dispatchEvent(new Event('previous-file'));
  };

  const fileExtension =
    openedEntry &&
    extractFileExtension(openedEntry.path, cLocation?.getDirSeparator());
  const isEditable =
    !readOnlyMode &&
    openedEntry &&
    openedEntry.isFile &&
    AppConfig.editableFiles.includes(fileExtension);

  const toggleAutoSave = (event: React.ChangeEvent<HTMLInputElement>) => {
    const autoSave = event.target.checked;
    if (Pro) {
      setAutoSave(openedEntry, autoSave, openedEntry.locationID);
      /*switchLocationTypeByID(openedEntry.locationId).then(
        (currentLocationId) => {
          Pro.MetaOperations.saveFsEntryMeta(openedEntry.path, {
            autoSave,
          }).then((entryMeta) => {
            updateOpenedFile(openedEntry.path, entryMeta).then(() =>
              switchCurrentLocationType(),
            );
          });
        },
      );*/
    } else {
      showNotification(t('core:thisFunctionalityIsAvailableInPro'));
    }
  };

  const toggleEntryPropertiesHeight = () => {
    if (entryPropertiesHeight === 100) {
      setEntryPropertiesHeight(150);
    } else if (entryPropertiesHeight === 150) {
      setEntryPropertiesHeight(50);
    } else if (entryPropertiesHeight === 50) {
      setEntryPropertiesHeight(100);
    }
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
          checked={openedEntry.meta && openedEntry.meta.autoSave}
          onChange={toggleAutoSave}
          name="autoSave"
          color="primary"
        />
      </Tooltip>
    );

    let closeCancelIcon;
    if (desktopMode) {
      closeCancelIcon = fileChanged ? <CancelIcon /> : <CloseEditIcon />;
    }

    let editFile = null;
    if (editingSupported) {
      if (isEditMode) {
        editFile = (
          <ButtonGroup>
            <Tooltip title={t('core:cancelEditing')}>
              <Button
                onClick={() => {
                  setEditMode(false);
                  setFileChanged(false);
                }}
                aria-label={t('core:cancelEditing')}
                size="small"
                variant="outlined"
                color="primary"
                startIcon={closeCancelIcon}
              >
                {fileChanged ? t('core:cancel') : t('core:closeButton')}
              </Button>
            </Tooltip>
            <Tooltip
              title={
                t('core:saveFile') +
                ' (' +
                (AppConfig.isMacLike ? '⌘' : 'CTRL') +
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
                loading={isSavingInProgress.current}
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
              disabled={isEditDescriptionMode}
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
    const haveDescription = description?.length > 0;
    const tabsComponent = (marginRight = undefined) => (
      <EntryContainerTabs
        isEditable={isEditable}
        isPanelOpened={isPanelOpened}
        openPanel={openPanel}
        toggleProperties={toggleProperties}
        haveDescription={haveDescription}
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
          height: '100%',
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
            alignItems: 'center',
          }}
        >
          {autoSave}
          {editFile}
        </div>
      </div>
    );
  };

  if (!openedEntry || openedEntry.path === undefined) {
    return <div>{t('core:noEntrySelected')}</div>;
  }

  return (
    <GlobalHotKeys
      handlers={{
        closeViewer: startClosingEntry,
        saveDocument: startSavingFile,
        editDocument: editOpenedFile,
        nextDocument: openNextFileAction,
        prevDocument: openPrevFileAction,
        reloadDocument: reloadDocument,
        deleteDocument: () => {}, // TODO move delete functionality from entry container menu
        openInFullWidth: toggleEntryFullWidth,
        toggleFullScreen,
      }}
      keyMap={{
        closeViewer: keyBindings.closeViewer,
        saveDocument: keyBindings.saveDocument,
        editDocument: keyBindings.editDocument,
        nextDocument: keyBindings.nextDocument,
        prevDocument: keyBindings.prevDocument,
        reloadDocument: keyBindings.reloadDocument,
        deleteDocument: keyBindings.deleteDocument,
        openInFullWidth: keyBindings.openInFullWidth,
        toggleFullScreen: keyBindings.toggleFullScreen,
      }}
    >
      <div
        style={{
          height: '100%',
          ...(isPanelOpened && openedPanelStyle),
        }}
      >
        <div
          style={{
            width: '100%',
            flexDirection: 'column',
            flex: '1 1 ' + entryPropertiesHeight + '%',
            display: 'flex',
            backgroundColor: theme.palette.background.default,
            overflow: 'hidden',
            marginBottom: 1,
          }}
        >
          <Box
            style={{
              paddingLeft: 0,
              paddingRight: 50,
              paddingTop: 0,
              minHeight: 48,
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'flex-start',
            }}
          >
            <EntryContainerTitle
              reloadDocument={reloadDocument}
              toggleFullScreen={toggleFullScreen}
              startClosingEntry={startClosingEntry}
              isEntryInFullWidth={isEntryInFullWidth}
              desktopMode={desktopMode}
            />
            <EntryContainerNav
              isFile={openedEntry.isFile}
              startClosingEntry={startClosingEntry}
            />
          </Box>
          {tabs()}
          {openedEntry.isFile && isPanelOpened && (
            <Tooltip title={t('core:togglePreviewSize')}>
              <div
                style={{
                  textAlign: 'center',
                  maxHeight: 9,
                  minHeight: 9,
                  backgroundColor: theme.palette.background.default,
                  borderBottom: '1px solid ' + theme.palette.divider,
                }}
                onClick={toggleEntryPropertiesHeight}
              >
                <div
                  style={{
                    width: '30%',
                    border: '1px solid ' + theme.palette.text.secondary,
                    margin: '2px auto',
                  }}
                ></div>
              </div>
            </Tooltip>
          )}
        </div>
        {openedEntry.isFile && (
          <FileView
            key="FileViewID"
            isFullscreen={isFullscreen}
            fileViewer={fileViewer}
            fileViewerContainer={fileViewerContainer}
            toggleFullScreen={toggleFullScreen}
            eventID={eventID.current}
            height={tabIndex !== undefined ? '100%' : 'calc(100% - 100px)'}
          />
        )}
      </div>
      {isSaveBeforeCloseConfirmDialogOpened && (
        <ConfirmDialog
          open={isSaveBeforeCloseConfirmDialogOpened}
          onClose={() => {
            setSaveBeforeCloseConfirmDialogOpened(false);
          }}
          title={t('core:confirm')}
          content={t('core:saveFileBeforeClosingFile')}
          confirmCallback={(result) => {
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
          confirmCallback={(result) => {
            if (result) {
              setSaveBeforeReloadConfirmDialogOpened(false);
              startSavingFile();
            } else {
              setSaveBeforeReloadConfirmDialogOpened(false);
              setFileChanged(false);
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
          selected={
            openedEntry
              ? [cLocation.toFsEntry(openedEntry.path, openedEntry.isFile)]
              : []
          }
        />
      )}
      <ResolveConflictDialog
        open={isConflictDialogOpen}
        onClose={() => setConflictDialogOpen(false)}
        saveAs={saveAs}
        override={override}
      />
    </GlobalHotKeys>
  );
}

export default EntryContainer;

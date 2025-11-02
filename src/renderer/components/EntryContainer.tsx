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
import EntryContainerNav from '-/components/EntryContainerNav';
import EntryContainerTabs from '-/components/EntryContainerTabs';
import EntryContainerTitle from '-/components/EntryContainerTitle';
import FileView from '-/components/FileView';
import Tooltip from '-/components/Tooltip';
import { useResolveConflictContext } from '-/components/dialogs/hooks/useResolveConflictContext';
import { TabNames } from '-/hooks/EntryPropsTabsContextProvider';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import { useFilePropertiesContext } from '-/hooks/useFilePropertiesContext';
import { useFullScreenContext } from '-/hooks/useFullScreenContext';
import { useIOActionsContext } from '-/hooks/useIOActionsContext';
import { useNotificationContext } from '-/hooks/useNotificationContext';
import { useOpenedEntryContext } from '-/hooks/useOpenedEntryContext';
import { usePerspectiveActionsContext } from '-/hooks/usePerspectiveActionsContext';
import { usePlatformFacadeContext } from '-/hooks/usePlatformFacadeContext';
import { AppDispatch } from '-/reducers/app';
import {
  actions as SettingsActions,
  getEntryContainerTab,
  getEntryPropertiesHeight,
  getKeyBindingObject,
  isDesktopMode,
} from '-/reducers/settings';
import { getResizedImageThumbnail } from '-/services/thumbsgenerator';
import { TS } from '-/tagspaces.namespace';
import { base64ToBlob } from '-/utils/dom';
import { useMediaQuery } from '@mui/material';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import { extractContainingDirectoryPath } from '@tagspaces/tagspaces-common/paths';
import React, {
  MutableRefObject,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react';
import { GlobalHotKeys } from 'react-hotkeys';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

function EntryContainer() {
  const { t } = useTranslation();
  const dispatch: AppDispatch = useDispatch();
  const {
    openedEntry,
    reloadOpenedFile,
    toggleEntryFullWidth,
    isEntryInFullWidth,
    fileChanged,
    setFileChanged,
  } = useOpenedEntryContext();
  const { setActions } = usePerspectiveActionsContext();
  const { toggleFullScreen } = useFullScreenContext();
  const { saveDescription, isEditMode, setEditMode, closeOpenedEntries } =
    useFilePropertiesContext();
  const { findLocation } = useCurrentLocationContext();
  const { saveFileOpen } = useResolveConflictContext();
  const { setThumbnailImageChange } = useIOActionsContext();
  const { saveBinaryFilePromise } = usePlatformFacadeContext();

  const { showNotification, openConfirmDialog } = useNotificationContext();
  const tabIndex = useSelector(getEntryContainerTab);
  const entryPropertiesHeight = useSelector(getEntryPropertiesHeight);
  const keyBindings = useSelector(getKeyBindingObject);
  const desktopMode = useSelector(isDesktopMode);
  const theme = useTheme();
  const timer = useRef<NodeJS.Timeout>(null);

  const openedPanelStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
  };
  const [isPanelOpened, setPanelOpened] = useState<boolean>(
    tabIndex !== TabNames.closedTabs,
  );

  const smallScreen = useMediaQuery(theme.breakpoints.down('md'));

  // eslint-disable-next-line no-unused-vars
  const [ignored, forceUpdate] = useReducer((x) => x + 1, 0, undefined);
  const isSavingInProgress = useRef<boolean>(false);
  const fileViewer: MutableRefObject<HTMLIFrameElement> =
    useRef<HTMLIFrameElement>(null);
  const fileViewerContainer: MutableRefObject<HTMLDivElement> =
    useRef<HTMLDivElement>(null);
  const cLocation = findLocation(openedEntry.locationID);

  useEffect(() => {
    if (openedEntry) {
      isSavingInProgress.current = false;
    }
  }, [openedEntry]);

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
    try {
      if (
        // @ts-ignore
        fileViewer?.current?.contentWindow?.setTheme
      ) {
        // @ts-ignore call setContent from iframe
        fileViewer.current.contentWindow.setTheme(theme.palette.mode);
      }
    } catch (e) {
      console.log('Error setTheme', e);
    }
  }, [theme.palette.mode]);

  const editingSupported: boolean =
    cLocation &&
    !cLocation.isReadOnly &&
    openedEntry &&
    openedEntry.editingExtensionId !== undefined &&
    openedEntry.editingExtensionId.length > 3;

  const handleMessage = (data: any) => {
    let message;
    let filePath;
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
      case 'parentSaveDocument':
        try {
          isSavingInProgress.current = true;
          forceUpdate();
          saveFileOpen(openedEntry, JSON.stringify(data.content)).then(
            (success) => {
              if (success) {
                setFileChanged(false);
              }
              // change state will not render DOT before file name too
              isSavingInProgress.current = false;
            },
          );
        } catch (e) {
          isSavingInProgress.current = false;
          console.debug('parentSaveDocument:', e);
        }
        break;
      case 'parentLoadTextContent':
        if (
          fileViewer &&
          fileViewer.current &&
          fileViewer.current.contentWindow
        ) {
          cLocation
            .loadTextFilePromise(openedEntry.path, false)
            .then((content) => {
              // Check and remove UTF-8 BOM
              const cleanedContent = content.startsWith('\uFEFF')
                ? content.slice(1)
                : content;
              fileViewer.current.contentWindow.postMessage(
                {
                  action: 'fileContent',
                  content: cleanedContent,
                  isEditMode: isEditMode,
                },
                '*',
              );
            });
        }
        break;
      case 'thumbnailGenerated':
        if (data.content) {
          getResizedImageThumbnail(data.content)
            .then((base64Image) => {
              const data = base64ToBlob(base64Image.split(',').pop());

              const thumbPath = cLocation.getThumbEntryPath(openedEntry);
              saveBinaryFilePromise(
                { path: thumbPath },
                data, //new Blob([data]), //data.buffer ? data.buffer :
                true,
              )
                .then(() => {
                  return setThumbnailImageChange({
                    ...(openedEntry as TS.FileSystemEntry),
                    meta: { ...openedEntry.meta, thumbPath },
                  });
                })
                .catch((error) => {
                  console.error(
                    'Save to file ' + openedEntry.path + ' failed ',
                    error,
                  );
                  return true;
                });
            })
            .catch((error) => {
              console.error('Thumbnail generation failed ' + error);
            });
        }
        break;
      case 'savingFile':
        if (fileChanged) {
          saveFile(data.content);
        }
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
        filePath = openedEntry.path;

        try {
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
        } catch (e) {
          console.log('Error setTheme', e);
        }
        // TODO make loading index.html for folders configurable
        // if (!this.state.currentEntry.isFile) {
        //   textFilePath += '/index.html';
        // }
        cLocation
          .loadTextFilePromise(filePath, data.preview ? data.preview : false)
          .then((content) => {
            const UTF8_BOM = '\ufeff';
            if (content.indexOf(UTF8_BOM) === 0) {
              // eslint-disable-next-line no-param-reassign
              content = content.substr(1);
            }
            let fileDirectory = extractContainingDirectoryPath(
              filePath,
              cLocation?.getDirSeparator(),
            );
            if (AppConfig.isWeb) {
              const webDir = extractContainingDirectoryPath(
                // eslint-disable-next-line no-restricted-globals
                location.href,
                cLocation?.getDirSeparator(),
              );
              fileDirectory =
                (webDir && webDir !== '/' ? webDir + '/' : '') + fileDirectory;
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
      case 'loadDefaultBinaryContent':
        if (!openedEntry || !openedEntry.path) {
          // || openedEntry.changed) {
          break;
        }
        filePath = openedEntry.path;

        cLocation
          .getFileContentPromise(filePath, 'arraybuffer')
          .then((content) => {
            let fileDirectory = extractContainingDirectoryPath(
              filePath,
              cLocation?.getDirSeparator(),
            );
            if (AppConfig.isWeb) {
              const webDir = extractContainingDirectoryPath(
                // eslint-disable-next-line no-restricted-globals
                location.href,
                cLocation?.getDirSeparator(),
              );
              fileDirectory =
                (webDir && webDir !== '/' ? webDir + '/' : '') + fileDirectory;
            }
            if (
              // @ts-ignore
              fileViewer?.current?.contentWindow?.setContent
            ) {
              // @ts-ignore
              fileViewer.current.contentWindow.setContent(
                content,
                fileDirectory,
                !isEditMode,
                theme.palette.mode,
              );
              //    return true;
            }
            // return true;
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
        openConfirmDialog(
          t('core:confirm'),
          t('core:fileModified'),
          (result) => {
            if (result) {
              startSavingFile();
            } else {
              setFileChanged(false);
            }
          },
          'cancelSaveBeforeCloseDialog',
          'confirmSaveBeforeCloseDialog',
          'confirmDialogContent',
        );
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
      openConfirmDialog(
        t('core:confirm'),
        t('core:saveFileBeforeClosingFile'),
        (result) => {
          if (result) {
            startSavingFile();
          } else {
            closeFile();
            isSavingInProgress.current = false;
            setFileChanged(false);
          }
        },
        'cancelSaveBeforeCloseDialog',
        'confirmSaveBeforeCloseDialog',
        'confirmDialogContent',
      );
    } else {
      closeFile();
    }
  };

  const closeFile = () => {
    closeOpenedEntries();
  };

  const startSavingFile = () => {
    if (isEditMode) {
      savingFile();
    } else {
      saveDescription();
    }
  };

  const savingFile = (force = false) => {
    try {
      if (
        fileViewer &&
        fileViewer.current &&
        fileViewer.current.contentWindow &&
        // @ts-ignore
        fileViewer.current.contentWindow.getContent
      ) {
        //check if file is changed
        if (fileChanged || force) {
          // @ts-ignore
          const fileContent = fileViewer.current.contentWindow.getContent();
          saveFile(fileContent);
        }
      } else {
        //console.log('saving crepe file');
        fileViewer.current.contentWindow.postMessage(
          { action: 'savingFile' },
          '*',
        );
      }
    } catch (e) {
      isSavingInProgress.current = false;
      console.debug('function getContent not exist for file:', e);
    }
  };

  function saveFile(fileContent: string) {
    isSavingInProgress.current = true;
    forceUpdate();
    saveFileOpen(openedEntry, fileContent).then((success) => {
      if (success) {
        setFileChanged(false);
      }
      // change state will not render DOT before file name too
      isSavingInProgress.current = false;
    });
  }

  const editOpenedFile = () => {
    setEditMode(true);
  };

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
  };

  const openPrevFileAction = () => {
    const action: TS.PerspectiveActions = { action: 'openPrevious' };
    setActions(action);
  };

  const toggleEntryPropertiesHeight = () => {
    if (entryPropertiesHeight === 100) {
      dispatch(SettingsActions.setEntryPropertiesHeight(200));
    } else if (entryPropertiesHeight === 200) {
      dispatch(SettingsActions.setEntryPropertiesHeight(350));
    } else if (entryPropertiesHeight === 350) {
      dispatch(SettingsActions.setEntryPropertiesHeight(50));
    } else if (entryPropertiesHeight === 50) {
      dispatch(SettingsActions.setEntryPropertiesHeight(100));
    } else {
      dispatch(SettingsActions.setEntryPropertiesHeight(200));
    }
  };

  const tabsElement = useMemo(
    () => (
      <EntryContainerTabs
        isPanelOpened={isPanelOpened}
        openPanel={openPanel}
        toggleProperties={toggleProperties}
        isSavingInProgress={isSavingInProgress.current}
        savingFile={savingFile}
      />
    ),
    [isPanelOpened, isSavingInProgress.current, fileChanged],
  );

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
        toggleFullScreen: () => toggleFullScreen(fileViewerContainer.current),
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
      <Box
        sx={{
          height: '100%',
          ...(isPanelOpened && openedPanelStyle),
        }}
      >
        <Box
          sx={{
            width: '100%',
            flexDirection: 'column',
            flex: '1 1 ' + entryPropertiesHeight + '%',
            display: 'flex',
            backgroundColor: theme.palette.background.default,
            overflow: 'hidden',
            marginBottom: '1px',
          }}
        >
          <Box
            sx={{
              paddingLeft: 0,
              paddingRight: '55px',
              paddingTop: 0,
              minHeight: '48px',
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'flex-start',
            }}
          >
            <EntryContainerTitle
              reloadDocument={reloadDocument}
              startClosingEntry={startClosingEntry}
              isEntryInFullWidth={isEntryInFullWidth}
              fileViewerContainer={fileViewerContainer.current}
              desktopMode={desktopMode}
              smallScreen={smallScreen}
            />
            <EntryContainerNav
              isFile={openedEntry.isFile}
              startClosingEntry={startClosingEntry}
              smallScreen={smallScreen}
            />
          </Box>
          {tabsElement}
          {openedEntry.isFile && isPanelOpened && (
            <Tooltip title={t('core:togglePreviewSize')}>
              <Box
                sx={{
                  textAlign: 'center',
                  minHeight: '8px',
                  paddingTop: '2px',
                  backgroundColor: 'background.default',
                  borderBottom: '1px solid ' + theme.palette.divider,
                  cursor: 's-resize',
                }}
                onClick={toggleEntryPropertiesHeight}
              >
                <Box
                  sx={{
                    width: '10%',
                    border: '1px dashed ' + theme.palette.text.secondary,
                    margin: '2px auto',
                  }}
                ></Box>
              </Box>
            </Tooltip>
          )}
        </Box>
        {openedEntry.isFile && (
          <FileView
            key="FileViewID"
            fileViewer={fileViewer}
            fileViewerContainer={fileViewerContainer}
            height={
              tabIndex !== TabNames.closedTabs ? '100%' : 'calc(100% - 100px)'
            }
            handleMessage={handleMessage}
          />
        )}
      </Box>
    </GlobalHotKeys>
  );
}

export default EntryContainer;

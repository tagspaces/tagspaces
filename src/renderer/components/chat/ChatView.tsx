/**
 * TagSpaces - universal file and folder organizer
 * Copyright (C) 2024-present TagSpaces GmbH
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
import { CloseIcon } from '-/components/CommonIcons';
import DragItemTypes from '-/components/DragItemTypes';
import Tooltip from '-/components/Tooltip';
import TsIconButton from '-/components/TsIconButton';
import TsSelect from '-/components/TsSelect';
import TsTextField from '-/components/TsTextField';
import ChatDndTargetFile from '-/components/chat/ChatDndTargetFile';
import ChatMenu from '-/components/chat/ChatMenu';
import { AIProvider, ChatItem, ChatMode } from '-/components/chat/ChatTypes';
import SelectChatModel from '-/components/chat/SelectChatModel';
import ConfirmDialog from '-/components/dialogs/ConfirmDialog';
import { OllamaIcon } from '-/components/dialogs/components/Ollama';
import { useChatContext } from '-/hooks/useChatContext';
import { useNotificationContext } from '-/hooks/useNotificationContext';
import { getDefaultAIProvider } from '-/reducers/settings';
import { saveAsTextFile } from '-/services/utils-io';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import SendIcon from '@mui/icons-material/Send';
import { Box, Grid2, MenuItem } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import CancelIcon from '@mui/icons-material/Cancel';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import { useTheme } from '@mui/material/styles';
import { formatDateTime4Tag } from '@tagspaces/tagspaces-common/misc';
import { extractFileExtension } from '@tagspaces/tagspaces-common/paths';
import { MilkdownEditor, MilkdownRef } from '@tagspaces/tagspaces-md';
import { format } from 'date-fns';
import React, {
  ChangeEvent,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from 'react';
import { NativeTypes } from 'react-dnd-html5-backend';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

function ChatView() {
  const { t } = useTranslation();
  const theme = useTheme();
  const {
    images,
    removeImage,
    chatHistoryItems,
    newChatMessage,
    changeCurrentModel,
    setModel,
    currentModel,
    getHistoryFilePath,
    deleteHistory,
    isTyping,
    cancelMessage,
  } = useChatContext();
  const { showNotification } = useNotificationContext();
  const aiDefaultProvider: AIProvider = useSelector(getDefaultAIProvider);
  const isLoading = useRef<boolean>(false);
  const currentMode = useRef<ChatMode>(undefined);
  const editorRef = useRef<MilkdownRef>(null);
  const milkdownDivRef = useRef<HTMLDivElement>(null);
  const chatMsg = useRef<string>(undefined);
  //const txtInputRef = useRef<HTMLInputElement>(null);
  const [ignored, forceUpdate] = useReducer((x) => x + 1, 0, undefined);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [isConfirmDialogOpened, setIsConfirmDialogOpened] =
    React.useState<boolean>(false);
  /*const getAddedText = (oldText, newText) => {
    if (newText.startsWith(oldText)) {
      return newText.slice(oldText.length);
    }
    return ''; // Return an empty string if newText does not start with oldText
  };*/

  /*const chatMessageHandler = useMemo(() => {
    return (msg, replace): void => {
      //console.log(`Chat ${msg}`);
      const items = addTimeLineResponse(msg, replace);
      if (editorRef.current) {
        const newMarkdown = formatChatItems(items);
        /!*const oldMarkdown = editorRef.current.getMarkdown();
        editorRef.current.insert(getAddedText(oldMarkdown, newMarkdown));*!/ // insert and preserve selection
        editorRef.current.update(newMarkdown);
      }
    };
  }, []);*/

  useEffect(() => {
    editorRef.current?.setDarkMode(theme.palette.mode === 'dark');
  }, [theme]);

  /*useEffect(() => {
    if (AppConfig.isElectron) {
      window.electronIO.ipcRenderer.on('ChatMessage', (message, replace) => {
        //console.log('ChatMessage:' + message);
        if (!replace) {
          // ignore download progress
          if (isLoading.current) {
            isLoading.current = false;
            forceUpdate();
          }
          if (message instanceof Uint8Array) {
            chatMessageHandler(
              new TextDecoder('utf-8').decode(message),
              replace,
            );
          } else if (typeof message === 'string') {
            chatMessageHandler(message, replace);
          }
        }
      });

      return () => {
        window.electronIO.ipcRenderer.removeAllListeners('ChatMessage');
        unloadCurrentModel();
      };
    }
  }, [chatMessageHandler]);*/

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    chatMsg.current = event.target.value;
    forceUpdate();
  };

  const handleChangeModel = (newModelName: string) => {
    changeCurrentModel(newModelName)
      .then((success) => {
        if (success) {
          setModel(newModelName);
          //forceUpdate();
        }
      })
      .catch((err) => {
        showNotification(
          t('core:installCustomModel') + err.message + ': ' + newModelName,
          'error',
          false,
        );
        console.log(err);
      });
  };

  function formatChatItems(chatItems: ChatItem[]): string {
    if (chatItems) {
      const formattedItems = chatItems.map((item) => {
        const date = item.timestamp
          ? '**User on ' + format(item.timestamp, 'yyyy-MM-dd HH:mm:ss') + '**'
          : '**User**';
        const request = item.request ? item.request : '';
        const model = item.modelName ? item.modelName : 'AI model';
        const response = item.response
          ? '**' + model + '**:\\\n' + item.response
          : '';
        const images = item.imagePaths
          ? item.imagePaths.map((i) => {
              return (
                '![chat image](' +
                (AppConfig.isWeb ? '' : 'file://') +
                getHistoryFilePath(i) +
                ')'
              );
            })
          : '';
        return (
          '' +
          date +
          ': \\\n' +
          request +
          '\n' +
          images +
          '\n' +
          response +
          '\n *** \n'
        );
      });
      const markdown = formattedItems.join(' ');
      return markdown;
    }
    return '';
  }

  const handleChangeMode = (event: ChangeEvent<HTMLInputElement>) => {
    currentMode.current = event.target.value
      ? (event.target.value as ChatMode)
      : undefined;
    forceUpdate();
  };

  const handleChatMessage = () => {
    //isTyping.current = true;
    isLoading.current = true;
    forceUpdate();
    newChatMessage(
      chatMsg.current,
      false,
      'user',
      currentMode.current,
      undefined,
      true,
    )
      .then((response) => {
        console.log('newOllamaMessage response:' + response);
        if (response) {
          chatMsg.current = '';
        }
        isLoading.current = false;
        forceUpdate();
      })
      .catch((error) => {
        if (error.name === 'AbortError') {
          console.log('ChatMessage request has been aborted');
        } else {
          console.error('An error occurred:', error);
        }
      });
  };

  const handleMoreClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelectAll = () => {
    setAnchorEl(null);
    const range = document.createRange(); // Create a new range
    const selection = window.getSelection(); // Get the current selection
    if (milkdownDivRef.current) {
      range.selectNodeContents(milkdownDivRef.current); // Select the text inside the div
      selection.removeAllRanges(); // Clear any existing selections
      selection.addRange(range); // Add the new range to the selection
    }
  };

  const handleCopy = () => {
    setAnchorEl(null);
    if (milkdownDivRef.current) {
      const textToCopy = milkdownDivRef.current.innerText; // Get the text content of the div
      navigator.clipboard
        .writeText(textToCopy)
        .then(() => {
          showNotification(t('core:copyToClipboard'));
        })
        .catch((err) => {
          console.error('Failed to copy text:', err);
          showNotification(t('core:generatedHTMLFailed'));
        });
    }
  };

  const clearHistory = () => {
    setAnchorEl(null);
    deleteHistory();
  };

  const saveAsHtml = () => {
    setAnchorEl(null);
    if (milkdownDivRef.current) {
      const html = milkdownDivRef.current.innerHTML;
      const blob = new Blob([html], {
        type: 'text/html',
      });
      const dateTimeTag = formatDateTime4Tag(new Date(), true);
      const filename = 'tagspaces-chat [export ' + dateTimeTag + '].html';

      saveAsTextFile(blob, filename);
    }
  };

  const saveAsMarkdown = () => {
    setAnchorEl(null);
    if (editorRef.current) {
      const md = editorRef.current.getMarkdown();
      const blob = new Blob([md], {
        type: 'text/markdown',
      });
      const dateTimeTag = formatDateTime4Tag(new Date(), true);
      const filename = 'tagspaces-chat [export ' + dateTimeTag + '].md';

      saveAsTextFile(blob, filename);
    }
  };

  const { FILE } = NativeTypes;

  return (
    <Box sx={{ flexGrow: 1, margin: 0, height: '100%' }}>
      <Grid2
        container
        spacing={1}
        direction="column"
        wrap="nowrap"
        sx={{
          height: '100%',
          overflow: 'hidden',
        }}
      >
        <Grid2
          container
          spacing={0}
          direction="row"
          style={{ flexFlow: 'nowrap' }}
        >
          <Grid2 size={11.5}>
            <SelectChatModel
              id="chatModelId"
              handleChangeModel={handleChangeModel}
              aiProvider={aiDefaultProvider}
              chosenModel={currentModel?.name}
              label={t('core:selectedAIModel')}
            />
          </Grid2>
          <Grid2>
            <TsIconButton
              style={{ marginTop: 20 }}
              tooltip={t('core:chatMore')}
              onClick={handleMoreClick}
              data-tid="chatMoreTID"
              aria-label={t('core:chatMore')}
              aria-controls={Boolean(anchorEl) ? 'account-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={Boolean(anchorEl) ? 'true' : undefined}
            >
              <MoreVertIcon />
            </TsIconButton>
            <ChatMenu
              anchorEl={anchorEl}
              handleClose={handleClose}
              handleSelectAll={handleSelectAll}
              handleCopy={handleCopy}
              clearHistory={() => setIsConfirmDialogOpened(true)}
              saveAsHtml={saveAsHtml}
              saveAsMarkdown={saveAsMarkdown}
            />
            <ConfirmDialog
              open={isConfirmDialogOpened}
              onClose={() => {
                setIsConfirmDialogOpened(false);
              }}
              title={t('core:titleConfirm')}
              content={t('core:confirmHistoryDeletion')}
              confirmCallback={(result) => {
                if (result) {
                  clearHistory();
                }
              }}
              cancelDialogTID="cancelDeleteHistoryDialog"
              confirmDialogTID="confirmDeleteHistoryDialog"
              confirmDialogContentTID="confirmDeleteHistoryDialogContent"
            />
          </Grid2>
        </Grid2>
        <Grid2 size="grow" sx={{ padding: 0, overflowY: 'auto' }}>
          <div ref={milkdownDivRef}>
            <MilkdownEditor
              ref={editorRef}
              content={formatChatItems(chatHistoryItems)}
              readOnly={true}
              lightMode={true}
            />
          </div>
        </Grid2>
        <Grid2 container spacing={1} direction="column">
          <Grid2>
            {images.length > 0 &&
              images.map((image, index) => (
                <Box position="relative" style={{ float: 'right' }}>
                  <img
                    src={
                      'data:image/' +
                      extractFileExtension(image.path) +
                      ';base64,' +
                      image.base64
                    }
                    alt={`Image ${index + 1}`}
                    style={{ maxHeight: 150, width: 'auto' }}
                  />
                  <IconButton
                    size="small"
                    onClick={() => removeImage(image.uuid)}
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      backgroundColor: 'rgba(255, 255, 255, 0.7)',
                      '&:hover': { backgroundColor: 'rgba(255, 255, 255, 1)' },
                    }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Box>
              ))}
          </Grid2>
          <Grid2>
            <ChatDndTargetFile accepts={[FILE, DragItemTypes.FILE]}>
              <FormControl fullWidth>
                <TsTextField
                  autoFocus
                  disabled={isTyping || isLoading.current}
                  name="entryName"
                  //label={t('core:newChatMessage')}
                  placeholder={t('core:yourMessageForAI')}
                  onChange={handleInputChange}
                  value={chatMsg.current}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.code === 'Enter') {
                      event.preventDefault();
                      event.stopPropagation();
                      handleChatMessage();
                    }
                  }}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start" style={{ height: 32 }}>
                          <Tooltip title={aiDefaultProvider?.engine}>
                            <OllamaIcon height={30} />
                          </Tooltip>
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end" style={{ height: 32 }}>
                          {isTyping && (
                            <CircularProgress size={24} color="inherit" />
                          )}
                          {isLoading.current && (
                            <Tooltip title="Cancel Message">
                              <IconButton
                                onClick={() => {
                                  isLoading.current = false;
                                  cancelMessage();
                                }}
                                size="large"
                              >
                                <CancelIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                          <Tooltip title="Send Message">
                            <IconButton
                              onClick={handleChatMessage}
                              size="large"
                            >
                              <SendIcon />
                            </IconButton>
                          </Tooltip>
                          <TsSelect
                            id="select-mode"
                            value={currentMode.current}
                            onChange={handleChangeMode}
                            variant="standard"
                            sx={{ width: currentMode.current ? 170 : 25 }}
                          >
                            <MenuItem value="">None</MenuItem>
                            <MenuItem
                              value="helpful"
                              title="If you don't know the answer, just say you don't know. DO NOT try to make up an answer"
                            >
                              Helpful assistant
                            </MenuItem>
                            <MenuItem
                              value="summary"
                              title="Generate a concise summary"
                            >
                              Generate Summary
                            </MenuItem>
                          </TsSelect>
                        </InputAdornment>
                      ),
                    },
                  }}
                />
                <FormHelperText>
                  {t('core:aiHelp', {
                    chatModel: currentModel && '(' + currentModel.name + ')',
                  })}
                </FormHelperText>
              </FormControl>
            </ChatDndTargetFile>
          </Grid2>
        </Grid2>
      </Grid2>
    </Box>
  );
}

export default ChatView;

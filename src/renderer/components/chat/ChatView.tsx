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

import { CloseIcon, MoreMenuIcon, OllamaIcon } from '-/components/CommonIcons';
import DragItemTypes from '-/components/DragItemTypes';
import Tooltip from '-/components/Tooltip';
import TsIconButton from '-/components/TsIconButton';
import TsTextField from '-/components/TsTextField';
import ChatDndTargetFile from '-/components/chat/ChatDndTargetFile';
import ChatMenu from '-/components/chat/ChatMenu';
import { AIProvider, ChatMode } from '-/components/chat/ChatTypes';
import SelectChatModel from '-/components/chat/SelectChatModel';
import ChatMdEditor from '-/components/md/ChatMdEditor';
import { CrepeRef } from '-/components/md/useCrepeHandler';
import { useChatContext } from '-/hooks/useChatContext';
import { useNotificationContext } from '-/hooks/useNotificationContext';
import { useOpenedEntryContext } from '-/hooks/useOpenedEntryContext';
import { getDefaultAIProvider } from '-/reducers/settings';
import { saveAsTextFile } from '-/services/utils-io';
import { MilkdownProvider } from '@milkdown/react';
import CancelIcon from '@mui/icons-material/Cancel';
import SendIcon from '@mui/icons-material/Send';
import { Box, Grid } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputAdornment from '@mui/material/InputAdornment';
import { useTheme } from '@mui/material/styles';
import { formatDateTime4Tag } from '@tagspaces/tagspaces-common/misc';
import { extractFileExtension } from '@tagspaces/tagspaces-common/paths';
import React, { ChangeEvent, useReducer, useRef } from 'react';
import { NativeTypes } from 'react-dnd-html5-backend';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

function ChatView() {
  const { t } = useTranslation();
  const theme = useTheme();
  const {
    images,
    removeImage,
    newChatMessage,
    changeCurrentModel,
    setModel,
    currentModel,
    isTyping,
    cancelMessage,
  } = useChatContext();
  const { showNotification } = useNotificationContext();
  const { openedEntry } = useOpenedEntryContext();
  const aiDefaultProvider: AIProvider = useSelector(getDefaultAIProvider);
  const isLoading = useRef<boolean>(false);
  const currentMode = useRef<ChatMode>(undefined);
  const editorRef = useRef<CrepeRef>(null);
  const milkdownDivRef = useRef<HTMLDivElement>(null);
  const chatMsg = useRef<string>(undefined);
  const [ignored, forceUpdate] = useReducer((x) => x + 1, 0, undefined);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

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

  /*const handleChangeMode = (event: ChangeEvent<HTMLInputElement>) => {
    currentMode.current = event.target.value
      ? (event.target.value as ChatMode)
      : undefined;
    forceUpdate();
  };*/

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
        chatMsg.current = '';
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
      <Grid
        container
        spacing={1}
        direction="column"
        wrap="nowrap"
        sx={{
          height: '100%',
          overflow: 'hidden',
        }}
      >
        <Grid container spacing={0} direction="row" sx={{ flexFlow: 'nowrap' }}>
          <Grid size={11.5}>
            <SelectChatModel
              id="chatModelId"
              handleChangeModel={handleChangeModel}
              aiProvider={aiDefaultProvider}
              chosenModel={currentModel?.name}
              label={t('core:selectedAIModel')}
            />
          </Grid>
          <Grid>
            <TsIconButton
              sx={{ marginTop: '20px' }}
              tooltip={t('core:moreActions')}
              onClick={handleMoreClick}
              data-tid="moreActionsTID"
              aria-label={t('core:moreActions')}
              aria-controls={Boolean(anchorEl) ? 'account-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={Boolean(anchorEl) ? 'true' : undefined}
            >
              <MoreMenuIcon />
            </TsIconButton>
            <ChatMenu
              anchorEl={anchorEl}
              handleClose={handleClose}
              handleSelectAll={handleSelectAll}
              handleCopy={handleCopy}
              saveAsHtml={saveAsHtml}
              saveAsMarkdown={saveAsMarkdown}
            />
          </Grid>
        </Grid>
        <Grid size="grow" sx={{ padding: 0, overflowY: 'auto' }}>
          <div className="chatMD" ref={milkdownDivRef}>
            <style>
              {`
                .chatMD .milkdown .ProseMirror {
                    padding: 10px;
                }
                .chatMD .milkdown .ProseMirror a {
                    color: ${theme.palette.primary.main};
                }
                .chatMD .milkdown .ProseMirror img {
                    max-width: 99%;
                }
            `}
            </style>
            <MilkdownProvider>
              <ChatMdEditor ref={editorRef} currentFolder={openedEntry.path} />
            </MilkdownProvider>
          </div>
        </Grid>
        <Grid container spacing={1} direction="column">
          <Grid>
            {images.length > 0 &&
              images.map((image, index) => (
                <Box position="relative" sx={{ float: 'right' }}>
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
                  <TsIconButton
                    size="small"
                    tooltip={t('core:remove')}
                    onClick={(e) => {
                      removeImage(image.uuid);
                    }}
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      backgroundColor: 'rgba(255, 255, 255, 0.7)',
                      '&:hover': { backgroundColor: 'rgba(255, 255, 255, 1)' },
                    }}
                  >
                    <CloseIcon fontSize="small" />
                  </TsIconButton>
                </Box>
              ))}
          </Grid>
          <Grid>
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
                        <InputAdornment position="start" sx={{ height: 32 }}>
                          <Tooltip
                            title={
                              aiDefaultProvider?.name +
                              ' - ' +
                              aiDefaultProvider?.engine
                            }
                          >
                            <OllamaIcon />
                          </Tooltip>
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end" sx={{ height: 32 }}>
                          {isTyping && (
                            <CircularProgress size={24} color="inherit" />
                          )}
                          {isLoading.current && (
                            <Tooltip title="Cancel Message">
                              <TsIconButton
                                onClick={() => {
                                  isLoading.current = false;
                                  cancelMessage();
                                }}
                              >
                                <CancelIcon />
                              </TsIconButton>
                            </Tooltip>
                          )}

                          <TsIconButton
                            tooltip={t('core:send')}
                            onClick={handleChatMessage}
                          >
                            <SendIcon />
                          </TsIconButton>
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
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
}

export default ChatView;

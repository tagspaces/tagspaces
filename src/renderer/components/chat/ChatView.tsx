/*
Copyright (c) 2023-present The TagSpaces GmbH. All rights reserved.
*/

import React, {
  ChangeEvent,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from 'react';
import FormHelperText from '@mui/material/FormHelperText';
import FormControl from '@mui/material/FormControl';
import { useTranslation } from 'react-i18next';
import AppConfig from '-/AppConfig';
import TsTextField from '-/components/TsTextField';
import { Box, Grid2, MenuItem } from '@mui/material';
import InputAdornment from '@mui/material/InputAdornment';
import Tooltip from '-/components/Tooltip';
import IconButton from '@mui/material/IconButton';
import SendIcon from '@mui/icons-material/Send';
import { MilkdownEditor, MilkdownRef } from '@tagspaces/tagspaces-md';
import { format } from 'date-fns';
import { ChatItem, ChatMode } from '-/hooks/ChatProvider';
import { useChatContext } from '-/hooks/useChatContext';
import ChatDndTargetFile from '-/components/chat/ChatDndTargetFile';
import { NativeTypes } from 'react-dnd-html5-backend';
import { useTheme } from '@mui/material/styles';
import TsSelect from '-/components/TsSelect';
import SelectChatModel from '-/components/chat/SelectChatModel';

function ChatView() {
  const { t } = useTranslation();
  const theme = useTheme();
  const {
    images,
    chatHistoryItems,
    addTimeLineResponse,
    unloadCurrentModel,
    newChatMessage,
    changeCurrentModel,
    currentModel,
  } = useChatContext();
  const isTyping = useRef<boolean>(false);
  const currentMode = useRef<ChatMode>(undefined);
  const editorRef = useRef<MilkdownRef>(null);
  const chatMsg = useRef<string>(undefined);
  //const txtInputRef = useRef<HTMLInputElement>(null);
  const [ignored, forceUpdate] = useReducer((x) => x + 1, 0, undefined);

  const chatMessageHandler = useMemo(() => {
    return (msg, replace): void => {
      //console.log(`Chat ${msg}`);
      const items = addTimeLineResponse(msg, replace);
      editorRef.current?.update(formatChatItems(items));
    };
  }, []);

  useEffect(() => {
    editorRef.current?.setDarkMode(theme.palette.mode === 'dark');
  }, [theme]);

  useEffect(() => {
    if (AppConfig.isElectron) {
      window.electronIO.ipcRenderer.on('ChatMessage', (message, replace) => {
        console.log('ChatMessage:' + message);
        if (message instanceof Uint8Array) {
          chatMessageHandler(new TextDecoder('utf-8').decode(message), replace);
        } else if (typeof message === 'string') {
          chatMessageHandler(message, replace);
        }
      });

      return () => {
        window.electronIO.ipcRenderer.removeAllListeners('ChatMessage');
        unloadCurrentModel();
      };
    }
  }, [chatMessageHandler]);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    chatMsg.current = event.target.value;
    forceUpdate();
  };

  const handleChangeModel = (newModelName: string) => {
    changeCurrentModel(newModelName).then((success) => {
      if (success) {
        //forceUpdate();
      }
    });
  };

  function formatChatItems(chatItems: ChatItem[]): string {
    const formattedItems = chatItems.map((item) => {
      const date = item.timestamp
        ? ' [' + format(item.timestamp, 'yyyy-MM-dd HH:mm:ss') + ']'
        : '';
      const request = item.request ? item.request : '';
      const response = item.response ? item.response : '';
      const images = item.imagePaths
        ? item.imagePaths.map((i) => {
            return '![chat image](' + i + ')';
          })
        : '';
      return (
        '\n | `' +
        date +
        ':` ' +
        request +
        images +
        ' |\n|-------------| \n\n ' +
        response +
        ' \n '
      );
    });
    return formattedItems.join(' ');
  }

  const handleChangeMode = (event: ChangeEvent<HTMLInputElement>) => {
    currentMode.current = event.target.value
      ? (event.target.value as ChatMode)
      : undefined;
    forceUpdate();
  };

  const handleChatMessage = () => {
    isTyping.current = true;
    forceUpdate();
    newChatMessage(chatMsg.current, false, 'user', currentMode.current).then(
      (response) => {
        console.log('newOllamaMessage response:' + response);
        if (response) {
          chatMsg.current = '';
        }
        isTyping.current = false;
        forceUpdate();
      },
    );
  };
  const { FILE } = NativeTypes;

  return (
    <Box sx={{ flexGrow: 1, margin: 2, height: 'calc(100% - 40px)' }}>
      <Grid2 container spacing={2} style={{ height: '100%' }}>
        <Grid2 size={8} style={{ height: 60 }}>
          <FormControl fullWidth>
            <SelectChatModel
              handleChangeModel={handleChangeModel}
              chosenModel={currentModel}
            />
          </FormControl>
        </Grid2>
        <Grid2 size={4} style={{ height: 60 }}>
          <FormControl fullWidth>
            <TsSelect
              placeholder="Chat mode"
              id="select-mode"
              value={currentMode.current}
              onChange={handleChangeMode}
              label="Select Mode"
            >
              <MenuItem value="">None</MenuItem>
              <MenuItem
                value="helpful"
                title="If you don't know the answer, just say you don't know. DO NOT try to make up an answer"
              >
                Helpful assistant
              </MenuItem>
              <MenuItem value="summary" title="Generate a concise summary">
                Generate Summary
              </MenuItem>
            </TsSelect>
          </FormControl>
        </Grid2>
        <Grid2
          size="grow"
          sx={{ padding: 2, height: 'calc(100% - 180px)', overflowY: 'auto' }}
        >
          <MilkdownEditor
            ref={editorRef}
            content={formatChatItems(chatHistoryItems)}
            readOnly={true}
            lightMode={true}
          />
        </Grid2>
        <Grid2 size={12} style={{ height: 100 }}>
          <ChatDndTargetFile accepts={[FILE]}>
            <FormControl fullWidth>
              <TsTextField
                autoFocus
                disabled={isTyping.current}
                name="entryName"
                label={t('core:newChatMessage')}
                onChange={handleInputChange}
                value={chatMsg.current}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.code === 'Enter') {
                    event.preventDefault();
                    event.stopPropagation();
                    handleChatMessage();
                  }
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end" style={{ height: 32 }}>
                      {images.length > 0 &&
                        images.map((image) => (
                          <img
                            src={'data:image/*;base64,' + image.base64}
                            style={{ maxHeight: 50 }}
                          />
                        ))}
                      <Tooltip title="Send Message">
                        <IconButton onClick={handleChatMessage} size="large">
                          <SendIcon />
                        </IconButton>
                      </Tooltip>
                    </InputAdornment>
                  ),
                }}
              />
              <FormHelperText>{t('core:aiHelp')}</FormHelperText>
            </FormControl>
          </ChatDndTargetFile>
        </Grid2>
      </Grid2>
    </Box>
  );
}

export default ChatView;

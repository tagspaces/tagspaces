/*
Copyright (c) 2023-present The TagSpaces GmbH. All rights reserved.
*/

import React, { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import FormHelperText from '@mui/material/FormHelperText';
import FormControl from '@mui/material/FormControl';
import { useTranslation } from 'react-i18next';
import AppConfig from '-/AppConfig';
import TsTextField from '-/components/TsTextField';
import { Box, InputLabel, MenuItem, Select } from '@mui/material';
import { TS } from '-/tagspaces.namespace';
import InputAdornment from '@mui/material/InputAdornment';
import Tooltip from '-/components/Tooltip';
import IconButton from '@mui/material/IconButton';
import SendIcon from '@mui/icons-material/Send';
import { SelectChangeEvent } from '@mui/material/Select';
import { RemoveIcon } from '-/components/CommonIcons';
import { MilkdownEditor } from '@tagspaces/tagspaces-md';
import { format } from 'date-fns';
import {
  ChatContextProvider,
  ChatItem,
} from '-/perspectives/chat/hooks/ChatProvider';
import { useChatContext } from '-/perspectives/chat/hooks/useChatContext';
import ChatDndTargetFile from '-/perspectives/chat/components/ChatDndTargetFile';
import { NativeTypes } from 'react-dnd-html5-backend';

interface Props {
  onClose: (event?: object, reason?: string) => void;
}

function MainContainer(props: Props) {
  const { t } = useTranslation();
  const {
    isTyping,
    models,
    images,
    currentModel,
    chatHistoryItems,
    addTimeLineResponse,
    unloadCurrentModel,
    changeCurrentModel,
    newChatMessage,
    removeModel,
  } = useChatContext();
  const chatMsg = useRef<string>(undefined);
  //const txtInputRef = useRef<HTMLInputElement>(null);
  const [ignored, forceUpdate] = useReducer((x) => x + 1, 0, undefined);

  const ollamaAvailableModels: TS.Model[] = [
    {
      name: 'llama3.1',
      details: {
        format:
          '4,6 GB. The largest language model from Meta, featuring 405 billion parameters. It is one of the leading open-source AI models, capable of understanding and processing information deeply and diversely',
      },
    },
    {
      name: 'llama3.2',
      details: {
        format:
          'new 1B and 3B lightweight models are designed for seamless integration on mobile and edge devices. With these models, you can build private, personalized AI experiences with minimal latency and resource overhead.',
      },
    },
    {
      name: 'gemma2',
      details: {
        format:
          "5,4 GB. One of GEMMA2's standout features is its ability to handle and integrate multiple data modalities. Traditional AI models often specialise in a single type of data — text, images, or audio. GEMMA2, however, can process and synthesise information from all these sources simultaneously.",
      },
    },
    {
      name: 'codegemma',
      details: {
        format:
          'CodeGemma models are text-to-text and text-to-code decoder-only models and are available as a 7 billion pretrained variant that specializes in code completion and code generation tasks, a 7 billion parameter instruction-tuned variant for code chat and instruction following and a 2 billion parameter pretrained variant.',
      },
    },
    {
      name: 'llava',
      details: {
        format:
          'large multimodal model that is designed to understand and generate content based on both visual inputs (images) and textual instructions.',
      },
    },
  ];

  const chatMessageHandler = useMemo(() => {
    return (msg, replace): void => {
      //console.log(`Chat ${msg}`);
      addTimeLineResponse(msg, replace);
    };
  }, []);

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

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    chatMsg.current = event.target.value;
    forceUpdate();
  };

  function formatChatItems(chatItems: ChatItem[]): string {
    const formattedItems = chatItems.map((item) => {
      const date = item.timestamp
        ? ' [' + format(item.timestamp, 'yyyy-MM-dd HH:mm:ss') + ']'
        : '';
      const request = item.request ? item.request : '';
      const response = item.response ? item.response : '';
      return (
        '\n | `' +
        date +
        ':` ' +
        request +
        ' |\n|-------------| \n\n ' +
        response +
        ' \n '
      );
    });
    return formattedItems.join(' ');
  }

  const handleChangeModel = (event: SelectChangeEvent) => {
    const newModelName = event.target.value;
    changeCurrentModel(newModelName);
  };

  const handleRemoveModel = () => {
    removeModel();
  };

  const handleChatMessage = () => {
    newChatMessage(chatMsg.current).then((response) => {
      console.log('newOllamaMessage response:' + response);
      chatMsg.current = '';
    });
  };
  const { FILE } = NativeTypes;

  return (
    <>
      <FormControl variant="filled">
        <Box sx={{ width: '100%' }}>
          <InputLabel id="select-label">Select a model</InputLabel>
          <Select
            displayEmpty
            sx={{ minWidth: 400 }}
            labelId="select-label"
            id="select-menu"
            value={currentModel ? currentModel.name : 'init'}
            onChange={handleChangeModel}
            label="Select Model"
          >
            <MenuItem value="init" disabled>
              Choose an model
            </MenuItem>
            {models.length > 0 ? (
              models.map((model) => (
                <MenuItem
                  key={model.name}
                  value={model.name}
                  title={model.modified_at}
                >
                  {model.name}
                </MenuItem>
              ))
            ) : (
              <MenuItem value="" disabled>
                No models installed
              </MenuItem>
            )}
            <MenuItem value="" disabled>
              Available models
            </MenuItem>
            {ollamaAvailableModels.map((model) => (
              <MenuItem
                key={model.name}
                value={model.name}
                title={model.details.format}
              >
                {model.name}
              </MenuItem>
            ))}
          </Select>
          {currentModel && (
            <IconButton
              aria-label={t('core:deleteModel')}
              onClick={handleRemoveModel}
              data-tid="deleteModelTID"
              size="small"
            >
              <RemoveIcon />
            </IconButton>
          )}
        </Box>
      </FormControl>

      <ChatDndTargetFile accepts={[FILE]}>
        <FormControl fullWidth={true}>
          <TsTextField
            autoFocus
            disabled={isTyping}
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
                        src={'data:image/*;base64,' + image}
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
      <MilkdownEditor
        content={formatChatItems(chatHistoryItems)}
        readOnly={true}
        lightMode={true}
      />
    </>
  );
}

export default MainContainer;

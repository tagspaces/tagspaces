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

import React, { useEffect, useReducer, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useOpenedEntryContext } from '-/hooks/useOpenedEntryContext';
import { extractFileExtension } from '@tagspaces/tagspaces-common/paths';
import {
  extractPDFcontent,
  supportedImgs,
  supportedText,
} from '-/services/thumbsgenerator';
import Button from '@mui/material/Button';
import { useChatContext } from '-/hooks/useChatContext';
import { Pro } from '-/pro';
import { useFilePropertiesContext } from '-/hooks/useFilePropertiesContext';
import { toBase64Image } from '-/services/utils-io';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import { useDispatch, useSelector } from 'react-redux';
import {
  actions as SettingsActions,
  getOllamaSettings,
} from '-/reducers/settings';
import LoadingLazy from '-/components/LoadingLazy';
import { useNotificationContext } from '-/hooks/useNotificationContext';
import { AppDispatch } from '-/reducers/app';
import CircularProgress from '@mui/material/CircularProgress';
import { Box } from '@mui/material';
import { TS } from '-/tagspaces.namespace';
import { useTaggingActionsContext } from '-/hooks/useTaggingActionsContext';
import { ChatMode, Model } from '-/components/chat/ChatTypes';

interface Props {}

const ChatView = React.lazy(
  () => import(/* webpackChunkName: "ChatView" */ './chat/ChatView'),
);
function ChatViewAsync(props) {
  return (
    <React.Suspense fallback={<LoadingLazy />}>
      <ChatView {...props} />
    </React.Suspense>
  );
}

function AiPropertiesTab(props: Props) {
  const { t } = useTranslation();
  const dispatch: AppDispatch = useDispatch();
  const { currentLocation } = useCurrentLocationContext();
  const { openedEntry } = useOpenedEntryContext();
  const { newChatMessage, getModel } = useChatContext();
  const { setDescription, saveDescription } = useFilePropertiesContext();
  const { showNotification } = useNotificationContext();
  const { addTagsToFsEntry } = useTaggingActionsContext();

  const ollamaSettings = useSelector(getOllamaSettings);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const aiModel = useRef<Model>(undefined);
  const ext = extractFileExtension(openedEntry.name).toLowerCase();
  const [ignored, forceUpdate] = useReducer((x) => x + 1, 0, undefined);
  const IMAGE_DESCRIPTION = Pro && Pro.UI ? Pro.UI.IMAGE_DESCRIPTION : false;
  const GENERATE_TAGS = Pro && Pro.UI ? Pro.UI.GENERATE_TAGS : false;

  useEffect(() => {
    let model;
    if (supportedText.includes(ext) || ext === 'pdf') {
      model = ollamaSettings.textModel;
    } else if (supportedImgs.includes(ext)) {
      model = ollamaSettings.imageModel;
    }
    if (model) {
      getModel(model).then((m) => {
        aiModel.current = m;
        forceUpdate();
      });
    }
  }, [ollamaSettings]);

  if (!openedEntry.isFile) {
    return <ChatViewAsync />;
  }

  function getFileContent(
    content: any,
    fileContent: 'text' | 'pdf' | 'image',
  ): Promise<string> {
    if (fileContent === 'text') {
      //&& typeof content === 'string') {
      return Promise.resolve(content);
    } else if (fileContent === 'pdf') {
      return extractPDFcontent(content);
    }
    return Promise.resolve(content);
  }

  function generate(fileContent: 'text' | 'pdf' | 'image', mode: ChatMode) {
    if (aiModel.current) {
      setIsLoading(true);
      currentLocation
        .getFileContentPromise(
          openedEntry.path,
          fileContent === 'text' ? 'text' : 'arraybuffer',
        )
        .then((content) => getFileContent(content, fileContent))
        .then((content) => {
          return newChatMessage(
            fileContent === 'image' ? undefined : content,
            false,
            'user',
            mode,
            aiModel.current.name,
            false,
            fileContent === 'image' ? [toBase64Image(content)] : [],
            false,
          );
        })
        .then((response) => {
          console.log('newOllamaMessage response:' + response);
          setIsLoading(false);
          if (response) {
            if (mode === 'tags') {
              try {
                const regex = /\{([^}]+)\}/g;
                const tags: TS.Tag[] = [...response.matchAll(regex)].map(
                  (match) => ({ title: match[1] + '', type: 'sidecar' }),
                );
                addTagsToFsEntry(openedEntry, tags).then(() => {
                  dispatch(SettingsActions.setEntryContainerTab(0));
                });
              } catch (e) {
                console.error('parse response ' + response, e);
              }
            } else if (mode === 'description' || mode === 'summary') {
              dispatch(SettingsActions.setEntryContainerTab(1));

              if (openedEntry.meta.description) {
                setDescription(
                  openedEntry.meta.description + '\n---\n' + response,
                );
              } else {
                setDescription(response);
              }
              saveDescription();
              //openEntry(openedEntry.path).then(() => {
              showNotification(
                'Description for ' + openedEntry.path + ' generated',
              );
            }
          }
          //setImage(undefined);
          //forceUpdate();
        })
        .catch((e) => console.log('newOllamaMessage error:', e));
    } else {
      showNotification('Model not found, try pulling it first');
    }
  }

  let descriptionButton;
  let generateTagsButton;
  if (IMAGE_DESCRIPTION && supportedImgs.includes(ext)) {
    descriptionButton = (
      <Button
        disabled={isLoading || !aiModel.current}
        data-tid="generateDescriptionTID"
        onClick={() => {
          generate('image', 'description');
        }}
        color="secondary"
      >
        {t('core:generateDescription')}
      </Button>
    );
  } else if (supportedText.includes(ext) || ext === 'pdf') {
    descriptionButton = (
      <Button
        disabled={isLoading || !aiModel.current}
        data-tid="generateDescriptionTID"
        onClick={() => {
          generate(ext === 'pdf' ? 'pdf' : 'text', 'summary');
        }}
        color="secondary"
      >
        {t('core:generateDescription')}
      </Button>
    );
    if (GENERATE_TAGS) {
      generateTagsButton = (
        <Button
          disabled={isLoading || !aiModel.current}
          data-tid="generateTagsTID"
          onClick={() => {
            generate(ext === 'pdf' ? 'pdf' : 'text', 'tags');
          }}
          color="secondary"
        >
          {t('core:generateTags')}
        </Button>
      );
    }
  }

  if (descriptionButton || generateTagsButton) {
    return (
      <Box position="relative" display="inline-flex">
        {descriptionButton && descriptionButton}
        {generateTagsButton && generateTagsButton}
        {isLoading && <CircularProgress size={24} color="inherit" />}
      </Box>
    );
  } else {
    return <div>No AI actions</div>;
  }
}

export default AiPropertiesTab;

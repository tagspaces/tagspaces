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
import LoadingLazy from '-/components/LoadingLazy';
import TsButton from '-/components/TsButton';
import { ChatMode, Model } from '-/components/chat/ChatTypes';
import { useChatContext } from '-/hooks/useChatContext';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import { useFilePropertiesContext } from '-/hooks/useFilePropertiesContext';
import { useNotificationContext } from '-/hooks/useNotificationContext';
import { useOpenedEntryContext } from '-/hooks/useOpenedEntryContext';
import { useTaggingActionsContext } from '-/hooks/useTaggingActionsContext';
import { AppDispatch } from '-/reducers/app';
import {
  actions as SettingsActions,
  getOllamaSettings,
} from '-/reducers/settings';
import {
  extractPDFcontent,
  supportedImgs,
  supportedText,
} from '-/services/thumbsgenerator';
import { toBase64Image } from '-/services/utils-io';
import { TS } from '-/tagspaces.namespace';
import { Box } from '@mui/material';
import { extractFileExtension } from '@tagspaces/tagspaces-common/paths';
import React, { useEffect, useReducer, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import AiGenDescButton from '-/components/AiGenDescButton';
import AiGenTagsButton from '-/components/AiGenTagsButton';

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
  const { openedEntry } = useOpenedEntryContext();

  if (!openedEntry.isFile) {
    return <ChatViewAsync />;
  }

  return (
    <Box position="relative" display="inline-flex">
      <AiGenDescButton />
      <span style={{ marginLeft: AppConfig.defaultSpaceBetweenButtons }}>
        <AiGenTagsButton />
      </span>
    </Box>
  );

  /* useEffect(() => {
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
  }, [ext, ollamaSettings]);*/

  /*function getFileContent(
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
  if (supportedImgs.includes(ext)) {
    descriptionButton = (
      <TsButton
        loading={isLoading}
        disabled={isLoading || !aiModel.current}
        data-tid="generateDescriptionTID"
        onClick={() => {
          generate('image', 'description');
        }}
      >
        {t('core:generateDescription')}
      </TsButton>
    );
    generateTagsButton = (
      <TsButton
        loading={isLoading}
        disabled={isLoading || !aiModel.current}
        data-tid="generateTagsTID"
        onClick={() => {
          generate('image', 'tags');
        }}
      >
        {t('core:generateTags')}
      </TsButton>
    );
  } else if (supportedText.includes(ext) || ext === 'pdf') {
    descriptionButton = (
      <TsButton
        loading={isLoading}
        disabled={isLoading || !aiModel.current}
        data-tid="generateDescriptionTID"
        onClick={() => {
          generate(ext === 'pdf' ? 'pdf' : 'text', 'summary');
        }}
      >
        {t('core:generateDescription')}
      </TsButton>
    );
    generateTagsButton = (
      <TsButton
        loading={isLoading}
        disabled={isLoading || !aiModel.current}
        data-tid="generateTagsTID"
        onClick={() => {
          generate(ext === 'pdf' ? 'pdf' : 'text', 'tags');
        }}
      >
        {t('core:generateTags')}
      </TsButton>
    );
  }

  if (descriptionButton || generateTagsButton) {
    return (
      <Box position="relative" display="inline-flex">
        {descriptionButton && descriptionButton}
        {generateTagsButton && (
          <span style={{ marginLeft: AppConfig.defaultSpaceBetweenButtons }}>
            {generateTagsButton}
          </span>
        )}
      </Box>
    );
  } else {
    return <div>No AI actions</div>;
  }*/
}

export default AiPropertiesTab;

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
import React, { useEffect, useRef } from 'react';
import { Milkdown, useEditor } from '@milkdown/react';
import { useOpenedEntryContext } from '-/hooks/useOpenedEntryContext';
import { createCrepeEditor } from '-/components/md/utils';
import { EditorStatus } from '@milkdown/core';
import { CrepeRef, useCrepeHandler } from '-/components/md/useCrepeHandler';
import { Crepe } from '@milkdown/crepe';
import { replaceAll } from '@milkdown/utils';
import { useChatContext } from '-/hooks/useChatContext';
import { ChatItem } from '-/components/chat/ChatTypes';
import { format } from 'date-fns';
import AppConfig from '-/AppConfig';

interface ChatMdEditorProps {
  //defaultContent: string;
  currentFolder?: string;
  placeholder?: string;
}

const ChatMdEditor = React.forwardRef<CrepeRef, ChatMdEditorProps>(
  (props, ref) => {
    const { currentFolder, placeholder } = props;
    const { openLink } = useOpenedEntryContext();
    const { chatHistoryItems } = useChatContext();
    const crepeInstanceRef = useRef<Crepe>(undefined);

    const { get, loading } = useEditor(
      (root) => {
        const crepe = createCrepeEditor(
          root,
          formatChatItems(chatHistoryItems),
          false,
          {
            [Crepe.Feature.BlockEdit]: false,
            [Crepe.Feature.Toolbar]: false,
            [Crepe.Feature.Placeholder]: false,
            [Crepe.Feature.Cursor]: false,
          },
          placeholder,
          currentFolder,
          openLink,
        );

        crepe.editor.onStatusChange((status: EditorStatus) => {
          if (status === EditorStatus.Created) {
            console.log(status);
            crepeInstanceRef.current = crepe;
          }
        });
        return crepe;
      },
      [currentFolder],
    );

    useEffect(() => {
      const editor = get();
      if (loading || !editor || editor.status !== EditorStatus.Created) return;
      editor.action(replaceAll(formatChatItems(chatHistoryItems)));
    }, [chatHistoryItems]);

    useEffect(() => {
      return () => {
        if (crepeInstanceRef.current) {
          crepeInstanceRef.current.destroy();
        }
      };
    }, []);

    useCrepeHandler(ref, () => crepeInstanceRef.current, get, loading);

    function formatChatItems(chatItems: ChatItem[]): string {
      if (chatItems) {
        const formattedItems = chatItems.map((item) => {
          const date = item.timestamp
            ? '**User on ' +
              format(item.timestamp, 'yyyy-MM-dd HH:mm:ss') +
              '**'
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
                  //(AppConfig.isWeb ? '' : 'file://') +
                  // getHistoryFilePath(i) +
                  AppConfig.metaFolder +
                  '/' +
                  AppConfig.aiFolder +
                  '/' +
                  i +
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
        return formattedItems.join(' ');
      }
      return '';
    }

    return <Milkdown />;
  },
);

export default ChatMdEditor;

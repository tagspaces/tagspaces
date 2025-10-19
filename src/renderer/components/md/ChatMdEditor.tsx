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
import { ChatItem } from '-/components/chat/ChatTypes';
import { CrepeRef, useCrepeHandler } from '-/components/md/useCrepeHandler';
import { createCrepeEditor } from '-/components/md/utils';
import { useChatContext } from '-/hooks/useChatContext';
import { useOpenedEntryContext } from '-/hooks/useOpenedEntryContext';
import { EditorStatus } from '@milkdown/core';
import { Crepe } from '@milkdown/crepe';
import { Milkdown, useEditor } from '@milkdown/react';
import { format } from 'date-fns';
import React, { useEffect, useRef } from 'react';

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

            // const content = document.querySelector('.chatMD');
            // if (!content) return;
            // setTimeout(() => {
            //   content.scrollTo({
            //     top: content.scrollHeight,
            //     behavior: 'smooth',
            //   });
            //   console.log('Scrolled to: ' + content.scrollHeight);
            // }, 100);
          }
        });
        return crepe;
      },
      [currentFolder, chatHistoryItems],
    );

    /* useEffect(() => {
      const editor = get();
      if (loading || !editor || editor.status !== EditorStatus.Created) return;
      editor.action(replaceAll(formatChatItems(chatHistoryItems)));
    }, [chatHistoryItems]);*/

    useEffect(() => {
      return () => {
        if (crepeInstanceRef.current) {
          crepeInstanceRef.current.destroy();
        }
      };
    }, []);

    // useEffect(() => {
    //   // Find the inner editable content area
    //   const content = document.querySelector('.ProseMirror');
    //   if (!content) return;
    //   content.scrollTo({
    //     top: content.scrollHeight,
    //     behavior: 'smooth',
    //   });
    // }, [chatHistoryItems]);

    useCrepeHandler(ref, () => crepeInstanceRef.current, get, loading);

    function formatChatItems(chatItems: ChatItem[] = []): string {
      if (!chatItems.length) return '';

      return (
        [...chatItems] // clone to avoid mutating original
          // .reverse() // reverse order
          .map((item) => {
            const dateStr = item.timestamp
              ? `**User on ${format(item.timestamp, 'yyyy-MM-dd HH:mm:ss')}**`
              : '**User**';

            const requestStr = item.request ?? '';
            const modelName = item.modelName ?? 'AI model';
            const responseStr = item.response
              ? `**${modelName}**:\\\n${item.response}`
              : '';

            const imagesStr = (item.imagePaths ?? [])
              .map(
                (img) =>
                  `![chat image](${AppConfig.metaFolder}/${AppConfig.aiFolder}/${img})`,
              )
              .join('\n');

            return `${dateStr}: \\\n${requestStr}\n${imagesStr}\n${responseStr}\n***\n`;
          })
          .join('\n')
      );
    }

    return <Milkdown />;
  },
);

export default ChatMdEditor;

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
import { getAuthor } from '-/reducers/settings';
import { EditorStatus } from '@milkdown/core';
import { Crepe } from '@milkdown/crepe';
import { Milkdown, useEditor } from '@milkdown/react';
import { format } from 'date-fns';
import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';

interface ChatMdEditorProps {
  placeholder?: string;
  showCurrent?: boolean;
}

const ChatMdEditor = React.forwardRef<CrepeRef, ChatMdEditorProps>(
  (props, ref) => {
    const { placeholder, showCurrent } = props;
    const { openedEntry, openLink } = useOpenedEntryContext();
    const { chatHistoryItems } = useChatContext();
    const crepeInstanceRef = useRef<Crepe | null>(null);
    const author = useSelector(getAuthor);
    const openedEntryPathRef = useRef<string | undefined>();
    const openLinkRef = useRef(openLink);

    // Update refs without triggering re-renders
    useEffect(() => {
      openedEntryPathRef.current = openedEntry?.path;
      openLinkRef.current = openLink;
    }, [openedEntry?.path, openLink]);

    // Memoize formatted chat content for performance
    const formattedChatContent = React.useMemo(
      () =>
        formatChatItems(showCurrent ? [chatHistoryItems[0]] : chatHistoryItems),
      [chatHistoryItems, showCurrent],
    );

    // Use Milkdown's useEditor, but only recreate the editor when formatted content changes
    const { get, loading } = useEditor(
      (root) => {
        // Destroy previous instance if exists
        if (crepeInstanceRef.current) {
          crepeInstanceRef.current.destroy();
          crepeInstanceRef.current = null;
        }
        // Create new crepe editor
        const crepe = createCrepeEditor(
          root,
          formattedChatContent,
          false,
          {
            [Crepe.Feature.BlockEdit]: false,
            [Crepe.Feature.Toolbar]: false,
            [Crepe.Feature.Placeholder]: false,
            [Crepe.Feature.Cursor]: false,
          },
          placeholder,
          openedEntryPathRef.current,
          openLinkRef.current,
        );
        crepe.editor.onStatusChange((status: EditorStatus) => {
          if (status === EditorStatus.Created) {
            crepeInstanceRef.current = crepe;
          }
        });
        return crepe;
      },
      [formattedChatContent],
    );

    useCrepeHandler(ref, () => crepeInstanceRef.current, get, loading);

    // Scroll to bottom when markdown content changes
    useEffect(() => {
      const container = document.querySelector('#chatMD');
      if (container) {
        setTimeout(() => {
          container.scrollTo({
            top: container.scrollHeight,
            behavior: 'auto', // 'smooth',
          });
        }, 500);
      }
    }, [formattedChatContent]);

    function formatChatItems(chatItems: ChatItem[] = []): string {
      if (!chatItems.length || !chatItems[0]) return '';
      const user = author || 'You';
      return [...chatItems]
        .reverse()
        .map((item) => {
          const dateStr = item.timestamp
            ? `**${user} on ${format(item.timestamp, 'yyyy-MM-dd HH:mm:ss')}**`
            : `**${user}**`;
          const requestStr = item.request ?? '';
          const modelName = item.modelName ?? 'AI model';
          const responseStr = item.response
            ? `**AI/LLM (${modelName})**:\\\n${item.response}`
            : '';
          const imagesStr = (item.imagePaths ?? [])
            .map(
              (img) =>
                `![chat image](${AppConfig.metaFolder}/${AppConfig.aiFolder}/${img})`,
            )
            .join('\n');
          return `${dateStr}: \\\n${requestStr}\n${imagesStr}\n${responseStr}\n***\n`;
        })
        .join('\n');
    }

    return <Milkdown />;
  },
);

export default React.memo(ChatMdEditor);

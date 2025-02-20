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
import React, { useRef } from 'react';
import { Milkdown, useEditor } from '@milkdown/react';
import { useOpenedEntryContext } from '-/hooks/useOpenedEntryContext';
import { createCrepeEditor } from '-/components/md/utils';
import { EditorStatus } from '@milkdown/core';
import { CrepeRef, useCrepeHandler } from '-/components/md/useCrepeHandler';
import { Crepe } from '@milkdown/crepe';

interface ChatMdEditorProps {
  defaultContent: string;
  currentFolder?: string;
  placeholder?: string;
}

const ChatMdEditor = React.forwardRef<CrepeRef, ChatMdEditorProps>(
  (props, ref) => {
    const { defaultContent, currentFolder, placeholder } = props;
    const { openLink } = useOpenedEntryContext();
    const crepeInstanceRef = useRef<Crepe>(undefined);

    const { get, loading } = useEditor(
      (root) => {
        const crepe = createCrepeEditor(
          root,
          defaultContent,
          false,
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

    useCrepeHandler(ref, () => crepeInstanceRef.current, get, loading);

    return <Milkdown />;
  },
);

export default ChatMdEditor;

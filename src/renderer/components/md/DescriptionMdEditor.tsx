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
import { EditorStatus, commandsCtx } from '@milkdown/kit/core';
import { $useKeymap, $command } from '@milkdown/kit/utils';
import { useOpenedEntryContext } from '-/hooks/useOpenedEntryContext';
import { createCrepeEditor } from '-/components/md/utils';
import { CrepeRef, useCrepeHandler } from '-/components/md/useCrepeHandler';
import { Crepe } from '@milkdown/crepe';
import { useFilePropertiesContext } from '-/hooks/useFilePropertiesContext';
import { useTranslation } from 'react-i18next';
import { Pro } from '-/pro';
import { useDirectoryContentContext } from '-/hooks/useDirectoryContentContext';

interface CrepeMdEditorProps {
  onChange?: (markdown: string, prevMarkdown: string) => void;
  onFocus?: () => void;
}

const DescriptionMdEditor = React.forwardRef<CrepeRef, CrepeMdEditorProps>(
  (props, ref) => {
    const { onChange, onFocus } = props;
    const { t } = useTranslation();
    const { currentDirectoryPath } = useDirectoryContentContext();
    const { saveDescription, isEditDescriptionMode, description } =
      useFilePropertiesContext();
    const { openLink } = useOpenedEntryContext();
    const crepeInstanceRef = useRef<Crepe>(undefined);

    const { get, loading } = useEditor(
      (root) => {
        /*if (crepeInstanceRef.current) {
          return crepeInstanceRef.current;
        }*/
        const placeholder = isEditDescriptionMode
          ? undefined
          : t(
              Pro
                ? 'core:addMarkdownDescription'
                : 'core:thisFunctionalityIsAvailableInPro',
            );
        const crepe = createCrepeEditor(
          root,
          description,
          isEditDescriptionMode,
          {},
          placeholder,
          currentDirectoryPath,
          openLink,
          onChange,
          onFocus,
        );

        crepe.editor.onStatusChange((status: EditorStatus) => {
          if (status === EditorStatus.Created) {
            //console.log(status);
            /* if (crepeInstanceRef.current) {
              console.log('Destroyed...');
              crepeInstanceRef.current.destroy();
              crepeInstanceRef.current = null;
            }*/
            crepeInstanceRef.current = crepe;
          }
        });

        const saveCommand = $command('saveCommand', () => () => {
          return () => {
            saveDescription();
            return true;
          };
        });

        const saveKeyMap = $useKeymap('saveKeymap', {
          saveDescription: {
            //https://prosemirror.net/docs/ref/version/0.18.0.html#keymap
            shortcuts: 'Mod-s', //keyBindings['saveDocument'], //You can use Mod- as a shorthand for Cmd- on Mac and Ctrl- on other platforms.
            command: (ctx) => {
              const commands = ctx.get(commandsCtx);
              return () => commands.call(saveCommand.key);
            },
          },
        });

        crepe.editor.use([saveCommand, saveKeyMap].flat());

        return crepe;
      },
      [currentDirectoryPath, isEditDescriptionMode, description],
    );

    useCrepeHandler(ref, () => crepeInstanceRef.current, get, loading);

    return <Milkdown />;
  },
);

export default DescriptionMdEditor;

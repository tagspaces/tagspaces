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
import { Crepe } from '@milkdown/crepe';

interface CrepeMdEditorProps {
  isEditMode: boolean;
  content: string;
  onChange?: (markdown: string, prevMarkdown: string) => void;
  onFocus?: () => void;
}

const CrepeMdEditor: React.FC<CrepeMdEditorProps> = (props) => {
  const { isEditMode, content, onChange, onFocus } = props;

  const focus = useRef<boolean>(false);

  const { get, loading } = useEditor(
    (root) => {
      const crepe = new Crepe({
        root,
        defaultValue: content || 'Loading...',
        /* features: {
        [Crepe.Feature.CodeMirror]: false,
      },*/
        featureConfigs: {
          [Crepe.Feature.Placeholder]: {
            text: 'Type / to use slash command',
          },
          [Crepe.Feature.ImageBlock]: {
            /* proxyDomURL: (originalURL: string) => {
              return mediaProtocol+`://example.com/${originalURL}`;
            }*/
          },
        },
      });
      crepe.on((listener) => {
        listener.markdownUpdated(
          (_, markdown: string, prevMarkdown: string) => {
            if (focus.current) {
              console.log('Change listener:' + markdown);
              if (onChange) {
                onChange(markdown, prevMarkdown);
              }
            }
          },
        );
        listener.focus(() => {
          focus.current = true;
          if (onFocus) {
            onFocus();
          }
        });
      });
      crepe.setReadonly(!isEditMode);
      crepe.create().then(() => {
        console.log('Editor created');
        //sendMessageToHost({ command: 'parentLoadTextContent' });
      });
      /*crepe.editor.config((ctx: Ctx) => {
      ctx.update(editorViewOptionsCtx, prev => ({
        ...prev,
        /!*attributes: {
          class: 'mx-auto h-full' // text-center w-1/2 flex justify-center items-center h-screen
        },*!/
        editable: () => isEditable,
        handleClickOn: (view: EditorView, pos: number) =>
            handleClick(textEditorMode, ctx, view, pos) //, node)
      }));
    });*/

      //preventDefaultClick
      /* const observer = new MutationObserver(() => {
      const links = Array.from(root.querySelectorAll('a'));
      links.forEach(link => {
        link.onclick = () => false;
      });
    });
    observer.observe(root, {
      childList: true
    });*/

      return crepe;
    },
    [isEditMode],
  );

  return <Milkdown />;
};

export default CrepeMdEditor;

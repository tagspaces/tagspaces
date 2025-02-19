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
import { editorViewOptionsCtx } from '@milkdown/core';
import AppConfig from '-/AppConfig';
import { Milkdown, useEditor } from '@milkdown/react';
import { replaceAll } from '@milkdown/utils';
import { EditorStatus } from '@milkdown/kit/core';
import { getMarkdown } from '@milkdown/kit/utils';
import { Crepe } from '@milkdown/crepe';
import { extractContainingDirectoryPath } from '@tagspaces/tagspaces-common/paths';
import { useOpenedEntryContext } from '-/hooks/useOpenedEntryContext';
import { EditorView } from 'prosemirror-view';
import { Ctx } from '@milkdown/ctx';
import { getHref } from '-/components/md/utils';

interface CrepeMdEditorProps {
  isEditMode: boolean;
  content: string;
  placeholder?: string; //'Type / to use slash command'
  onChange?: (markdown: string, prevMarkdown: string) => void;
  onFocus?: () => void;
  instance?: (crepe: Crepe) => void;
}

export interface CrepeRef {
  update: (markdown: string) => void;
  setDarkMode: (isDark: boolean) => void;
  openSearchDialog: () => void;
  getMarkdown: () => string;
}

const CrepeMdEditor = React.forwardRef<CrepeRef, CrepeMdEditorProps>(
  (props, ref) => {
    const { isEditMode, content, onChange, onFocus, placeholder, instance } =
      props;
    const { openedEntry, openLink } = useOpenedEntryContext();
    const focus = useRef<boolean>(false);

    const { get, loading } = useEditor(
      (root) => {
        const crepe = new Crepe({
          root,
          defaultValue: content,
          /* features: {
        [Crepe.Feature.CodeMirror]: false,
      },*/
          featureConfigs: {
            [Crepe.Feature.Placeholder]: {
              text: placeholder || '',
            },
            [Crepe.Feature.ImageBlock]: {
              proxyDomURL: (originalURL: string) => {
                const dirPath = extractContainingDirectoryPath(
                  openedEntry.path,
                );
                return (
                  AppConfig.mediaProtocol + `:///${dirPath}/${originalURL}`
                );
              },
            },
          },
        });
        crepe.editor.config((ctx: Ctx) => {
          ctx.update(editorViewOptionsCtx, (prev) => ({
            ...prev,
            handleClickOn: (view: EditorView, pos: number) => {
              if (!isEditMode) {
                const href = getHref(ctx, view, pos);
                if (href) {
                  openLink(href, { fullWidth: false });
                }
              }
            },
          }));
        });

        crepe
          .on((listener) => {
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
          })
          .setReadonly(!isEditMode);

        crepe.editor.onStatusChange((status: EditorStatus) => {
          if (status === EditorStatus.Created) {
            console.log(status);
            if (instance) {
              instance(crepe);
            }
          }
        });

        return crepe;
      },
      [isEditMode, content],
    );

    React.useImperativeHandle(ref, () => ({
      update: (markdown: string) => {
        const editor = get();
        if (loading || !editor || editor.status !== EditorStatus.Created)
          return;
        editor.action(replaceAll(markdown));
      },
      setDarkMode: (isDarkMode: boolean) => {
        // setDarkMode(isDarkMode);
      },
      openSearchDialog: () => {
        // openSearchDialog();
      },
      getMarkdown: () => {
        const editor = get();
        if (loading || !editor || editor.status !== EditorStatus.Created)
          return;
        return editor.action(getMarkdown());
      },
    }));

    return <Milkdown />;
  },
);

export default CrepeMdEditor;

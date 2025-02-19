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
import React, { useReducer, useRef } from 'react';
import AppConfig from '-/AppConfig';
import { Milkdown, useEditor } from '@milkdown/react';
import { replaceAll } from '@milkdown/utils';
import { EditorStatus, editorViewOptionsCtx } from '@milkdown/kit/core';
import { getMarkdown, insert } from '@milkdown/kit/utils';
import { Crepe } from '@milkdown/crepe';
import { useOpenedEntryContext } from '-/hooks/useOpenedEntryContext';
import { EditorView } from 'prosemirror-view';
import { Ctx } from '@milkdown/ctx';
import { getHref } from '-/components/md/utils';

interface CrepeMdEditorProps {
  defaultEditMode: boolean;
  defaultContent: string;
  currentFolder?: string;
  placeholder?: string;
  onChange?: (markdown: string, prevMarkdown: string) => void;
  onFocus?: () => void;
  //instance?: (crepe: Crepe) => void;
}

export interface CrepeRef {
  update: (markdown: string) => void;
  insert: (markdown: string) => void;
  setDarkMode: (isDark: boolean) => void;
  setEditMode: (isEditMode: boolean) => void;
  openSearchDialog: () => void;
  getMarkdown: () => string;
}

const CrepeMdEditor = React.forwardRef<CrepeRef, CrepeMdEditorProps>(
  (props, ref) => {
    const {
      defaultEditMode,
      defaultContent,
      currentFolder,
      onChange,
      onFocus,
      placeholder,
    } = props;
    const { openLink } = useOpenedEntryContext();
    const focus = useRef<boolean>(false);
    const instance = useRef<Crepe>(undefined);
    const isEditMode = useRef<boolean>(defaultEditMode);

    const [ignored, forceUpdate] = useReducer((x) => x + 1, 0, undefined);

    const { get, loading } = useEditor(
      (root) => {
        const crepe = new Crepe({
          root,
          defaultValue: defaultContent || '',
          /* features: {
        [Crepe.Feature.CodeMirror]: false,
      },*/
          featureConfigs: {
            [Crepe.Feature.Placeholder]: {
              text: placeholder || 'Type / to use slash command',
            },
            [Crepe.Feature.ImageBlock]: {
              proxyDomURL: (originalURL: string) => {
                if (currentFolder) {
                  return (
                    AppConfig.mediaProtocol +
                    `:///${currentFolder}/${originalURL}`
                  );
                }
                return originalURL;
              },
            },
          },
        });
        crepe.editor.config((ctx: Ctx) => {
          ctx.update(editorViewOptionsCtx, (prev) => ({
            ...prev,
            attributes: {
              class: 'mx-auto full-height',
            },
            handleClickOn: (view: EditorView, pos: number) => {
              if (!isEditMode.current) {
                const href = getHref(ctx, view, pos);
                if (href) {
                  openLink(href, { fullWidth: false });
                  return true;
                }
              }
              return false;
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
          .setReadonly(!defaultEditMode);

        crepe.editor.onStatusChange((status: EditorStatus) => {
          if (status === EditorStatus.Created) {
            console.log(status);
            instance.current = crepe;
          }
        });

        return crepe;
      },
      [isEditMode.current],
    );

    React.useImperativeHandle(ref, () => ({
      update: (markdown: string) => {
        const editor = get();
        if (loading || !editor || editor.status !== EditorStatus.Created)
          return;
        editor.action(replaceAll(markdown));
      },
      insert: (markdown: string) => {
        const editor = get();
        if (loading || !editor || editor.status !== EditorStatus.Created)
          return;
        editor.action(insert(markdown));
      },
      setDarkMode: (isDarkMode: boolean) => {
        // setDarkMode(isDarkMode);
      },
      setEditMode: (isEditable: boolean) => {
        if (instance.current) {
          if (isEditable !== isEditMode.current) {
            instance.current.setReadonly(!isEditable);
            isEditMode.current = isEditable;
            forceUpdate();
          }
        }
        /* const editor = get();
        if (loading || !editor || editor.status !== EditorStatus.Created)
          return;
        editor.config((ctx: Ctx) => {
            ctx.update(editorViewOptionsCtx, (prev) => ({
              ...prev,
              editable: () => isEditable,
            }));
        })*/
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

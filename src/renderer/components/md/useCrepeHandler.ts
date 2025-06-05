import React, { useImperativeHandle } from 'react';
import { replaceAll, insert, getMarkdown } from '@milkdown/kit/utils';
import { EditorStatus } from '@milkdown/kit/core';
import type { Editor } from '@milkdown/kit/core';
import { Crepe } from '@milkdown/crepe';

export interface CrepeRef {
  update: (markdown: string) => void;
  insert: (markdown: string) => void;
  setEditMode: (isEditMode: boolean) => void;
  getMarkdown: () => string | undefined;
  destroy: () => void;
}

export function useCrepeHandler(
  ref: React.Ref<CrepeRef>,
  getCrepe: () => Crepe | undefined,
  get: () => Editor | undefined,
  loading: boolean,
) {
  useImperativeHandle(ref, () => ({
    update: (markdown: string) => {
      const editor = get();
      if (loading || !editor || editor.status !== EditorStatus.Created) return;
      editor.action(replaceAll(markdown)); //, true));
    },
    insert: (markdown: string) => {
      const editor = get();
      if (loading || !editor || editor.status !== EditorStatus.Created) return;
      editor.action(insert(markdown));
    },
    setEditMode: (isEditable: boolean) => {
      const crepe = getCrepe();
      const editor = get();

      if (!crepe || !editor) return;

      // If we haven’t reached “Ready” yet, stash the flag and/or delay:
      /*if (editor.status !== EditorStatus.Ready) {
        pendingEditableRef.current = isEditable;
        return;
      }*/

      // At this point, status === Ready, you can safely flip readOnly:
      crepe.setReadonly(!isEditable);

      // If you want to be extra sure, also update the editorViewOptionsCtx:
      /*editor.config((ctx) => {
        ctx.update(editorViewOptionsCtx, (prev) => ({
          ...prev,
          editable: () => isEditable,
        }));
      });*/
    },
    getMarkdown: () => {
      const editor = get();
      if (loading || !editor || editor.status !== EditorStatus.Created) return;
      return editor.action(getMarkdown());
    },
    destroy: () => {
      const crepe = getCrepe();
      if (crepe) {
        crepe.destroy();
      }
      /* const editor = get();
      if (loading || !editor || editor.status !== EditorStatus.Created) return;
      editor?.destroy();*/
    },
  }));
}

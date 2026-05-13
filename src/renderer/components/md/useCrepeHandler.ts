import React, { useImperativeHandle } from 'react';
import { replaceAll, insert, getMarkdown } from '@milkdown/kit/utils';
import { editorViewCtx, EditorStatus } from '@milkdown/kit/core';
import type { Editor } from '@milkdown/kit/core';
import { Crepe } from '@milkdown/crepe';

export interface CrepeRef {
  update: (markdown: string) => void;
  insert: (markdown: string) => void;
  setEditMode: (isEditMode: boolean) => void;
  getMarkdown: () => string | undefined;
  getSelectedText: () => string;
  destroy: () => void;
  focus: () => void;
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
      // `inline: true` serializes the parsed doc to DOM and re-parses as an
      // inline slice, so the inserted content (e.g. a markdown link) lands
      // inside the current paragraph instead of splitting it into a new block.
      editor.action(insert(markdown, true));
    },
    focus: () => {
      const editor = get();
      if (loading || !editor || editor.status !== EditorStatus.Created) return;
      editor.action((ctx) => {
        const view = ctx.get(editorViewCtx);
        view?.focus();
      });
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
    getSelectedText: () => {
      const editor = get();
      if (loading || !editor || editor.status !== EditorStatus.Created) {
        return '';
      }
      return editor.action((ctx) => {
        const view = ctx.get(editorViewCtx);
        if (!view) return '';
        const { from, to, empty } = view.state.selection;
        if (empty) return '';
        return view.state.doc.textBetween(from, to, ' ').trim();
      });
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

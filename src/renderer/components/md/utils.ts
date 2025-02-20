import { EditorView } from 'prosemirror-view';
import { linkSchema } from '@milkdown/preset-commonmark';
import { Crepe } from '@milkdown/crepe';
import { editorViewCtx } from '@milkdown/core';
import AppConfig from '-/AppConfig';
import { Ctx } from '@milkdown/ctx';
import { editorViewOptionsCtx } from '@milkdown/kit/core';

export function createCrepeEditor(
  root: HTMLElement,
  defaultContent: string,
  defaultEditMode: boolean,
  placeholder?: string,
  currentFolder?: string,
  openLink?: (url: string, options?) => void,
  onChange?: (markdown: string, prevMarkdown: string) => void,
  onFocus?: () => void,
): Crepe {
  const crepe = new Crepe({
    root,
    defaultValue: defaultContent || '',
    /* features: {
  [Crepe.Feature.CodeMirror]: false,
},*/
    featureConfigs: {
      [Crepe.Feature.Placeholder]: {
        text:
          placeholder === undefined
            ? 'Type / to use slash command'
            : placeholder,
      },
      [Crepe.Feature.ImageBlock]: {
        proxyDomURL: (originalURL: string) => {
          if (currentFolder) {
            return (
              AppConfig.mediaProtocol + `:///${currentFolder}/${originalURL}`
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
        if (!view.editable) {
          const href = getHref(ctx, view, pos);
          if (href && openLink) {
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
      listener.markdownUpdated((_, markdown: string, prevMarkdown: string) => {
        const view = crepe.editor.ctx.get(editorViewCtx);
        if (view && view.hasFocus()) {
          console.log('Change listener:' + markdown);
          if (onChange) {
            onChange(markdown, prevMarkdown);
          }
        }
      });
      listener.focus(() => {
        if (onFocus) {
          onFocus();
        }
      });
    })
    .setReadonly(!defaultEditMode);

  return crepe;
}

function getHref(ctx, view: EditorView, pos: number): string {
  const found = view.state.tr.doc.nodeAt(pos);
  if (found && found.marks.length > 0) {
    const mark = found.marks.find(({ type }) => type === linkSchema.type(ctx));
    return mark?.attrs.href;
  }
  return undefined;
}

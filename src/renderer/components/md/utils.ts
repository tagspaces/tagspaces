import AppConfig from '-/AppConfig';
import { Crepe } from '@milkdown/crepe';
import { Ctx } from '@milkdown/ctx';
import { editorViewOptionsCtx, editorViewCtx } from '@milkdown/kit/core';
import { remarkPreserveEmptyLinePlugin } from '@milkdown/preset-commonmark';
import { trailing } from '@milkdown/kit/plugin/trailing';

export function createCrepeEditor(
  root: HTMLElement,
  defaultContent: string,
  defaultEditMode: boolean,
  features?: {}, //[Crepe.Feature.CodeMirror]: false,
  placeholder?: string,
  currentFolder?: string,
  openLink?: (url: string, options?) => void,
  onChange?: (markdown: string, prevMarkdown: string) => void,
  onFocus?: () => void,
): Crepe {
  const crepe = new Crepe({
    root,
    defaultValue: defaultContent || '',
    features: features,
    featureConfigs: {
      [Crepe.Feature.Placeholder]: {
        text:
          placeholder === undefined
            ? 'Type / to use slash command'
            : placeholder,
      },
      [Crepe.Feature.ImageBlock]: {
        proxyDomURL: (originalURL: string) => {
          if (originalURL.length === 0) {
            return '';
          }
          if (
            currentFolder &&
            !originalURL.startsWith('data:') &&
            !originalURL.startsWith('blob') &&
            !originalURL.startsWith('http')
          ) {
            return (
              AppConfig.mediaProtocol + `:///${currentFolder}/${originalURL}`
            );
          }
          return originalURL;
        },
        onUpload: async (file: File) => {
          const base64String = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => resolve(event.target?.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
          return base64String;
        },
      },
    },
  });
  crepe.editor.remove(remarkPreserveEmptyLinePlugin);
  crepe.editor.remove(trailing);
  crepe.editor.config((ctx: Ctx) => {
    ctx.update(editorViewOptionsCtx, (prev) => ({
      ...prev,
      attributes: {
        class: 'mx-auto full-height',
      },
      handleDOMEvents: {
        click: (view, event) => {
          if (!view.editable) {
            const target = event.target as HTMLElement;
            if (target.tagName === 'A') {
              const href = (target as HTMLAnchorElement).getAttribute('href');
              if (href) {
                event.preventDefault();
                openLink(href, { fullWidth: false });
                return true;
              }
            }
          }
          return false;
        },
      },
    }));
  });

  if (onChange || onFocus) {
    crepe.on((listener) => {
      listener.markdownUpdated((_, markdown: string, prevMarkdown: string) => {
        const view = crepe.editor.ctx.get(editorViewCtx);
        if (view && view.hasFocus()) {
          // console.log('Change listener:' + markdown);
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
    });
  }
  crepe.setReadonly(!defaultEditMode);

  return crepe;
}

/*function getHref(ctx, view: EditorView, pos: number): string {
  const found = view.state.tr.doc.nodeAt(pos);
  if (found && found.marks.length > 0) {
    const mark = found.marks.find(({ type }) => type === linkSchema.type(ctx));
    return mark?.attrs.href;
  }
  return undefined;
}*/

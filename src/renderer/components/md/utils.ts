import { EditorView } from 'prosemirror-view';
import { linkSchema } from '@milkdown/preset-commonmark';

export function getHref(ctx, view: EditorView, pos: number): string {
  const found = view.state.tr.doc.nodeAt(pos);
  if (found && found.marks.length > 0) {
    const mark = found.marks.find(({ type }) => type === linkSchema.type(ctx));
    return mark?.attrs.href;
  }
  return undefined;
}

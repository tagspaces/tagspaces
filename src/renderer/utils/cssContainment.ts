/**
 * TagSpaces - universal file and folder organizer
 * Copyright (C) 2017-present TagSpaces GmbH
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

/**
 * `position: fixed` is contained — not viewport-relative — by any ancestor
 * with `contain`/`transform`/`filter`/`perspective`/`will-change` (the
 * Splitter panes set `contain: layout paint`). That traps CSS-fullscreen
 * overlays (FileView on iOS, the Gallery perspective's modal fullscreen)
 * inside their pane. This walks up from `start`, neutralizes those properties
 * on every ancestor that has them, and returns a restore function that puts
 * the original inline values back. (Portaling to <body> would escape the trap
 * too, but moving an iframe in the DOM reloads it and loses viewer state.)
 */
export function suspendContainingBlocks(
  start: HTMLElement | null | undefined,
): () => void {
  const saved: Array<{ node: HTMLElement; props: Record<string, string> }> = [];
  const RESET: Record<string, string> = {
    contain: 'none',
    transform: 'none',
    filter: 'none',
    perspective: 'none',
    willChange: 'auto',
  };
  let node: HTMLElement | null = start || null;
  while (node && node !== document.body) {
    const cs = getComputedStyle(node);
    const traps =
      (cs.contain && cs.contain !== 'none') ||
      (cs.transform && cs.transform !== 'none') ||
      (cs.filter && cs.filter !== 'none') ||
      (cs.perspective && cs.perspective !== 'none') ||
      (cs.willChange && cs.willChange !== 'auto');
    if (traps) {
      const props: Record<string, string> = {};
      Object.keys(RESET).forEach((k) => {
        props[k] = node!.style[k as any];
        node!.style[k as any] = RESET[k];
      });
      saved.push({ node, props });
    }
    node = node.parentElement;
  }
  return () => {
    saved.forEach(({ node: n, props }) => {
      Object.keys(props).forEach((k) => {
        n.style[k as any] = props[k];
      });
    });
  };
}

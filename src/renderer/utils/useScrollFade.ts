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

import { RefObject, useEffect, useRef } from 'react';

/** Maximum height of the fade at each edge, in px. */
const FADE_SIZE = 20;

/**
 * Opaque down to --fade-inset (a sticky header stays crisp), then the top fade
 * starts below it; the bottom fade sits at the very end. With the inset at 0
 * this is a plain top/bottom fade.
 */
const MASK =
  'linear-gradient(to bottom, #000 0, #000 var(--fade-inset), transparent var(--fade-inset), #000 calc(var(--fade-inset) + var(--fade-top)), #000 calc(100% - var(--fade-bottom)), transparent 100%)';

interface ScrollFadeOptions<T extends HTMLElement> {
  /** Pause the fade, e.g. while a fixed-position descendant is showing. */
  active?: boolean;
  /** Use an existing ref object for the container instead of the returned one. */
  ref?: RefObject<T | null>;
  /**
   * Find the element that actually scrolls inside the container — for
   * components that scroll internally (e.g. MUI DataGrid). Waits for it to
   * appear if it isn't rendered yet.
   */
  target?: (container: T) => HTMLElement | null;
  /** Height in px at the top of the scroller to keep unfaded (sticky header). */
  insetTop?: (scroller: HTMLElement) => number;
}

function attachFade(
  el: HTMLElement,
  insetTop?: (scroller: HTMLElement) => number,
): () => void {
  let frame = 0;
  let masked = false;
  const update = () => {
    frame = 0;
    const remaining = el.scrollHeight - el.clientHeight - el.scrollTop;
    const top = Math.min(Math.max(el.scrollTop, 0), FADE_SIZE);
    const bottom = Math.min(Math.max(remaining, 0), FADE_SIZE);
    const needsMask = top > 0 || bottom > 0;
    if (needsMask !== masked) {
      masked = needsMask;
      el.style.maskImage = needsMask ? MASK : '';
      el.style.webkitMaskImage = needsMask ? MASK : ''; // older iOS WebViews
    }
    el.style.setProperty('--fade-inset', `${insetTop ? insetTop(el) : 0}px`);
    el.style.setProperty('--fade-top', `${top}px`);
    el.style.setProperty('--fade-bottom', `${bottom}px`);
  };
  const schedule = () => {
    if (!frame) frame = requestAnimationFrame(update);
  };

  el.addEventListener('scroll', schedule, { passive: true });
  // Content height changes (lazy loads, expanding groups, images) and
  // container resizes change how much is left to scroll. Children are
  // observed directly, not through a wrapper, because some content sizes
  // itself with height: 100%.
  const resizeObserver = new ResizeObserver(schedule);
  const observeChildren = () => {
    resizeObserver.disconnect();
    resizeObserver.observe(el);
    Array.from(el.children).forEach((child) => resizeObserver.observe(child));
    schedule();
  };
  observeChildren();
  const mutationObserver = new MutationObserver(observeChildren);
  mutationObserver.observe(el, { childList: true });

  return () => {
    el.removeEventListener('scroll', schedule);
    resizeObserver.disconnect();
    mutationObserver.disconnect();
    if (frame) cancelAnimationFrame(frame);
    el.style.maskImage = '';
    el.style.webkitMaskImage = '';
    el.style.removeProperty('--fade-inset');
    el.style.removeProperty('--fade-top');
    el.style.removeProperty('--fade-bottom');
  };
}

/**
 * Fades the top/bottom edge of a scroll container when content continues
 * beyond it. The fade grows with the scrolled distance, so it eases in instead
 * of popping. Updates go straight to inline styles, so scrolling never
 * re-renders React.
 *
 * The mask is only applied while there is something to scroll. A CSS mask
 * clips everything painted inside the element — including `position: fixed`
 * descendants such as a card being dragged or a modal overlay — so pass
 * `active: false` while such a descendant is showing.
 *
 * Usage: `const ref = useScrollFade();` then
 * `<Box ref={ref} sx={{ overflowY: 'auto' }}>`.
 */
export default function useScrollFade<T extends HTMLElement = HTMLDivElement>({
  active = true,
  ref,
  target,
  insetTop,
}: ScrollFadeOptions<T> = {}) {
  const ownRef = useRef<T>(null);
  const scrollRef = ref ?? ownRef;
  // Read through refs so inline callbacks don't re-attach on every render.
  const targetRef = useRef(target);
  targetRef.current = target;
  const insetTopRef = useRef(insetTop);
  insetTopRef.current = insetTop;

  useEffect(() => {
    const container = scrollRef.current;
    if (!active || !container) return undefined;
    const getInset = (el: HTMLElement) => insetTopRef.current?.(el) ?? 0;

    const resolve = targetRef.current;
    if (!resolve) return attachFade(container, getInset);

    let detach: (() => void) | undefined;
    const tryAttach = () => {
      const el = resolve(container);
      if (!el) return false;
      detach = attachFade(el, getInset);
      return true;
    };
    if (tryAttach()) return () => detach?.();

    // Not rendered yet — wait for it to show up in the container.
    const waiter = new MutationObserver(() => {
      if (tryAttach()) waiter.disconnect();
    });
    waiter.observe(container, { childList: true, subtree: true });
    return () => {
      waiter.disconnect();
      detach?.();
    };
    // scrollRef is a stable ref object; callbacks are read through refs
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  return scrollRef;
}

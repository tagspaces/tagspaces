/**
 * TagSpaces - universal file and folder organizer
 * Copyright (C) 2026-present TagSpaces GmbH
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

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from 'react';

type Visibility = boolean;
type VisibilityCallback = (visible: Visibility) => void;

type CellVisibilityContextData = {
  // Subscribe an element to visibility updates. Returns the current visibility
  // value so callers can short-circuit before the first observer entry fires.
  // Pass `undefined` for the element to unsubscribe — use the same callback
  // identity for both calls. Cells should call this from a useEffect that
  // depends on the cell root ref.
  observe: (el: Element | null, cb: VisibilityCallback) => Visibility;
  unobserve: (el: Element | null, cb: VisibilityCallback) => void;
};

const noopCtx: CellVisibilityContextData = {
  observe: () => true,
  unobserve: () => {},
};

const CellVisibilityContext = createContext<CellVisibilityContextData>(noopCtx);

type ProviderProps = {
  scrollRoot: React.RefObject<HTMLElement>;
  children: React.ReactNode;
};

// Single shared IntersectionObserver for all cells in a perspective. Cheaper
// than one observer per cell when the page has 100+ entries. Uses a generous
// rootMargin so thumbnails start resolving slightly before they scroll into
// view, which masks the latency of disk / decrypt / data URL conversion.
export function CellVisibilityProvider({
  scrollRoot,
  children,
}: ProviderProps) {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const callbacksRef = useRef<Map<Element, Set<VisibilityCallback>>>(new Map());
  const visibleRef = useRef<WeakSet<Element>>(new WeakSet());

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') {
      // Fallback for environments without IntersectionObserver: pretend every
      // cell is visible so the eager thumbnail path still works.
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const visible = entry.isIntersecting;
          if (visible) visibleRef.current.add(entry.target);
          else visibleRef.current.delete(entry.target);
          const set = callbacksRef.current.get(entry.target);
          if (set) {
            for (const cb of set) cb(visible);
          }
        }
      },
      {
        root: scrollRoot.current ?? null,
        rootMargin: '200px',
        threshold: 0,
      },
    );
    observerRef.current = observer;
    // Re-observe any elements that registered before the observer was ready.
    for (const el of callbacksRef.current.keys()) observer.observe(el);
    return () => {
      observer.disconnect();
      observerRef.current = null;
    };
  }, [scrollRoot]);

  const observe = useCallback(
    (el: Element | null, cb: VisibilityCallback): Visibility => {
      if (!el) return true;
      let set = callbacksRef.current.get(el);
      if (!set) {
        set = new Set();
        callbacksRef.current.set(el, set);
        observerRef.current?.observe(el);
      }
      set.add(cb);
      return visibleRef.current.has(el);
    },
    [],
  );

  const unobserve = useCallback(
    (el: Element | null, cb: VisibilityCallback) => {
      if (!el) return;
      const set = callbacksRef.current.get(el);
      if (!set) return;
      set.delete(cb);
      if (set.size === 0) {
        callbacksRef.current.delete(el);
        observerRef.current?.unobserve(el);
      }
    },
    [],
  );

  const value = useMemo(() => ({ observe, unobserve }), [observe, unobserve]);

  return (
    <CellVisibilityContext.Provider value={value}>
      {children}
    </CellVisibilityContext.Provider>
  );
}

export function useCellVisibility() {
  return useContext(CellVisibilityContext);
}

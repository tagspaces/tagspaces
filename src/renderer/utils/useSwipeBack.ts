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

import React, { useEffect, useRef } from 'react';

const HORIZONTAL_INTENT_SLOP = 10;
const SPRING_BACK_MS = 150;
const DEFAULT_EDGE_WIDTH = 24;
// Strip starts below the entry title bar so it does not cover the
// back-arrow button in EntryContainerTitle.
const STRIP_TOP_OFFSET = 48;

export interface SwipeEvaluation {
  dx: number;
  dy?: number;
  elapsedMs: number;
  width: number;
  commitRatio?: number;
  velocityThreshold?: number; // px/ms
  flickMinDx?: number;
}

/**
 * Decides whether a finished drag closes the view ('commit') or springs
 * back ('cancel'): commit when the drag crossed commitRatio of the width,
 * or on a fast flick that moved at least flickMinDx.
 */
export function evaluateSwipe({
  dx,
  elapsedMs,
  width,
  commitRatio = 0.4,
  velocityThreshold = 0.3,
  flickMinDx = 32,
}: SwipeEvaluation): 'commit' | 'cancel' {
  if (dx <= 0 || width <= 0) {
    return 'cancel';
  }
  if (dx >= width * commitRatio) {
    return 'commit';
  }
  const velocity = elapsedMs > 0 ? dx / elapsedMs : 0;
  if (dx >= flickMinDx && velocity >= velocityThreshold) {
    return 'commit';
  }
  return 'cancel';
}

/**
 * A drag reads as horizontal once it moved right past the slop and clearly
 * dominates the vertical component. Callers must treat a vertical-first
 * drag as dead for the rest of the touch.
 */
export function isHorizontalIntent(
  dx: number,
  dy: number,
  slop: number = HORIZONTAL_INTENT_SLOP,
): boolean {
  return dx > slop && dx > Math.abs(dy) * 1.5;
}

interface SwipeBackOptions {
  enabled: boolean;
  /** Element translated while dragging (the full-screen entry overlay). */
  targetRef: React.RefObject<HTMLElement>;
  /**
   * Called when the slide-out animation finished. Return true when the view
   * actually closes; false (e.g. an unsaved-changes confirm dialog appeared
   * instead) springs the target back into place.
   */
  onCommitRequest: () => boolean;
  /** Signals drag start/end, e.g. to un-hide the content behind the target. */
  onDragActiveChange?: (active: boolean) => void;
  edgeWidth?: number;
}

type GesturePhase = 'idle' | 'pending' | 'horizontal' | 'dead';

/**
 * iOS-style edge-swipe-back: a transparent strip on the left edge captures
 * the gesture (file previews render in iframes, which swallow touches — but
 * all events of a touch stay with the element that received touchstart, so
 * the strip alone is sufficient). Native listeners are attached with
 * passive: false because React 17+ delegates touchmove as passive, which
 * would forbid preventDefault().
 */
export function useSwipeBack({
  enabled,
  targetRef,
  onCommitRequest,
  onDragActiveChange,
  edgeWidth = DEFAULT_EDGE_WIDTH,
}: SwipeBackOptions): {
  edgeStripRef: React.RefObject<HTMLDivElement>;
  edgeStripStyle: React.CSSProperties;
} {
  const edgeStripRef = useRef<HTMLDivElement>(null);
  const onCommitRequestRef = useRef(onCommitRequest);
  const onDragActiveChangeRef = useRef(onDragActiveChange);
  onCommitRequestRef.current = onCommitRequest;
  onDragActiveChangeRef.current = onDragActiveChange;

  useEffect(() => {
    const strip = edgeStripRef.current;
    if (!enabled || !strip) {
      return undefined;
    }
    let phase: GesturePhase = 'idle';
    let startX = 0;
    let startY = 0;
    let startTime = 0;
    let lastDx = 0;
    let lastDy = 0;
    let rafId = 0;
    let settleTimer: ReturnType<typeof setTimeout>;

    const setDragActive = (active: boolean) =>
      onDragActiveChangeRef.current?.(active);

    const resetTargetStyle = () => {
      const target = targetRef.current;
      if (target) {
        target.style.transition = '';
        target.style.transform = '';
      }
    };

    const springBack = () => {
      const target = targetRef.current;
      if (target) {
        target.style.transition = `transform ${SPRING_BACK_MS}ms ease-out`;
        target.style.transform = 'translateX(0)';
      }
      settleTimer = setTimeout(() => {
        resetTargetStyle();
        setDragActive(false);
      }, SPRING_BACK_MS + 20);
    };

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1 || phase !== 'idle') {
        phase = 'dead';
        return;
      }
      clearTimeout(settleTimer);
      const touch = e.touches[0];
      startX = touch.clientX;
      startY = touch.clientY;
      startTime = performance.now();
      lastDx = 0;
      lastDy = 0;
      phase = 'pending';
      const target = targetRef.current;
      if (target) {
        target.style.transition = 'none';
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (phase === 'dead' || phase === 'idle') {
        return;
      }
      const touch = e.touches[0];
      lastDx = touch.clientX - startX;
      lastDy = touch.clientY - startY;
      if (phase === 'pending') {
        if (isHorizontalIntent(lastDx, lastDy)) {
          phase = 'horizontal';
          setDragActive(true);
        } else if (
          Math.abs(lastDy) > HORIZONTAL_INTENT_SLOP ||
          lastDx < -HORIZONTAL_INTENT_SLOP
        ) {
          // Vertical or leftward drag won first — dead for this touch.
          phase = 'dead';
          resetTargetStyle();
          return;
        }
      }
      if (phase === 'horizontal') {
        e.preventDefault();
        cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => {
          const target = targetRef.current;
          if (target) {
            target.style.transform = `translateX(${Math.max(0, lastDx)}px)`;
          }
        });
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      cancelAnimationFrame(rafId);
      const finishedPhase = phase;
      phase = 'idle';
      if (finishedPhase !== 'horizontal') {
        resetTargetStyle();
        return;
      }
      const target = targetRef.current;
      const decision =
        e.type === 'touchcancel'
          ? 'cancel'
          : evaluateSwipe({
              dx: lastDx,
              dy: lastDy,
              elapsedMs: performance.now() - startTime,
              width: target ? target.offsetWidth : window.innerWidth,
            });
      if (decision === 'cancel' || !target) {
        springBack();
        return;
      }
      target.style.transition = `transform ${SPRING_BACK_MS}ms ease-out`;
      target.style.transform = 'translateX(100%)';
      // setTimeout instead of transitionend: the element can unmount when
      // the close goes through, swallowing the transition event.
      settleTimer = setTimeout(() => {
        const closing = onCommitRequestRef.current();
        if (closing) {
          // Entry closes and the overlay unmounts; clear the inline styles
          // in case the same node is reused for the next opened entry.
          resetTargetStyle();
          setDragActive(false);
        } else {
          springBack();
        }
      }, SPRING_BACK_MS + 20);
    };

    strip.addEventListener('touchstart', onTouchStart, { passive: true });
    strip.addEventListener('touchmove', onTouchMove, { passive: false });
    strip.addEventListener('touchend', onTouchEnd, { passive: true });
    strip.addEventListener('touchcancel', onTouchEnd, { passive: true });
    return () => {
      clearTimeout(settleTimer);
      cancelAnimationFrame(rafId);
      strip.removeEventListener('touchstart', onTouchStart);
      strip.removeEventListener('touchmove', onTouchMove);
      strip.removeEventListener('touchend', onTouchEnd);
      strip.removeEventListener('touchcancel', onTouchEnd);
    };
  }, [enabled, targetRef]);

  return {
    edgeStripRef,
    edgeStripStyle: {
      position: 'absolute',
      top: STRIP_TOP_OFFSET,
      bottom: 0,
      left: 0,
      width: edgeWidth,
      zIndex: 10,
      touchAction: 'none',
    },
  };
}

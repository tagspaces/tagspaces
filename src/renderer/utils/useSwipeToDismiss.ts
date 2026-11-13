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

import React, { useRef } from 'react';
import { evaluateSwipe, isHorizontalIntent } from '-/utils/useSwipeBack';

const SPRING_BACK_MS = 180;
const FLY_OUT_MS = 160;

type GesturePhase = 'idle' | 'pending' | 'horizontal' | 'dead';

/**
 * Decides whether a horizontal drag in either direction dismisses the
 * element. Same thresholds as the swipe-back gesture, applied to |dx|, with
 * a lower commit ratio since a toast is narrow and dismissing it is cheap
 * to undo for the user (the message is informational).
 */
export function evaluateDismissSwipe(
  dx: number,
  elapsedMs: number,
  width: number,
): 'commit' | 'cancel' {
  return evaluateSwipe({
    dx: Math.abs(dx),
    elapsedMs,
    width,
    commitRatio: 0.35,
  });
}

/** Horizontal intent in either direction (swipe-back only accepts right). */
export function isDismissIntent(dx: number, dy: number): boolean {
  return isHorizontalIntent(Math.abs(dx), dy);
}

/**
 * Swipe-left-or-right to dismiss, for touch and pen only — a mouse drag
 * keeps selecting text. Uses pointer events plus `touch-action: pan-y`, so
 * vertical scrolling is left to the browser and no non-passive listener is
 * needed. The pointer is captured only once the drag is clearly horizontal,
 * so taps on buttons inside the element still click.
 */
export function useSwipeToDismiss(onDismiss: (() => void) | undefined): {
  ref: React.RefObject<HTMLDivElement>;
  handlers: Pick<
    React.DOMAttributes<HTMLDivElement>,
    | 'onPointerDown'
    | 'onPointerMove'
    | 'onPointerUp'
    | 'onPointerCancel'
    | 'onClickCapture'
  >;
  style: React.CSSProperties;
} {
  const ref = useRef<HTMLDivElement>(null);
  const gesture = useRef({
    phase: 'idle' as GesturePhase,
    pointerId: -1,
    startX: 0,
    startY: 0,
    startTime: 0,
    dx: 0,
    /** Swallows the click that follows a completed drag */
    suppressClick: false,
  });
  const onDismissRef = useRef(onDismiss);
  onDismissRef.current = onDismiss;

  const setVisual = (dx: number, transition: string) => {
    const el = ref.current;
    if (!el) return;
    const width = el.offsetWidth || 1;
    el.style.transition = transition;
    el.style.transform = dx ? `translateX(${dx}px)` : '';
    el.style.opacity = dx ? String(Math.max(0, 1 - Math.abs(dx) / width)) : '';
  };

  const end = (e: React.PointerEvent<HTMLDivElement>, cancelled: boolean) => {
    const g = gesture.current;
    if (e.pointerId !== g.pointerId) return;
    const wasHorizontal = g.phase === 'horizontal';
    g.phase = 'idle';
    g.pointerId = -1;
    if (!wasHorizontal) return;
    g.suppressClick = true;
    const el = ref.current;
    const width = el?.offsetWidth || 1;
    const verdict = cancelled
      ? 'cancel'
      : evaluateDismissSwipe(g.dx, performance.now() - g.startTime, width);
    if (verdict === 'commit') {
      const target = Math.sign(g.dx || 1) * width * 1.1;
      setVisual(
        target,
        `transform ${FLY_OUT_MS}ms ease-out, opacity ${FLY_OUT_MS}ms ease-out`,
      );
      setTimeout(() => onDismissRef.current?.(), FLY_OUT_MS);
    } else {
      setVisual(
        0,
        `transform ${SPRING_BACK_MS}ms ease-out, opacity ${SPRING_BACK_MS}ms ease-out`,
      );
    }
  };

  const enabled = !!onDismiss;

  return {
    ref,
    style: enabled ? { touchAction: 'pan-y' } : {},
    handlers: enabled
      ? {
          onPointerDown: (e) => {
            if (e.pointerType === 'mouse' || !e.isPrimary) return;
            const g = gesture.current;
            g.phase = 'pending';
            g.pointerId = e.pointerId;
            g.startX = e.clientX;
            g.startY = e.clientY;
            g.startTime = performance.now();
            g.dx = 0;
            g.suppressClick = false;
          },
          onPointerMove: (e) => {
            const g = gesture.current;
            if (e.pointerId !== g.pointerId) return;
            const dx = e.clientX - g.startX;
            const dy = e.clientY - g.startY;
            if (g.phase === 'pending') {
              if (isDismissIntent(dx, dy)) {
                g.phase = 'horizontal';
                ref.current?.setPointerCapture(e.pointerId);
              } else if (Math.abs(dy) > 10) {
                g.phase = 'dead';
              }
            }
            if (g.phase === 'horizontal') {
              g.dx = dx;
              setVisual(dx, 'none');
            }
          },
          onPointerUp: (e) => end(e, false),
          onPointerCancel: (e) => end(e, true),
          onClickCapture: (e) => {
            if (gesture.current.suppressClick) {
              gesture.current.suppressClick = false;
              e.stopPropagation();
              e.preventDefault();
            }
          },
        }
      : {},
  };
}

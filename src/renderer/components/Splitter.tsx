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

import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import React, { useEffect, useRef } from 'react';

/** Shared visual constants for every gutter in the app. */
export const GUTTER_VISIBLE_SIZE = 1;
export const GUTTER_HIT_SIZE = 14;
export const GUTTER_HOVER_SIZE = 4;

export interface SplitterGutterProps {
  direction: 'vertical' | 'horizontal';
  disabled?: boolean;
  ariaLabel?: string;
  ariaValueNow?: number;
  ariaValueMin?: number;
  ariaValueMax?: number;
  onPointerDown: (e: React.PointerEvent) => void;
  onPointerMove: (e: React.PointerEvent) => void;
  onPointerUp: (e: React.PointerEvent) => void;
  onDoubleClick?: () => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  /** Extra positioning (absolute for overlay cases, e.g. Drawer). */
  style?: React.CSSProperties;
}

/**
 * The single visual/ARIA primitive every splitter in the app uses.
 * One look, one feel: a 1 px divider that thickens to 4 px with accent
 * colour on hover/focus, with a 14 px invisible hit area around it.
 */
export function SplitterGutter(props: SplitterGutterProps) {
  const {
    direction,
    disabled,
    ariaLabel,
    ariaValueNow,
    ariaValueMin,
    ariaValueMax,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onDoubleClick,
    onKeyDown,
    style,
  } = props;
  const theme = useTheme();
  const isVert = direction === 'vertical';

  const dividerColor = theme.palette.divider;
  const hoverColor = theme.palette.primary.main;

  const hitOverflow = (GUTTER_HIT_SIZE - GUTTER_VISIBLE_SIZE) / 2;

  return (
    <Box
      role="separator"
      aria-orientation={isVert ? 'vertical' : 'horizontal'}
      aria-valuenow={ariaValueNow}
      aria-valuemin={ariaValueMin}
      aria-valuemax={ariaValueMax}
      aria-label={ariaLabel}
      aria-disabled={disabled || undefined}
      tabIndex={disabled ? -1 : 0}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onLostPointerCapture={onPointerUp}
      onDoubleClick={onDoubleClick}
      onKeyDown={onKeyDown}
      sx={{
        position: 'relative',
        cursor: disabled ? 'default' : isVert ? 'col-resize' : 'row-resize',
        touchAction: 'none',
        outline: 'none',
        ...(isVert
          ? { width: GUTTER_VISIBLE_SIZE + 'px', height: '100%' }
          : { height: GUTTER_VISIBLE_SIZE + 'px', width: '100%' }),
        // invisible hit area via ::before
        '&::before': {
          content: '""',
          position: 'absolute',
          background: 'transparent',
          ...(isVert
            ? {
                top: 0,
                bottom: 0,
                left: -hitOverflow + 'px',
                right: -hitOverflow + 'px',
              }
            : {
                left: 0,
                right: 0,
                top: -hitOverflow + 'px',
                bottom: -hitOverflow + 'px',
              }),
        },
        // visible divider via ::after — animates to hoverColor/thicker
        '&::after': {
          content: '""',
          position: 'absolute',
          inset: 0,
          background: dividerColor,
          pointerEvents: 'none',
          transition:
            'background-color 120ms ease, width 120ms ease, height 120ms ease, left 120ms ease, top 120ms ease',
        },
        '&:hover::after, &:focus-visible::after, &[data-dragging="true"]::after':
          {
            background: hoverColor,
            ...(isVert
              ? {
                  width: GUTTER_HOVER_SIZE + 'px',
                  left: -(GUTTER_HOVER_SIZE - GUTTER_VISIBLE_SIZE) / 2 + 'px',
                }
              : {
                  height: GUTTER_HOVER_SIZE + 'px',
                  top: -(GUTTER_HOVER_SIZE - GUTTER_VISIBLE_SIZE) / 2 + 'px',
                }),
          },
        ...style,
      }}
    />
  );
}

export interface SplitterProps {
  direction: 'vertical' | 'horizontal';
  size: number;
  onChange: (size: number) => void;
  onResize?: (size: number) => void;
  min?: number;
  max?: number;
  defaultSize?: number;
  disabled?: boolean;
  hidden?: boolean;
  hiddenTake?: 'primary' | 'secondary';
  ariaLabel?: string;
  children: [React.ReactNode, React.ReactNode];
}

export function Splitter(props: SplitterProps) {
  const {
    direction,
    size,
    onChange,
    onResize,
    min = 150,
    max,
    defaultSize,
    disabled,
    hidden,
    hiddenTake = 'primary',
    ariaLabel,
    children: [primary, secondary],
  } = props;

  const isVert = direction === 'vertical';
  const rootRef = useRef<HTMLDivElement>(null);
  const liveSizeRef = useRef<number>(size);
  const dragRef = useRef<{
    startPos: number;
    startSize: number;
    lo: number;
    hi: number;
  } | null>(null);
  const rafRef = useRef<number | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    liveSizeRef.current = size;
    rootRef.current?.style.setProperty('--sp-size', size + 'px');
  }, [size]);

  const measureBounds = (): { lo: number; hi: number } => {
    const rect = rootRef.current?.getBoundingClientRect();
    const total = rect ? (isVert ? rect.width : rect.height) : 0;
    const lo = min;
    const hi = max ?? Math.max(min, total - min - GUTTER_VISIBLE_SIZE);
    return { lo, hi };
  };

  const clampTo = (v: number, lo: number, hi: number) =>
    Math.max(lo, Math.min(hi, v));

  const writeLive = (v: number) => {
    liveSizeRef.current = v;
    if (rafRef.current != null) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      rootRef.current?.style.setProperty(
        '--sp-size',
        liveSizeRef.current + 'px',
      );
      onResize?.(liveSizeRef.current);
    });
  };

  const mountOverlay = () => {
    if (overlayRef.current) return;
    const div = document.createElement('div');
    div.style.cssText = `
      position:fixed;inset:0;z-index:99999;cursor:${
        isVert ? 'col-resize' : 'row-resize'
      };
      background:transparent;
    `;
    document.body.appendChild(div);
    overlayRef.current = div;
  };

  const unmountOverlay = () => {
    if (overlayRef.current) {
      document.body.removeChild(overlayRef.current);
      overlayRef.current = null;
    }
  };

  const setDraggingAttr = (on: boolean) => {
    const gutterEl = rootRef.current?.querySelector(
      '[role="separator"]',
    ) as HTMLElement | null;
    if (gutterEl) {
      if (on) gutterEl.setAttribute('data-dragging', 'true');
      else gutterEl.removeAttribute('data-dragging');
    }
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (disabled || hidden) return;
    const { lo, hi } = measureBounds();
    dragRef.current = {
      startPos: isVert ? e.clientX : e.clientY,
      startSize: liveSizeRef.current,
      lo,
      hi,
    };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    document.body.style.cursor = isVert ? 'col-resize' : 'row-resize';
    document.body.style.userSelect = 'none';
    mountOverlay();
    setDraggingAttr(true);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d) return;
    const pos = isVert ? e.clientX : e.clientY;
    writeLive(clampTo(d.startSize + (pos - d.startPos), d.lo, d.hi));
  };

  const finishDrag = (e: React.PointerEvent) => {
    if (!dragRef.current) return;
    dragRef.current = null;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      /* capture may already be released */
    }
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
    unmountOverlay();
    setDraggingAttr(false);
    onChange(liveSizeRef.current);
  };

  const onDoubleClick = () => {
    if (defaultSize == null || disabled || hidden) return;
    const { lo, hi } = measureBounds();
    onChange(clampTo(defaultSize, lo, hi));
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (disabled || hidden) return;
    const step = e.shiftKey ? 40 : 8;
    const plus = isVert ? 'ArrowRight' : 'ArrowDown';
    const minus = isVert ? 'ArrowLeft' : 'ArrowUp';
    const { lo, hi } = measureBounds();
    if (e.key === plus) {
      onChange(clampTo(liveSizeRef.current + step, lo, hi));
      e.preventDefault();
    } else if (e.key === minus) {
      onChange(clampTo(liveSizeRef.current - step, lo, hi));
      e.preventDefault();
    } else if (e.key === 'Home') {
      onChange(lo);
      e.preventDefault();
    } else if (e.key === 'End') {
      onChange(hi);
      e.preventDefault();
    }
  };

  const template = hidden
    ? hiddenTake === 'primary'
      ? '1fr 0 0'
      : '0 0 1fr'
    : `var(--sp-size) ${GUTTER_VISIBLE_SIZE}px 1fr`;

  const rootStyle: React.CSSProperties = {
    display: 'grid',
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    position: 'relative',
    [isVert ? 'gridTemplateColumns' : 'gridTemplateRows']: template,
    [isVert ? 'gridTemplateRows' : 'gridTemplateColumns']: '1fr',
    ['--sp-size' as any]: size + 'px',
  };

  const paneStyle: React.CSSProperties = {
    minWidth: 0,
    minHeight: 0,
    overflow: 'hidden',
    position: 'relative',
    // Isolate child layout so grid-track size changes during drag
    // don't trigger full-page relayout of descendant content.
    contain: 'layout paint',
  };

  return (
    <div ref={rootRef} style={rootStyle}>
      <div style={paneStyle}>{primary}</div>
      {hidden ? (
        <div />
      ) : (
        <SplitterGutter
          direction={direction}
          disabled={disabled}
          ariaLabel={ariaLabel}
          ariaValueNow={Math.round(size)}
          ariaValueMin={min}
          ariaValueMax={max}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={finishDrag}
          onDoubleClick={onDoubleClick}
          onKeyDown={onKeyDown}
        />
      )}
      <div style={paneStyle}>{secondary}</div>
    </div>
  );
}

export default Splitter;

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

import { Box } from '@mui/material';
import React, { useEffect, useRef } from 'react';

/** Maximum height of the fade at each edge, in px. */
const FADE_SIZE = 24;

/**
 * Fades the top/bottom edge of a scroll container when content continues
 * beyond it. The fade grows with the scrolled distance, so it eases in instead
 * of popping, and is absent when there's nothing more to scroll. Updates go
 * straight to CSS variables, so scrolling never re-renders React.
 */
function useScrollFade(active: boolean) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!active || !el) return undefined;

    let frame = 0;
    const update = () => {
      frame = 0;
      const remaining = el.scrollHeight - el.clientHeight - el.scrollTop;
      const top = Math.min(Math.max(el.scrollTop, 0), FADE_SIZE);
      const bottom = Math.min(Math.max(remaining, 0), FADE_SIZE);
      el.style.setProperty('--fade-top', `${top}px`);
      el.style.setProperty('--fade-bottom', `${bottom}px`);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    el.addEventListener('scroll', schedule, { passive: true });
    // Content height changes (lazy tab load, map, images) and panel resizes
    // change how much is left to scroll. Children are observed directly, not
    // through a wrapper, because some tabs size themselves with height: 100%.
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
    };
  }, [active]);

  return scrollRef;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TsTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  const isActive = value === index;
  const scrollRef = useScrollFade(isActive);

  return (
    <Box
      ref={scrollRef}
      role="tabpanel"
      hidden={!isActive}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
      sx={{
        height: '100%',
        overflowY: 'auto',
        overflowX: 'hidden',
        paddingTop: '5px',
        paddingLeft: '10px',
        paddingRight: '10px',
        '--fade-top': '0px',
        '--fade-bottom': '0px',
        maskImage:
          'linear-gradient(to bottom, transparent 0, #000 var(--fade-top), #000 calc(100% - var(--fade-bottom)), transparent 100%)',
      }}
    >
      {children}
    </Box>
  );
}

export default TsTabPanel;

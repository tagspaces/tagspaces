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

import AppConfig from '-/AppConfig';
import PageNotification from '-/containers/PageNotification';
import { FilePropertiesContextProvider } from '-/hooks/FilePropertiesContextProvider';
import { FullScreenContextProvider } from '-/hooks/FullScreenContextProvider';
import { useDirectoryContentContext } from '-/hooks/useDirectoryContentContext';
import { useOpenedEntryContext } from '-/hooks/useOpenedEntryContext';
import { usePanelsContext } from '-/hooks/usePanelsContext';
import { useUserContext } from '-/hooks/useUserContext';
import useEventListener from '-/utils/useEventListener';
import { Box, useMediaQuery } from '@mui/material';
import Drawer from '@mui/material/Drawer';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import { styled, useTheme } from '@mui/material/styles';
import clsx from 'clsx';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { GlobalHotKeys } from 'react-hotkeys';
import { useDispatch, useSelector } from 'react-redux';
import EntryContainer from '../components/EntryContainer';
import FolderContainer from '../components/FolderContainer';
import MobileNavigation from '../components/MobileNavigation';
import { Splitter, SplitterGutter } from '../components/Splitter';
import {
  actions as SettingsActions,
  getDesktopMode,
  getKeyBindingObject,
  getLeftPanelWidth,
  getMainVerticalSplitSize,
} from '../reducers/settings';

const DRAWER_MIN_WIDTH = 310;
const DRAWER_MAX_WIDTH = 600;
const DRAWER_DEFAULT_WIDTH = 320;
const MOBILE_DRAWER_WIDTH = 320;
const DRAWER_WIDTH_VAR = '--tagspaces-drawer-width';

const classes = {
  content: `MainPage-content`,
  contentShift: `MainPage-contentShift`,
};

const Root = styled('div')(() => ({
  height: '100%',
  [`& .${classes.content}`]: {
    height: '100%',
    flexGrow: 1,
    padding: 0,
    paddingLeft: 'var(--tagspaces-drawer-width, 320px)',
  },
  [`& .${classes.contentShift}`]: {
    height: '100%',
    padding: 0,
    marginLeft: 0,
  },
}));

function MainPage() {
  const dispatch = useDispatch();
  const { openLink, openedEntry, isEntryInFullWidth, setEntryInFullWidth } =
    useOpenedEntryContext();

  const theme = useTheme();
  const smallScreen = useMediaQuery(theme.breakpoints.down('md'));

  const {
    loadParentDirectoryContent,
    enterSearchMode,
    exitSearchMode,
    openCurrentDirectory,
  } = useDirectoryContentContext();
  const { showPanel } = usePanelsContext();
  const { isLoggedIn } = useUserContext();
  const mainSplitContainerRef = useRef<HTMLDivElement>(null);
  const [sizePx, setSizePx] = useState<number>(0);

  const [drawerOpened, setDrawerOpened] = useState<boolean>(true);
  const isDesktopMode: boolean = useSelector(getDesktopMode);
  const keyBindings = useSelector(getKeyBindingObject);
  const mainSplitSize = useSelector(getMainVerticalSplitSize);
  const drawerWidth = useSelector(getLeftPanelWidth);

  // Redux actions as callbacks
  const toggleShowUnixHiddenEntries = useCallback(
    () => dispatch(SettingsActions.toggleShowUnixHiddenEntries()),
    [dispatch],
  );
  const setMainVerticalSplitSize = useCallback(
    (splitSize: string) =>
      dispatch(SettingsActions.setMainVerticalSplitSize(splitSize)),
    [dispatch],
  );
  const setLeftPanelWidth = useCallback(
    (w: number) => dispatch(SettingsActions.setLeftPanelWidth(w)),
    [dispatch],
  );

  useEventListener('message', (e) => {
    // Only accept messages from same-origin frames or sandboxed extension
    // iframes (origin 'null'). Without this, any embedded frame could trigger
    // openLink() with attacker-controlled URLs.
    const trusted = e.origin === window.location.origin || e.origin === 'null';
    if (!trusted) return;
    if (typeof e.data === 'string') {
      try {
        const data = JSON.parse(e.data);
        if (
          data.command === 'openLinkExternally' &&
          typeof data.link === 'string' &&
          data.link.length > 0
        ) {
          openLink(data.link, { fullWidth: false });
        }
      } catch (ex) {
        console.debug(
          'useEventListener message:' + e.data + ' parse error:',
          ex,
        );
      }
    }
  });

  useEffect(() => {
    if (!AppConfig.isNativeMobile) {
      updateDimensions();
    }
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (isEntryInFullWidth) {
      setDrawerOpened(false);
    }
  }, [isEntryInFullWidth]);

  // Expose desktop drawer width to CSS so the main content's paddingLeft
  // tracks the drawer size without re-creating the styled component on every drag.
  // The .contentShift class zeroes padding when the drawer is closed, so the
  // var stays at the live width regardless of drawerOpened. The drag handler
  // also writes this var directly during drag — keep it consistent on commit.
  useEffect(() => {
    if (!isDesktopMode) {
      document.documentElement.style.removeProperty(DRAWER_WIDTH_VAR);
      return;
    }
    document.documentElement.style.setProperty(
      DRAWER_WIDTH_VAR,
      drawerWidth + 'px',
    );
  }, [drawerWidth, isDesktopMode]);

  useEffect(() => {
    updateDimensions();
    // eslint-disable-next-line
  }, [openedEntry]);

  useEventListener('resize', () => {
    if (!AppConfig.isNativeMobile) {
      updateDimensions();
    }
  });

  const updateDimensions = useCallback(() => {
    const w =
      window.innerWidth ||
      document.documentElement.clientWidth ||
      document.body.clientWidth;
    const h =
      window.innerHeight ||
      document.documentElement.clientHeight ||
      document.body.clientHeight;

    if (openedEntry && !isEntryInFullWidth) {
      const isFillWidth = h > w;
      if (isFillWidth !== isEntryInFullWidth) {
        setEntryInFullWidth(isFillWidth);
      }
    }
  }, [openedEntry, isEntryInFullWidth, setEntryInFullWidth]);

  const toggleDrawer = useCallback(() => {
    setDrawerOpened((prevOpen) => !prevOpen);
  }, []);

  const keyBindingHandlers = useMemo(
    () => ({
      openParentDirectory: loadParentDirectoryContent,
      toggleShowHiddenEntries: toggleShowUnixHiddenEntries,
      showLocationManager: () => {
        showPanel('locationManagerPanel');
        setDrawerOpened(true);
      },
      showTagLibrary: () => {
        showPanel('tagLibraryPanel');
        setDrawerOpened(true);
      },
      openSearch: () => {
        if (!isEntryInFullWidth) {
          enterSearchMode();
        }
      },
      closeSearch: () => {
        exitSearchMode();
        openCurrentDirectory();
      },
      showHelp: () => {
        showPanel('helpFeedbackPanel');
        setDrawerOpened(true);
      },
    }),
    [
      loadParentDirectoryContent,
      toggleShowUnixHiddenEntries,
      showPanel,
      setDrawerOpened,
      isEntryInFullWidth,
      enterSearchMode,
      exitSearchMode,
      openCurrentDirectory,
    ],
  );

  const keyMap = useMemo(
    () => ({
      openParentDirectory: keyBindings.openParentDirectory,
      toggleShowHiddenEntries: keyBindings.toggleShowHiddenEntries,
      showLocationManager: keyBindings.showLocationManager,
      showTagLibrary: keyBindings.showTagLibrary,
      openSearch: keyBindings.openSearch,
      closeSearch: keyBindings.Escape,
      showHelp: keyBindings.showHelp,
    }),
    [keyBindings],
  );

  const hideSplit = !openedEntry || isEntryInFullWidth;

  // Keep sizePx in sync with persisted percentage and container width.
  useEffect(() => {
    const el = mainSplitContainerRef.current;
    if (!el || hideSplit) return;
    const pct = parseFloat(mainSplitSize);
    if (!isFinite(pct)) return;
    const next = Math.round((el.clientWidth * pct) / 100);
    setSizePx(next);
  }, [mainSplitSize, hideSplit]);

  // Recompute sizePx on window resize to preserve the persisted percentage.
  useEventListener('resize', () => {
    const el = mainSplitContainerRef.current;
    if (!el || hideSplit) return;
    const pct = parseFloat(mainSplitSize);
    if (!isFinite(pct)) return;
    setSizePx(Math.round((el.clientWidth * pct) / 100));
  });

  const onMainSplitChange = useCallback(
    (px: number) => {
      setSizePx(px);
      const el = mainSplitContainerRef.current;
      if (!el || el.clientWidth === 0) return;
      const pct = Math.round((px / el.clientWidth) * 100);
      const next = pct + '%';
      if (mainSplitSize !== next) {
        setMainVerticalSplitSize(next);
      }
    },
    [mainSplitSize, setMainVerticalSplitSize],
  );

  function renderContainers() {
    if (smallScreen && openedEntry) {
      return (
        <>
          <FolderContainer
            hidden
            toggleDrawer={toggleDrawer}
            drawerOpened={drawerOpened}
          />
          <FilePropertiesContextProvider>
            <FullScreenContextProvider>
              <EntryContainer key="EntryContainerID" />
            </FullScreenContextProvider>
          </FilePropertiesContextProvider>
        </>
      );
    }
    return (
      <div ref={mainSplitContainerRef} style={{ height: '100%' }}>
        <Splitter
          direction="vertical"
          size={sizePx}
          min={400}
          hidden={hideSplit}
          hiddenTake={isEntryInFullWidth ? 'secondary' : 'primary'}
          onChange={onMainSplitChange}
          ariaLabel="Resize file list and preview"
        >
          <FolderContainer
            toggleDrawer={toggleDrawer}
            drawerOpened={drawerOpened}
          />
          <FilePropertiesContextProvider>
            {openedEntry ? (
              <FullScreenContextProvider>
                <EntryContainer key="EntryContainerID" />
              </FullScreenContextProvider>
            ) : (
              <div />
            )}
          </FilePropertiesContextProvider>
        </Splitter>
      </div>
    );
  }

  return (
    <Root>
      <GlobalHotKeys handlers={keyBindingHandlers} keyMap={keyMap}>
        <PageNotification />
        <Box
          sx={{
            backgroundColor: theme.palette.background.default,
            height: '100%',
          }}
        >
          <style>
            {`
              body { background-color: ${
                theme.palette.background.default
              } !important;}
          `}
          </style>
          {isDesktopMode || (AppConfig.ExtIsAmplify && !isLoggedIn()) ? (
            <>
              <Drawer
                sx={{
                  backgroundColor: 'unset',
                  // The DrawerResizeHandle's hit area extends 6.5px past the
                  // drawer's right edge (SplitterGutter's invisible hit zone).
                  // Without this, the Paper allows a few pixels of horizontal
                  // scroll into that empty overflow.
                  '& .MuiDrawer-paper': { overflowX: 'hidden' },
                }}
                variant="persistent"
                anchor="left"
                open={drawerOpened}
              >
                <MobileNavigation
                  width={drawerWidth}
                  widthVar={DRAWER_WIDTH_VAR}
                />
                <DrawerResizeHandle
                  width={drawerWidth}
                  onChange={setLeftPanelWidth}
                />
              </Drawer>
              <main
                className={clsx(classes.content, {
                  [classes.contentShift]: !drawerOpened,
                })}
              >
                {renderContainers()}
              </main>
            </>
          ) : (
            <>
              <SwipeableDrawer
                open={drawerOpened}
                onClose={() => setDrawerOpened(false)}
                onOpen={() => setDrawerOpened(true)}
                hysteresis={0.1}
                disableBackdropTransition={!AppConfig.isIOS}
                disableDiscovery={AppConfig.isIOS}
              >
                <MobileNavigation
                  width={MOBILE_DRAWER_WIDTH}
                  hideDrawer={() => setDrawerOpened(false)}
                />
              </SwipeableDrawer>
              {renderContainers()}
            </>
          )}
        </Box>
      </GlobalHotKeys>
    </Root>
  );
}

interface DrawerResizeHandleProps {
  width: number;
  onChange: (w: number) => void;
}

function DrawerResizeHandle({ width, onChange }: DrawerResizeHandleProps) {
  const dragRef = useRef<{ sx: number; sw: number } | null>(null);
  const liveRef = useRef<number>(width);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    liveRef.current = width;
  }, [width]);

  const clamp = (v: number) =>
    Math.max(DRAWER_MIN_WIDTH, Math.min(DRAWER_MAX_WIDTH, v));

  // During drag we bypass Redux entirely and write straight to the CSS var
  // that both the main content's paddingLeft and MobileNavigation's width
  // resolve from. This avoids a per-frame store update / re-render of the
  // (heavy) MobileNavigation tree.
  const writeLive = (v: number) => {
    liveRef.current = clamp(v);
    if (rafRef.current != null) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      document.documentElement.style.setProperty(
        DRAWER_WIDTH_VAR,
        liveRef.current + 'px',
      );
    });
  };

  const onPointerDown = (e: React.PointerEvent) => {
    dragRef.current = { sx: e.clientX, sw: liveRef.current };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d) return;
    writeLive(d.sw + (e.clientX - d.sx));
  };
  const finish = (e: React.PointerEvent) => {
    if (!dragRef.current) return;
    dragRef.current = null;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      /* already released */
    }
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
    onChange(liveRef.current);
  };
  const onDoubleClick = () => onChange(DRAWER_DEFAULT_WIDTH);
  const onKeyDown = (e: React.KeyboardEvent) => {
    const step = e.shiftKey ? 40 : 8;
    if (e.key === 'ArrowRight') {
      onChange(clamp(width + step));
      e.preventDefault();
    } else if (e.key === 'ArrowLeft') {
      onChange(clamp(width - step));
      e.preventDefault();
    } else if (e.key === 'Home') {
      onChange(DRAWER_MIN_WIDTH);
      e.preventDefault();
    } else if (e.key === 'End') {
      onChange(DRAWER_MAX_WIDTH);
      e.preventDefault();
    }
  };

  return (
    <SplitterGutter
      direction="vertical"
      ariaLabel="Resize navigation panel"
      ariaValueNow={width}
      ariaValueMin={DRAWER_MIN_WIDTH}
      ariaValueMax={DRAWER_MAX_WIDTH}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={finish}
      onDoubleClick={onDoubleClick}
      onKeyDown={onKeyDown}
      style={{
        position: 'absolute',
        top: 0,
        right: 0,
        height: '100%',
        zIndex: 1300,
      }}
    />
  );
}

export default React.memo(MainPage);

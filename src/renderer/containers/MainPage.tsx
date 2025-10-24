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
import { useMediaQuery } from '@mui/material';
import Drawer from '@mui/material/Drawer';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import { styled, useTheme } from '@mui/material/styles';
import { buffer } from '@tagspaces/tagspaces-common/misc';
import clsx from 'clsx';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react';
import { GlobalHotKeys } from 'react-hotkeys';
import { useDispatch, useSelector } from 'react-redux';
import { Split } from 'ts-react-splitter';
import EntryContainer from '../components/EntryContainer';
import FolderContainer from '../components/FolderContainer';
import MobileNavigation from '../components/MobileNavigation';
import {
  actions as SettingsActions,
  getDesktopMode,
  getKeyBindingObject,
  getMainVerticalSplitSize,
} from '../reducers/settings';

const drawerWidth = 320;
const bufferedLeftSplitResize = buffer({
  timeout: 300,
  id: 'buffered-leftsplit-resize',
});

const classes = {
  content: `MainPage-content`,
  contentShift: `MainPage-contentShift`,
};

const Root = styled('div')(({ theme }) => ({
  height: '100%',
  [`& .${classes.content}`]: {
    height: '100%',
    flexGrow: 1,
    padding: 0,
    paddingLeft: drawerWidth,
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  [`& .${classes.contentShift}`]: {
    height: '100%',
    padding: 0,
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
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
  const percent = useRef<number | undefined>(undefined);
  const [, forceUpdate] = useReducer((x) => x + 1, 0);

  const [drawerOpened, setDrawerOpened] = useState<boolean>(true);
  const isDesktopMode: boolean = useSelector(getDesktopMode);
  const keyBindings = useSelector(getKeyBindingObject);
  const mainSplitSize = useSelector(getMainVerticalSplitSize);

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

  useEventListener('message', (e) => {
    if (typeof e.data === 'string') {
      try {
        const data = JSON.parse(e.data);
        if (data.command === 'openLinkExternally') {
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
    if (!AppConfig.isCordova) {
      updateDimensions();
    }
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (isEntryInFullWidth) {
      setDrawerOpened(false);
    }
  }, [isEntryInFullWidth]);

  useEffect(() => {
    updateDimensions();
    // eslint-disable-next-line
  }, [openedEntry]);

  useEventListener('resize', () => {
    if (!AppConfig.isCordova) {
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

  const setPercent = useCallback(
    (p: number | undefined) => {
      percent.current = p;
      if (p !== undefined) {
        bufferedLeftSplitResize(() => {
          if (mainSplitSize !== p + '%') {
            setMainVerticalSplitSize(p + '%');
          }
        });
      }
      forceUpdate();
    },
    [mainSplitSize, setMainVerticalSplitSize],
  );

  function renderContainers() {
    let initialPrimarySize = mainSplitSize;
    let minPrimarySize = '250px';
    let minSecondarySize = '250px';
    let renderSplitter: (() => React.ReactNode) | undefined;

    if (!openedEntry) {
      percent.current = undefined;
      initialPrimarySize = '100%';
      minSecondarySize = '0%';
      renderSplitter = () => null;
    }
    if (isEntryInFullWidth) {
      percent.current = undefined;
      initialPrimarySize = '0%';
      minPrimarySize = '0%';
      renderSplitter = () => null;
    }
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
      <Split
        initialPrimarySize={initialPrimarySize}
        minPrimarySize={minPrimarySize}
        minSecondarySize={minSecondarySize}
        renderSplitter={renderSplitter}
        percent={percent.current}
        setPercent={setPercent}
      >
        <FolderContainer
          toggleDrawer={toggleDrawer}
          drawerOpened={drawerOpened}
        />
        <FilePropertiesContextProvider>
          {openedEntry && (
            <FullScreenContextProvider>
              <EntryContainer key="EntryContainerID" />
            </FullScreenContextProvider>
          )}
        </FilePropertiesContextProvider>
      </Split>
    );
  }

  return (
    <Root>
      <GlobalHotKeys handlers={keyBindingHandlers} keyMap={keyMap}>
        <PageNotification />
        <div
          style={{
            backgroundColor: theme.palette.background.default,
            height: '100%',
          }}
        >
          <style>
            {`
              body { background-color: ${
                theme.palette.background.default
              } !important;}
              .default-splitter {
                --default-splitter-line-margin: 2px !important;
                --default-splitter-line-size: 1px !important;
                --default-splitter-line-color: ${
                  theme.palette.divider
                } !important;
              }

              .react-split .split-container.vertical .splitter {
                background-color: ${theme.palette.background.default};
              }

              .react-split .split-container {
                --react-split-splitter: ${
                  !openedEntry || isEntryInFullWidth ? '0' : '3px'
                } !important;
              }
              .react-split .secondary .full-content {
                display: flex;
                flex-direction: column;
              }
          `}
          </style>
          {isDesktopMode || (AppConfig.isAmplify && !isLoggedIn()) ? (
            <>
              <Drawer
                style={{ backgroundColor: 'unset' }}
                variant="persistent"
                anchor="left"
                open={drawerOpened}
              >
                <MobileNavigation width={drawerWidth} />
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
                  width={drawerWidth}
                  hideDrawer={() => setDrawerOpened(false)}
                />
              </SwipeableDrawer>
              {renderContainers()}
            </>
          )}
        </div>
      </GlobalHotKeys>
    </Root>
  );
}

export default React.memo(MainPage);

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
import React, { useEffect, useReducer, useRef, useState } from 'react';
import { HotKeys } from 'react-hotkeys';
import { connect, useSelector } from 'react-redux';
import { bindActionCreators } from 'redux';
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
const body = document.getElementsByTagName('body')[0];
const bufferedLeftSplitResize = buffer({
  timeout: 300,
  id: 'buffered-leftsplit-resize',
});

const PREFIX = 'MainPage';

const classes = {
  content: `${PREFIX}-content`,
  contentShift: `${PREFIX}-contentShift`,
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

interface Props {
  toggleShowUnixHiddenEntries: () => void;
  setMainVerticalSplitSize: (splitSize: string) => void;
}

function MainPage(props: Props) {
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
  const [ignored, forceUpdate] = useReducer((x) => x + 1, 0, undefined);

  const [drawerOpened, setDrawerOpened] = useState<boolean>(true);
  const isDesktopMode: boolean = useSelector(getDesktopMode);
  const keyBindings = useSelector(getKeyBindingObject);
  const mainSplitSize = useSelector(getMainVerticalSplitSize);

  useEventListener('message', (e) => {
    if (typeof e.data === 'string') {
      // console.log(e.data);
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
  }, []);

  useEffect(() => {
    if (isEntryInFullWidth) {
      setDrawerOpened(false); // !props.isEntryInFullWidth);
    }
  }, [isEntryInFullWidth]);

  useEffect(() => {
    updateDimensions();
  }, [openedEntry]);

  useEventListener('resize', () => {
    if (!AppConfig.isCordova) {
      updateDimensions();
    }
  });

  const updateDimensions = () => {
    const w =
      window.innerWidth ||
      document.documentElement.clientWidth ||
      body.clientWidth;
    const h =
      window.innerHeight ||
      document.documentElement.clientHeight ||
      body.clientHeight;

    // console.log('Width: ' + width + ' Height: ' + height);
    //setDimensions({ width: w, height: h });

    if (openedEntry && !isEntryInFullWidth) {
      const isFillWidth = h > w;
      if (isFillWidth !== isEntryInFullWidth) {
        setEntryInFullWidth(isFillWidth);
      }
    }
  };

  const toggleDrawer = () => {
    setDrawerOpened((prevOpen) => !prevOpen);
  };

  const keyBindingHandlers = {
    openParentDirectory: loadParentDirectoryContent,
    toggleShowHiddenEntries: props.toggleShowUnixHiddenEntries,
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
  };

  const keyMap = {
    openParentDirectory: keyBindings.openParentDirectory,
    toggleShowHiddenEntries: keyBindings.toggleShowHiddenEntries,
    showLocationManager: keyBindings.showLocationManager,
    showTagLibrary: keyBindings.showTagLibrary,
    openSearch: keyBindings.openSearch,
    closeSearch: keyBindings.Escape,
    showHelp: keyBindings.showHelp,
  };

  const setPercent = (p: number | undefined) => {
    percent.current = p;
    if (p !== undefined) {
      bufferedLeftSplitResize(() => {
        if (mainSplitSize !== p + '%') {
          props.setMainVerticalSplitSize(p + '%');
        }
      });
    }
    forceUpdate();
  };

  function renderContainers() {
    let initialPrimarySize = mainSplitSize;
    let minPrimarySize = '250px';
    let minSecondarySize = '250px';
    let renderSplitter;

    if (!openedEntry) {
      percent.current = undefined;
      initialPrimarySize = '100%';
      minSecondarySize = '0%';
      renderSplitter = function () {
        return null;
      };
    }
    if (isEntryInFullWidth) {
      percent.current = undefined;
      initialPrimarySize = '0%';
      minPrimarySize = '0%';
      renderSplitter = function () {
        return null;
      };
    }
    if (smallScreen && openedEntry) {
      return (
        <>
          <FolderContainer
            style={{ display: 'none' }}
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
      <HotKeys
        handlers={keyBindingHandlers}
        keyMap={keyMap}
        style={{ height: '100%' }}
      >
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
      </HotKeys>
    </Root>
  );
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      toggleShowUnixHiddenEntries: SettingsActions.toggleShowUnixHiddenEntries,
      setMainVerticalSplitSize: SettingsActions.setMainVerticalSplitSize,
    },
    dispatch,
  );
}

export default connect(undefined, mapDispatchToProps)(React.memo(MainPage));

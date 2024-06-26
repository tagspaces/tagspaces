/**
 * TagSpaces - universal file and folder organizer
 * Copyright (C) 2017-present TagSpaces UG (haftungsbeschraenkt)
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

import React, { useEffect, useReducer, useRef, useState } from 'react';
import clsx from 'clsx';
import { bindActionCreators } from 'redux';
import { connect, useSelector } from 'react-redux';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import Drawer from '@mui/material/Drawer';
import { HotKeys } from 'react-hotkeys';
import { Split } from 'ts-react-splitter';
import { buffer } from '@tagspaces/tagspaces-common/misc';
import AppConfig from '-/AppConfig';
import MobileNavigation from '../components/MobileNavigation';
import FolderContainer from '../components/FolderContainer';
import EntryContainer from '../components/EntryContainer';
import {
  getDesktopMode,
  getKeyBindingObject,
  getMainVerticalSplitSize,
  actions as SettingsActions,
} from '../reducers/settings';
import useEventListener from '-/utils/useEventListener';
import PageNotification from '-/containers/PageNotification';
import { styled, useTheme } from '@mui/material/styles';
import { FilePropertiesContextProvider } from '-/hooks/FilePropertiesContextProvider';
import { useOpenedEntryContext } from '-/hooks/useOpenedEntryContext';
import { useDirectoryContentContext } from '-/hooks/useDirectoryContentContext';
import { usePanelsContext } from '-/hooks/usePanelsContext';
import { useUserContext } from '-/hooks/useUserContext';

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
  /*isLocationManagerPanelOpened: boolean;
  isTagLibraryPanelOpened: boolean;
  isSearchPanelOpened: boolean;
  isHelpFeedbackPanelOpened: boolean;*/
  //user: CognitoUserInterface;
}

function MainPage(props: Props) {
  const {
    openLink,
    openedEntry,
    isEntryInFullWidth,
    goForward,
    goBack,
    setEntryInFullWidth,
  } = useOpenedEntryContext();

  const {
    loadParentDirectoryContent,
    enterSearchMode,
    exitSearchMode,
    openCurrentDirectory,
  } = useDirectoryContentContext();
  const { showPanel } = usePanelsContext();
  const { isLoggedIn } = useUserContext();
  const theme = useTheme();
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
    /*listen({
      ...props,
      goBack,
      goForward,
      openFsEntry,
      openNextFile,
      openPrevFile,
      setSearchQuery,
    });*/
  }, []);

  useEffect(() => {
    // setPercent(undefined);
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
    openSearch: () => enterSearchMode(),
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
          goBack={goBack}
          goForward={goForward}
          /*openMoveCopyFilesDialog={() =>
            setMoveCopyDialogOpened(props.selectedEntries)
          }*/
        />
        {openedEntry && (
          <FilePropertiesContextProvider>
            <EntryContainer key="EntryContainerID" />
          </FilePropertiesContextProvider>
        )}
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

function mapStateToProps(state) {
  return {
    /*isLocationManagerPanelOpened: isLocationManagerPanelOpened(state),
    isTagLibraryPanelOpened: isTagLibraryPanelOpened(state),
    isSearchPanelOpened: isSearchPanelOpened(state),
    isHelpFeedbackPanelOpened: isHelpFeedbackPanelOpened(state),*/
    //user: currentUser(state),
  };
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

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(React.memo(MainPage));

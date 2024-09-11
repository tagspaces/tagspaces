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

import React, { useCallback, useEffect, useReducer, useRef } from 'react';
import { styled, useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useSelector, useDispatch } from 'react-redux';
import { getBackupFileDir } from '@tagspaces/tagspaces-common/paths';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import { AppDispatch } from '-/reducers/app';
import Revisions from '-/components/Revisions';
import Tooltip from '-/components/Tooltip';
import EntryProperties from '-/components/EntryProperties';
import {
  actions as SettingsActions,
  getEntryContainerTab,
  getMapTileServer,
} from '-/reducers/settings';
import {
  FolderPropertiesIcon,
  DescriptionIcon,
  EditDescriptionIcon,
  RevisionIcon,
} from '-/components/CommonIcons';
import EditDescription from '-/components/EditDescription';
import { useTranslation } from 'react-i18next';
import { useOpenedEntryContext } from '-/hooks/useOpenedEntryContext';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import { CommonLocation } from '-/utils/CommonLocation';
import TsTabPanel from '-/components/TsTabPanel';

interface StyledTabsProps {
  children?: React.ReactNode;
  value: number;
  onChange: (event: React.SyntheticEvent, newValue: number) => void;
}

const StyledTabs = styled((props: StyledTabsProps) => (
  <Tabs
    {...props}
    variant="scrollable"
    // scrollButtons={}
    // allowScrollButtonsMobile
    TabIndicatorProps={{ children: <span className="MuiTabs-indicatorSpan" /> }}
  />
))(({ theme }) => ({
  '& .MuiTabs-indicator': {
    display: 'flex',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  '& .MuiTabs-indicatorSpan': {
    maxWidth: 40,
    width: '100%',
    backgroundColor: theme.palette.text.primary, //theme.palette.background.default //'#635ee7',
  },
}));

interface StyledTabProps {
  title: string;
  tinyMode: any;
  icon: any;
  onClick: (event: React.SyntheticEvent) => void;
}

const StyledTab = styled((props: StyledTabProps) => {
  const { title, tinyMode, ...tabProps } = props; // Extract title and tinyMode

  return (
    <Tooltip title={!tinyMode && title}>
      <Tab
        label={!tinyMode && title}
        disableRipple
        iconPosition="start"
        {...tabProps} // Pass remaining props to Tab
      />
    </Tooltip>
  );
})(({ theme }) => ({
  textTransform: 'none',
  fontWeight: theme.typography.fontWeightRegular,
  fontSize: theme.typography.pxToRem(15),
  minHeight: 50,
  maxHeight: 50,
  minWidth: 40,
  marginRight: 5,
  padding: 5,
}));

function a11yProps(index: number) {
  return {
    id: `tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

interface EntryContainerTabsProps {
  openPanel: () => void;
  toggleProperties: () => void;
  isEditable: boolean;
  isPanelOpened: boolean;
  haveDescription: boolean;
  marginRight: string;
}

function EntryContainerTabs(props: EntryContainerTabsProps) {
  const {
    openPanel,
    toggleProperties,
    marginRight,
    isEditable,
    isPanelOpened,
    haveDescription,
  } = props;

  const { t } = useTranslation();
  const { findLocation } = useCurrentLocationContext();
  const { openedEntry } = useOpenedEntryContext();
  const theme = useTheme();
  const tabIndex = useSelector(getEntryContainerTab);
  const tileServer = useSelector(getMapTileServer);
  const haveRevisions = useRef<boolean>(isEditable);
  const dispatch: AppDispatch = useDispatch();
  const [ignored, forceUpdate] = useReducer((x) => x + 1, 0, undefined);
  const isTinyMode = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    if (!isEditable) {
      const location: CommonLocation = findLocation(openedEntry.locationID);
      const backupFilePath = getBackupFileDir(
        openedEntry.path,
        openedEntry.uuid,
        location?.getDirSeparator(),
      );
      location?.checkDirExist(backupFilePath).then((exist) => {
        if (exist) {
          haveRevisions.current = exist;
          forceUpdate();
        }
      });
    }
  }, [isEditable]);

  // Create functions that dispatch actions
  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    dispatch(SettingsActions.setEntryContainerTab(newValue));
    openPanel();
    console.log('tab changed to:' + newValue);
  };
  const handleTabClick = (event: React.SyntheticEvent) => {
    if (
      openedEntry.isFile &&
      tabIndex === parseInt(event.currentTarget.id.split('-')[1], 10)
    ) {
      // when selected tab is clicked...
      dispatch(SettingsActions.setEntryContainerTab(undefined));
      toggleProperties();
      console.log('tab click:' + tabIndex);
    }
  };

  // directories must be always opened
  let selectedTabIndex =
    !openedEntry.isFile && tabIndex === undefined ? 0 : tabIndex;
  if (!haveRevisions.current && selectedTabIndex === 2) {
    selectedTabIndex = 0;
  }

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        borderBottom:
          openedEntry.isFile && !isPanelOpened
            ? '1px solid ' + theme.palette.divider
            : 'none',
      }}
    >
      <Box sx={{ ...(marginRight && { marginRight }) }}>
        <StyledTabs
          value={selectedTabIndex}
          onChange={handleChange}
          aria-label="Switching among description, revisions entry properties"
        >
          <StyledTab
            data-tid="detailsTabTID"
            icon={<FolderPropertiesIcon />}
            title={t('core:details')}
            tinyMode={isTinyMode}
            {...a11yProps(0)}
            onClick={handleTabClick}
          />
          <StyledTab
            data-tid="descriptionTabTID"
            icon={
              haveDescription ? <EditDescriptionIcon /> : <DescriptionIcon />
            }
            title={t('core:filePropertiesDescription')}
            tinyMode={isTinyMode}
            {...a11yProps(1)}
            onClick={handleTabClick}
          />
          {haveRevisions.current && (
            <StyledTab
              data-tid="revisionsTabTID"
              icon={<RevisionIcon />}
              title={t('core:revisions')}
              tinyMode={isTinyMode}
              {...a11yProps(2)}
              onClick={handleTabClick}
            />
          )}
        </StyledTabs>
      </Box>
      <TsTabPanel key="propertiesTab" value={selectedTabIndex} index={0}>
        <EntryProperties key={openedEntry.path} tileServer={tileServer} />
      </TsTabPanel>
      <TsTabPanel key="descriptionTab" value={selectedTabIndex} index={1}>
        <EditDescription />
      </TsTabPanel>
      {haveRevisions.current && (
        <TsTabPanel key="revisionsTab" value={selectedTabIndex} index={2}>
          <Revisions />
        </TsTabPanel>
      )}
    </div>
  );
}

export default EntryContainerTabs;

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

import React, { useReducer } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import withStyles from '@mui/styles/withStyles';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Divider from '@mui/material/Divider';
import ChangeLogIcon from '@mui/icons-material/ImportContacts';
import WebClipperIcon from '@mui/icons-material/Transform';
import EmailIcon from '@mui/icons-material/Email';
import IssueIcon from '@mui/icons-material/BugReport';
import TranslationIcon from '@mui/icons-material/Translate';
import NewFeatureIcon from '@mui/icons-material/Gesture';
import TwitterIcon from '@mui/icons-material/Twitter';
import WelcomeBackground from '-/assets/images/background.png';
import WelcomeLogo from '-/assets/images/welcome-logo.png';
import {
  CreateFileIcon,
  LocalLocationIcon,
  OpenLinkIcon,
  KeyShortcutsIcon,
  HelpIcon
} from '-/components/CommonIcons';
import {
  actions as AppActions,
  AppDispatch,
  getCurrentLocationId
} from '-/reducers/app';
import i18n from '-/services/i18n';
import { getDesktopMode } from '-/reducers/settings';
import Links from '-/content/links';
import { Pro } from '-/pro';
import { TS } from '-/tagspaces.namespace';
import { renderHistory } from '-/components/RenderHistory';
import HowToStart from '-/components/HowToStart';
import { openURLExternally } from '-/services/utils-io';

interface Props {
  theme: any;
  classes: any;
}

export const styles: any = (theme: any) => ({
  listItem: {
    color: theme.palette.text.primary,
    textTransform: 'uppercase',
    marginTop: 10
  },
  recentTitle: {
    color: theme.palette.text.primary,
    textTransform: 'uppercase',
    textAlign: 'center'
  },
  noRecentItems: {
    color: theme.palette.text.primary,
    padding: 30,
    alignSelf: 'center'
  }
});

function WelcomePanel(props: Props) {
  const { theme, classes } = props;

  const dispatch: AppDispatch = useDispatch();
  const desktopMode = useSelector(getDesktopMode);
  const currentLocationId = useSelector(getCurrentLocationId);

  const toggleNewFileDialogDispatch = () =>
    dispatch(AppActions.toggleNewFileDialog());
  const toggleLocationDialogDispatch = () =>
    dispatch(AppActions.toggleLocationDialog());
  const toggleOpenLinkDialogDispatch = () =>
    dispatch(AppActions.toggleOpenLinkDialog());
  const toggleKeysDialogDispatch = () =>
    dispatch(AppActions.toggleKeysDialog());
  const openEntryDispatch = entryPath =>
    dispatch(AppActions.openEntry(entryPath));
  const openLinkDispatch = link => dispatch(AppActions.openLink(link));
  const openLocationByIdDispatch = locationId =>
    dispatch(AppActions.openLocationById(locationId));

  const [ignored, forceUpdate] = useReducer(x => x + 1, 0);

  const historyKeys = Pro && Pro.history ? Pro.history.historyKeys : {};
  const fileOpenHistoryItems: Array<TS.HistoryItem> = Pro
    ? Pro.history.getHistory(historyKeys.fileOpenKey)
    : [];
  const fileEditHistoryItems: Array<TS.HistoryItem> = Pro
    ? Pro.history.getHistory(historyKeys.fileEditKey)
    : [];
  const folderOpenHistoryItems: Array<TS.HistoryItem> = Pro
    ? Pro.history.getHistory(historyKeys.folderOpenKey)
    : [];

  const showDelete = false;
  const maxRecentItems = 5;

  /*function triggerOpenLocation() {
    const button = document.getElementById(
      desktopMode ? 'locationMenuButton' : 'mobileMenuButton'
    );
    button.click();
  }*/

  function renderRecentItems() {
    return (
      <Box style={{ display: 'flex', flexDirection: 'column' }}>
        <Typography
          variant="inherit"
          style={{
            paddingTop: 20
          }}
          className={classes.recentTitle}
          noWrap
        >
          {i18n.t('core:fileOpenHistory')}
        </Typography>
        {fileOpenHistoryItems ? (
          <List>
            {renderHistory(
              historyKeys.fileOpenKey,
              fileOpenHistoryItems,
              forceUpdate,
              currentLocationId,
              openLinkDispatch,
              openLocationByIdDispatch,
              openEntryDispatch,
              maxRecentItems,
              showDelete
            )}
          </List>
        ) : (
          <Typography className={classes.noRecentItems} variant="caption">
            {i18n.t('noItems')}
          </Typography>
        )}
        <Typography variant="inherit" className={classes.recentTitle} noWrap>
          {i18n.t('core:fileEditHistory')}
        </Typography>
        {fileEditHistoryItems ? (
          <List>
            {renderHistory(
              historyKeys.fileEditKey,
              fileEditHistoryItems,
              forceUpdate,
              currentLocationId,
              openLinkDispatch,
              openLocationByIdDispatch,
              openEntryDispatch,
              maxRecentItems,
              showDelete
            )}
          </List>
        ) : (
          <Typography className={classes.noRecentItems} variant="caption">
            {i18n.t('noItems')}
          </Typography>
        )}
        <Typography variant="inherit" className={classes.recentTitle} noWrap>
          {i18n.t('core:folderOpenHistory')}
        </Typography>
        {folderOpenHistoryItems ? (
          <List>
            {renderHistory(
              historyKeys.folderOpenKey,
              folderOpenHistoryItems,
              forceUpdate,
              currentLocationId,
              openLinkDispatch,
              openLocationByIdDispatch,
              openEntryDispatch,
              maxRecentItems,
              showDelete
            )}
          </List>
        ) : (
          <Typography className={classes.noRecentItems} variant="caption">
            {i18n.t('noItems')}
          </Typography>
        )}
      </Box>
    );
  }

  function renderQuickLinks() {
    return (
      <List
        dense={true}
        aria-label="useful link on welcome page"
        style={{
          height: 'calc(100% - 70px)',
          marginTop: 15,
          marginBottom: 15,
          // @ts-ignore
          overflowY: 'overlay',
          backgroundColor: theme.palette.background.default
        }}
      >
        <div
          role="button"
          aria-hidden="true"
          tabIndex={0}
          onClick={() => dispatch(AppActions.toggleAboutDialog())}
        >
          <img src={WelcomeLogo} alt="Organize your files" />
        </div>
        {/* <ListItem onClick={triggerOpenLocation}>
          <ListItemIcon>
            <LocalLocationIcon />
          </ListItemIcon>
          <ListItemText
            primary={i18n.t('core:chooseLocation')}
            className={classes.listItem}
          />
        </ListItem> */}
        <ListItem onClick={toggleNewFileDialogDispatch}>
          <ListItemIcon>
            <CreateFileIcon />
          </ListItemIcon>
          <ListItemText
            primary={i18n.t('core:create')}
            className={classes.listItem}
          />
        </ListItem>
        <ListItem onClick={toggleLocationDialogDispatch}>
          <ListItemIcon>
            <LocalLocationIcon />
          </ListItemIcon>
          <ListItemText
            primary={i18n.t('createLocationTitle')}
            className={classes.listItem}
          />
        </ListItem>
        <ListItem onClick={toggleOpenLinkDialogDispatch}>
          <ListItemIcon>
            <OpenLinkIcon />
          </ListItemIcon>
          <ListItemText
            primary={i18n.t('openLink')}
            className={classes.listItem}
          />
        </ListItem>
        <Divider />
        <ListItem
          onClick={() =>
            openURLExternally(Links.documentationLinks.general, true)
          }
        >
          <ListItemIcon>
            <HelpIcon />
          </ListItemIcon>
          <ListItemText
            primary={i18n.t('documentation')}
            className={classes.listItem}
          />
        </ListItem>
        <ListItem onClick={toggleKeysDialogDispatch}>
          <ListItemIcon>
            <KeyShortcutsIcon />
          </ListItemIcon>
          <ListItemText
            primary={i18n.t('shortcutKeys')}
            className={classes.listItem}
          />
        </ListItem>
        <ListItem
          onClick={() => openURLExternally(Links.links.changelogURL, true)}
        >
          <ListItemIcon>
            <ChangeLogIcon />
          </ListItemIcon>
          <ListItemText
            primary={i18n.t('core:whatsNew')}
            className={classes.listItem}
          />
        </ListItem>
        <ListItem
          onClick={() => openURLExternally(Links.links.webClipper, true)}
        >
          <ListItemIcon>
            <WebClipperIcon />
          </ListItemIcon>
          <ListItemText
            primary={i18n.t('core:webClipper')}
            className={classes.listItem}
          />
        </ListItem>
        <Divider />
        <ListItem
          onClick={() => openURLExternally(Links.links.suggestFeature, true)}
        >
          <ListItemIcon>
            <NewFeatureIcon />
          </ListItemIcon>
          <ListItemText
            primary={i18n.t('core:suggestNewFeatures')}
            className={classes.listItem}
          />
        </ListItem>
        <ListItem
          onClick={() => openURLExternally(Links.links.reportIssue, true)}
        >
          <ListItemIcon>
            <IssueIcon />
          </ListItemIcon>
          <ListItemText
            primary={i18n.t('core:reportIssues')}
            className={classes.listItem}
          />
        </ListItem>
        <ListItem
          onClick={() => openURLExternally(Links.links.helpTranslating, true)}
        >
          <ListItemIcon>
            <TranslationIcon />
          </ListItemIcon>
          <ListItemText
            primary={i18n.t('core:helpWithTranslation')}
            className={classes.listItem}
          />
        </ListItem>
        <Divider />
        <ListItem
          onClick={() => openURLExternally(Links.links.emailContact, true)}
        >
          <ListItemIcon>
            <EmailIcon />
          </ListItemIcon>
          <ListItemText
            primary={i18n.t('core:emailContact')}
            className={classes.listItem}
          />
        </ListItem>
        <ListItem onClick={() => openURLExternally(Links.links.twitter, true)}>
          <ListItemIcon>
            <TwitterIcon />
          </ListItemIcon>
          <ListItemText
            primary={i18n.t('core:followOnTwitter')}
            className={classes.listItem}
          />
        </ListItem>
      </List>
    );
  }

  return (
    <div
      data-tid="WelcomePanelTID"
      style={{
        overflow: 'hidden',
        position: 'relative',
        paddingLeft: 20,
        height: '100%'
      }}
    >
      <div
        style={{
          backgroundColor: theme.palette.background.default,
          backgroundImage: 'url(' + WelcomeBackground + ')',
          backgroundRepeat: 'repeat',
          opacity: '0.4',
          position: 'absolute',
          left: 0,
          top: 0,
          width: '100%',
          height: '100%'
        }}
      />
      <Grid
        style={{
          position: 'relative',
          height: '100%'
        }}
        container
        spacing={3}
      >
        <Grid
          item
          xs="auto"
          style={{ height: '100%', zIndex: 1, minWidth: 300 }}
        >
          {renderQuickLinks()}
        </Grid>
        {desktopMode && (
          <Grid item xs="auto" style={{ height: '100%' }}>
            <div
              style={{
                margin: 'auto',
                marginTop: 15,
                marginBottom: 15,
                // @ts-ignore
                overflowY: 'overlay',
                height: 'calc(100% - 50px)',
                backgroundColor: theme.palette.background.default
              }}
            >
              <HowToStart />
            </div>
          </Grid>
        )}
        {Pro && (
          <Grid item xs="auto" style={{ height: '100%', minWidth: 330 }}>
            <div
              style={{
                margin: 'auto',
                marginTop: 15,
                marginBottom: 15,
                // @ts-ignore
                overflowY: 'overlay',
                height: 'calc(100% - 50px)',
                backgroundColor: theme.palette.background.default
              }}
            >
              {renderRecentItems()}
            </div>
          </Grid>
        )}
      </Grid>
    </div>
  );
}

export default withStyles(styles, { withTheme: true })(WelcomePanel);

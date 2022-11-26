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
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import withStyles from '@mui/styles/withStyles';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Grid from '@mui/material/Grid';
import Divider from '@mui/material/Divider';
import ChangeLogIcon from '@mui/icons-material/ImportContacts';
import WebClipperIcon from '@mui/icons-material/Transform';
import EmailIcon from '@mui/icons-material/Email';
import IssueIcon from '@mui/icons-material/BugReport';
import TranslationIcon from '@mui/icons-material/Translate';
import NewFeatureIcon from '@mui/icons-material/Gesture';
import TwitterIcon from '@mui/icons-material/Twitter';
import WelcomeBackground from '../assets/images/background.png';
import WelcomeLogo from '../assets/images/welcome-logo.png';
import {
  CreateFileIcon,
  LocalLocationIcon,
  OpenLinkIcon,
  KeyShortcutsIcon,
  HelpIcon
} from '-/components/CommonIcons';
import { actions as AppActions, getCurrentLocationId } from '../reducers/app';
import i18n from '../services/i18n';
import {
  isFirstRun,
  getDesktopMode,
  actions as SettingsActions
} from '../reducers/settings';
import Links from '../links';
import { Pro } from '-/pro';
import { TS } from '-/tagspaces.namespace';
import { renderHistory } from '-/components/RenderHistory';
import Typography from '@mui/material/Typography';

interface Props {
  theme: any;
  classes: any;
  toggleCreateFileDialog: () => void;
  toggleLocationDialog: () => void;
  toggleOpenLinkDialog: () => void;
  toggleKeysDialog: () => void;
  openURLExternally: (url: string, skipConfirmation?: boolean) => void;
  toggleAboutDialog: () => void;
  isDesktopMode: boolean;
  openFsEntry: (fsEntry: TS.FileSystemEntry) => void;
  openLink: (url: string, options: any) => void;
  openLocationById: (locationId: string) => void;
  currentLocationId: string;
}

const styles: any = (theme: any) => ({
  listItem: {
    color: theme.palette.text.primary,
    textTransform: 'uppercase'
  },
  recentTitle: {
    color: theme.palette.text.primary,
    textTransform: 'uppercase',
    textAlign: 'center'
  }
});

function WelcomePanel(props: Props) {
  const {
    theme,
    classes,
    currentLocationId,
    openLink,
    openLocationById,
    openFsEntry,
    openURLExternally,
    toggleKeysDialog,
    toggleCreateFileDialog,
    toggleLocationDialog,
    toggleOpenLinkDialog,
    isDesktopMode
  } = props;
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

  function triggerOpenLocation() {
    const button = document.getElementById(
      isDesktopMode ? 'locationMenuButton' : 'mobileMenuButton'
    );
    button.click();
  }

  return (
    <div
      style={{
        overflow: 'hidden',
        position: 'relative',
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
        <Grid item xs={isDesktopMode ? 4 : 12} style={{ height: '100%' }}>
          <List
            dense={false}
            component="nav"
            aria-label="main help area"
            style={{
              width: 300,
              height: 'calc(100% - 70px)',
              margin: 'auto',
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
              onClick={props.toggleAboutDialog}
            >
              <img src={WelcomeLogo} alt="Organize your files" />
            </div>
            <ListItem button onClick={triggerOpenLocation}>
              <ListItemIcon>
                <LocalLocationIcon />
              </ListItemIcon>
              <ListItemText
                primary={i18n.t('chooseLocation')}
                className={classes.listItem}
              />
            </ListItem>
            <ListItem button onClick={toggleCreateFileDialog}>
              <ListItemIcon>
                <CreateFileIcon />
              </ListItemIcon>
              <ListItemText
                primary={i18n.t('createFileTitle')}
                className={classes.listItem}
              />
            </ListItem>
            <ListItem button onClick={toggleLocationDialog}>
              <ListItemIcon>
                <LocalLocationIcon />
              </ListItemIcon>
              <ListItemText
                primary={i18n.t('createLocationTitle')}
                className={classes.listItem}
              />
            </ListItem>
            <ListItem button onClick={toggleOpenLinkDialog}>
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
              button
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
            <ListItem button onClick={toggleKeysDialog}>
              <ListItemIcon>
                <KeyShortcutsIcon />
              </ListItemIcon>
              <ListItemText
                primary={i18n.t('shortcutKeys')}
                className={classes.listItem}
              />
            </ListItem>
            <ListItem
              button
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
              button
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
              button
              onClick={() =>
                openURLExternally(Links.links.suggestFeature, true)
              }
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
              button
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
              button
              onClick={() =>
                openURLExternally(Links.links.helpTranslating, true)
              }
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
              button
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
            <ListItem
              button
              onClick={() => openURLExternally(Links.links.twitter, true)}
            >
              <ListItemIcon>
                <TwitterIcon />
              </ListItemIcon>
              <ListItemText
                primary={i18n.t('core:followOnTwitter')}
                className={classes.listItem}
              />
            </ListItem>
          </List>
        </Grid>
        {isDesktopMode && (
          <>
            <Grid item xs={4} style={{ height: '100%' }}>
              <div
                style={{
                  width: 300,
                  margin: 'auto',
                  marginTop: 15,
                  marginBottom: 15,
                  // @ts-ignore
                  overflowY: 'overlay',
                  height: 'calc(100% - 50px)',
                  backgroundColor: theme.palette.background.default
                }}
              >
                <div>
                  <Typography
                    variant="inherit"
                    style={{
                      paddingTop: 20
                    }}
                    className={classes.recentTitle}
                    noWrap
                  >
                    {i18n.t('How to start')}
                  </Typography>
                  <div style={{ height: 400 }}></div>
                </div>
              </div>
            </Grid>
            <Grid item xs={4} style={{ height: '100%' }}>
              <div
                style={{
                  width: 300,
                  margin: 'auto',
                  marginTop: 15,
                  marginBottom: 15,
                  // @ts-ignore
                  overflowY: 'overlay',
                  height: 'calc(100% - 50px)',
                  backgroundColor: theme.palette.background.default
                }}
              >
                <div>
                  {fileOpenHistoryItems && (
                    <>
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
                      <List>
                        {renderHistory(
                          historyKeys.fileOpenKey,
                          fileOpenHistoryItems,
                          forceUpdate,
                          currentLocationId,
                          openLink,
                          openLocationById,
                          openFsEntry,
                          maxRecentItems,
                          showDelete
                        )}
                      </List>
                    </>
                  )}
                  {fileEditHistoryItems && (
                    <>
                      <Typography
                        variant="inherit"
                        className={classes.recentTitle}
                        noWrap
                      >
                        {i18n.t('core:fileEditHistory')}
                      </Typography>
                      <List>
                        {renderHistory(
                          historyKeys.fileEditKey,
                          fileEditHistoryItems,
                          forceUpdate,
                          props.currentLocationId,
                          props.openLink,
                          props.openLocationById,
                          props.openFsEntry,
                          maxRecentItems,
                          showDelete
                        )}
                      </List>
                    </>
                  )}
                  {folderOpenHistoryItems && (
                    <>
                      <Typography
                        variant="inherit"
                        className={classes.recentTitle}
                        noWrap
                      >
                        {i18n.t('core:folderOpenHistory')}
                      </Typography>
                      <List>
                        {renderHistory(
                          historyKeys.folderOpenKey,
                          folderOpenHistoryItems,
                          forceUpdate,
                          props.currentLocationId,
                          props.openLink,
                          props.openLocationById,
                          props.openFsEntry,
                          maxRecentItems,
                          showDelete
                        )}
                      </List>
                    </>
                  )}
                </div>
              </div>
            </Grid>
          </>
        )}
      </Grid>
    </div>
  );
}

function mapStateToProps(state) {
  return {
    isFirstRun: isFirstRun(state),
    isDesktopMode: getDesktopMode(state),
    currentLocationId: getCurrentLocationId(state)
  };
}

function mapActionCreatorsToProps(dispatch) {
  return bindActionCreators(
    {
      setFirstRun: SettingsActions.setFirstRun,
      toggleCreateFileDialog: AppActions.toggleCreateFileDialog,
      toggleLocationDialog: AppActions.toggleLocationDialog,
      toggleOpenLinkDialog: AppActions.toggleOpenLinkDialog,
      openURLExternally: AppActions.openURLExternally,
      toggleKeysDialog: AppActions.toggleKeysDialog,
      toggleAboutDialog: AppActions.toggleAboutDialog,
      openFsEntry: AppActions.openFsEntry,
      openLink: AppActions.openLink,
      openLocationById: AppActions.openLocationById
    },
    dispatch
  );
}

export default connect(
  mapStateToProps,
  mapActionCreatorsToProps
)(withStyles(styles, { withTheme: true })(WelcomePanel));

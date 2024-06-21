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

import React, { useContext, useReducer } from 'react';
import { useSelector, useDispatch } from 'react-redux';
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
import XIcon from '@mui/icons-material/X';
import WelcomeBackground from '-/assets/images/background.png';
import WelcomeLogo from '-/assets/images/welcome-logo.png';
import {
  CreateFileIcon,
  LocalLocationIcon,
  OpenLinkIcon,
  KeyShortcutsIcon,
  HelpIcon,
} from '-/components/CommonIcons';
import { actions as AppActions, AppDispatch } from '-/reducers/app';
import { getDesktopMode } from '-/reducers/settings';
import Links from 'assets/links';
import { Pro } from '-/pro';
import { TS } from '-/tagspaces.namespace';
import HowToStart from '-/components/HowToStart';
import { openURLExternally } from '-/services/utils-io';
import { styled, useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import RenderHistory from '-/components/RenderHistory';
import { useCreateEditLocationDialogContext } from '-/components/dialogs/hooks/useCreateEditLocationDialogContext';
import { useNewFileDialogContext } from '-/components/dialogs/hooks/useNewFileDialogContext';
import { useAboutDialogContext } from '-/components/dialogs/hooks/useAboutDialogContext';
import { useKeyboardDialogContext } from '-/components/dialogs/hooks/useKeyboardDialogContext';
import { useLinkDialogContext } from '-/components/dialogs/hooks/useLinkDialogContext';

const PREFIX = 'WelcomePanel';

const classes = {
  listItem: `${PREFIX}-listItem`,
  recentTitle: `${PREFIX}-recentTitle`,
  noRecentItems: `${PREFIX}-noRecentItems`,
};

const Root = styled('div')(({ theme }) => ({
  [`& .${classes.listItem}`]: {
    color: theme.palette.text.primary,
    marginTop: 5,
  },
  [`& .${classes.listItem} .MuiListItemText-primary`]: {
    fontSize: '1rem',
  },
  [`& .${classes.recentTitle}`]: {
    color: theme.palette.text.primary,
    textAlign: 'center',
  },
  [`& .${classes.noRecentItems}`]: {
    color: theme.palette.text.primary,
    padding: 30,
    alignSelf: 'center',
  },
}));

function WelcomePanel() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { openCreateEditLocationDialog } = useCreateEditLocationDialogContext();
  const { openNewFileDialog } = useNewFileDialogContext();
  const { openAboutDialog } = useAboutDialogContext();
  const { openKeyboardDialog } = useKeyboardDialogContext();
  const { openLinkDialog } = useLinkDialogContext();
  const historyContext = Pro?.contextProviders?.HistoryContext
    ? useContext<TS.HistoryContextData>(Pro.contextProviders.HistoryContext)
    : undefined;
  const desktopMode = useSelector(getDesktopMode);

  const [ignored, forceUpdate] = useReducer((x) => x + 1, 0, undefined);

  const historyKeys = Pro ? Pro.keys.historyKeys : {};
  const fileOpenHistoryItems: Array<TS.HistoryItem> = Pro
    ? historyContext.fileOpenHistory
    : [];
  const fileEditHistoryItems: Array<TS.HistoryItem> = Pro
    ? historyContext.fileEditHistory
    : [];
  const folderOpenHistoryItems: Array<TS.HistoryItem> = Pro
    ? historyContext.folderOpenHistory
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
            paddingTop: 20,
          }}
          className={classes.recentTitle}
          noWrap
        >
          {t('core:fileOpenHistory')}
        </Typography>
        {fileOpenHistoryItems ? (
          <List>
            <RenderHistory
              historyKey={historyKeys.fileOpenKey}
              items={fileOpenHistoryItems}
              update={forceUpdate}
              maxItems={maxRecentItems}
              showDelete={showDelete}
            />
          </List>
        ) : (
          <Typography className={classes.noRecentItems} variant="caption">
            {t('noItems')}
          </Typography>
        )}
        <Typography variant="inherit" className={classes.recentTitle} noWrap>
          {t('core:fileEditHistory')}
        </Typography>
        {fileEditHistoryItems ? (
          <List>
            <RenderHistory
              historyKey={historyKeys.fileEditKey}
              items={fileEditHistoryItems}
              update={forceUpdate}
              maxItems={maxRecentItems}
              showDelete={showDelete}
            />
          </List>
        ) : (
          <Typography className={classes.noRecentItems} variant="caption">
            {t('noItems')}
          </Typography>
        )}
        <Typography variant="inherit" className={classes.recentTitle} noWrap>
          {t('core:folderOpenHistory')}
        </Typography>
        {folderOpenHistoryItems ? (
          <List>
            <RenderHistory
              historyKey={historyKeys.folderOpenKey}
              items={folderOpenHistoryItems}
              update={forceUpdate}
              maxItems={maxRecentItems}
              showDelete={showDelete}
            />
          </List>
        ) : (
          <Typography className={classes.noRecentItems} variant="caption">
            {t('noItems')}
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
          overflowY: 'auto',
          overflowX: 'hidden',
          backgroundColor: theme.palette.background.default,
        }}
      >
        <div
          role="button"
          aria-hidden="true"
          tabIndex={0}
          onClick={() => openAboutDialog()}
        >
          <img src={WelcomeLogo} alt="Organize your files" />
        </div>
        {/* <ListItem onClick={triggerOpenLocation}>
          <ListItemIcon>
            <LocalLocationIcon />
          </ListItemIcon>
          <ListItemText
            primary={t('core:chooseLocation')}
            className={classes.listItem}
          />
        </ListItem> */}
        <ListItem onClick={() => openNewFileDialog()}>
          <ListItemIcon>
            <CreateFileIcon />
          </ListItemIcon>
          <ListItemText
            primary={t('core:create')}
            className={classes.listItem}
          />
        </ListItem>
        <ListItem onClick={() => openCreateEditLocationDialog()}>
          <ListItemIcon>
            <LocalLocationIcon />
          </ListItemIcon>
          <ListItemText
            primary={t('createLocationTitle')}
            className={classes.listItem}
          />
        </ListItem>
        <ListItem onClick={() => openLinkDialog()}>
          <ListItemIcon>
            <OpenLinkIcon />
          </ListItemIcon>
          <ListItemText primary={t('openLink')} className={classes.listItem} />
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
            primary={t('documentation')}
            className={classes.listItem}
          />
        </ListItem>
        <ListItem onClick={() => openKeyboardDialog()}>
          <ListItemIcon>
            <KeyShortcutsIcon />
          </ListItemIcon>
          <ListItemText
            primary={t('shortcutKeys')}
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
            primary={t('core:whatsNew')}
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
            primary={t('core:webClipper')}
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
            primary={t('core:suggestNewFeatures')}
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
            primary={t('core:reportIssues')}
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
            primary={t('core:helpWithTranslation')}
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
            primary={t('core:emailContact')}
            className={classes.listItem}
          />
        </ListItem>
        <ListItem onClick={() => openURLExternally(Links.links.twitter, true)}>
          <ListItemIcon>
            <XIcon />
          </ListItemIcon>
          <ListItemText
            primary={t('core:followOnX')}
            className={classes.listItem}
          />
        </ListItem>
      </List>
    );
  }

  return (
    <Root
      data-tid="WelcomePanelTID"
      style={{
        overflow: 'hidden',
        position: 'relative',
        paddingLeft: 20,
        height: '100%',
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
          height: '100%',
        }}
      />
      <Grid
        style={{
          position: 'relative',
          height: '100%',
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
                overflowY: 'auto',
                height: 'calc(100% - 50px)',
                backgroundColor: theme.palette.background.default,
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
                overflowY: 'auto',
                height: 'calc(100% - 50px)',
                backgroundColor: theme.palette.background.default,
              }}
            >
              {renderRecentItems()}
            </div>
          </Grid>
        )}
      </Grid>
    </Root>
  );
}

export default WelcomePanel;

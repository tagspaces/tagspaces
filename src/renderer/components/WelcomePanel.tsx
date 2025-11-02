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

import {
  ChangeLogIcon,
  CreateFileIcon,
  EmailIcon,
  HelpIcon,
  IssueIcon,
  KeyShortcutsIcon,
  LocalLocationIcon,
  MastodonIcon,
  NewFeatureIcon,
  OpenLinkIcon,
  TranslationIcon,
  WebClipperIcon,
  XIcon,
} from '-/components/CommonIcons';
import HowToStart from '-/components/HowToStart';
import RenderHistory from '-/components/RenderHistory';
import { useCreateEditLocationDialogContext } from '-/components/dialogs/hooks/useCreateEditLocationDialogContext';
import { useKeyboardDialogContext } from '-/components/dialogs/hooks/useKeyboardDialogContext';
import { useLinkDialogContext } from '-/components/dialogs/hooks/useLinkDialogContext';
import { useNewFileDialogContext } from '-/components/dialogs/hooks/useNewFileDialogContext';
import { historyKeys } from '-/hooks/HistoryContextProvider';
import { useHistoryContext } from '-/hooks/useHistoryContext';
import { getDesktopMode } from '-/reducers/settings';
import { openURLExternally } from '-/services/utils-io';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import { styled, useTheme } from '@mui/material/styles';
import Links from 'assets/links';
import { useReducer } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

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
  const { openKeyboardDialog } = useKeyboardDialogContext();
  const { openLinkDialog } = useLinkDialogContext();
  const { fileOpenHistory, fileEditHistory, folderOpenHistory } =
    useHistoryContext();
  const desktopMode = useSelector(getDesktopMode);

  const [ignored, forceUpdate] = useReducer((x) => x + 1, 0, undefined);

  const showMenu = false;
  const maxRecentItems = 5;

  function renderRecentItems() {
    return (
      <Box style={{ display: 'flex', flexDirection: 'column' }}>
        <Typography variant="inherit" className={classes.recentTitle} noWrap>
          {t('core:fileOpenHistory')}
        </Typography>
        {fileOpenHistory ? (
          <List>
            <RenderHistory
              historyKey={historyKeys.fileOpenKey}
              items={fileOpenHistory}
              update={forceUpdate}
              maxItems={maxRecentItems}
              showMenu={showMenu}
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
        {fileEditHistory ? (
          <List>
            <RenderHistory
              historyKey={historyKeys.fileEditKey}
              items={fileEditHistory}
              update={forceUpdate}
              maxItems={maxRecentItems}
              showMenu={showMenu}
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
        {folderOpenHistory ? (
          <List>
            <RenderHistory
              historyKey={historyKeys.folderOpenKey}
              items={folderOpenHistory}
              update={forceUpdate}
              maxItems={maxRecentItems}
              showMenu={showMenu}
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
        dense
        aria-label="useful links in the welcome page"
        sx={{
          height: 'calc(100% - 70px)',
          marginTop: '45px',
          marginBottom: '15px',
          overflowY: 'auto',
          overflowX: 'hidden',
          backgroundColor: theme.palette.background.default,
        }}
      >
        <ListItem disablePadding>
          <ListItemButton onClick={() => openNewFileDialog()}>
            <ListItemIcon>
              <CreateFileIcon />
            </ListItemIcon>
            <ListItemText
              primary={t('core:create')}
              className={classes.listItem}
            />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton onClick={openCreateEditLocationDialog}>
            <ListItemIcon>
              <LocalLocationIcon />
            </ListItemIcon>
            <ListItemText
              primary={t('createLocationTitle')}
              className={classes.listItem}
            />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton onClick={openLinkDialog}>
            <ListItemIcon>
              <OpenLinkIcon />
            </ListItemIcon>
            <ListItemText
              primary={t('openLink')}
              className={classes.listItem}
            />
          </ListItemButton>
        </ListItem>
        <Divider />
        <ListItem disablePadding>
          <ListItemButton
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
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton onClick={openKeyboardDialog}>
            <ListItemIcon>
              <KeyShortcutsIcon />
            </ListItemIcon>
            <ListItemText
              primary={t('shortcutKeys')}
              className={classes.listItem}
            />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => openURLExternally(Links.links.changelogURL, true)}
          >
            <ListItemIcon>
              <ChangeLogIcon />
            </ListItemIcon>
            <ListItemText
              primary={t('core:whatsNew')}
              className={classes.listItem}
            />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => openURLExternally(Links.links.webClipper, true)}
          >
            <ListItemIcon>
              <WebClipperIcon />
            </ListItemIcon>
            <ListItemText
              primary={t('core:webClipper')}
              className={classes.listItem}
            />
          </ListItemButton>
        </ListItem>
        <Divider />
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => openURLExternally(Links.links.suggestFeature, true)}
          >
            <ListItemIcon>
              <NewFeatureIcon />
            </ListItemIcon>
            <ListItemText
              primary={t('core:suggestNewFeatures')}
              className={classes.listItem}
            />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => openURLExternally(Links.links.reportIssue, true)}
          >
            <ListItemIcon>
              <IssueIcon />
            </ListItemIcon>
            <ListItemText
              primary={t('core:reportIssues')}
              className={classes.listItem}
            />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => openURLExternally(Links.links.helpTranslating, true)}
          >
            <ListItemIcon>
              <TranslationIcon />
            </ListItemIcon>
            <ListItemText
              primary={t('core:helpWithTranslation')}
              className={classes.listItem}
            />
          </ListItemButton>
        </ListItem>
        <Divider />
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => openURLExternally(Links.links.emailContact, true)}
          >
            <ListItemIcon>
              <EmailIcon />
            </ListItemIcon>
            <ListItemText
              primary={t('core:emailContact')}
              className={classes.listItem}
            />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => openURLExternally(Links.links.mastodon, true)}
          >
            <ListItemIcon>
              <MastodonIcon color="action" />
            </ListItemIcon>
            <ListItemText
              primary={t('core:followOnMastodon')}
              className={classes.listItem}
            />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => openURLExternally(Links.links.twitter, true)}
          >
            <ListItemIcon>
              <XIcon />
            </ListItemIcon>
            <ListItemText
              primary={t('core:followOnX')}
              className={classes.listItem}
            />
          </ListItemButton>
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
      <Grid
        style={{
          position: 'relative',
          height: '100%',
        }}
        container
        spacing={2}
      >
        <Grid style={{ height: '100%', zIndex: 1, minWidth: 300 }}>
          {renderQuickLinks()}
        </Grid>
        {desktopMode && (
          <Grid style={{ height: '100%' }}>
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
        <Grid style={{ height: '100%', minWidth: 300 }}>
          <div
            style={{
              margin: 'auto',
              marginTop: 55,
              marginBottom: 15,
              overflowY: 'auto',
              height: 'calc(100% - 50px)',
              backgroundColor: theme.palette.background.default,
            }}
          >
            {renderRecentItems()}
          </div>
        </Grid>
      </Grid>
    </Root>
  );
}

export default WelcomePanel;

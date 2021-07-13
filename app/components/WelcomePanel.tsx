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

import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Divider from '@material-ui/core/Divider';
import DocumentationIcon from '@material-ui/icons/Help';
import LocationIcon from '@material-ui/icons/WorkOutline';
import ChangeLogIcon from '@material-ui/icons/ImportContacts';
import WebClipperIcon from '@material-ui/icons/Transform';
import EmailIcon from '@material-ui/icons/Email';
import IssueIcon from '@material-ui/icons/BugReport';
import TranslationIcon from '@material-ui/icons/Translate';
import NewFeatureIcon from '@material-ui/icons/Gesture';
import SocialIcon from '@material-ui/icons/ThumbUp';
import Social2Icon from '@material-ui/icons/Mood';
import KeyShortcutsIcon from '@material-ui/icons/Keyboard';
import WelcomeBackground from '../assets/images/background.png';
import WelcomeLogo from '../assets/images/welcome-logo.png';
import { actions as AppActions } from '../reducers/app';
import i18n from '../services/i18n';
import {
  isFirstRun,
  getDesktopMode,
  actions as SettingsActions
} from '../reducers/settings';
import Links from '../links';

const styles: any = (theme: any) => ({
  mainPanel: {
    flex: '1 1 100%',
    width: '100%',
    height: '100%',
    overflowY: 'hidden',
    backgroundColor: theme.palette.background.default,
    backgroundImage: 'url(' + WelcomeBackground + ')',
    backgroundRepeat: 'repeat',
    opacity: '0.4'
  },
  slogan: {
    top: '45%',
    width: '100%',
    textAlign: 'center',
    position: 'absolute'
  },
  links: {
    width: 300,
    height: 'calc(100% - 100px)',
    margin: 'auto',
    marginTop: 15,
    marginBottom: 15,
    overflowY: 'overlay',
    backgroundColor: theme.palette.background.default
  }
});

interface Props {
  classes: any;
  toggleKeysDialog: () => void;
  openURLExternally: (url: string, skipConfirmation?: boolean) => void;
  toggleAboutDialog: () => void;
  isDesktopMode: boolean;
}

const WelcomePanel = (props: Props) => {
  const { classes, openURLExternally, toggleKeysDialog, isDesktopMode } = props;
  return (
    <div className={classes.mainPanel}>
      <List
        dense={false}
        component="nav"
        aria-label="main help area"
        className={classes.links}
      >
        <div
          role="button"
          aria-hidden="true"
          tabIndex={0}
          onClick={props.toggleAboutDialog}
        >
          <img src={WelcomeLogo} alt="Organize your files" />
        </div>
        <ListItem
          button
          onClick={() => {
            const button = document.getElementById(
              isDesktopMode ? 'locationMenuButton' : 'mobileMenuButton'
            );
            button.click();
          }}
        >
          <Button startIcon={<LocationIcon />}>
            {i18n.t('core:chooseLocation')}
          </Button>
        </ListItem>
        <ListItem
          button
          onClick={() =>
            openURLExternally(Links.documentationLinks.general, true)
          }
        >
          <Button startIcon={<DocumentationIcon />}>Open Documentation</Button>
        </ListItem>
        <ListItem button onClick={() => toggleKeysDialog()}>
          <Button startIcon={<KeyShortcutsIcon />}>
            {i18n.t('core:shortcutKeys')}
          </Button>
        </ListItem>
        <ListItem
          button
          onClick={() => openURLExternally(Links.links.changelogURL, true)}
        >
          <Button
            startIcon={<ChangeLogIcon />}
            title="Opens the changelog of the app"
          >
            {i18n.t('core:whatsNew')}
          </Button>
        </ListItem>
        <ListItem
          button
          onClick={() => openURLExternally(Links.links.webClipper, true)}
        >
          <Button startIcon={<WebClipperIcon />}>
            {i18n.t('core:webClipper')}
          </Button>
        </ListItem>
        <Divider />
        <ListItem
          button
          onClick={() => openURLExternally(Links.links.suggestFeature, true)}
        >
          <Button startIcon={<NewFeatureIcon />}>
            {i18n.t('core:suggestNewFeatures')}
          </Button>
        </ListItem>
        <ListItem
          button
          onClick={() => openURLExternally(Links.links.reportIssue, true)}
        >
          <Button startIcon={<IssueIcon />}>
            {i18n.t('core:reportIssues')}
          </Button>
        </ListItem>
        <ListItem
          button
          onClick={() => openURLExternally(Links.links.helpTranslating)}
        >
          <Button startIcon={<TranslationIcon />}>
            {i18n.t('core:helpWithTranslation')}
          </Button>
        </ListItem>
        <Divider />
        <ListItem
          button
          onClick={() => openURLExternally(Links.links.emailContact, true)}
        >
          <Button startIcon={<EmailIcon />}>
            {i18n.t('core:emailContact')}
          </Button>
        </ListItem>
        <ListItem button onClick={() => openURLExternally(Links.links.twitter)}>
          <Button startIcon={<Social2Icon />}>
            {i18n.t('core:followOnTwitter')}
          </Button>
        </ListItem>
        <ListItem
          button
          onClick={() => openURLExternally(Links.links.facebook)}
        >
          <Button startIcon={<SocialIcon />}>
            {i18n.t('core:likeUsOnFacebook')}
          </Button>
        </ListItem>
        {/* {AppConfig.isWeb && (
          <ListItem
            button
            onClick={() => {
              // @ts-ignore
              const newHref = window.location.href.replace(
                'http://',
                'http://' +
                  new Date().getTime() +
                  ':' +
                  new Date().getTime() +
                  '@'
              );
              // @ts-ignore
              window.location.href = newHref;
            }}
          >
            <Button startIcon={<LogoutIcon />}>{i18n.t('core:Logout')}</Button>
          </ListItem>
        )} */}
      </List>
    </div>
  );
};

function mapStateToProps(state) {
  return {
    isFirstRun: isFirstRun(state),
    isDesktopMode: getDesktopMode(state)
  };
}

function mapActionCreatorsToProps(dispatch) {
  return bindActionCreators(
    {
      setFirstRun: SettingsActions.setFirstRun,
      openURLExternally: AppActions.openURLExternally,
      toggleKeysDialog: AppActions.toggleKeysDialog,
      toggleAboutDialog: AppActions.toggleAboutDialog
    },
    dispatch
  );
}

export default connect(
  mapStateToProps,
  mapActionCreatorsToProps
)(withStyles(styles)(WelcomePanel));

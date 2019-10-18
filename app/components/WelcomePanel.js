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
 * @flow
 */

import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withStyles } from '@material-ui/core/styles';
import HelpFeedbackPanel from './HelpFeedbackPanel';
import WelcomeLogo from '../assets/images/welcome-logo.png';
import WelcomeBackground from '../assets/images/background.png';
// import i18n from '../services/i18n';
// import { getLocations, type Location } from '../reducers/locations';
import classNames from 'classnames';
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Divider from '@material-ui/core/Divider';
import DocumentationIcon from '@material-ui/icons/Help';
import ChangeLogIcon from '@material-ui/icons/ImportContacts';
import OnboardingIcon from '@material-ui/icons/Explore';
import WebClipperIcon from '@material-ui/icons/Transform';
import EmailIcon from '@material-ui/icons/Email';
import IssueIcon from '@material-ui/icons/BugReport';
import TranslationIcon from '@material-ui/icons/Translate';
import NewFeatureIcon from '@material-ui/icons/Gesture';
import SocialIcon from '@material-ui/icons/ThumbUp';
import Social2Icon from '@material-ui/icons/Mood';
import KeyShortcutsIcon from '@material-ui/icons/Keyboard';
import { actions as AppActions } from '../reducers/app';
import i18n from '../services/i18n';
import {
  isFirstRun,
  actions as SettingsActions
} from '../reducers/settings';
import AppConfig from '../config';

const styles = theme => ({
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
    position: 'absolute',
  },
  links: {
    width: 300,
    margin: 'auto',    
    marginTop: 40,
    backgroundColor: theme.palette.background.default,
  }  
});

type Props = {
  classes: Object,
  setFirstRun: (isFirstRun: boolean) => void,
  toggleKeysDialog: () => void,
  openURLExternally: (url: string) => void,
  openFileNatively: (url: string) => void
  // locations: Array<Location>
};

const WelcomePanel = (props: Props) => {
  const { classes, openURLExternally, openFileNatively, toggleKeysDialog } = props;
  return (
    <div className={classes.mainPanel}>
      {/* <div className={classes.slogan}>

      </div> */}
      <List dense={false} component="nav" aria-label="main help area" className={classes.links}>
         <img
          src={WelcomeLogo}
          alt="Organize your files"
          onClick={() => { props.setFirstRun(!props.isFirstRun) }}
        />        
        <ListItem button onClick={() => openURLExternally(AppConfig.documentationLinks.general)}>
          <ListItemIcon>
            <DocumentationIcon />
          </ListItemIcon>
          <ListItemText primary="Open Documentation" />
        </ListItem>
        <ListItem button onClick={() => toggleKeysDialog()}>
          <ListItemIcon>
            <KeyShortcutsIcon />
          </ListItemIcon>
          <ListItemText primary={i18n.t('core:shortcutKeys')} title="" />
        </ListItem>
        <ListItem button onClick={() => openURLExternally(AppConfig.links.changelogURL)}>
          <ListItemIcon>
            <ChangeLogIcon />
          </ListItemIcon>
          <ListItemText primary={i18n.t('core:whatsNew')} title="Opens the changelog of the app" />
        </ListItem>
        {/* <ListItem button onClick={() => toggleOnboardingDialog()}>
          <ListItemIcon>
            <OnboardingIcon />
          </ListItemIcon>
          <ListItemText primary={i18n.t('core:onboardingWizard')} />
        </ListItem> */}
        <ListItem button onClick={() => openURLExternally(AppConfig.links.webClipper)}>
          <ListItemIcon>
            <WebClipperIcon />
          </ListItemIcon>
          <ListItemText primary={i18n.t('core:webClipper')} />
        </ListItem>
        <Divider />
        <ListItem button onClick={() => openURLExternally(AppConfig.links.suggestFeature)}>
          <ListItemIcon>
            <NewFeatureIcon />
          </ListItemIcon>
          <ListItemText primary={i18n.t('core:suggestNewFeatures')} />
        </ListItem>
        <ListItem button onClick={() => openURLExternally(AppConfig.links.reportIssue)}>
          <ListItemIcon>
            <IssueIcon />
          </ListItemIcon>
          <ListItemText primary={i18n.t('core:reportIssues')} />
        </ListItem>
        <ListItem button onClick={() => openURLExternally(AppConfig.links.helpTranslating)}>
          <ListItemIcon>
            <TranslationIcon />
          </ListItemIcon>
          <ListItemText primary={i18n.t('core:helpWithTranslation')} />
        </ListItem>
        <Divider />
        <ListItem button onClick={() => openURLExternally(AppConfig.links.emailContact)}>
          <ListItemIcon>
            <EmailIcon />
          </ListItemIcon>
          <ListItemText primary={i18n.t('core:emailContact')} />
        </ListItem>
        <ListItem button onClick={() => openFileNatively(AppConfig.links.twitter)}>
          <ListItemIcon>
            <Social2Icon />
          </ListItemIcon>
          <ListItemText primary={i18n.t('core:followOnTwitter')} />
        </ListItem>
        <ListItem button onClick={() => openURLExternally(AppConfig.links.facebook)}>
          <ListItemIcon>
            <SocialIcon />
          </ListItemIcon>
          <ListItemText primary={i18n.t('core:likeUsOnFacebook')} color="textPrimary" />
        </ListItem>
      </List>      
    </div>
  );
};

function mapStateToProps(state) {
  return {
    isFirstRun: isFirstRun(state),
    // locations: getLocations(state),
  };
}

function mapActionCreatorsToProps(dispatch) {
  return bindActionCreators(
    {
      setFirstRun: SettingsActions.setFirstRun,
      openURLExternally: AppActions.openURLExternally,
      openFileNatively: AppActions.openFileNatively,
      toggleKeysDialog: AppActions.toggleKeysDialog,
    },
    dispatch
  );
}

export default connect(mapStateToProps, mapActionCreatorsToProps)(
  withStyles(styles)(WelcomePanel)
);

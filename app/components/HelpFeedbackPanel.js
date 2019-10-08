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
import { withStyles } from '@material-ui/core/styles';
import classNames from 'classnames';
import Typography from '@material-ui/core/Typography';
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
import CustomLogo from './CustomLogo';
import styles from './SidePanels.css';
import AppConfig from '../config';
import i18n from '../services/i18n';
import { Pro } from '../pro';

type Props = {
  classes: Object,
  openFileNatively: (url: string) => void,
  toggleKeysDialog: () => void,
  toggleOnboardingDialog: () => void,
  toggleProTeaser: () => void,
  style: Object
};

class HelpFeedbackPanel extends React.Component<Props> {
  render() {
    const {
      classes,
      openFileNatively,
      toggleKeysDialog,
      toggleOnboardingDialog,
      toggleProTeaser
    } = this.props;

    return (
      <div className={classes.panel} style={this.props.style}>
        <CustomLogo />
        <Typography className={classNames(classes.panelTitle, classes.header)} type="subtitle1">Help & Feedback</Typography>
        <List dense={false} component="nav" aria-label="main mailbox folders">
          <ListItem button onClick={() => openFileNatively(AppConfig.documentationLinks.general)}>
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
          <ListItem button onClick={() => openFileNatively(AppConfig.links.changelogURL)}>
            <ListItemIcon>
              <ChangeLogIcon />
            </ListItemIcon>
            <ListItemText primary={i18n.t('core:whatsNew')} title="Opens the changelog of the app" />
          </ListItem>
          <ListItem button onClick={() => toggleOnboardingDialog()}>
            <ListItemIcon>
              <OnboardingIcon />
            </ListItemIcon>
            <ListItemText primary={i18n.t('core:onboardingWizard')} />
          </ListItem>
          <Divider />
          <ListItem button onClick={() => openFileNatively(AppConfig.links.suggestFeature)}>
            <ListItemIcon>
              <NewFeatureIcon />
            </ListItemIcon>
            <ListItemText primary={i18n.t('core:suggestNewFeatures')} />
          </ListItem>
          <ListItem button onClick={() => openFileNatively(AppConfig.links.reportIssue)}>
            <ListItemIcon>
              <IssueIcon />
            </ListItemIcon>
            <ListItemText primary={i18n.t('core:reportIssues')} />
          </ListItem>
          <ListItem button onClick={() => openFileNatively(AppConfig.links.helpTranslating)}>
            <ListItemIcon>
              <TranslationIcon />
            </ListItemIcon>
            <ListItemText primary={i18n.t('core:helpWithTranslation')} />
          </ListItem>
          <Divider />
          <ListItem button onClick={() => openFileNatively(AppConfig.links.emailContact)}>
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
          <ListItem button onClick={() => openFileNatively(AppConfig.links.facebook)}>
            <ListItemIcon>
              <SocialIcon />
            </ListItemIcon>
            <ListItemText primary={i18n.t('core:likeUsOnFacebook')} />
          </ListItem>
          <Divider />
          <ListItem button onClick={() => openFileNatively(AppConfig.links.webClipperChrome)}>
            <ListItemIcon>
              <WebClipperIcon />
            </ListItemIcon>
            <ListItemText primary={i18n.t('core:webClipperChrome')} />
          </ListItem>
          <ListItem button onClick={() => openFileNatively(AppConfig.links.webClipperFirefox)}>
            <ListItemIcon>
              <WebClipperIcon />
            </ListItemIcon>
            <ListItemText primary={i18n.t('core:webClipperFirefox')} />
          </ListItem>
          <Divider />
          <ListItem button onClick={() => toggleProTeaser()}>
            <ListItemIcon>
              <WebClipperIcon />
            </ListItemIcon>
            <ListItemText primary={i18n.t('core:proTeaser')} />
          </ListItem>
        </List>
      </div>
    );
  }
}

export default withStyles(styles)(HelpFeedbackPanel);

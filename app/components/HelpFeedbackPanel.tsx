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
import withStyles from '@mui/styles/withStyles';
import classNames from 'classnames';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import Divider from '@mui/material/Divider';
import DocumentationIcon from '@mui/icons-material/Help';
import AboutIcon from '@mui/icons-material/BlurOn';
import ChangeLogIcon from '@mui/icons-material/ImportContacts';
import OnboardingIcon from '@mui/icons-material/Explore';
import WebClipperIcon from '@mui/icons-material/Transform';
import EmailIcon from '@mui/icons-material/Email';
import CancelSubscriptionIcon from '@mui/icons-material/EventBusy';
import IssueIcon from '@mui/icons-material/BugReport';
import TranslationIcon from '@mui/icons-material/Translate';
import NewFeatureIcon from '@mui/icons-material/Gesture';
// import SocialIcon from '@mui/icons-material/ThumbUp';
import TwitterIcon from '@mui/icons-material/Twitter';
import KeyShortcutsIcon from '@mui/icons-material/Keyboard';
import ProTeaserIcon from '@mui/icons-material/FlightTakeoff';
import AppConfig from '@tagspaces/tagspaces-platforms/AppConfig';
import styles from './SidePanels.css';
import i18n from '../services/i18n';
import Links from '-/links';
import { connect } from 'react-redux';
import { getCurrentLanguage } from '-/reducers/settings';

interface Props {
  classes?: any;
  theme?: any;
  openURLExternally: (url: string, skipConfirmation?: boolean) => void;
  toggleAboutDialog?: () => void;
  toggleKeysDialog: () => void;
  toggleOnboardingDialog: () => void;
  toggleProTeaser: () => void;
  style?: any;
  reduceHeightBy?: number;
}

function HelpFeedbackPanel(props: Props) {
  const {
    classes,
    openURLExternally,
    toggleAboutDialog,
    toggleKeysDialog,
    toggleOnboardingDialog,
    toggleProTeaser,
    theme,
    reduceHeightBy
  } = props;

  return (
    <div
      className={classes.panel}
      style={{
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <div className={classes.toolbar}>
        <Typography
          className={classNames(classes.panelTitle, classes.header)}
          variant="subtitle1"
          style={{ paddingLeft: 14 }}
        >
          {i18n.t('core:helpFeedback')}
        </Typography>
      </div>
      <List
        dense={false}
        component="nav"
        aria-label="main help area"
        style={{
          height: 'calc(100% - ' + reduceHeightBy + 'px)',
          // @ts-ignore
          overflowY: AppConfig.isFirefox ? 'auto' : 'overlay'
        }}
      >
        <ListItem
          button
          onClick={toggleAboutDialog}
          title="Opens the about dialog"
          data-tid="aboutDialog"
        >
          <ListItemIcon>
            <AboutIcon />
          </ListItemIcon>
          <Typography style={{ color: theme.palette.text.primary }}>
            {i18n.t('core:aboutTitle')}
          </Typography>
        </ListItem>
        <ListItem
          button
          onClick={() =>
            openURLExternally(Links.documentationLinks.general, true)
          }
        >
          <ListItemIcon>
            <DocumentationIcon />
          </ListItemIcon>
          <Typography style={{ color: theme.palette.text.primary }}>
            {i18n.t('core:documentation')}
          </Typography>
        </ListItem>
        <ListItem button onClick={toggleKeysDialog}>
          <ListItemIcon>
            <KeyShortcutsIcon />
          </ListItemIcon>
          <Typography style={{ color: theme.palette.text.primary }}>
            {i18n.t('core:shortcutKeys')}
          </Typography>
        </ListItem>
        <ListItem
          button
          onClick={() => openURLExternally(Links.links.changelogURL, true)}
          title="Opens the changelog of the app"
        >
          <ListItemIcon>
            <ChangeLogIcon />
          </ListItemIcon>
          <Typography style={{ color: theme.palette.text.primary }}>
            {i18n.t('core:whatsNew')}
          </Typography>
        </ListItem>
        <ListItem button onClick={toggleOnboardingDialog}>
          <ListItemIcon>
            <OnboardingIcon />
          </ListItemIcon>
          <Typography style={{ color: theme.palette.text.primary }}>
            {i18n.t('core:onboardingWizard')}
          </Typography>
        </ListItem>
        <ListItem
          button
          onClick={() => openURLExternally(Links.links.webClipper, true)}
        >
          <ListItemIcon>
            <WebClipperIcon />
          </ListItemIcon>
          <Typography style={{ color: theme.palette.text.primary }}>
            {i18n.t('core:webClipper')}
          </Typography>
        </ListItem>
        <Divider />
        <ListItem
          button
          onClick={() => openURLExternally(Links.links.suggestFeature, true)}
        >
          <ListItemIcon>
            <NewFeatureIcon />
          </ListItemIcon>
          <Typography style={{ color: theme.palette.text.primary }}>
            {i18n.t('core:suggestNewFeatures')}
          </Typography>
        </ListItem>
        <ListItem
          button
          onClick={() => openURLExternally(Links.links.reportIssue, true)}
        >
          <ListItemIcon>
            <IssueIcon />
          </ListItemIcon>
          <Typography style={{ color: theme.palette.text.primary }}>
            {i18n.t('core:reportIssues')}
          </Typography>
        </ListItem>
        <ListItem
          button
          onClick={() => openURLExternally(Links.links.helpTranslating, true)}
        >
          <ListItemIcon>
            <TranslationIcon />
          </ListItemIcon>
          <Typography style={{ color: theme.palette.text.primary }}>
            {i18n.t('core:helpWithTranslation')}
          </Typography>
        </ListItem>
        <Divider />
        <ListItem
          button
          onClick={() => openURLExternally(Links.links.emailContact, true)}
        >
          <ListItemIcon>
            <EmailIcon />
          </ListItemIcon>
          <Typography style={{ color: theme.palette.text.primary }}>
            {i18n.t('core:emailContact')}
          </Typography>
        </ListItem>
        <ListItem
          button
          onClick={() =>
            openURLExternally(Links.links.cancelSubscription, true)
          }
        >
          <ListItemIcon>
            <CancelSubscriptionIcon />
          </ListItemIcon>
          <Typography style={{ color: theme.palette.text.primary }}>
            {i18n.t('core:cancelSubscription')}
          </Typography>
        </ListItem>
        <ListItem button onClick={() => openURLExternally(Links.links.twitter)}>
          <ListItemIcon>
            <TwitterIcon />
          </ListItemIcon>
          <Typography style={{ color: theme.palette.text.primary }}>
            {i18n.t('core:followOnTwitter')}
          </Typography>
        </ListItem>
        {/* <ListItem
          button
          onClick={() => openURLExternally(Links.links.facebook)}
        >
          <ListItemIcon>
            <SocialIcon />
          </ListItemIcon>
          <Typography style={{ color: theme.palette.text.primary }}>
            {i18n.t('core:likeUsOnFacebook')}
          </Typography>
        </ListItem> */}
        <Divider />
        <ListItem button onClick={toggleProTeaser}>
          <ListItemIcon>
            <ProTeaserIcon />
          </ListItemIcon>
          <Typography style={{ color: theme.palette.text.primary }}>
            {i18n.t('achieveMore') + ' TagSpaces Pro'}
          </Typography>
        </ListItem>
      </List>
    </div>
  );
}

function mapStateToProps(state) {
  return { language: getCurrentLanguage(state) };
}
export default connect(mapStateToProps)(
  withStyles(styles, { withTheme: true })(HelpFeedbackPanel)
);

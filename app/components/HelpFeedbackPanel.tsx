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
import { withStyles } from '@material-ui/core/styles';
import classNames from 'classnames';
import Typography from '@material-ui/core/Typography';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Divider from '@material-ui/core/Divider';
import DocumentationIcon from '@material-ui/icons/Help';
import AboutIcon from '@material-ui/icons/BlurOn';
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
import ProTeaserIcon from '@material-ui/icons/FlightTakeoff';
import styles from './SidePanels.css';
import i18n from '../services/i18n';
import { Pro } from '-/pro';
import Links from '-/links';
import AppConfig from '-/config';

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

const HelpFeedbackPanel = (props: Props) => {
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
        <ListItem button onClick={() => openURLExternally(Links.links.twitter)}>
          <ListItemIcon>
            <Social2Icon />
          </ListItemIcon>
          <Typography style={{ color: theme.palette.text.primary }}>
            {i18n.t('core:followOnTwitter')}
          </Typography>
        </ListItem>
        <ListItem
          button
          onClick={() => openURLExternally(Links.links.facebook)}
        >
          <ListItemIcon>
            <SocialIcon />
          </ListItemIcon>
          <Typography style={{ color: theme.palette.text.primary }}>
            {i18n.t('core:likeUsOnFacebook')}
          </Typography>
        </ListItem>
        {Pro && (
          <>
            <Divider />
            <ListItem button onClick={toggleProTeaser}>
              <ListItemIcon>
                <ProTeaserIcon />
              </ListItemIcon>
              <Typography style={{ color: theme.palette.text.primary }}>
                {i18n.t('TagSpaces Pro Overview')}
              </Typography>
            </ListItem>
          </>
        )}
      </List>
    </div>
  );
};

export default withStyles(styles, { withTheme: true })(HelpFeedbackPanel);

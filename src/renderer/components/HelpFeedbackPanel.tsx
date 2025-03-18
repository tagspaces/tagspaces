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
  AboutIcon,
  CancelSubscriptionIcon,
  ChangeLogIcon,
  EmailIcon,
  ForumIcon,
  HelpIcon,
  IssueIcon,
  KeyShortcutsIcon,
  NewFeatureIcon,
  OnboardingIcon,
  ProTeaserIcon,
  TranslationIcon,
  WebClipperIcon,
  XIcon,
} from '-/components/CommonIcons';
import { SidePanel, classes } from '-/components/SidePanels.css';
import { useAboutDialogContext } from '-/components/dialogs/hooks/useAboutDialogContext';
import { useKeyboardDialogContext } from '-/components/dialogs/hooks/useKeyboardDialogContext';
import { useOnboardingDialogContext } from '-/components/dialogs/hooks/useOnboardingDialogContext';
import { useProTeaserDialogContext } from '-/components/dialogs/hooks/useProTeaserDialogContext';
import { Pro } from '-/pro';
import { openURLExternally } from '-/services/utils-io';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import Links from 'assets/links';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';

interface Props {
  style?: any;
  reduceHeightBy?: number;
}

function HelpFeedbackPanel(props: Props) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { openAboutDialog } = useAboutDialogContext();
  const { openOnboardingDialog } = useOnboardingDialogContext();
  const { openKeyboardDialog } = useKeyboardDialogContext();
  const { openProTeaserDialog } = useProTeaserDialogContext();
  const { reduceHeightBy } = props;

  return (
    <SidePanel
      style={{
        display: 'flex',
        flexDirection: 'column',
        marginLeft: 5,
      }}
    >
      <div className={classes.toolbar}>
        <Typography
          className={classNames(classes.panelTitle, classes.header)}
          variant="subtitle1"
          style={{ paddingLeft: 0 }}
        >
          {t('core:helpFeedback')}
        </Typography>
      </div>
      <List
        dense={false}
        component="nav"
        aria-label="main help area"
        style={{
          height: 'calc(100% - ' + reduceHeightBy + 'px)',
          overflowY: 'auto',
          marginRight: 5,
        }}
      >
        <ListItem
          onClick={() => openAboutDialog()}
          title="Opens the about dialog"
          data-tid="aboutDialog"
        >
          <ListItemIcon>
            <AboutIcon />
          </ListItemIcon>
          <Typography style={{ color: theme.palette.text.primary }}>
            {t('core:aboutTitle')}
          </Typography>
        </ListItem>
        <ListItem
          onClick={() =>
            openURLExternally(Links.documentationLinks.general, true)
          }
        >
          <ListItemIcon>
            <HelpIcon />
          </ListItemIcon>
          <Typography style={{ color: theme.palette.text.primary }}>
            {t('core:documentation')}
          </Typography>
        </ListItem>
        <ListItem onClick={() => openKeyboardDialog()}>
          <ListItemIcon>
            <KeyShortcutsIcon />
          </ListItemIcon>
          <Typography style={{ color: theme.palette.text.primary }}>
            {t('core:shortcutKeys')}
          </Typography>
        </ListItem>
        <ListItem
          onClick={() => openURLExternally(Links.links.changelogURL, true)}
          title="Opens the changelog of the app"
        >
          <ListItemIcon>
            <ChangeLogIcon />
          </ListItemIcon>
          <Typography style={{ color: theme.palette.text.primary }}>
            {t('core:whatsNew')}
          </Typography>
        </ListItem>
        <ListItem onClick={() => openOnboardingDialog()}>
          <ListItemIcon>
            <OnboardingIcon />
          </ListItemIcon>
          <Typography style={{ color: theme.palette.text.primary }}>
            {t('core:onboardingWizard')}
          </Typography>
        </ListItem>
        <ListItem
          onClick={() => openURLExternally(Links.links.webClipper, true)}
        >
          <ListItemIcon>
            <WebClipperIcon />
          </ListItemIcon>
          <Typography style={{ color: theme.palette.text.primary }}>
            {t('core:webClipper')}
          </Typography>
        </ListItem>
        <Divider />
        <ListItem
          onClick={() => openURLExternally(Links.links.suggestFeature, true)}
        >
          <ListItemIcon>
            <NewFeatureIcon />
          </ListItemIcon>
          <Typography style={{ color: theme.palette.text.primary }}>
            {t('core:suggestNewFeatures')}
          </Typography>
        </ListItem>
        <ListItem
          onClick={() => openURLExternally(Links.links.forumsUrl, true)}
        >
          <ListItemIcon>
            <ForumIcon />
          </ListItemIcon>
          <Typography style={{ color: theme.palette.text.primary }}>
            {t('core:forums')}
          </Typography>
        </ListItem>
        <ListItem
          onClick={() => openURLExternally(Links.links.reportIssue, true)}
        >
          <ListItemIcon>
            <IssueIcon />
          </ListItemIcon>
          <Typography style={{ color: theme.palette.text.primary }}>
            {t('core:reportIssues')}
          </Typography>
        </ListItem>
        <ListItem
          onClick={() => openURLExternally(Links.links.helpTranslating, true)}
        >
          <ListItemIcon>
            <TranslationIcon />
          </ListItemIcon>
          <Typography style={{ color: theme.palette.text.primary }}>
            {t('core:helpWithTranslation')}
          </Typography>
        </ListItem>
        <Divider />
        <ListItem
          onClick={() => openURLExternally(Links.links.emailContact, true)}
        >
          <ListItemIcon>
            <EmailIcon />
          </ListItemIcon>
          <Typography style={{ color: theme.palette.text.primary }}>
            {t('core:emailContact')}
          </Typography>
        </ListItem>
        {Pro && (
          <ListItem
            onClick={() =>
              openURLExternally(Links.links.cancelSubscription, true)
            }
          >
            <ListItemIcon>
              <CancelSubscriptionIcon />
            </ListItemIcon>
            <Typography style={{ color: theme.palette.text.primary }}>
              {t('core:cancelSubscription')}
            </Typography>
          </ListItem>
        )}
        <ListItem onClick={() => openURLExternally(Links.links.twitter, true)}>
          <ListItemIcon>
            <XIcon />
          </ListItemIcon>
          <Typography style={{ color: theme.palette.text.primary }}>
            {t('core:followOnX')}
          </Typography>
        </ListItem>
        <Divider />
        <ListItem onClick={() => openProTeaserDialog()}>
          <ListItemIcon>
            <ProTeaserIcon />
          </ListItemIcon>
          <Typography style={{ color: theme.palette.text.primary }}>
            {t('achieveMore') + ' TagSpaces Pro'}
          </Typography>
        </ListItem>
      </List>
    </SidePanel>
  );
}

export default HelpFeedbackPanel;

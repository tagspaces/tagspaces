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
import { useAboutDialogContext } from '-/components/dialogs/hooks/useAboutDialogContext';
import { useKeyboardDialogContext } from '-/components/dialogs/hooks/useKeyboardDialogContext';
import { useOnboardingDialogContext } from '-/components/dialogs/hooks/useOnboardingDialogContext';
import { useProTeaserDialogContext } from '-/components/dialogs/hooks/useProTeaserDialogContext';
import { Pro } from '-/pro';
import { openURLExternally } from '-/services/utils-io';
import { Box } from '@mui/material';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import Links from 'assets/links';
import { useTranslation } from 'react-i18next';
import SidePanelTitle from './SidePanelTitle';

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
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        paddingLeft: '5px',
        paddingRight: 0,
        height: '100%',
      }}
    >
      <SidePanelTitle title={t('core:helpFeedback')} />
      <List
        dense={false}
        component="nav"
        aria-label="main help area"
        sx={{
          height: 'calc(100% - ' + reduceHeightBy + 'px)',
          overflowY: 'auto',
          marginRight: '5px',
        }}
      >
        <ListItem disablePadding>
          <ListItemButton
            data-tid="aboutDialog"
            onClick={() => openAboutDialog()}
          >
            <ListItemIcon>
              <AboutIcon />
            </ListItemIcon>
            <Typography sx={{ color: theme.palette.text.primary }}>
              {t('core:aboutTagSpaces')}
            </Typography>
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton
            onClick={() =>
              openURLExternally(Links.documentationLinks.general, true)
            }
          >
            <ListItemIcon>
              <HelpIcon />
            </ListItemIcon>
            <Typography sx={{ color: theme.palette.text.primary }}>
              {t('core:documentation')}
            </Typography>
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton onClick={openKeyboardDialog}>
            <ListItemIcon>
              <KeyShortcutsIcon />
            </ListItemIcon>
            <Typography sx={{ color: theme.palette.text.primary }}>
              {t('core:shortcutKeys')}
            </Typography>
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => openURLExternally(Links.links.changelogURL, true)}
          >
            <ListItemIcon>
              <ChangeLogIcon />
            </ListItemIcon>
            <Typography sx={{ color: theme.palette.text.primary }}>
              {t('core:whatsNew')}
            </Typography>
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton onClick={openOnboardingDialog}>
            <ListItemIcon>
              <OnboardingIcon />
            </ListItemIcon>
            <Typography sx={{ color: theme.palette.text.primary }}>
              {t('core:onboardingWizard')}
            </Typography>
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => openURLExternally(Links.links.webClipper, true)}
          >
            <ListItemIcon>
              <WebClipperIcon />
            </ListItemIcon>
            <Typography sx={{ color: theme.palette.text.primary }}>
              {t('core:webClipper')}
            </Typography>
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
            <Typography sx={{ color: theme.palette.text.primary }}>
              {t('core:suggestNewFeatures')}
            </Typography>
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => openURLExternally(Links.links.forumsUrl, true)}
          >
            <ListItemIcon>
              <ForumIcon />
            </ListItemIcon>
            <Typography sx={{ color: theme.palette.text.primary }}>
              {t('core:forums')}
            </Typography>
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => openURLExternally(Links.links.reportIssue, true)}
          >
            <ListItemIcon>
              <IssueIcon />
            </ListItemIcon>
            <Typography sx={{ color: theme.palette.text.primary }}>
              {t('core:reportIssues')}
            </Typography>
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => openURLExternally(Links.links.helpTranslating, true)}
          >
            <ListItemIcon>
              <TranslationIcon />
            </ListItemIcon>
            <Typography sx={{ color: theme.palette.text.primary }}>
              {t('core:helpWithTranslation')}
            </Typography>
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
            <Typography sx={{ color: theme.palette.text.primary }}>
              {t('core:emailContact')}
            </Typography>
          </ListItemButton>
        </ListItem>
        {Pro && (
          <ListItem disablePadding>
            <ListItemButton
              onClick={() =>
                openURLExternally(Links.links.cancelSubscription, true)
              }
            >
              <ListItemIcon>
                <CancelSubscriptionIcon />
              </ListItemIcon>
              <Typography sx={{ color: theme.palette.text.primary }}>
                {t('core:cancelSubscription')}
              </Typography>
            </ListItemButton>
          </ListItem>
        )}
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => openURLExternally(Links.links.twitter, true)}
          >
            <ListItemIcon>
              <XIcon />
            </ListItemIcon>
            <Typography sx={{ color: theme.palette.text.primary }}>
              {t('core:followOnX')}
            </Typography>
          </ListItemButton>
        </ListItem>
        <Divider />
        <ListItem disablePadding>
          <ListItemButton onClick={() => openProTeaserDialog()}>
            <ListItemIcon>
              <ProTeaserIcon />
            </ListItemIcon>
            <Typography sx={{ color: theme.palette.text.primary }}>
              {t('achieveMore') + ' TagSpaces Pro'}
            </Typography>
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );
}

export default HelpFeedbackPanel;

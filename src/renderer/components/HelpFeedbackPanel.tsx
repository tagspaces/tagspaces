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
  MastodonIcon,
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
import { isDesktopMode } from '-/reducers/settings';
import { openURLExternally } from '-/services/utils-io';
import { Box, ListItemText } from '@mui/material';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import { useTheme } from '@mui/material/styles';
import Links from 'assets/links';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import SidePanelTitle from './SidePanelTitle';

interface Props {
  style?: any;
  reduceHeightBy?: number;
}

function HelpFeedbackPanel(props: Props) {
  const { t } = useTranslation();
  const theme = useTheme();
  const desktopMode = useSelector(isDesktopMode);
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
        dense={desktopMode}
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
            <ListItemText>{t('core:aboutTagSpaces')}</ListItemText>
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
            <ListItemText>{t('core:documentation')}</ListItemText>
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton onClick={openKeyboardDialog}>
            <ListItemIcon>
              <KeyShortcutsIcon />
            </ListItemIcon>
            <ListItemText>{t('core:shortcutKeys')}</ListItemText>
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => openURLExternally(Links.links.changelogURL, true)}
          >
            <ListItemIcon>
              <ChangeLogIcon />
            </ListItemIcon>
            <ListItemText>{t('core:whatsNew')}</ListItemText>
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton onClick={openOnboardingDialog}>
            <ListItemIcon>
              <OnboardingIcon />
            </ListItemIcon>
            <ListItemText>{t('core:onboardingWizard')}</ListItemText>
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => openURLExternally(Links.links.webClipper, true)}
          >
            <ListItemIcon>
              <WebClipperIcon />
            </ListItemIcon>
            <ListItemText>{t('core:webClipper')}</ListItemText>
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
            <ListItemText>{t('core:suggestNewFeatures')}</ListItemText>
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => openURLExternally(Links.links.forumsUrl, true)}
          >
            <ListItemIcon>
              <ForumIcon />
            </ListItemIcon>
            <ListItemText>{t('core:forums')}</ListItemText>
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => openURLExternally(Links.links.reportIssue, true)}
          >
            <ListItemIcon>
              <IssueIcon />
            </ListItemIcon>
            <ListItemText>{t('core:reportIssues')}</ListItemText>
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => openURLExternally(Links.links.helpTranslating, true)}
          >
            <ListItemIcon>
              <TranslationIcon />
            </ListItemIcon>
            <ListItemText>{t('core:helpWithTranslation')}</ListItemText>
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
            <ListItemText>{t('core:emailContact')}</ListItemText>
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
              <ListItemText>{t('core:cancelSubscription')}</ListItemText>
            </ListItemButton>
          </ListItem>
        )}
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => openURLExternally(Links.links.mastodon, true)}
          >
            <ListItemIcon>
              <MastodonIcon color="action" />
            </ListItemIcon>
            <ListItemText primary={t('core:followOnMastodon')} />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => openURLExternally(Links.links.twitter, true)}
          >
            <ListItemIcon>
              <XIcon />
            </ListItemIcon>
            <ListItemText>{t('core:followOnX')}</ListItemText>
          </ListItemButton>
        </ListItem>
        <Divider />
        <ListItem disablePadding>
          <ListItemButton onClick={() => openProTeaserDialog()}>
            <ListItemIcon>
              <ProTeaserIcon />
            </ListItemIcon>
            <ListItemText>{t('achieveMore') + ' TagSpaces Pro'}</ListItemText>
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );
}

export default HelpFeedbackPanel;

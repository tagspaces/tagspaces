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
  AndroidAppIcon,
  CancelSubscriptionIcon,
  ChangeLogIcon,
  EmailIcon,
  ForumIcon,
  HelpIcon,
  IosAppIcon,
  IssueIcon,
  KeyShortcutsIcon,
  MastodonIcon,
  NewFeatureIcon,
  OnboardingIcon,
  ProTeaserIcon,
  RestoreIcon,
  TranslationIcon,
  WebClipperIcon,
  XIcon,
} from '-/components/CommonIcons';
import AppConfig from '-/AppConfig';
import { useAboutDialogContext } from '-/components/dialogs/hooks/useAboutDialogContext';
import { useKeyboardDialogContext } from '-/components/dialogs/hooks/useKeyboardDialogContext';
import { useOnboardingDialogContext } from '-/components/dialogs/hooks/useOnboardingDialogContext';
import { useProTeaserDialogContext } from '-/components/dialogs/hooks/useProTeaserDialogContext';
import { useMobileTeaserDialogContext } from '-/components/dialogs/hooks/useMobileTeaserDialogContext';
import { Pro } from '-/pro';
import { isIapAvailable, restoreProPurchase } from '-/services/iap';
import { AppDispatch } from '-/reducers/app';
import {
  actions as SettingsActions,
  isDesktopMode,
  isHowToStartHidden,
} from '-/reducers/settings';
import { openURLExternally } from '-/services/utils-io';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Box, ListItemText } from '@mui/material';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import { useTheme } from '@mui/material/styles';
import Links from 'assets/links';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import SidePanelTitle from './SidePanelTitle';

function HelpFeedbackPanel() {
  const { t } = useTranslation();
  const theme = useTheme();
  const desktopMode = useSelector(isDesktopMode);
  const howToStartHidden = useSelector(isHowToStartHidden);
  const dispatch: AppDispatch = useDispatch();
  const { openAboutDialog } = useAboutDialogContext();
  const { openOnboardingDialog } = useOnboardingDialogContext();
  const { openKeyboardDialog } = useKeyboardDialogContext();
  const { openProTeaserDialog } = useProTeaserDialogContext();
  const { openMobileTeaserDialog } = useMobileTeaserDialogContext();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        paddingLeft: '5px',
        paddingRight: '5px',
        flex: 1,
        minHeight: 0,
      }}
    >
      <SidePanelTitle title={t('core:helpFeedback')} />
      <List
        dense={desktopMode}
        component="nav"
        aria-label="main help area"
        sx={{
          flex: 1,
          minHeight: 0,
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
        {howToStartHidden && (
          <ListItem disablePadding>
            <ListItemButton
              data-tid="showHowToStartTID"
              onClick={() => dispatch(SettingsActions.setHideHowToStart(false))}
            >
              <ListItemIcon>
                <VisibilityIcon />
              </ListItemIcon>
              <ListItemText>{t('peri:htsShowGuide')}</ListItemText>
            </ListItemButton>
          </ListItem>
        )}
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
        {!AppConfig.isNativeMobile && (
          <>
            <ListItem disablePadding>
              <ListItemButton
                data-tid="getIosAppTID"
                onClick={() => openMobileTeaserDialog('ios')}
              >
                <ListItemIcon>
                  <IosAppIcon />
                </ListItemIcon>
                <ListItemText>{t('core:getIosApp')}</ListItemText>
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton
                data-tid="getAndroidAppTID"
                onClick={() => openMobileTeaserDialog('android')}
              >
                <ListItemIcon>
                  <AndroidAppIcon />
                </ListItemIcon>
                <ListItemText>{t('core:getAndroidApp')}</ListItemText>
              </ListItemButton>
            </ListItem>
          </>
        )}
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
        {isIapAvailable() ? (
          // Mobile Pro is a one-time non-consumable IAP — there is no
          // subscription to cancel. Offer Restore Purchases instead, gated
          // on IAP availability (not on Pro) so a reinstalled user can restore
          // before the entitlement has been re-applied. The billing-free Lite
          // APK reports IAP unavailable, so the button is hidden there.
          <ListItem disablePadding>
            <ListItemButton onClick={() => restoreProPurchase()}>
              <ListItemIcon>
                <RestoreIcon />
              </ListItemIcon>
              <ListItemText>{t('peri:restorePurchases')}</ListItemText>
            </ListItemButton>
          </ListItem>
        ) : (
          Pro && (
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
          )
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

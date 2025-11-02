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

import AppConfig from '-/AppConfig';
import TsButton from '-/components/TsButton';
import TsIconButton from '-/components/TsIconButton';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import { useLocationIndexContext } from '-/hooks/useLocationIndexContext';
import { useNotificationContext } from '-/hooks/useNotificationContext';
import { getLastPublishedVersion } from '-/reducers/settings';
import { openURLExternally } from '-/services/utils-io';
import CloseIcon from '@mui/icons-material/Close';
import Snackbar from '@mui/material/Snackbar';
import { styled } from '@mui/material/styles';
import Links from 'assets/links';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { Pro } from '../pro';
import {
  actions as AppActions,
  AppDispatch,
  isUpdateAvailable,
} from '../reducers/app';

const TSNotification = styled(Snackbar)(({ theme }) => {
  return {
    root: {
      '& .MuiSnackbarContent-root': {
        borderRadius: AppConfig.defaultCSSRadius,
      },
    },
  };
}) as typeof Snackbar;

function PageNotification() {
  const { t } = useTranslation();
  const dispatch: AppDispatch = useDispatch();
  const {
    isGeneratingThumbs,
    setGeneratingThumbs,
    notificationStatus,
    showNotification,
    hideNotifications,
  } = useNotificationContext();
  const { findLocation } = useCurrentLocationContext();
  const { isIndexing, cancelDirectoryIndexing } = useLocationIndexContext();
  const updateAvailable = useSelector(isUpdateAvailable);
  const lastPublishedVersion = useSelector(getLastPublishedVersion);

  const skipRelease = () => {
    dispatch(AppActions.setUpdateAvailable(false));
  };

  const openChangelogPage = () => {
    openURLExternally(Links.links.changelogURL, true);
  };

  const getLatestVersion = () => {
    if (Pro) {
      showNotification(t('core:getLatestVersionPro'), 'default', false);
    } else {
      openURLExternally(Links.links.downloadURL, true);
    }
    dispatch(AppActions.setUpdateAvailable(false));
  };

  return (
    <>
      <TSNotification
        data-tid={notificationStatus.tid}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        open={notificationStatus.visible}
        onClose={() => hideNotifications()}
        autoHideDuration={notificationStatus.autohide ? 3000 : undefined}
        message={notificationStatus.text}
        action={[
          <TsIconButton
            data-tid={'close' + notificationStatus.tid}
            key="close"
            aria-label={t('core:closeButton')}
            color="inherit"
            onClick={() => hideNotifications()}
          >
            <CloseIcon />
          </TsIconButton>,
        ]}
      />
      {isGeneratingThumbs && (
        <TSNotification
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          open={isGeneratingThumbs}
          autoHideDuration={undefined}
          message={t('core:loadingOrGeneratingThumbnails')}
          action={[
            <TsIconButton
              key="closeButton"
              aria-label={t('core:closeButton')}
              color="inherit"
              onClick={() => setGeneratingThumbs(false)}
            >
              <CloseIcon />
            </TsIconButton>,
          ]}
        />
      )}
      <TSNotification
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        open={isIndexing !== undefined}
        autoHideDuration={undefined}
        message={t('indexing') + ': ' + findLocation(isIndexing)?.name}
        action={[
          <TsButton
            key="cancelIndexButton"
            color="secondary"
            onClick={() => cancelDirectoryIndexing(isIndexing)}
            data-tid="cancelDirectoryIndexing"
          >
            {t('core:cancelIndexing')}
          </TsButton>,
        ]}
      />
      <TSNotification
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        open={updateAvailable}
        autoHideDuration={undefined}
        message={'Version ' + lastPublishedVersion + ' available.'}
        action={[
          <TsButton key="laterButton" color="secondary" onClick={skipRelease}>
            {t('core:later')}
          </TsButton>,
          <TsButton
            key="changelogButton"
            color="secondary"
            onClick={openChangelogPage}
            sx={{
              marginLeft: AppConfig.defaultSpaceBetweenButtons,
            }}
          >
            {t('core:releaseNotes')}
          </TsButton>,
          <TsButton
            key="latestVersionButton"
            sx={{
              marginLeft: AppConfig.defaultSpaceBetweenButtons,
            }}
            onClick={getLatestVersion}
          >
            {t('core:getItNow')}
          </TsButton>,
        ]}
      />
    </>
  );
}

export default PageNotification;

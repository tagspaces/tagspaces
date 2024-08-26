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
import { useDispatch, useSelector } from 'react-redux';
import { styled } from '@mui/material/styles';
import Snackbar from '@mui/material/Snackbar';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { getLastPublishedVersion } from '-/reducers/settings';
import {
  actions as AppActions,
  AppDispatch,
  isUpdateAvailable,
} from '../reducers/app';
import { Pro } from '../pro';
import Links from 'assets/links';
import { openURLExternally } from '-/services/utils-io';
import { useTranslation } from 'react-i18next';
import { useNotificationContext } from '-/hooks/useNotificationContext';
import { useLocationIndexContext } from '-/hooks/useLocationIndexContext';
import i18n from '-/services/i18n';

const TSNotification = styled(Snackbar)(({ theme }) => {
  return {
    root: {
      '& .MuiSnackbarContent-root': {
        borderRadius: 10,
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
          <IconButton
            data-tid={'close' + notificationStatus.tid}
            key="close"
            aria-label={t('core:closeButton')}
            color="inherit"
            onClick={() => hideNotifications()}
            size="large"
          >
            <CloseIcon />
          </IconButton>,
        ]}
      />
      {isGeneratingThumbs && (
        <TSNotification
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          open={isGeneratingThumbs}
          autoHideDuration={undefined}
          message={t('core:loadingOrGeneratingThumbnails')}
          action={[
            <IconButton
              key="closeButton"
              aria-label={t('core:closeButton')}
              color="inherit"
              onClick={() => setGeneratingThumbs(false)}
              size="large"
            >
              <CloseIcon />
            </IconButton>,
          ]}
        />
      )}
      <TSNotification
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        open={isIndexing !== undefined}
        autoHideDuration={undefined}
        message={i18n.t('indexing') + ': ' + isIndexing}
        action={[
          <Button
            key="cancelIndexButton"
            color="secondary"
            size="small"
            onClick={() => cancelDirectoryIndexing()}
            data-tid="cancelDirectoryIndexing"
          >
            {t('core:cancelIndexing')}
          </Button>,
        ]}
      />
      <TSNotification
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        open={updateAvailable}
        autoHideDuration={undefined}
        message={'Version ' + lastPublishedVersion + ' available.'}
        action={[
          <Button
            key="laterButton"
            color="secondary"
            size="small"
            onClick={skipRelease}
          >
            {t('core:later')}
          </Button>,
          <Button
            key="changelogButton"
            color="secondary"
            size="small"
            onClick={openChangelogPage}
          >
            {t('core:releaseNotes')}
          </Button>,
          <Button
            key="latestVersionButton"
            color="primary"
            size="small"
            onClick={getLatestVersion}
          >
            {t('core:getItNow')}
          </Button>,
        ]}
      />
    </>
  );
}

export default PageNotification;

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
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { emphasize, styled, Theme } from '@mui/material/styles';
import Snackbar from '@mui/material/Snackbar';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { getLastPublishedVersion } from '-/reducers/settings';
import {
  actions as AppActions,
  getNotificationStatus,
  isGeneratingThumbs,
  isUpdateAvailable
} from '../reducers/app';
import {
  actions as LocationIndexActions,
  isIndexing
} from '../reducers/location-index';
import { Pro } from '../pro';
import Links from '-/content/links';
import { openURLExternally } from '-/services/utils-io';
import Chip from '@mui/material/Chip';
import { useTranslation } from 'react-i18next';

interface Props {
  notificationStatus: any;
  isIndexing: boolean;
  isGeneratingThumbs: boolean;
  showNotification: (
    text: string,
    notificationType?: string,
    autohide?: boolean
  ) => void;
  hideNotifications: () => void;
  cancelDirectoryIndexing: () => void;
  isUpdateAvailable: boolean;
  lastPublishedVersion: string;
  setUpdateAvailable: (isUpdateAvailable: boolean) => void;
  setGeneratingThumbnails: (isGenerating: boolean) => void;
}

const TSNotification = styled(Snackbar)(({ theme }) => {
  return {
    root: {
      '& .MuiSnackbarContent-root': {
        borderRadius: 10
      }
    }
  };
}) as typeof Snackbar;

function PageNotification(props: Props) {
  const { t } = useTranslation();
  const skipRelease = () => {
    props.setUpdateAvailable(false);
  };

  const openChangelogPage = () => {
    openURLExternally(Links.links.changelogURL, true);
  };

  const getLatestVersion = () => {
    if (Pro) {
      props.showNotification(t('core:getLatestVersionPro'), 'default', false);
    } else {
      openURLExternally(Links.links.downloadURL, true);
    }
    props.setUpdateAvailable(false);
  };

  return (
    <>
      <TSNotification
        data-tid={props.notificationStatus.tid}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        open={props.notificationStatus.visible}
        onClose={() => props.hideNotifications()}
        autoHideDuration={props.notificationStatus.autohide ? 3000 : undefined}
        message={props.notificationStatus.text}
        action={[
          <IconButton
            data-tid={'close' + props.notificationStatus.tid}
            key="close"
            aria-label={t('core:closeButton')}
            color="inherit"
            onClick={() => props.hideNotifications()}
            size="large"
          >
            <CloseIcon />
          </IconButton>
        ]}
      />
      {props.isGeneratingThumbs && (
        <TSNotification
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          open={props.isGeneratingThumbs}
          autoHideDuration={undefined}
          message={t('core:loadingOrGeneratingThumbnails')}
          action={[
            <IconButton
              key="closeButton"
              aria-label={t('core:closeButton')}
              color="inherit"
              onClick={() => props.setGeneratingThumbnails(false)}
              size="large"
            >
              <CloseIcon />
            </IconButton>
          ]}
        />
      )}
      <TSNotification
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        open={props.isIndexing}
        autoHideDuration={undefined}
        message="Indexing"
        action={[
          <Button
            key="cancelIndexButton"
            color="secondary"
            size="small"
            onClick={props.cancelDirectoryIndexing}
            data-tid="cancelDirectoryIndexing"
          >
            {t('core:cancelIndexing')}
          </Button>
        ]}
      />
      <TSNotification
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        open={props.isUpdateAvailable}
        autoHideDuration={undefined}
        message={'Version ' + props.lastPublishedVersion + ' available.'}
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
          </Button>
        ]}
      />
    </>
  );
}

function mapStateToProps(state) {
  return {
    notificationStatus: getNotificationStatus(state),
    isIndexing: isIndexing(state),
    isUpdateAvailable: isUpdateAvailable(state),
    lastPublishedVersion: getLastPublishedVersion(state),
    isGeneratingThumbs: isGeneratingThumbs(state)
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      showNotification: AppActions.showNotification,
      hideNotifications: AppActions.hideNotifications,
      cancelDirectoryIndexing: LocationIndexActions.cancelDirectoryIndexing,
      setUpdateAvailable: AppActions.setUpdateAvailable,
      setGeneratingThumbnails: AppActions.setGeneratingThumbnails
    },
    dispatch
  );
}

const areEqual = (prevProp, nextProp) =>
  JSON.stringify(nextProp.notificationStatus) ===
    JSON.stringify(prevProp.notificationStatus) &&
  nextProp.isIndexing === prevProp.isIndexing &&
  nextProp.isGeneratingThumbs === prevProp.isGeneratingThumbs &&
  nextProp.isUpdateAvailable === prevProp.isUpdateAvailable;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(React.memo(PageNotification, areEqual));

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
import Snackbar from '@material-ui/core/Snackbar';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import { getLastPublishedVersion } from '-/reducers/settings';
import {
  actions as AppActions,
  getNotificationStatus,
  isUpdateAvailable
} from '../reducers/app';
import {
  actions as LocationIndexActions,
  isIndexing
} from '../reducers/location-index';
import i18n from '../services/i18n';
import { Pro } from '../pro';
import Links from '-/links';

interface Props {
  notificationStatus: any;
  isIndexing: boolean;
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
  openURLExternally: (url: string, skipConfirm: boolean) => void;
}

const PageNotification = (props: Props) => {
  const skipRelease = () => {
    props.setUpdateAvailable(false);
  };

  const openChangelogPage = () => {
    props.openURLExternally(Links.links.changelogURL, true);
  };

  const getLatestVersion = () => {
    if (Pro) {
      props.showNotification(
        i18n.t('core:getLatestVersionPro'),
        'default',
        false
      );
    } else {
      props.openURLExternally(Links.links.downloadURL, true);
    }
    props.setUpdateAvailable(false);
  };

  return (
    <>
      <Snackbar
        data-tid={props.notificationStatus.tid}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        open={props.notificationStatus.visible}
        onClose={props.hideNotifications}
        autoHideDuration={props.notificationStatus.autohide ? 3000 : undefined}
        message={props.notificationStatus.text}
        action={[
          <IconButton
            data-tid={'close' + props.notificationStatus.tid}
            key="close"
            aria-label={i18n.t('core:closeButton')}
            color="inherit"
            onClick={props.hideNotifications}
          >
            <CloseIcon />
          </IconButton>
        ]}
      />
      {/* <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        open={props.isGeneratingThumbs}
        autoHideDuration={undefined}
        message={i18n.t('core:loadingOrGeneratingThumbnails')}
        action={[
          <IconButton
            key="closeButton"
            aria-label={i18n.t('core:closeButton')}
            color="inherit"
            onClick={() => props.setGeneratingThumbnails(false)}
          >
            <CloseIcon />
          </IconButton>
        ]}
      /> */}
      <Snackbar
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
            {i18n.t('core:cancelIndexing')}
          </Button>
        ]}
      />
      <Snackbar
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
            {i18n.t('core:later')}
          </Button>,
          <Button
            key="changelogButton"
            color="secondary"
            size="small"
            onClick={openChangelogPage}
          >
            {i18n.t('core:releaseNotes')}
          </Button>,
          <Button
            key="latestVersionButton"
            color="primary"
            size="small"
            onClick={getLatestVersion}
          >
            {i18n.t('core:getItNow')}
          </Button>
        ]}
      />
    </>
  );
};

function mapStateToProps(state) {
  return {
    notificationStatus: getNotificationStatus(state),
    isIndexing: isIndexing(state),
    isUpdateAvailable: isUpdateAvailable(state),
    lastPublishedVersion: getLastPublishedVersion(state)
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      showNotification: AppActions.showNotification,
      hideNotifications: AppActions.hideNotifications,
      cancelDirectoryIndexing: LocationIndexActions.cancelDirectoryIndexing,
      setUpdateAvailable: AppActions.setUpdateAvailable,
      openURLExternally: AppActions.openURLExternally
    },
    dispatch
  );
}

const areEqual = (prevProp, nextProp) =>
  JSON.stringify(nextProp.notificationStatus) ===
    JSON.stringify(prevProp.notificationStatus) &&
  nextProp.isIndexing === prevProp.isIndexing &&
  nextProp.isUpdateAvailable === prevProp.isUpdateAvailable;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(React.memo(PageNotification, areEqual));

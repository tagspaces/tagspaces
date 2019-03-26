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
 * @flow
 */

import { actions as AppActions } from './app';
import {
  extractFileName,
  getMetaFileLocationForFile,
  getThumbFileLocationForFile,
  normalizePath
} from '../utils/paths';
import {
  copyFilesPromise,
  renameFilesPromise
} from '../services/utils-io';
import AppConfig from '../config';
import i18n from '../services/i18n';
import { Pro } from '../pro';
import TaggingActions from './tagging-actions';

const actions = {
  extractContent: () => (
    dispatch: (actions: Object) => void,
    getState: () => Object
  ) => {
    const { currentDirectoryEntries } = getState().app;
    if (!Pro || !Pro.ContentExtractor) {
      dispatch(AppActions.showNotification(i18n.t('core:needProVersion')));
      return false;
    }
    Pro.ContentExtractor.extractContent(currentDirectoryEntries, dispatch, AppActions, TaggingActions);
  },
  moveFiles: (paths: Array<string>, targetPath: string) => (
    dispatch: (actions: Object) => void,
  ) => {
    /* const renameJobs = [];
    paths.map((path) => {
      renameJobs.push(renameFile(path, targetPath + extractFileName(path)));
      return true;
    });
    Promise.all(renameJobs).then(() => {
      dispatch(AppActions.showNotification(i18n.t('core:filesMovedSuccessful')));
      return true;
    }).catch((err) => {
      console.warn('Moving files failed with ' + err)
      dispatch(AppActions.showNotification(i18n.t('core:movingFilesFailed')));
    }); */
    const moveJobs = [];
    paths.map((path) => {
      moveJobs.push([path, normalizePath(targetPath) + AppConfig.dirSeparator + extractFileName(path)]);
      return true;
    });
    renameFilesPromise(moveJobs).then(() => {
      dispatch(AppActions.showNotification(i18n.t('core:filesMovedSuccessful')));
      const moveMetaJobs = [];
      moveJobs.map((job) => {
        dispatch(AppActions.reflectDeleteEntry(job[0])); // TODO moved files should be added to the index, if the target dir in index
        moveMetaJobs.push([getMetaFileLocationForFile(job[0]), getMetaFileLocationForFile(job[1])]);
        moveMetaJobs.push([getThumbFileLocationForFile(job[0]), getThumbFileLocationForFile(job[1])]);
        renameFilesPromise(moveMetaJobs).then(() => {
          console.log('Moving meta and thumbs successful');
          return true;
        }).catch(err => {
          console.warn('At least one meta or thumb was not moved ' + err);
        });
        return true;
      });
      return true;
    }).catch((err) => {
      console.warn('Moving files failed with ' + err);
      dispatch(AppActions.showNotification(i18n.t('core:copyingFilesFailed')));
    });
  },
  copyFiles: (paths: Array<string>, targetPath: string) => (
    dispatch: (actions: Object) => void,
  ) => {
    const copyJobs = [];
    paths.map((path) => {
      copyJobs.push([path, normalizePath(targetPath) + AppConfig.dirSeparator + extractFileName(path)]);
      return true;
    });
    copyFilesPromise(copyJobs).then(() => {
      dispatch(AppActions.showNotification(i18n.t('core:filesCopiedSuccessful')));
      const copyMetaJobs = [];
      copyJobs.map((job) => {
        // dispatch(AppActions.reflectCopyEntry(job[0])); // TODO need only for the index if the target dir is indexed
        copyMetaJobs.push([getMetaFileLocationForFile(job[0]), getMetaFileLocationForFile(job[1])]);
        copyMetaJobs.push([getThumbFileLocationForFile(job[0]), getThumbFileLocationForFile(job[1])]);
        copyFilesPromise(copyMetaJobs).then(() => {
          console.log('Copy meta and thumbs successful');
          return true;
        }).catch(err => {
          console.warn('At least one meta or thumb was not copied ' + err);
        });
        return true;
      });
      return true;
    }).catch((err) => {
      console.warn('Moving files failed with ' + err);
      dispatch(AppActions.showNotification(i18n.t('core:copyingFilesFailed')));
    });
  },
};

export default actions;

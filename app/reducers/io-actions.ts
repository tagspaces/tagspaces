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

import { Progress } from 'aws-sdk/clients/s3';
import { actions as AppActions } from './app';
import {
  extractFileName,
  getMetaFileLocationForFile,
  getThumbFileLocationForFile,
  normalizePath
} from '../utils/paths';
import { copyFilesPromise, renameFilesPromise } from '../services/utils-io';
import i18n from '../services/i18n';
import { Pro } from '../pro';
import TaggingActions from './tagging-actions';
import PlatformIO from '-/services/platform-io';
import AppConfig from '-/config';

const actions = {
  extractContent: (
    options: Object = {
      EXIFGeo: true,
      EXIFDateTime: true,
      IPTCDescription: true,
      IPTCTags: true
    }
  ) => (dispatch: (actions: any) => void, getState: () => any) => {
    const { currentDirectoryEntries } = getState().app;
    if (!Pro || !Pro.ContentExtractor) {
      dispatch(AppActions.showNotification(i18n.t('core:needProVersion')));
      return false;
    }
    Pro.ContentExtractor.extractContent(
      currentDirectoryEntries,
      dispatch,
      AppActions,
      TaggingActions,
      options
    );
  },
  moveFiles: (paths: Array<string>, targetPath: string) => (
    dispatch: (actions: Object) => void
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
    paths.map(path => {
      moveJobs.push([
        path,
        normalizePath(targetPath) +
          PlatformIO.getDirSeparator() +
          extractFileName(path, PlatformIO.getDirSeparator())
      ]);
      return true;
    });
    renameFilesPromise(moveJobs)
      .then(() => {
        dispatch(
          AppActions.showNotification(i18n.t('core:filesMovedSuccessful'))
        );
        const moveMetaJobs = [];
        moveJobs.map(job => {
          dispatch(AppActions.reflectDeleteEntry(job[0])); // TODO moved files should be added to the index, if the target dir in index
          moveMetaJobs.push([
            getMetaFileLocationForFile(job[0], PlatformIO.getDirSeparator()),
            getMetaFileLocationForFile(job[1], PlatformIO.getDirSeparator())
          ]);
          moveMetaJobs.push([
            getThumbFileLocationForFile(job[0], PlatformIO.getDirSeparator()),
            getThumbFileLocationForFile(job[1], PlatformIO.getDirSeparator())
          ]);
          renameFilesPromise(moveMetaJobs)
            .then(() => {
              console.log('Moving meta and thumbs successful');
              return true;
            })
            .catch(err => {
              console.warn('At least one meta or thumb was not moved ' + err);
            });
          return true;
        });
        return true;
      })
      .catch(err => {
        console.warn('Moving files failed with ' + err);
        dispatch(
          AppActions.showNotification(i18n.t('core:copyingFilesFailed'))
        );
      });
  },
  copyFiles: (paths: Array<string>, targetPath: string) => (
    dispatch: (actions: Object) => void
  ) => {
    const copyJobs = [];
    paths.map(path => {
      copyJobs.push([
        path,
        normalizePath(targetPath) +
          PlatformIO.getDirSeparator() +
          extractFileName(path, PlatformIO.getDirSeparator())
      ]);
      return true;
    });
    copyFilesPromise(copyJobs)
      .then(() => {
        dispatch(
          AppActions.showNotification(i18n.t('core:filesCopiedSuccessful'))
        );
        const copyMetaJobs = [];
        copyJobs.map(job => {
          // dispatch(AppActions.reflectCopyEntry(job[0])); // TODO need only for the index if the target dir is indexed
          copyMetaJobs.push([
            getMetaFileLocationForFile(job[0], PlatformIO.getDirSeparator()),
            getMetaFileLocationForFile(job[1], PlatformIO.getDirSeparator())
          ]);
          copyMetaJobs.push([
            getThumbFileLocationForFile(job[0], PlatformIO.getDirSeparator()),
            getThumbFileLocationForFile(job[1], PlatformIO.getDirSeparator())
          ]);
          copyFilesPromise(copyMetaJobs)
            .then(() => {
              console.log('Copy meta and thumbs successful');
              return true;
            })
            .catch(err => {
              console.warn('At least one meta or thumb was not copied ' + err);
            });
          return true;
        });
        return true;
      })
      .catch(err => {
        console.warn('Moving files failed with ' + err);
        dispatch(
          AppActions.showNotification(i18n.t('core:copyingFilesFailed'))
        );
      });
  },
  /**
   * download files from S3 Location
   * @param paths
   * @param targetPath
   */
  downloadFiles: (paths: Array<string>, targetPath: string) => (
    dispatch: (actions: Object) => void
  ) => {
    if (AppConfig.isElectron) {
      import('fs-extra').then(fs => {
        const downloadJobs = [];
        paths.map(path => {
          downloadJobs.push([
            path,
            normalizePath(targetPath) +
              PlatformIO.getDirSeparator() +
              extractFileName(path, PlatformIO.getDirSeparator())
          ]);
          return true;
        });
        downloadJobs.map(path => {
          const file = fs.createWriteStream(path[1]);
          PlatformIO.downloadFile(path[0], file);
          return true;
        });
        return true;
      }).catch(err => {
          console.log('Error import fs: ' + err);
      });
    }
  },
  /**
   * with HTML5 Files API
   * @param files
   * @param targetPath
   * @param onUploadProgress
   */
  uploadFilesAPI: (
    files: Array<File>,
    targetPath: string,
    onUploadProgress?: (progress: Progress, response: any) => void
  ) => (dispatch: (actions: Object) => void) => {
    const uploadJobs = [];
    files.map(file => {
      uploadJobs.push(file);
      return true;
    });
    uploadJobs.map(file => {
      const filePath =
        normalizePath(targetPath) +
        PlatformIO.getDirSeparator() +
        decodeURIComponent(file.name);
      const reader = new FileReader();
      reader.onload = (event: any) => {
        // TODO event.currentTarget.result is ArrayBuffer
        // Sample call from PRO version using content = Utils.base64ToArrayBuffer(baseString);
        PlatformIO.getPropertiesPromise(filePath)
          .then(entryProps => {
            if (entryProps) {
              dispatch(
                AppActions.showNotification(
                  'File with the same name already exist, importing skipped!',
                  'warning',
                  true
                )
              );
            } else {
              PlatformIO.saveBinaryFilePromise(
                filePath,
                event.currentTarget.result,
                true,
                onUploadProgress
              )
                .then(() => {
                  dispatch(
                    AppActions.showNotification(
                      'File ' + filePath + ' successfully imported.',
                      'default',
                      true
                    )
                  );
                  dispatch(AppActions.reflectCreateEntry(filePath, true));
                  return true;
                })
                .catch(error => {
                  // TODO showAlertDialog("Saving " + filePath + " failed.");
                  console.error(
                    'Save to file ' + filePath + ' failed ' + error
                  );
                  dispatch(
                    AppActions.showNotification(
                      'Importing file ' + filePath + ' failed.',
                      'error',
                      true
                    )
                  );
                  return true;
                });
            }
            return true;
          })
          .catch(err => {
            console.log('Error getting properties ' + err);
          });
      };

      if (AppConfig.isCordova) {
        reader.readAsDataURL(file);
      } else {
        reader.readAsArrayBuffer(file);
      }
      return file;
    });
  },

  /**
   * use with Electron only!
   * @param paths
   * @param targetPath
   * @param onUploadProgress
   */
  uploadFiles: (
    paths: Array<string>,
    targetPath: string,
    onUploadProgress?: (progress: Progress, response: any) => void
  ) => (dispatch: (actions: Object) => void) => {
    const uploadJobs = [];
    paths.map(path => {
      const target =
        normalizePath(targetPath) +
        PlatformIO.getDirSeparator() +
        extractFileName(path, PlatformIO.getDirSeparator());
      uploadJobs.push([path, target]);
      // copy meta
      uploadJobs.push([
        getMetaFileLocationForFile(path, PlatformIO.getDirSeparator()),
        getMetaFileLocationForFile(target, PlatformIO.getDirSeparator())
      ]);
      uploadJobs.push([
        getThumbFileLocationForFile(path, PlatformIO.getDirSeparator()),
        getThumbFileLocationForFile(target, PlatformIO.getDirSeparator())
      ]);
      return true;
    });
    uploadJobs.map(job => {
      // console.log("Selected File: "+JSON.stringify(selection.currentTarget.files[0]));
      // const file = selection.currentTarget.files[0];
      const filePath = job[1];
      /* normalizePath(props.directoryPath) +
                PlatformIO.getDirSeparator() +
                decodeURIComponent(file.name); */

      // TODO try to replace this with <input type="file"
      if (AppConfig.isElectron) {
        import('fs-extra')
          .then(fs => {
            const fileContent = fs.readFileSync(job[0]);
            // TODO event.currentTarget.result is ArrayBuffer
            // Sample call from PRO version using content = Utils.base64ToArrayBuffer(baseString);
            PlatformIO.getPropertiesPromise(filePath)
              .then(entryProps => {
                if (entryProps) {
                  dispatch(
                    AppActions.showNotification(
                      'File with the same name already exist, importing skipped!',
                      'warning',
                      true
                    )
                  );
                } else {
                  // dispatch(AppActions.setProgress(filePath, progress));
                  PlatformIO.saveBinaryFilePromise(
                    filePath,
                    fileContent,
                    true,
                    onUploadProgress
                  )
                    .then(() => {
                      dispatch(
                        AppActions.showNotification(
                          'File ' + filePath + ' successfully imported.',
                          'default',
                          true
                        )
                      );
                      dispatch(AppActions.reflectCreateEntry(filePath, true));
                      return true;
                    })
                    .catch(err => {
                      // TODO showAlertDialog("Saving " + filePath + " failed.");
                      console.error(
                        'Save to file ' + filePath + ' failed ' + err
                      );
                      dispatch(
                        AppActions.showNotification(
                          'Importing file ' + filePath + ' failed.',
                          'error',
                          true
                        )
                      );
                      return true;
                    });
                }
                return true;
              })
              .catch(err => {
                console.log('Error getting properties ' + err);
              });
            return true;
          })
          .catch(err => {
            console.log('Error import fs: ' + err);
          });
      }
      return true;
    });
  }
};

export default actions;

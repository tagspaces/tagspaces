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
import {
  enhanceEntry,
  loadJSONString
} from '@tagspaces/tagspaces-common/utils-io';
import {
  extractFileName,
  getMetaFileLocationForFile,
  getThumbFileLocationForFile,
  getBackupFileDir,
  normalizePath
} from '@tagspaces/tagspaces-common/paths';
import AppConfig from '-/AppConfig';
import { actions as AppActions } from './app';
import {
  copyFilesPromise,
  getThumbPath,
  loadFileMetaDataPromise,
  renameFilesPromise
} from '-/services/utils-io';
import i18n from '../services/i18n';
import { Pro } from '../pro';
import TaggingActions from './tagging-actions';
import PlatformIO from '-/services/platform-facade';
import { TS } from '-/tagspaces.namespace';
import { generateThumbnailPromise } from '-/services/thumbsgenerator';
import { base64ToArrayBuffer } from '-/utils/dom';

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
      dispatch(
        AppActions.showNotification(
          i18n.t('core:thisFunctionalityIsAvailableInPro')
        )
      );
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
    dispatch: (actions: Object) => Promise<boolean>
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
    const moveJobs = paths.map(path => [
      path,
      normalizePath(targetPath) +
        PlatformIO.getDirSeparator() +
        extractFileName(path, PlatformIO.getDirSeparator())
    ]);
    return renameFilesPromise(moveJobs)
      .then(() => {
        dispatch(
          AppActions.showNotification(i18n.t('core:filesMovedSuccessful'))
        );

        const moveMetaJobs = [];
        moveJobs.map(job => {
          dispatch(AppActions.reflectDeleteEntry(job[0])); // moved files should be added to the index, if the target dir in index

          // Move revisions
          loadFileMetaDataPromise(job[0]).then(
            (fsEntryMeta: TS.FileSystemEntryMeta) => {
              if (fsEntryMeta.id) {
                const backupDir = getBackupFileDir(
                  job[0],
                  fsEntryMeta.id,
                  PlatformIO.getDirSeparator()
                );
                const newBackupDir = getBackupFileDir(
                  job[1],
                  fsEntryMeta.id,
                  PlatformIO.getDirSeparator()
                );
                return PlatformIO.moveDirectoryPromise(backupDir, newBackupDir)
                  .then(() => {
                    console.log(
                      'Moving revisions successful from ' +
                        backupDir +
                        ' to ' +
                        newBackupDir
                    );
                    return true;
                  })
                  .catch(err => {
                    console.warn('Moving revisions failed ', err);
                  });
              }
            }
          );

          // move meta
          moveMetaJobs.push([
            getMetaFileLocationForFile(job[0], PlatformIO.getDirSeparator()),
            getMetaFileLocationForFile(job[1], PlatformIO.getDirSeparator())
          ]);
          moveMetaJobs.push([
            getThumbFileLocationForFile(
              job[0],
              PlatformIO.getDirSeparator(),
              false
            ),
            getThumbFileLocationForFile(
              job[1],
              PlatformIO.getDirSeparator(),
              false
            )
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
            getThumbFileLocationForFile(
              job[0],
              PlatformIO.getDirSeparator(),
              false
            ),
            getThumbFileLocationForFile(
              job[1],
              PlatformIO.getDirSeparator(),
              false
            )
          ]);
          copyFilesPromise(copyMetaJobs)
            .then(() => {
              console.log('Copy meta and thumbs successful');
              dispatch(AppActions.reflectCreateEntry(job[1], true));
              return true;
            })
            .catch(err => {
              dispatch(AppActions.reflectCreateEntry(job[1], true));
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
   * S3 TODO work for test files only
   * @param url
   * @param targetPath
   * @param onDownloadProgress
   */
  downloadFile: (
    url: string,
    targetPath: string,
    onDownloadProgress?: (progress: Progress, response: any) => void
  ) => (dispatch: (actions: Object) => void) => {
    function saveFile(response: Response): Promise<TS.FileSystemEntry> {
      if (AppConfig.isElectron && !PlatformIO.haveObjectStoreSupport()) {
        return PlatformIO.saveBinaryFilePromise(
          { path: targetPath },
          response.body,
          true,
          onDownloadProgress
        );
      }
      return response.arrayBuffer().then(arrayBuffer => {
        return PlatformIO.saveFilePromise(
          { path: targetPath },
          arrayBuffer,
          true
        );
      });
    }
    return fetch(url)
      .then(response => saveFile(response))
      .then((fsEntry: TS.FileSystemEntry) => {
        return generateThumbnailPromise(
          PlatformIO.haveObjectStoreSupport() ? url : fsEntry.path,
          fsEntry.size
        ).then(dataURL => {
          if (dataURL && dataURL.length > 6) {
            const baseString = dataURL.split(',').pop();
            const fileContent = base64ToArrayBuffer(baseString);
            return PlatformIO.saveBinaryFilePromise(
              {
                path: getThumbFileLocationForFile(
                  targetPath,
                  PlatformIO.getDirSeparator(),
                  false
                )
              },
              fileContent,
              true
            ).then((thumb: TS.FileSystemEntry) => ({
              ...fsEntry,
              thumbPath: getThumbPath(thumb.path)
            }));
          }
          return fsEntry;
        });
      })
      .then((fsEntry: TS.FileSystemEntry) => {
        dispatch(AppActions.reflectCreateEntryObj(fsEntry));
        return fsEntry;
      })
      .catch(e => console.log(e));
  },
  /**
   * with HTML5 Files API
   * @param files
   * @param targetPath
   * @param onUploadProgress
   * @param uploadMeta - try to upload meta and thumbs if available
   * reader.onload not work for multiple files https://stackoverflow.com/questions/56178918/react-upload-multiple-files-using-window-filereader
   */
  uploadFilesAPI: (
    files: Array<File>,
    targetPath: string,
    onUploadProgress?: (progress: Progress, response: any) => void,
    uploadMeta = true
  ) => (dispatch: (actions: Object) => void) => {
    if (AppConfig.isElectron || AppConfig.isCordovaiOS) {
      const arrFiles = [];
      for (let i = 0; i < files.length; i += 1) {
        arrFiles.push(files[i].path);
      }
      return dispatch(
        actions.uploadFiles(arrFiles, targetPath, onUploadProgress, uploadMeta)
      );
    }

    return new Promise(async resolve => {
      const fsEntries = [];
      // -> cannot upload meta data (for every upload in web browser its need to have <input> element)
      await setupReader(0);

      async function setupReader(inx) {
        const file = files[inx];
        const reader = new FileReader();
        let fileName = file.name;
        try {
          fileName = decodeURIComponent(file.name);
        } catch (ex) {}
        let filePath =
          normalizePath(targetPath) + PlatformIO.getDirSeparator() + fileName;
        if (
          PlatformIO.haveObjectStoreSupport() &&
          (filePath.startsWith('\\') || filePath.startsWith('/'))
        ) {
          filePath = filePath.substr(1);
        }
        reader.onload = async (event: any) => {
          await readerLoaded(event, inx, filePath);
        };
        // if (AppConfig.isWeb && PlatformIO.isMinio()) {
        //   reader.readAsBinaryString(file);
        // } else {
        reader.readAsArrayBuffer(file);
        // }
        /* else if (AppConfig.isCordova) {
          reader.readAsDataURL(file);
        } */
      }

      async function readerLoaded(event, index, fileTargetPath) {
        const entryProps = await PlatformIO.getPropertiesPromise(
          fileTargetPath
        );
        if (entryProps) {
          dispatch(
            AppActions.showNotification(
              'File with the same name already exist, importing skipped!',
              'warning',
              true
            )
          );
        } else {
          const result = event.currentTarget
            ? event.currentTarget.result
            : event.target.result;
          try {
            const fsEntry: TS.FileSystemEntry = await PlatformIO.saveBinaryFilePromise(
              { path: fileTargetPath },
              new Uint8Array(result),
              true,
              onUploadProgress
            );
            if (fsEntry) {
              // Generate Thumbnail
              const thumbPath = await generateThumbnailPromise(
                PlatformIO.getURLforPath(fileTargetPath),
                fsEntry.size
              )
                .then(dataURL => {
                  if (dataURL && dataURL.length > 6) {
                    const baseString = dataURL.split(',').pop();
                    const fileContent = base64ToArrayBuffer(baseString);
                    const thumbPath = getThumbFileLocationForFile(
                      fileTargetPath,
                      PlatformIO.getDirSeparator(),
                      false
                    );
                    return PlatformIO.saveBinaryFilePromise(
                      { path: thumbPath },
                      fileContent,
                      true
                    ).then(() => thumbPath);
                  }
                  return undefined;
                })
                .catch(err => {
                  console.error('error generateThumbnail:', err);
                });
              if (thumbPath) {
                fsEntry.thumbPath = PlatformIO.getURLforPath(thumbPath);
              }
              fsEntries.push(fsEntry);

              dispatch(
                AppActions.showNotification(
                  'File ' + fileTargetPath + ' successfully imported.',
                  'default',
                  true
                )
              );
              // dispatch(AppActions.reflectCreateEntry(fileTargetPath, true));
            }
          } catch (error) {
            console.error(
              'Uploading ' + fileTargetPath + ' failed with ' + error
            );
            dispatch(
              AppActions.showNotification(
                'Importing file ' + fileTargetPath + ' failed.',
                'error',
                true
              )
            );
          }
        }

        // If there's a file left to load
        if (index < files.length - 1) {
          // Load the next file
          await setupReader(index + 1);
        } else {
          resolve(fsEntries);
        }
      }
    });
  },

  /**
   * use with Electron only!
   * @param paths
   * @param targetPath
   * @param onUploadProgress
   * @param uploadMeta
   */
  uploadFiles: (
    paths: Array<string>,
    targetPath: string,
    onUploadProgress?: (progress: Progress, response: any) => void,
    uploadMeta = true
  ) => (dispatch: (actions: Object) => void) =>
    new Promise((resolve, reject) => {
      function uploadFile(
        filePath: string,
        fileType: string,
        fileContent: any
      ) {
        return PlatformIO.getPropertiesPromise(filePath)
          .then(entryProps => {
            if (entryProps) {
              dispatch(
                AppActions.showNotification(
                  'File with the same name already exist, importing skipped!',
                  'warning',
                  true
                )
              );
              dispatch(AppActions.setProgress(filePath, -1, undefined));
            } else {
              // dispatch(AppActions.setProgress(filePath, progress));
              return PlatformIO.saveBinaryFilePromise(
                { path: filePath },
                fileContent,
                true,
                onUploadProgress
              )
                .then((fsEntry: TS.FileSystemEntry) => {
                  // handle meta files
                  if (fileType === 'meta') {
                    try {
                      // eslint-disable-next-line no-param-reassign
                      fsEntry.meta = loadJSONString(fileContent.toString());
                    } catch (e) {
                      console.debug('cannot parse entry meta');
                    }
                  } else if (fileType === 'thumb') {
                    // eslint-disable-next-line no-param-reassign
                    fsEntry.thumbPath = fsEntry.path;
                  }

                  return fsEntry;
                })
                .catch(err => {
                  console.error('Importing file ' + filePath + ' failed ', err);
                  dispatch(
                    AppActions.showNotification(
                      'Importing file ' + filePath + ' failed.',
                      'error',
                      true
                    )
                  );
                  return undefined;
                });
            }
            return undefined;
          })
          .catch(err => {
            console.error('Error getting properties', err);
          });
      }

      const uploadJobs = [];
      paths.map(path => {
        let target =
          normalizePath(targetPath) +
          AppConfig.dirSeparator +
          extractFileName(path, AppConfig.dirSeparator); // PlatformIO.getDirSeparator()); // with "/" dir separator cannot extractFileName on Win
        // fix for Win
        if (
          PlatformIO.haveObjectStoreSupport() &&
          (target.startsWith('\\') || target.startsWith('/'))
        ) {
          target = target.substr(1);
        }
        uploadJobs.push([path, target, 'file']);
        if (uploadMeta) {
          // copy meta
          uploadJobs.push([
            getMetaFileLocationForFile(path, AppConfig.dirSeparator),
            getMetaFileLocationForFile(target, AppConfig.dirSeparator),
            'meta'
          ]);
          uploadJobs.push([
            getThumbFileLocationForFile(path, AppConfig.dirSeparator),
            getThumbFileLocationForFile(target, AppConfig.dirSeparator),
            'thumb',
            path
          ]);
        }
        return true;
      });
      const jobsPromises = uploadJobs.map(job => {
        // console.log("Selected File: "+JSON.stringify(selection.currentTarget.files[0]));
        // const file = selection.currentTarget.files[0];
        const filePath = job[1];
        const fileType = job[2];

        // TODO try to replace this with <input type="file"
        if (AppConfig.isElectron) {
          // for AWS location getFileContentPromise cannot load with io-objectore
          return PlatformIO.getLocalFileContentPromise(job[0])
            .then(fileContent => uploadFile(filePath, fileType, fileContent))
            .catch(err => {
              // console.log('Error getting file:' + job[0] + ' ' + err);
              if (fileType === 'thumb' && job[3]) {
                return generateThumbnailPromise(job[3], 0).then(dataURL => {
                  if (dataURL && dataURL.length > 6) {
                    const baseString = dataURL.split(',').pop();
                    const fileContent = base64ToArrayBuffer(baseString);
                    return uploadFile(filePath, fileType, fileContent);
                  }
                  return undefined;
                });
              }
            });
        }

        return undefined;
      });
      Promise.allSettled(jobsPromises)
        .then(filesProm => {
          const arrFiles: Array<TS.FileSystemEntry> = [];
          const arrMeta: Array<TS.FileSystemEntry> = [];
          const arrThumb: Array<TS.FileSystemEntry> = [];

          filesProm.map(result => {
            if (result.status !== 'rejected') {
              const file = result.value;
              if (file) {
                if (file.meta) {
                  arrMeta.push(file);
                } else if (file.thumbPath) {
                  arrThumb.push(file);
                } else {
                  arrFiles.push(file);
                }
              }
            }
            return true;
          });
          if (arrFiles.length > 0) {
            const numberOfFile = arrFiles.length;
            dispatch(
              AppActions.showNotification(
                numberOfFile + ' ' + 'file(s) successfully imported.',
                // 'Files: ' +
                //   arrFiles.map(file => file.name).toString() +
                //   ' successfully imported.',
                'default',
                true
              )
            );

            // Enhance entries
            resolve(
              arrFiles.map((file: TS.FileSystemEntry) => {
                const metaFilePath = getMetaFileLocationForFile(
                  file.path,
                  AppConfig.dirSeparator
                );
                if (metaFilePath !== undefined) {
                  for (let i = 0; i < arrMeta.length; i += 1) {
                    const metaFile = arrMeta[i];
                    if (
                      metaFile.path.replace(/[/\\]/g, '') ===
                      metaFilePath.replace(/[/\\]/g, '')
                    ) {
                      // eslint-disable-next-line no-param-reassign
                      file.meta = metaFile.meta;
                    }
                  }
                }
                const thumbFilePath = getThumbFileLocationForFile(
                  file.path,
                  AppConfig.dirSeparator
                );
                if (thumbFilePath !== undefined) {
                  for (let i = 0; i < arrThumb.length; i += 1) {
                    const thumbFile = arrThumb[i];
                    if (
                      thumbFile.path.replace(/[/\\]/g, '') ===
                      thumbFilePath.replace(/[/\\]/g, '')
                    ) {
                      // eslint-disable-next-line no-param-reassign
                      file.thumbPath = PlatformIO.getURLforPath(
                        thumbFile.thumbPath
                      );
                    }
                  }
                }
                if (file.meta) {
                  return enhanceEntry(
                    file,
                    AppConfig.tagDelimiter,
                    PlatformIO.getDirSeparator()
                  );
                }
                return file;
              })
            );
          } else {
            // eslint-disable-next-line prefer-promise-reject-errors
            reject('Upload failed');
          }
          return true;
        })
        .catch(err => {
          console.log('Error import fs: ' + err);
          reject(err);
        });
    })
};

export default actions;

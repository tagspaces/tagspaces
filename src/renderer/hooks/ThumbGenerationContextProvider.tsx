/**
 * TagSpaces - universal file and folder organizer
 * Copyright (C) 2023-present TagSpaces UG (haftungsbeschraenkt)
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

import React, { createContext, useEffect, useMemo, useRef } from 'react';
import { useSelector } from 'react-redux';
import {
  extractContainingDirectoryPath,
  extractFileName,
  normalizePath,
  getMetaDirectoryPath,
  extractFileExtension,
} from '@tagspaces/tagspaces-common/paths';
import {
  getEnableWS,
  getShowUnixHiddenEntries,
  getUseGenerateThumbnails,
} from '-/reducers/settings';
import { TS } from '-/tagspaces.namespace';
import AppConfig from '-/AppConfig';
import {
  generateThumbnailPromise,
  supportedContainers,
  supportedImgs,
  supportedMisc,
  supportedText,
  supportedVideos,
} from '-/services/thumbsgenerator';
import { usePaginationContext } from '-/hooks/usePaginationContext';
import { useDirectoryContentContext } from '-/hooks/useDirectoryContentContext';
import { useNotificationContext } from '-/hooks/useNotificationContext';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import { base64ToBlob } from '-/utils/dom';
import { usePlatformFacadeContext } from '-/hooks/usePlatformFacadeContext';
import {
  createThumbnailsInWorker,
  isWorkerAvailable,
} from '-/services/utils-io';
import { CommonLocation } from '-/utils/CommonLocation';
import { useEditedEntryMetaContext } from '-/hooks/useEditedEntryMetaContext';

type ThumbGenerationContextData = {
  generateThumbnails: (dirEntries: TS.FileSystemEntry[]) => Promise<boolean>;
};

export const ThumbGenerationContext = createContext<ThumbGenerationContextData>(
  {
    generateThumbnails: undefined,
  },
);

export type ThumbGenerationContextProviderProps = {
  children: React.ReactNode;
};

export const ThumbGenerationContextProvider = ({
  children,
}: ThumbGenerationContextProviderProps) => {
  const {
    currentDirectoryPath,
    currentDirectoryEntries,
    updateCurrentDirEntries,
    loadCurrentDirMeta,
  } = useDirectoryContentContext();
  const { findLocation } = useCurrentLocationContext();
  const { saveBinaryFilePromise, createDirectoryPromise } =
    usePlatformFacadeContext();
  const { metaActions } = useEditedEntryMetaContext();
  const { pageFiles, page } = usePaginationContext();
  const { setGeneratingThumbs } = useNotificationContext();
  const useGenerateThumbnails = useSelector(getUseGenerateThumbnails);
  const enableWS = useSelector(getEnableWS);
  const showUnixHiddenEntries = useSelector(getShowUnixHiddenEntries);
  const isGeneratingThumbs = useRef(false);

  function setGenThumbs(isGen: boolean) {
    isGeneratingThumbs.current = isGen;
    setGeneratingThumbs(isGen);
  }

  const supportedImgsWS = [
    'jpg',
    'jpeg',
    'jif',
    'jfif',
    'png',
    'gif',
    'svg',
    'tif',
    'tiff',
    'ico',
    'webp',
    'avif',
    // 'bmp' currently electron main processed: https://github.com/lovell/sharp/issues/806
  ];

  useEffect(() => {
    if (currentDirectoryPath !== undefined) {
      const entries =
        pageFiles && pageFiles.length > 0 ? pageFiles : currentDirectoryEntries;
      if (
        entries &&
        entries.length > 0
        //&& isGeneratingThumbs.current === false
      ) {
        generateThumbnails(entries).then(() => {
          //if (!isMetaFolderExist) {
          // initial thumbnail generation without .ts folder
          loadCurrentDirMeta(
            currentDirectoryPath,
            currentDirectoryEntries,
            entries.filter((entry) => entry.isFile),
          ).then((entries) => {
            updateCurrentDirEntries(entries);
          });
          // }
          return true;
        });
      }
    }
  }, [currentDirectoryPath, page]); //, isMetaFolderExist]);

  useEffect(() => {
    if (metaActions && metaActions.length > 0) {
      const entries = [];
      for (const action of metaActions) {
        if (action.action === 'thumbGenerate') {
          entries.push(action.entry);
        }
      }
      if (entries.length > 0) {
        generateThumbnails(entries).then(() => {
          return loadCurrentDirMeta(currentDirectoryPath, entries).then(
            (ent) => {
              updateCurrentDirEntries(ent);
              return true;
            },
          );
        });
      }
    }
  }, [metaActions]);

  function genThumbnailsEnabled(location: CommonLocation): boolean {
    if (
      currentDirectoryPath === undefined ||
      currentDirectoryPath.endsWith(
        AppConfig.dirSeparator + AppConfig.metaFolder,
      ) ||
      currentDirectoryPath.indexOf(
        AppConfig.dirSeparator + AppConfig.metaFolder + AppConfig.dirSeparator,
      ) !== -1
    ) {
      return false; // dont generate thumbnails in meta folder
    }
    if (!location || location.disableThumbnailGeneration === true) {
      return false; // dont generate thumbnails if it's not enabled in location settings
    }
    if (AppConfig.useGenerateThumbnails !== undefined) {
      return AppConfig.useGenerateThumbnails;
    }
    return useGenerateThumbnails;
  }

  function generateThumbnails(
    dirEntries: TS.FileSystemEntry[],
  ): Promise<boolean> {
    if (dirEntries.length === 0) {
      return Promise.resolve(false);
    }
    const location: CommonLocation = findLocation(dirEntries[0].locationID);
    if (!location || location.disableThumbnailGeneration === true) {
      return Promise.resolve(false); // dont generate thumbnails if it's not enabled in location settings
    }
    if (!genThumbnailsEnabled(location)) {
      return Promise.resolve(false);
    }

    if (AppConfig.isElectron) {
      return isWorkerAvailable().then((isWorkerAvailable) =>
        generateThumbnails2(dirEntries, isWorkerAvailable, location),
      );
    }
    return generateThumbnails2(dirEntries, false, location);
  }

  function generateThumbnails2(
    dirEntries: TS.FileSystemEntry[],
    isWorkerAvailable,
    location: CommonLocation,
  ): Promise<boolean> {
    const workerEntries: string[] = [];
    const mainEntries: string[] = [];
    dirEntries.map((entry) => {
      if (!entry.isFile) {
        return true;
      }
      if (!showUnixHiddenEntries && entry.name.startsWith('.')) {
        return true;
      }
      const extension = entry.extension
        ? entry.extension
        : extractFileExtension(entry.name, location.getDirSeparator());
      if (
        isWorkerAvailable &&
        enableWS &&
        supportedImgsWS.includes(extension) &&
        !location.haveObjectStoreSupport() &&
        !location.haveWebDavSupport()
      ) {
        workerEntries.push(entry.path);
      } else if (
        supportedImgs.includes(extension) ||
        supportedContainers.includes(extension) ||
        supportedText.includes(extension) ||
        supportedMisc.includes(extension) ||
        supportedVideos.includes(extension)
      ) {
        mainEntries.push(entry.path);
      } else {
        console.log('Unsupported thumb generation ext:' + extension);
      }
      return true;
    });

    if (workerEntries.length > 0) {
      setGenThumbs(true);
      return createThumbnailsInWorker(workerEntries)
        .then(() =>
          thumbnailMainGeneration(mainEntries, location).then(() => {
            setGenThumbs(false);
            return true;
          }),
        )
        .catch((e) => {
          // WS error handle let process thumbgeneration in Main process Generator
          console.log('createThumbnailsInWorker', e);
          return thumbnailMainGeneration(
            [...workerEntries, ...mainEntries],
            location,
          ).then(() => {
            setGenThumbs(false);
            return true;
          });
        });
    } else if (mainEntries.length > 0) {
      setGenThumbs(true);
      return thumbnailMainGeneration(mainEntries, location).then(() => {
        setGenThumbs(false);
        return true;
      });
    }

    setGenThumbs(false);
    return Promise.resolve(false);
  }

  function thumbnailMainGeneration(
    mainEntries: string[],
    location: CommonLocation,
  ): Promise<boolean> {
    const maxExecutionTime = 9000;
    const promises = mainEntries.map((tmbPath) =>
      getThumbnailURLPromise(tmbPath, location),
    );
    const promisesWithTimeout = promises.map((promise) => {
      const timeoutPromise = new Promise((resolve, reject) => {
        setTimeout(() => {
          reject(
            new Error('Maximum execution time exceeded' + maxExecutionTime),
          );
        }, maxExecutionTime);
      });

      return Promise.race([promise, timeoutPromise]);
    });

    return Promise.allSettled(promisesWithTimeout)
      .then(() => {
        return true;
      })
      .catch((e) => {
        console.log('thumbnailMainGeneration', e);
        return false;
      });
  }

  function getThumbnailURLPromise(
    filePath: string,
    location: CommonLocation,
  ): Promise<{ filePath: string; tmbPath?: string }> {
    return location
      .getPropertiesPromise(filePath)
      .then((origStats) => {
        const thumbFilePath = getThumbFileLocation(filePath, location);
        return location
          .getPropertiesPromise(thumbFilePath)
          .then((stats) => {
            if (stats) {
              // Thumbnail exists
              if (origStats.lmdt > stats.lmdt) {
                // Checking if is up to date
                return createThumbnailPromise(
                  filePath,
                  origStats.size,
                  thumbFilePath,
                  origStats.isFile,
                  location,
                )
                  .then((tmbPath) => ({ filePath, tmbPath }))
                  .catch((err) => {
                    console.log('Thumb generation failed ' + err);
                    return Promise.resolve({
                      filePath,
                      tmbPath: thumbFilePath,
                    });
                  });
              } else {
                // Tmb up to date
                return Promise.resolve({ filePath, tmbPath: thumbFilePath });
              }
            } else {
              // Thumbnail does not exists
              return createThumbnailPromise(
                filePath,
                origStats.size,
                thumbFilePath,
                origStats.isFile,
                location,
              )
                .then((tmbPath) => {
                  if (tmbPath !== undefined) {
                    return { filePath, tmbPath };
                  } else {
                    return { filePath };
                  }
                })
                .catch((err) => {
                  console.log('Thumb generation failed ' + err);
                  return Promise.resolve({ filePath });
                });
            }
          })
          .catch((err) => {
            console.log('Error getting tmb properties ' + err);
            return Promise.resolve({ filePath });
          });
      })
      .catch((err) => {
        console.log('Error getting file properties ' + err);
        return Promise.resolve({ filePath });
      });
  }

  function getThumbFileLocation(filePath: string, location: CommonLocation) {
    const containingFolder = extractContainingDirectoryPath(
      filePath,
      location.getDirSeparator(),
    );
    const metaFolder = getMetaDirectoryPath(
      containingFolder,
      location.getDirSeparator(),
    );
    return (
      metaFolder +
      location.getDirSeparator() +
      extractFileName(filePath, location.getDirSeparator()) +
      AppConfig.thumbFileExt
    );
  }

  function createThumbnailPromise(
    filePath: string,
    fileSize: number,
    thumbFilePath: string,
    isFile: boolean,
    location: CommonLocation,
  ): Promise<string | undefined> {
    const metaDirectory = extractContainingDirectoryPath(
      thumbFilePath,
      location.getDirSeparator(),
    );
    const fileDirectory = isFile
      ? extractContainingDirectoryPath(filePath, location.getDirSeparator())
      : filePath;
    const normalizedFileDirectory = normalizePath(fileDirectory);
    if (normalizedFileDirectory.endsWith(AppConfig.metaFolder)) {
      return Promise.resolve(undefined); // prevent creating thumbs in meta/.ts folder
    }
    return location.checkDirExist(metaDirectory).then((exist) => {
      if (!exist) {
        return createDirectoryPromise(metaDirectory, location.uuid).then(() => {
          return createThumbnailSavePromise(
            filePath,
            fileSize,
            thumbFilePath,
            location,
          );
        });
      } else {
        return createThumbnailSavePromise(
          filePath,
          fileSize,
          thumbFilePath,
          location,
        );
      }
    });
  }

  function createThumbnailSavePromise(
    filePath: string,
    fileSize: number,
    thumbFilePath: string,
    location: CommonLocation,
  ): Promise<string | undefined> {
    return generateThumbnailPromise(
      filePath,
      fileSize,
      location.loadTextFilePromise,
      location.getFileContentPromise,
      location.getDirSeparator(),
    )
      .then((dataURL) => {
        if (dataURL && dataURL.length) {
          return saveThumbnailPromise(thumbFilePath, dataURL, location.uuid)
            .then(() => thumbFilePath)
            .catch((err) => {
              console.log('Thumb saving failed ' + err + ' for ' + filePath);
              return Promise.resolve(undefined);
            });
        }
        return undefined; // thumbFilePath;
      })
      .catch((err) => {
        console.log('Thumb generation failed ' + err + ' for ' + filePath);
        return Promise.resolve(undefined);
      });
  }

  function saveThumbnailPromise(filePath, dataURL, locationID) {
    if (!dataURL || dataURL.length < 7) {
      // data:,
      return Promise.reject(new Error('Invalid dataURL'));
    }
    const baseString = dataURL.split(',').pop();
    const content = base64ToBlob(baseString);
    return saveBinaryFilePromise(
      { path: filePath, locationID },
      content, //PlatformIO.isMinio() ? content : content.buffer,
      true,
      undefined,
      'thumbgen',
    )
      .then(() => filePath)
      .catch((error) => {
        console.log(
          'Saving thumbnail for ' +
            filePath +
            ' failed with ' +
            JSON.stringify(error),
        );
        return Promise.reject(new Error('Saving tmb failed for: ' + filePath));
      });
  }

  const context = useMemo(() => {
    return {
      generateThumbnails,
    };
  }, []);

  return (
    <ThumbGenerationContext.Provider value={context}>
      {children}
    </ThumbGenerationContext.Provider>
  );
};

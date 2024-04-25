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
  const { currentLocation } = useCurrentLocationContext();
  const { saveBinaryFilePromise } = usePlatformFacadeContext();
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

  function genThumbnailsEnabled(): boolean {
    if (
      currentDirectoryPath === undefined ||
      currentDirectoryPath.endsWith(
        AppConfig.dirSeparator + AppConfig.metaFolder,
      ) ||
      currentDirectoryPath.endsWith(
        AppConfig.dirSeparator + AppConfig.metaFolder + AppConfig.dirSeparator,
      )
    ) {
      return false; // dont generate thumbnails in meta folder
    }
    if (currentLocation?.disableThumbnailGeneration === true) {
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
    if (
      !genThumbnailsEnabled() // enabled in the settings
    ) {
      return Promise.resolve(false);
    }

    if (AppConfig.isElectron) {
      return isWorkerAvailable().then((isWorkerAvailable) =>
        generateThumbnails2(dirEntries, isWorkerAvailable),
      );
    }
    return generateThumbnails2(dirEntries, false);
  }

  function generateThumbnails2(
    dirEntries: TS.FileSystemEntry[],
    isWorkerAvailable,
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
      if (
        isWorkerAvailable &&
        enableWS &&
        supportedImgsWS.includes(entry.extension) &&
        !currentLocation.haveObjectStoreSupport() &&
        !currentLocation.haveWebDavSupport()
      ) {
        workerEntries.push(entry.path);
      } else if (
        supportedImgs.includes(entry.extension) ||
        supportedContainers.includes(entry.extension) ||
        supportedText.includes(entry.extension) ||
        supportedMisc.includes(entry.extension) ||
        supportedVideos.includes(entry.extension)
      ) {
        mainEntries.push(entry.path);
      } else {
        console.log('Unsupported thumb generation ext:' + entry.extension);
      }
      return true;
    });

    if (workerEntries.length > 0) {
      setGenThumbs(true);
      return createThumbnailsInWorker(workerEntries)
        .then(() =>
          thumbnailMainGeneration(mainEntries).then(() => {
            setGenThumbs(false);
            return true;
          }),
        )
        .catch((e) => {
          // WS error handle let process thumbgeneration in Main process Generator
          console.log('createThumbnailsInWorker', e);
          return thumbnailMainGeneration([
            ...workerEntries,
            ...mainEntries,
          ]).then(() => {
            setGenThumbs(false);
            return true;
          });
        });
    } else if (mainEntries.length > 0) {
      setGenThumbs(true);
      return thumbnailMainGeneration(mainEntries).then(() => {
        setGenThumbs(false);
        return true;
      });
    }

    setGenThumbs(false);
    return Promise.resolve(false);
  }

  function thumbnailMainGeneration(mainEntries: string[]): Promise<boolean> {
    const maxExecutionTime = 9000;
    const promises = mainEntries.map((tmbPath) =>
      getThumbnailURLPromise(tmbPath),
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
  ): Promise<{ filePath: string; tmbPath?: string }> {
    return currentLocation
      .getPropertiesPromise(filePath)
      .then((origStats) => {
        const thumbFilePath = getThumbFileLocation(filePath);
        return currentLocation
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
                )
                  .then((tmbPath) => ({ filePath, tmbPath }))
                  .catch((err) => {
                    console.warn('Thumb generation failed ' + err);
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
              )
                .then((tmbPath) => {
                  if (tmbPath !== undefined) {
                    return { filePath, tmbPath };
                  } else {
                    return { filePath };
                  }
                })
                .catch((err) => {
                  console.warn('Thumb generation failed ' + err);
                  return Promise.resolve({ filePath });
                });
            }
          })
          .catch((err) => {
            console.warn('Error getting tmb properties ' + err);
            return Promise.resolve({ filePath });
          });
      })
      .catch((err) => {
        console.warn('Error getting file properties ' + err);
        return Promise.resolve({ filePath });
      });
  }

  function getThumbFileLocation(filePath: string) {
    const containingFolder = extractContainingDirectoryPath(
      filePath,
      currentLocation?.getDirSeparator(),
    );
    const metaFolder = getMetaDirectoryPath(
      containingFolder,
      currentLocation?.getDirSeparator(),
    );
    return (
      metaFolder +
      (currentLocation
        ? currentLocation.getDirSeparator()
        : AppConfig.dirSeparator) +
      extractFileName(filePath, currentLocation?.getDirSeparator()) +
      AppConfig.thumbFileExt
    );
  }

  function createThumbnailPromise(
    filePath: string,
    fileSize: number,
    thumbFilePath: string,
    isFile: boolean,
  ): Promise<string | undefined> {
    const metaDirectory = extractContainingDirectoryPath(
      thumbFilePath,
      currentLocation?.getDirSeparator(),
    );
    const fileDirectory = isFile
      ? extractContainingDirectoryPath(
          filePath,
          currentLocation?.getDirSeparator(),
        )
      : filePath;
    const normalizedFileDirectory = normalizePath(fileDirectory);
    if (normalizedFileDirectory.endsWith(AppConfig.metaFolder)) {
      return Promise.resolve(undefined); // prevent creating thumbs in meta/.ts folder
    }
    return currentLocation.checkDirExist(metaDirectory).then((exist) => {
      if (!exist) {
        return currentLocation
          .createDirectoryPromise(metaDirectory)
          .then(() => {
            return createThumbnailSavePromise(
              filePath,
              fileSize,
              thumbFilePath,
            );
          });
      } else {
        return createThumbnailSavePromise(filePath, fileSize, thumbFilePath);
      }
    });
  }

  function createThumbnailSavePromise(
    filePath: string,
    fileSize: number,
    thumbFilePath: string,
  ): Promise<string | undefined> {
    return generateThumbnailPromise(
      filePath,
      fileSize,
      currentLocation.loadTextFilePromise,
      currentLocation.getFileContentPromise,
      currentLocation?.getDirSeparator(),
    )
      .then((dataURL) => {
        if (dataURL && dataURL.length) {
          return saveThumbnailPromise(thumbFilePath, dataURL)
            .then(() => thumbFilePath)
            .catch((err) => {
              console.warn('Thumb saving failed ' + err + ' for ' + filePath);
              return Promise.resolve(undefined);
            });
        }
        return undefined; // thumbFilePath;
      })
      .catch((err) => {
        console.warn('Thumb generation failed ' + err + ' for ' + filePath);
        return Promise.resolve(undefined);
      });
  }

  function saveThumbnailPromise(filePath, dataURL) {
    if (!dataURL || dataURL.length < 7) {
      // data:,
      return Promise.reject(new Error('Invalid dataURL'));
    }
    const baseString = dataURL.split(',').pop();
    const content = base64ToBlob(baseString);
    return saveBinaryFilePromise(
      { path: filePath },
      content, //PlatformIO.isMinio() ? content : content.buffer,
      true,
    )
      .then(() => filePath)
      .catch((error) => {
        console.warn(
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
  }, [currentLocation]);

  return (
    <ThumbGenerationContext.Provider value={context}>
      {children}
    </ThumbGenerationContext.Provider>
  );
};

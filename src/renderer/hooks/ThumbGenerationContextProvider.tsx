/**
 * TagSpaces - universal file and folder organizer
 * Copyright (C) 2023-present TagSpaces GmbH
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
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import { useDirectoryContentContext } from '-/hooks/useDirectoryContentContext';
import { useEditedEntryMetaContext } from '-/hooks/useEditedEntryMetaContext';
import { useNotificationContext } from '-/hooks/useNotificationContext';
import { usePaginationContext } from '-/hooks/usePaginationContext';
import { usePlatformFacadeContext } from '-/hooks/usePlatformFacadeContext';
import {
  getEnableWS,
  getShowUnixHiddenEntries,
  getUseGenerateThumbnails,
} from '-/reducers/settings';
import {
  generateThumbnailPromise,
  supportedAudio,
  supportedContainers,
  supportedImgs,
  supportedMisc,
  supportedText,
  supportedVideos,
} from '-/services/thumbsgenerator';
import {
  createThumbnailsInWorker,
  isWorkerAvailable,
} from '-/services/utils-io';
import { TS } from '-/tagspaces.namespace';
import { CommonLocation } from '-/utils/CommonLocation';
import { base64ToUint8Array } from '-/utils/dom';
import useFirstRender from '-/utils/useFirstRender';
import { makeCancelable } from '-/utils/useCancelablePerLocation';
import {
  cleanTrailingDirSeparator,
  extractContainingDirectoryPath,
  extractFileExtension,
  extractFileName,
  getMetaDirectoryPath,
  normalizePath,
} from '@tagspaces/tagspaces-common/paths';
import React, { createContext, useEffect, useMemo, useRef } from 'react';
import { useSelector } from 'react-redux';

type ThumbGenerationContextData = {
  generateThumbnails: (dirEntries: TS.FileSystemEntry[]) => Promise<boolean>;
};

// Matches Chromium's per-host HTTP connection cap; tuned to avoid saturating
// the browser request queue on S3/WebDAV and to keep IO steady on slow
// network mounts. Local disk is barely affected since each worker call does
// real CPU work (wasm-vips) anyway.
const MAX_THUMB_CONCURRENCY = 6;

// Runs `worker(item)` over `items` with at most `limit` in flight at a time.
// Honors `signal`: stops dispatching new items on abort and resolves as soon
// as the currently-in-flight workers settle. Individual rejections are
// swallowed (callers already log inside their workers).
function runInPool<T>(
  items: T[],
  worker: (item: T) => Promise<any>,
  options: { limit: number; signal?: AbortSignal },
): Promise<boolean> {
  const { limit, signal } = options;
  if (items.length === 0) return Promise.resolve(true);
  if (signal?.aborted) return Promise.resolve(false);

  return new Promise((resolve) => {
    let idx = 0;
    let active = 0;
    let done = false;

    const finish = () => {
      if (done) return;
      done = true;
      resolve(!signal?.aborted);
    };

    const pump = () => {
      if (done) return;
      if (signal?.aborted) {
        if (active === 0) finish();
        return;
      }
      while (active < limit && idx < items.length) {
        if (signal?.aborted) break;
        const item = items[idx++];
        active++;
        worker(item)
          .catch(() => undefined)
          .finally(() => {
            active--;
            if (idx >= items.length && active === 0) {
              finish();
            } else {
              pump();
            }
          });
      }
      if (idx >= items.length && active === 0) finish();
    };

    pump();
  });
}

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
  const {
    saveBinaryFilePromise,
    createDirectoryPromise,
    setFolderThumbnailPromise,
  } = usePlatformFacadeContext();
  const { metaActions } = useEditedEntryMetaContext();
  const { pageFiles } = usePaginationContext();
  const { setGeneratingThumbs } = useNotificationContext();
  const useGenerateThumbnails = useSelector(getUseGenerateThumbnails);
  const enableWS = useSelector(getEnableWS);
  const showUnixHiddenEntries = useSelector(getShowUnixHiddenEntries);
  const isGeneratingThumbs = useRef(false);
  const thumbGenAbortRef = useRef<AbortController | null>(null);
  const firstRender = useFirstRender();

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
  ];

  function pickByExtensionPriority(
    entries: TS.FileSystemEntry[],
    priority: string[] = ['jpg', 'jpeg', 'png', 'pdf'],
  ): TS.FileSystemEntry | undefined {
    if (!entries || entries.length === 0) return undefined;

    for (const ext of priority) {
      const found = entries.find((e) => e.extension === ext);
      if (found) return found;
    }

    // fallback: first entry
    return entries[0];
  }

  // Abort any in-flight thumbnail batch when the current directory changes
  // (covers directory switches that do not fire a new thumbGenerate action)
  // and when the provider unmounts.
  useEffect(() => {
    return () => {
      thumbGenAbortRef.current?.abort();
    };
  }, [currentDirectoryPath]);

  useEffect(() => {
    if (metaActions && metaActions.length > 0) {
      //!firstRender (skip firstRender: if switch from KanBan perspective to Gallery thumbGenerate missing)
      const entries = [];
      let genThumbs = false;
      for (const action of metaActions) {
        if (action.action === 'thumbGenerate') {
          genThumbs = true;
          if (action.entry) {
            entries.push(action.entry);
          }
        }
      }
      if (genThumbs) {
        let genEntries;
        // pageFiles is undefined in KanBan, where PaginationContext is not injected
        if (entries.length > 0) {
          genEntries = entries;
        } else if (pageFiles && pageFiles.length > 0) {
          genEntries = pageFiles;
        } else {
          genEntries = currentDirectoryEntries;
        }
        if (genEntries) {
          thumbGenAbortRef.current?.abort();
          const controller = new AbortController();
          thumbGenAbortRef.current = controller;
          const { signal } = controller;
          const startPath = currentDirectoryPath;
          const isStale = () =>
            signal.aborted || currentDirectoryPath !== startPath;

          generateThumbnails(genEntries, signal)
            .then((success) => {
              if (isStale()) {
                return false;
              }
              if (success) {
                const entry = pickByExtensionPriority(
                  genEntries.filter((e) => e.isFile),
                  [
                    ...supportedImgs,
                    'pdf',
                    'html',
                    ...supportedVideos,
                    ...supportedAudio,
                    ...supportedText,
                    'url',
                  ],
                );
                if (entry) {
                  setFolderThumbnailPromise(entry.path, false).then(
                    (success) => {
                      if (!success) {
                        console.debug(
                          'set automatically thumbnail for folder failed: Thumb already exist',
                        );
                      }
                    },
                  );
                }
              }
              return loadCurrentDirMeta(startPath, genEntries).then((ent) => {
                if (isStale()) return true;
                updateCurrentDirEntries(ent);
                return true;
              });
            })
            .catch((e) => {
              if (e?.name !== 'AbortError') {
                console.log('generateThumbnails error', e);
              }
            });
        }
      }
    }
  }, [metaActions]);

  function genThumbnailsEnabled(location: CommonLocation): boolean {
    if (
      currentDirectoryPath === undefined ||
      cleanTrailingDirSeparator(currentDirectoryPath) ===
        AppConfig.metaFolder ||
      cleanTrailingDirSeparator(currentDirectoryPath).endsWith(
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
    if (AppConfig.ExtUseGenerateThumbnails !== undefined) {
      return AppConfig.ExtUseGenerateThumbnails;
    }
    return useGenerateThumbnails;
  }

  function generateThumbnails(
    dirEntries: TS.FileSystemEntry[],
    signal?: AbortSignal,
  ): Promise<boolean> {
    if (dirEntries.length === 0) {
      return Promise.resolve(false);
    }
    if (signal?.aborted) {
      return Promise.resolve(false);
    }
    const location: CommonLocation = findLocation(dirEntries[0].locationID);
    if (
      !location ||
      location.disableThumbnailGeneration === true ||
      location.isReadOnly
    ) {
      return Promise.resolve(false); // dont generate thumbnails if it's not enabled in location settings
    }
    if (!genThumbnailsEnabled(location)) {
      return Promise.resolve(false);
    }

    if (AppConfig.isElectron) {
      return isWorkerAvailable().then((isWorkerAvailable) =>
        generateThumbnails2(dirEntries, isWorkerAvailable, location, signal),
      );
    }
    return generateThumbnails2(dirEntries, false, location, signal);
  }

  function generateThumbnails2(
    dirEntries: TS.FileSystemEntry[],
    isWorkerAvailable,
    location: CommonLocation,
    signal?: AbortSignal,
  ): Promise<boolean> {
    const workerEntries: string[] = [];
    const mainEntries: string[] = [];
    const pdfEntries: string[] = [];
    console.time('TMB_GENERATION_RENDERER');
    console.time('TMB_GENERATION_WORKER');
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
        location.fullTextIndex &&
        extension.toLowerCase() === 'pdf' &&
        !location.haveObjectStoreSupport() &&
        !location.haveWebDavSupport()
      ) {
        pdfEntries.push(entry.path);
      }
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
        extension.toLowerCase() === 'pdf' ||
        supportedText.includes(extension) ||
        supportedMisc.includes(extension) ||
        supportedAudio.includes(extension) ||
        supportedVideos.includes(extension)
      ) {
        mainEntries.push(entry.path);
      } else {
        console.log('Unsupported thumb generation ext:' + extension);
      }
      return true;
    });

    if (pdfEntries.length > 0) {
      createThumbnailsInWorker(pdfEntries, location.fullTextIndex)
        .then(() => {
          console.timeEnd('TMB_GENERATION_WORKER');
        })
        .catch((e) => {
          console.log('createThumbnailsInWorker pdf', e);
        });
    }
    if (workerEntries.length > 0) {
      setGenThumbs(true);
      return createThumbnailsInWorker(workerEntries, location.fullTextIndex)
        .then(() =>
          thumbnailMainGeneration(mainEntries, location, signal).then(() => {
            console.timeEnd('TMB_GENERATION_WORKER');
            setGenThumbs(false);
            return true;
          }),
        )
        .catch((e) => {
          // WS error handle let process thumbgeneration in Main process Generator
          console.log('createThumbnailsInWorker failed: ', e);
          console.timeEnd('TMB_GENERATION_WORKER');
          return thumbnailMainGeneration(
            [...workerEntries, ...mainEntries],
            location,
            signal,
          ).then(() => {
            setGenThumbs(false);
            return true;
          });
        });
    } else if (mainEntries.length > 0) {
      setGenThumbs(true);
      return thumbnailMainGeneration(mainEntries, location, signal).then(() => {
        console.timeEnd('TMB_GENERATION_RENDERER');
        setGenThumbs(false);
        return true;
      });
    }

    console.timeEnd('TMB_GENERATION_RENDERER');

    setGenThumbs(false);
    return Promise.resolve(false);
  }

  function thumbnailMainGeneration(
    mainEntries: string[],
    location: CommonLocation,
    signal?: AbortSignal,
  ): Promise<boolean> {
    if (signal?.aborted) {
      return Promise.resolve(false);
    }

    const runOne = (tmbPath: string): Promise<any> => {
      const p = getThumbnailURLPromise(tmbPath, location);
      const wrapped = signal ? makeCancelable(p, signal) : p;
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(
            new Error(
              'Maximum execution time exceeded' + AppConfig.maxThumbGenTime,
            ),
          );
        }, AppConfig.maxThumbGenTime);
      });
      return Promise.race([wrapped, timeoutPromise]);
    };

    return runInPool(mainEntries, runOne, {
      limit: MAX_THUMB_CONCURRENCY,
      signal,
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
      location.getThumbPath,
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
    const content = base64ToUint8Array(dataURL);
    return saveBinaryFilePromise(
      { path: filePath, locationID },
      content,
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

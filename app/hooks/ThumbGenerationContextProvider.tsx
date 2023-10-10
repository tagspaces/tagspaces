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

import React, {
  createContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import { useSelector } from 'react-redux';
import {
  getEnableWS,
  getShowUnixHiddenEntries,
  getUseGenerateThumbnails
} from '-/reducers/settings';
import PlatformIO from '-/services/platform-facade';
import { TS } from '-/tagspaces.namespace';
import AppConfig from '-/AppConfig';
import {
  getThumbnailURLPromise,
  supportedContainers,
  supportedImgs,
  supportedMisc,
  supportedText,
  supportedVideos
} from '-/services/thumbsgenerator';
import { usePaginationContext } from '-/hooks/usePaginationContext';
import { useDirectoryContentContext } from '-/hooks/useDirectoryContentContext';
import { useNotificationContext } from '-/hooks/useNotificationContext';
import { locationType } from '@tagspaces/tagspaces-common/misc';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import { useMetaLoaderContext } from '-/hooks/useMetaLoaderContext';

type ThumbGenerationContextData = {
  generateThumbnails: (dirEntries: TS.FileSystemEntry[]) => void;
};

export const ThumbGenerationContext = createContext<ThumbGenerationContextData>(
  {
    generateThumbnails: () => {}
  }
);

export type ThumbGenerationContextProviderProps = {
  children: React.ReactNode;
};

export const ThumbGenerationContextProvider = ({
  children
}: ThumbGenerationContextProviderProps) => {
  const {
    currentDirectoryPath,
    currentDirectoryEntries,
    isMetaFolderExist
  } = useDirectoryContentContext();
  const { currentLocation } = useCurrentLocationContext();
  const { pageFiles } = usePaginationContext();
  const { loadCurrentDirMeta } = useMetaLoaderContext();
  const { setGeneratingThumbs } = useNotificationContext();
  const useGenerateThumbnails = useSelector(getUseGenerateThumbnails);
  const enableWS = useSelector(getEnableWS);
  const showUnixHiddenEntries = useSelector(getShowUnixHiddenEntries);
  const isGeneratingThumbs = useRef(false);

  function setGenThumbs(isGen: boolean) {
    isGeneratingThumbs.current = isGen;
    setGeneratingThumbs(isGen);
  }

  const entries =
    pageFiles && pageFiles.length > 0 ? pageFiles : currentDirectoryEntries;

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
    'avif'
    // 'bmp' currently electron main processed: https://github.com/lovell/sharp/issues/806
  ];

  useEffect(() => {
    if (
      entries &&
      entries.length > 0 &&
      genThumbnailsEnabled() &&
      isGeneratingThumbs.current === false
    ) {
      generateThumbnails(entries).then(() => {
        if (!isMetaFolderExist) {
          // initial thumbnail generation without .ts folder
          loadCurrentDirMeta(pageFiles).then(() =>
            console.debug('meta loaded')
          );
          /*PlatformIO.listMetaDirectoryPromise(currentDirectoryPath)
            .then(meta => {
              const thumbs = getThumbs(meta);
              return updateEntries(thumbs);
            })
            .catch(ex => {
              console.error(ex);
              return false;
            });*/
        }
        return true;
      });
    }
  }, [currentDirectoryPath, isMetaFolderExist]);

  function genThumbnailsEnabled(): boolean {
    if (
      !currentDirectoryPath ||
      currentDirectoryPath.endsWith(
        AppConfig.dirSeparator + AppConfig.metaFolder
      ) ||
      currentDirectoryPath.endsWith(
        AppConfig.dirSeparator + AppConfig.metaFolder + AppConfig.dirSeparator
      )
    ) {
      return false; // dont generate thumbnails in meta folder
    }
    if (currentLocation.type === locationType.TYPE_CLOUD) {
      return false; // dont generate thumbnails for cloud location
    }
    if (AppConfig.useGenerateThumbnails !== undefined) {
      return AppConfig.useGenerateThumbnails;
    }
    return useGenerateThumbnails;
  }

  function generateThumbnails(
    dirEntries: TS.FileSystemEntry[]
  ): Promise<boolean> {
    if (
      AppConfig.isWeb || // not in web mode
      PlatformIO.haveObjectStoreSupport() || // not in object store mode
      PlatformIO.haveWebDavSupport() // not in webdav mode
      // genThumbnails() // enabled in the settings
    ) {
      return Promise.resolve(false);
    }

    const isWorkerAvailable = enableWS && PlatformIO.isWorkerAvailable();
    const workerEntries: string[] = [];
    const mainEntries: string[] = [];
    dirEntries.map(entry => {
      if (!entry.isFile) {
        return true;
      }
      if (!showUnixHiddenEntries && entry.name.startsWith('.')) {
        return true;
      }
      if (isWorkerAvailable && supportedImgsWS.includes(entry.extension)) {
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
      return PlatformIO.createThumbnailsInWorker(workerEntries)
        .then(() =>
          thumbnailMainGeneration(mainEntries).then(() => {
            setGenThumbs(false);
            return true;
          })
        )
        .catch(e => {
          // WS error handle let process thumbgeneration in Main process Generator
          console.error('createThumbnailsInWorker', e);
          return thumbnailMainGeneration([
            ...workerEntries,
            ...mainEntries
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
    return Promise.resolve(false);
  }

  function thumbnailMainGeneration(mainEntries: string[]): Promise<boolean> {
    return Promise.all(
      mainEntries.map(tmbPath => getThumbnailURLPromise(tmbPath))
    )
      .then(() => {
        return true;
      })
      .catch(e => {
        console.error('thumbnailMainGeneration', e);
        return false;
      });
  }

  const context = useMemo(() => {
    return {
      generateThumbnails
    };
  }, []);

  return (
    <ThumbGenerationContext.Provider value={context}>
      {children}
    </ThumbGenerationContext.Provider>
  );
};

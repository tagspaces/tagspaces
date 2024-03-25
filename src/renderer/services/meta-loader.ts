import { TS } from '-/tagspaces.namespace';
import PlatformIO from '-/services/platform-facade';
import {
  executePromisesInBatches,
  getMetaForEntry,
  loadJSONFile,
  loadMetaForDir,
} from '-/services/utils-io';
import {
  getMetaFileLocationForDir,
  getMetaFileLocationForFile,
  getThumbFileLocationForDirectory,
  getThumbFileLocationForFile,
} from '@tagspaces/tagspaces-common/paths';
import { getUuid } from '@tagspaces/tagspaces-common/utils-io';
import AppConfig from '-/AppConfig';
import { enhanceEntry } from '@tagspaces/tagspaces-common/utils-io';

export function loadCurrentDirMeta(
  directoryPath: string,
  dirEntries: TS.FileSystemEntry[],
  pageFiles?: TS.FileSystemEntry[],
): Promise<TS.FileSystemEntry[]> {
  return PlatformIO.listMetaDirectoryPromise(directoryPath)
    .then((meta) => {
      const dirEntriesPromises = dirEntries
        .filter((entry) => !entry.isFile)
        .map((entry) => getEnhancedDir(entry));
      const files = pageFiles
        ? pageFiles
        : dirEntries.filter((entry) => entry.isFile);
      const fileEntriesPromises = getFileEntriesPromises(files, meta);
      const thumbs = getThumbs(files, meta);
      return getEntries([
        ...dirEntriesPromises,
        ...fileEntriesPromises,
        ...thumbs,
      ]);
    })
    .catch((ex) => {
      console.log(ex);
      return undefined;
    });
}

function getEntries(metaPromises): Promise<TS.FileSystemEntry[]> {
  // const catchHandler = (error) => undefined;
  //return Promise.all(metaPromises.map((promise) => promise.catch(catchHandler)))
  return executePromisesInBatches(metaPromises, 100)
    .then((entries: TS.FileSystemEntry[]) => {
      return entries;
    })
    .catch((err) => {
      console.log('err updateEntries:', err);
      return undefined;
    });
}

function getFileEntriesPromises(
  pageFiles: TS.FileSystemEntry[],
  meta: Array<any>,
): Promise<TS.FileSystemEntry>[] {
  return pageFiles.map((entry) => {
    const metaFilePath = getMetaFileLocationForFile(
      entry.path,
      PlatformIO.getDirSeparator(),
    );
    if (
      // check if metaFilePath exist in listMetaDirectory content
      meta.some((metaFile) => metaFilePath.endsWith(metaFile.path)) &&
      // !checkEntryExist(entry.path) &&
      entry.path.indexOf(
        AppConfig.metaFolder + PlatformIO.getDirSeparator(),
      ) === -1
    ) {
      return getMetaForEntry(entry, metaFilePath); /*Promise.resolve({
          [entry.path]: getMetaForEntry(entry, metaFilePath)
        });*/
    }
    return Promise.resolve(entry); //Promise.resolve({ [entry.path]: undefined });
  });
}

function getThumbs(
  pageFiles: TS.FileSystemEntry[],
  meta: Array<any>,
): Promise<TS.FileSystemEntry>[] {
  return pageFiles.map((entry) =>
    Promise.resolve(setThumbForEntry(entry, meta)),
  );
}

function setThumbForEntry(
  entry: TS.FileSystemEntry,
  meta: Array<any>, //TS.FileSystemEntryMeta[], -> todo extra path in meta
): TS.FileSystemEntry {
  const thumbEntry = { ...entry, tags: [] };
  let thumbPath = getThumbFileLocationForFile(
    entry.path,
    PlatformIO.getDirSeparator(),
    false,
  );
  const metaFile = meta.find((m) => thumbPath.endsWith(m.path));
  if (thumbPath && metaFile) {
    thumbEntry.meta = { id: getUuid(), thumbPath }; //{ ...metaFile, thumbPath };
    if (PlatformIO.haveObjectStoreSupport() || PlatformIO.haveWebDavSupport()) {
      if (thumbPath && thumbPath.startsWith('/')) {
        thumbPath = thumbPath.substring(1);
      }

      thumbPath = PlatformIO.generateURLforPath(thumbPath, 604800);
      if (thumbPath) {
        thumbEntry.meta = { id: getUuid(), thumbPath };
      }
    }
  }
  return thumbEntry;
}

export function getEnhancedDir(
  entry: TS.FileSystemEntry,
): Promise<TS.FileSystemEntry> {
  if (!entry) {
    return Promise.resolve(undefined);
  }
  if (entry.isFile) {
    return Promise.reject(
      new Error('getEnhancedDir accept dir only:' + entry.path),
    );
  }
  if (entry.name === AppConfig.metaFolder) {
    return Promise.resolve(undefined);
  }
  return getDirMeta(entry.path).then((meta) => ({
    ...entry,
    meta,
  }));

  /*return PlatformIO.listMetaDirectoryPromise(entry.path).then((meta) => {
    const metaFilePath = getMetaFileLocationForDir(
      entry.path,
      PlatformIO.getDirSeparator(),
    );
    const thumbDirPath = getThumbFileLocationForDirectory(
      entry.path,
      PlatformIO.getDirSeparator(),
    );
    let enhancedEntry;
    if (meta.some((metaFile) => thumbDirPath.endsWith(metaFile.path))) {
      const thumbPath =
        PlatformIO.haveObjectStoreSupport() || PlatformIO.haveWebDavSupport()
          ? PlatformIO.getURLforPath(thumbDirPath)
          : thumbDirPath;
      enhancedEntry = { ...entry, meta: { thumbPath } };
    }
    if (
      meta.some((metaFile) => metaFilePath.endsWith(metaFile.path)) &&
      entry.path.indexOf(
        AppConfig.metaFolder + PlatformIO.getDirSeparator(),
      ) === -1
    ) {
      return getMetaForEntry(enhancedEntry || entry, metaFilePath);
    }
    return enhancedEntry;
  });*/
}

export function getEnhancedFile(
  entry: TS.FileSystemEntry,
): Promise<TS.FileSystemEntry> {
  if (!entry) {
    return Promise.resolve(undefined);
  }
  if (!entry.isFile) {
    return Promise.reject(
      new Error('getEnhancedFile accept file only:' + entry.path),
    );
  }

  const thumbFilePath = getThumbFileLocationForFile(
    entry.path,
    PlatformIO.getDirSeparator(),
    false,
  );

  return PlatformIO.checkFileExist(thumbFilePath).then((exist) => {
    const metaProps = exist ? { thumbPath: thumbFilePath } : {};

    const metaFilePath = getMetaFileLocationForFile(
      entry.path,
      PlatformIO.getDirSeparator(),
    );

    try {
      return loadJSONFile(metaFilePath).then((meta: TS.FileSystemEntryMeta) => {
        if (meta) {
          return enhanceEntry(
            { ...entry, meta: { ...meta, ...metaProps } },
            AppConfig.tagDelimiter,
            PlatformIO.getDirSeparator(),
          );
        }
        return enhanceEntry(
          { ...entry, meta: { ...metaProps } },
          AppConfig.tagDelimiter,
          PlatformIO.getDirSeparator(),
        );
      });
    } catch (e) {
      return enhanceEntry(
        { ...entry, meta: { ...metaProps } },
        AppConfig.tagDelimiter,
        PlatformIO.getDirSeparator(),
      );
    }
  });
}

export function getDirMeta(dirPath: string): Promise<TS.FileSystemEntryMeta> {
  return PlatformIO.listMetaDirectoryPromise(dirPath).then((meta) => {
    const metaFilePath = getMetaFileLocationForDir(
      dirPath,
      PlatformIO.getDirSeparator(),
    );
    const thumbDirPath = getThumbFileLocationForDirectory(
      dirPath,
      PlatformIO.getDirSeparator(),
    );
    let thumbPath;
    if (meta.some((metaFile) => thumbDirPath.endsWith(metaFile.path))) {
      thumbPath =
        PlatformIO.haveObjectStoreSupport() || PlatformIO.haveWebDavSupport()
          ? PlatformIO.getURLforPath(thumbDirPath)
          : thumbDirPath;
    }
    if (
      meta.some((metaFile) => metaFilePath.endsWith(metaFile.path)) &&
      dirPath.indexOf(AppConfig.metaFolder + PlatformIO.getDirSeparator()) ===
        -1
    ) {
      return loadMetaForDir(dirPath, { thumbPath });
    }
    if (thumbPath) {
      return { id: '', thumbPath, lastUpdated: new Date().getTime() };
    }
    return undefined;
  });
}

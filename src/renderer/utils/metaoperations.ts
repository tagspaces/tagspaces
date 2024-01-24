import {
  loadMetaDataPromise,
  mergeFsEntryMeta,
  saveMetaDataPromise,
} from '-/services/utils-io';
import { TS } from '-/tagspaces.namespace';
import { UNSPECIFIED_ID } from '-/const';

// eslint-disable-next-line import/prefer-default-export
export function savePerspective(
  path: string,
  perspective: TS.PerspectiveType,
): Promise<TS.FileSystemEntryMeta> {
  return new Promise((resolve, reject) => {
    loadMetaDataPromise(path)
      .then((fsEntryMeta: TS.FileSystemEntryMeta) => {
        let updatedFsEntryMeta: TS.FileSystemEntryMeta;
        if (perspective && perspective !== UNSPECIFIED_ID) {
          updatedFsEntryMeta = {
            ...fsEntryMeta,
            perspective,
          };
        } else {
          const { perspective: remove, ...rest } = fsEntryMeta;
          updatedFsEntryMeta = rest;
        }
        saveMetaDataPromise(path, updatedFsEntryMeta)
          .then(() => {
            resolve(updatedFsEntryMeta);
            return true;
          })
          .catch((err) => {
            console.warn(
              'Error adding perspective for ' + path + ' with ' + err,
            );
            reject();
          });
        return true;
      })
      .catch(() => {
        const newFsEntryMeta: TS.FileSystemEntryMeta = mergeFsEntryMeta({
          perspective,
        });
        saveMetaDataPromise(path, newFsEntryMeta)
          .then(() => {
            resolve(newFsEntryMeta);
            return true;
          })
          .catch((error) => {
            console.warn(
              'Error adding perspective for ' + path + ' with ' + error,
            );
            reject();
          });
      });
  });
}

export function removeFolderCustomSettings(
  path: string,
  perspective: string,
): Promise<TS.FileSystemEntryMeta> {
  return new Promise((resolve, reject) => {
    loadMetaDataPromise(path, true)
      .then((fsEntryMeta: TS.FileSystemEntryMeta) => {
        let updatedFsEntryMeta: TS.FileSystemEntryMeta = {
          ...fsEntryMeta,
          perspectiveSettings: {
            ...fsEntryMeta.perspectiveSettings,
            [perspective]: undefined,
          },
        };

        saveMetaDataPromise(path, updatedFsEntryMeta)
          .then(() => {
            resolve(updatedFsEntryMeta);
            return true;
          })
          .catch((err) => {
            console.warn(
              'Error adding perspective for ' + path + ' with ' + err,
            );
            reject();
          });
        return true;
      })
      .catch(() => {
        const newFsEntryMeta: TS.FileSystemEntryMeta = mergeFsEntryMeta({
          perspectiveSettings: {
            [perspective]: undefined,
          },
        });
        saveMetaDataPromise(path, newFsEntryMeta)
          .then(() => {
            resolve(newFsEntryMeta);
            return true;
          })
          .catch((error) => {
            console.warn(
              'Error adding perspective for ' + path + ' with ' + error,
            );
            reject();
          });
      });
  });
}

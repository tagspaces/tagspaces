import {
  loadMetaDataPromise,
  mergeFsEntryMeta,
  saveMetaDataPromise,
} from '-/services/utils-io';
import { TS } from '-/tagspaces.namespace';

// eslint-disable-next-line import/prefer-default-export
export function savePerspective(
  path: string,
  perspective: string,
): Promise<TS.FileSystemEntryMeta> {
  return new Promise((resolve, reject) => {
    loadMetaDataPromise(path)
      .then((fsEntryMeta: TS.FileSystemEntryMeta) => {
        let updatedFsEntryMeta: TS.FileSystemEntryMeta;
        if (perspective && perspective !== 'unspecified') {
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

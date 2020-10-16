import {
  FileSystemEntryMeta,
  loadMetaDataPromise,
  saveMetaDataPromise
} from '-/services/utils-io';

// eslint-disable-next-line import/prefer-default-export
export function savePerspective(
  path: string,
  perspective: string
): Promise<FileSystemEntryMeta> {
  return new Promise((resolve, reject) => {
    loadMetaDataPromise(path)
      .then((fsEntryMeta: FileSystemEntryMeta) => {
        let updatedFsEntryMeta: FileSystemEntryMeta;
        if (perspective && perspective !== 'unspecified') {
          updatedFsEntryMeta = {
            ...fsEntryMeta,
            perspective
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
          .catch(err => {
            console.warn(
              'Error adding perspective for ' + path + ' with ' + err
            );
            reject();
          });
        return true;
      })
      .catch(() => {
        const newFsEntryMeta: FileSystemEntryMeta = {
          appName: '',
          appVersionCreated: '',
          appVersionUpdated: '',
          description: '',
          lastUpdated: '',
          tags: undefined,
          perspective
        };
        saveMetaDataPromise(path, newFsEntryMeta)
          .then(() => {
            resolve(newFsEntryMeta);
            return true;
          })
          .catch(error => {
            console.warn(
              'Error adding perspective for ' + path + ' with ' + error
            );
            reject();
          });
      });
  });
}

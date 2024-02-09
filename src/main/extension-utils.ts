import fs from 'fs';
import path from 'path';
import { Extensions } from './types';
/**
 * todo move in common-node
 * @param nodeModulesPath
 * @param packages: [@tagspaces/extensions, @tagspacespro/extensions]
 * @param isExternal
 * @returns {Promise<{ extensions, supportedFileTypes }>}
 */
export function getExtensions(
  nodeModulesPath: string,
  packages: string[],
  isExternal = false,
): Promise<Extensions> {
  const promises = packages.map(
    (packagePath) =>
      new Promise((resolve, reject) => {
        const extPath = path.join(nodeModulesPath, packagePath);
        fs.readdir(extPath, { withFileTypes: true }, (err, files) => {
          if (err) {
            console.log('Error reading directory:', err);
            reject(err);
            return;
          }
          // Filter subdirectories
          const subDirectories = files.filter((file) => file.isDirectory());

          resolve(
            processDirs(
              nodeModulesPath,
              packagePath,
              subDirectories,
              isExternal,
            ),
          );
        });
      }),
  );
  return Promise.allSettled(promises).then((results) => {
    const fulfilledResults = results
      .filter((result) => result.status === 'fulfilled')
      .map((result) => (result as PromiseFulfilledResult<Extensions>).value);
    return mergeExtensionsArray(fulfilledResults);
  });
}

// Function to merge an array of Extensions objects into a single Extensions object
function mergeExtensionsArray(extensionsArray: Extensions[]): Extensions {
  return extensionsArray.reduce(
    (acc, curr) => {
      return {
        extensions: [...acc.extensions, ...curr.extensions],
        supportedFileTypes: [
          ...acc.supportedFileTypes,
          ...curr.supportedFileTypes,
        ],
      };
    },
    { extensions: [], supportedFileTypes: [] },
  );
}

function processDirs(
  directoryPath: string,
  packagePath: string,
  dirs,
  isExternal = false,
): Extensions {
  const supportedFileTypes = [];

  const extensions = dirs.map((dir) => {
    const pluginJsonPath = path.join(
      directoryPath,
      packagePath,
      dir.name,
      'package.json',
    );
    try {
      const packageJsonContent = fs.readFileSync(pluginJsonPath, 'utf8');
      const packageJsonObj = JSON.parse(packageJsonContent);
      const version = packageJsonObj['version'];
      if (packageJsonObj['tsextension']) {
        const {
          id,
          name,
          types,
          color,
          fileTypes,
          buildFolder,
          enabled,
          ...props
        } = packageJsonObj['tsextension'];

        const extensionId =
          (id ? id : '@tagspaces/extensions/' + dir.name) +
          (buildFolder ? '/' + buildFolder : '');

        if (fileTypes) {
          fileTypes.forEach((fileType) => {
            if (fileType.ext) {
              const supportTypes = fileType.types ? fileType.types : types;
              const supportedTypes = supportTypes.map((type) => ({
                [type]: extensionId,
                ...(isExternal && { extensionExternalPath: directoryPath }),
              }));

              const existingItemIndex = supportedFileTypes.findIndex(
                (item) => item.type === fileType.ext,
              );
              if (existingItemIndex !== -1) {
                // If an item with the same id already exists, update its properties
                supportedFileTypes[existingItemIndex] = {
                  ...supportedFileTypes[existingItemIndex],
                  ...supportedTypes.reduce((a, b) => ({ ...a, ...b })),
                };
              } else {
                supportedFileTypes.push({
                  type: fileType.ext,
                  color: fileType.color ? fileType.color : color,
                  ...supportedTypes.reduce((a, b) => ({ ...a, ...b })),
                });
              }
            }
          });
        }
        return {
          extensionId: extensionId,
          extensionName: name,
          extensionTypes: types,
          ...(isExternal && { extensionExternal: true }),
          extensionEnabled: enabled !== undefined ? enabled : !isExternal,
          version: version,
          ...props,
        };
      }
    } catch (ex) {
      console.debug(
        'generateExtensionsConfig: ' + dir.name + ' error:' + ex.message,
      );
    }
    return undefined;
  });
  return {
    extensions: extensions.filter((ex) => ex),
    supportedFileTypes: supportedFileTypes,
  };
}

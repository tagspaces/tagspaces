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
        const extPath = packagePath.startsWith('.')
          ? packagePath
          : path.join(nodeModulesPath, packagePath);
        fs.readdir(extPath, { withFileTypes: true }, (err, files) => {
          if (err) {
            console.log('Error reading directory:', err);
            reject(err);
            return;
          }
          // Filter subdirectories — skip dot-prefixed folders like `.ts`
          // (TagSpaces metadata) or `.bin`, which are never valid plugin
          // directories and would fail the package.json lookup below
          const subDirectories = files.filter(
            (file) => file.isDirectory() && !file.name.startsWith('.'),
          );

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
    const pluginJsonPath = packagePath.startsWith('.')
      ? path.join(packagePath, dir.name, 'package.json')
      : path.join(directoryPath, packagePath, dir.name, 'package.json');
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
          isDefault,
          ...props
        } = packageJsonObj['tsextension'];

        const isPerspective =
          Array.isArray(types) && types.includes('perspective');

        // For perspective extensions, manifest `id` is the perspective
        // registry key (e.g. "timeline") — never the package import path —
        // so derive extensionId from the directory only. For viewer/editor
        // extensions, keep the historical behavior where `id` (if set)
        // overrides the auto-generated package path.
        const extensionId =
          (isPerspective || !id ? '@tagspaces/extensions/' + dir.name : id) +
          (buildFolder ? '/' + buildFolder : '');
        // Package name to import() at runtime (perspectives only). Webpack
        // resolves the `main` field of the package's package.json, so we
        // don't append buildFolder here.
        const packageName = packagePath + '/' + dir.name;

        if (fileTypes) {
          fileTypes.forEach((fileType) => {
            if (!fileType.ext) return;
            // each fileType may target multiple "types" (viewer/editor etc.)
            const supportTypes = fileType.types || types;
            const supportedTypes = supportTypes.map((type) => ({
              [type]: extensionId,
              ...(isExternal && { extensionExternalPath: directoryPath }),
            }));

            // find existing slot by extension
            const idx = supportedFileTypes.findIndex(
              (item) => item.type === fileType.ext,
            );
            if (idx !== -1 && isDefault) {
              // If an item with the same id already exists, update its properties
              supportedFileTypes[idx] = {
                ...supportedFileTypes[idx],
                ...supportedTypes.reduce((a, b) => ({ ...a, ...b }), {}),
              };
            } else if (idx !== -1) {
              // merge only missing props
              const existing = supportedFileTypes[idx];
              // merge in any new role/extension mappings
              supportedTypes.forEach((st) => {
                Object.keys(st).forEach((role) => {
                  if (!existing[role]) {
                    existing[role] = st[role];
                  }
                });
              });
              // color stays as-is, extensions slot keyed by type
            } else {
              supportedFileTypes.push({
                type: fileType.ext,
                color: fileType.color || color || '',
                ...supportedTypes.reduce((a, b) => ({ ...a, ...b }), {}),
              });
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
          ...(isPerspective && id ? { id, packageName } : {}),
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

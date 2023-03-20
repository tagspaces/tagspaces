const fs = require('fs');
const path = require('path');

/**
 * @param directoryPath
 * @param isExternal
 * @returns {Promise<{ extensions, supportedFileTypes }>}
 */
function getExtensions(directoryPath, isExternal = false) {
  return new Promise((resolve, reject) => {
    const extPath = path.join(directoryPath, '@tagspaces', 'extensions');
    fs.readdir(extPath, { withFileTypes: true }, (err, files) => {
      if (err) {
        console.error('Error reading directory:', err);
        reject(err);
        return;
      }
      // Filter subdirectories
      const subDirectories = files.filter(file => file.isDirectory());

      resolve(processDirs(directoryPath, subDirectories, isExternal));
    });
  });
}

function processDirs(directoryPath, dirs, isExternal = false) {
  const supportedFileTypes = [];

  const extensions = dirs.map(dir => {
    const pluginJsonPath = path.join(
      directoryPath,
      '@tagspaces',
      'extensions',
      dir.name,
      'package.json'
    );
    try {
      const packageJsonContent = fs.readFileSync(pluginJsonPath);
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
          fileTypes.forEach(fileType => {
            if (fileType.ext) {
              const supportTypes = fileType.types ? fileType.types : types;
              const supportedTypes = supportTypes.map(type => ({
                [type]: extensionId,
                ...(isExternal && { extensionExternalPath: directoryPath })
              }));

              const existingItemIndex = supportedFileTypes.findIndex(
                item => item.type === fileType.ext
              );
              if (existingItemIndex !== -1) {
                // If an item with the same id already exists, update its properties
                supportedFileTypes[existingItemIndex] = {
                  ...supportedFileTypes[existingItemIndex],
                  ...supportedTypes.reduce((a, b) => ({ ...a, ...b }))
                };
              } else {
                supportedFileTypes.push({
                  type: fileType.ext,
                  color: fileType.color ? fileType.color : color,
                  ...supportedTypes.reduce((a, b) => ({ ...a, ...b }))
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
          ...props
        };
      }
    } catch (ex) {
      console.debug(
        'generateExtensionsConfig: ' + dir.name + ' error:' + ex.message
      );
    }
    return undefined;
  });
  return {
    extensions: extensions.filter(ex => ex),
    supportedFileTypes: supportedFileTypes
  };
}

module.exports = { getExtensions };

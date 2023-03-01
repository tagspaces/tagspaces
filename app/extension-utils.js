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
      let extensionId = '@tagspaces/extensions/' + dir.name;
      const version = packageJsonObj['version'];
      if (packageJsonObj['tsextension']) {
        const {
          name,
          types,
          fileTypes,
          fileTypesEdit,
          fileTypesView,
          buildFolder,
          ...props
        } = packageJsonObj['tsextension'];

        if (buildFolder) {
          extensionId += '/' + buildFolder;
        }

        if (fileTypes) {
          fileTypes.forEach(fileType => {
            const supportedTypes = types.map(type => ({
              [type]: extensionId,
              ...(isExternal && { extensionExternalPath: directoryPath })
            }));

            const existingItemIndex = supportedFileTypes.findIndex(
              item => item.type === fileType
            );
            if (existingItemIndex !== -1) {
              // If an item with the same id already exists, update its properties
              supportedFileTypes[existingItemIndex] = {
                ...supportedFileTypes[existingItemIndex],
                ...supportedTypes.reduce((a, b) => ({ ...a, ...b }))
              };
            } else {
              supportedFileTypes.push({
                type: fileType,
                ...supportedTypes.reduce((a, b) => ({ ...a, ...b }))
              });
            }
          });
        }
        if (fileTypesEdit) {
          fileTypesEdit.forEach(fileType => {
            const existingItemIndex = supportedFileTypes.findIndex(
              item => item.type === fileType
            );
            if (existingItemIndex !== -1) {
              // If an item with the same id already exists, update its properties
              supportedFileTypes[existingItemIndex].editor = extensionId;
            } else {
              // If the item doesn't exist, add it to the array
              supportedFileTypes.push({
                type: fileType,
                editor: extensionId
              });
            }
          });
        }
        if (fileTypesView) {
          fileTypesView.forEach(fileType => {
            const existingItemIndex = supportedFileTypes.findIndex(
              item => item.type === fileType
            );
            if (existingItemIndex !== -1) {
              // If an item with the same id already exists, update its properties
              supportedFileTypes[existingItemIndex].viewer = extensionId;
            } else {
              // If the item doesn't exist, add it to the array
              supportedFileTypes.push({
                type: fileType,
                viewer: extensionId
              });
            }
          });
        }
        return {
          extensionId: extensionId,
          extensionName: name,
          extensionTypes: types,
          ...(isExternal && { extensionExternal: true }),
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

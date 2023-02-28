const fs = require('fs');
const path = require('path');
// const os = require('os');

let directoryPath = path.join(
  __dirname,
  '..',
  'app',
  'node_modules',
  '@tagspaces',
  'extensions'
);

/*function getUserDataPath() {
  switch (process.platform) {
    case 'darwin':
      return path.join(os.homedir(), 'Library', 'Application Support');
    case 'win32':
      return process.env.APPDATA;
    case 'linux':
      return process.env.XDG_CONFIG_HOME || path.join(os.homedir(), '.config');
    default:
      return null;
  }
}*/

function processDirs(dirs) {
  const supportedFileTypes = [];

  const extensions = dirs.map(dir => {
    const pluginJsonPath = path.join(directoryPath, dir.name, 'package.json');
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
              [type]: extensionId
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

fs.readdir(directoryPath, { withFileTypes: true }, (err, files) => {
  if (err) {
    console.error('Error reading directory:', err);
    return;
  }
  // Filter subdirectories
  const subDirectories = files.filter(file => file.isDirectory());

  const { extensions, supportedFileTypes } = processDirs(subDirectories);

  const generated =
    '/** GENERATED CODE - DO NOT MODIFY: This source file was generated automatically and any changes made to it may be overwritten */\n' +
    'export const extensionsFound = ' +
    JSON.stringify(extensions.filter(ex => ex)) +
    ';\n' +
    'export const supportedFileTypes = ' +
    JSON.stringify(supportedFileTypes);
  let outputFile = path.join(__dirname, '..', 'app', 'extension-config.ts');

  fs.writeFile(outputFile, generated, 'utf8', () => {
    console.log('Successfully generated:' + outputFile);
  });
});

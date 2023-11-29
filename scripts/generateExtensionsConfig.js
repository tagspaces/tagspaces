const fs = require('fs');
const path = require('path');
const { getExtensions } = require('../src/main/extension-utils');
// const os = require('os');

let directoryPath = path.join(
  __dirname,
  '..',
  'release',
  'app',
  'node_modules',
);

getExtensions(directoryPath)
  .then(({ extensions, supportedFileTypes }) => {
    writeExtensions(extensions, supportedFileTypes);
  })
  .catch((err) => {
    console.error('getExtensions error:', err);
    writeExtensions([], []);
  });

function writeExtensions(extensions, supportedFileTypes) {
  const generated =
    '/** GENERATED CODE - DO NOT MODIFY: This source file was generated automatically and any changes made to it may be overwritten */\n' +
    'export const extensionsFound = ' +
    JSON.stringify(extensions, null, 2) +
    ';\n' +
    'export const supportedFileTypes = ' +
    JSON.stringify(supportedFileTypes, null, 2) +
    ';';
  let outputFile = path.join(
    __dirname,
    '..',
    'src',
    'renderer',
    'extension-config.ts',
  );

  fs.writeFile(outputFile, generated, 'utf8', () => {
    console.log('Successfully generated:' + outputFile);
  });
}

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

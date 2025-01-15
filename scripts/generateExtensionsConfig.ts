import fs from 'fs';
import path from 'path';
import { getExtensions } from '../src/main/extension-utils';
//import { unZip } from '@tagspaces/tagspaces-common-node/io-node';
//import { Extensions } from "../src/main/types";
// const os = require('os');

let directoryPath = path.join(
  __dirname,
  '..',
  'release',
  'app',
  'node_modules',
);

const args = process.argv.slice(2);
/*extractZips(args).then(() => {

})*/
getExtensions(directoryPath, [
  '@tagspaces/extensions',
  '@tagspacespro/extensions',
  ...(args.length > 0 ? args : []),
])
  .then(({ extensions, supportedFileTypes }) => {
    writeExtensions(extensions, supportedFileTypes);
  })
  .catch((err) => {
    console.error('getExtensions error:', err);
    writeExtensions([], []);
  });

function writeExtensions(extensions, supportedFileTypes) {
  /*extensions.push({
    extensionId: '@tagspacespro/extensions/font-viewer',
    extensionName: 'Font Viewer',
    extensionTypes: ['viewer'],
    extensionEnabled: true,
    version: '1.0.90',
  }); // tmp workarroung
  supportedFileTypes.push({
    type: 'ttf',
    color: '#ac21f3',
    viewer: '@tagspacespro/extensions/font-viewer',
  });*/
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

/*async function extractZips(dirs: string[]): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const promises = dirs.map(dir => extractZip(dir, path.join(dir, 'extensions')));
    Promise.allSettled(promises).then((results) => {
      const fulfilledResults = results
        .filter((result) => result.status === 'fulfilled')
        .map((result) => (result as PromiseFulfilledResult<Extensions>).value);
      console.log(fulfilledResults);
      resolve(true);
    });
  });
}*/
/**
 * Extract all ZIP files in a given directory.
 * @param directoryPath - Path to the directory containing ZIP files.
 * @param outputDirectory - Path to the directory where files will be extracted.
 * @returns Promise<void> - Resolves when all files are extracted.
 */
/*const extractZip = (
  directoryPath: string,
  outputDirectory: string
): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    // Ensure the output directory exists
    if (!fs.existsSync(outputDirectory)) {
      fs.mkdirSync(outputDirectory, { recursive: true });
    }

    // Read all files in the directory
    fs.readdir(directoryPath, { withFileTypes: true }, (err, files) => {
      if (err) {
        console.log('Error reading directory:', err);
        //reject(err);
        resolve(false);
        return;
      }

      // Filter for ZIP files only
      const zipFiles = files.filter(file => path.extname(file.name).toLowerCase() === '.zip');
      if (zipFiles.length === 0) {
        resolve(true);
        return;
      }

      // Process each ZIP file
      const promises = zipFiles.map(file => {
        const zipPath = path.join(directoryPath, file.parentPath);
        const extractPath = path.join(outputDirectory, path.basename(file.parentPath, '.zip'));
        return unZip(zipPath, extractPath);
      });
      Promise.allSettled(promises).then((results) => {
        const fulfilledResults = results
          .filter((result) => result.status === 'fulfilled')
          .map((result) => (result as PromiseFulfilledResult<Extensions>).value);
        console.log(fulfilledResults);
        resolve(true);
      });
    });
  });
};*/

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

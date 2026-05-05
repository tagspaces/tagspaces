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

  // Pull perspectives out of the generic extensions list. They drive the
  // perspective registry (id, title, icon name, beta/pro flags) and the
  // dynamic-import loader map below — both consumed at runtime by
  // src/renderer/perspectives/index.tsx and RenderPerspective.tsx.
  //
  // Identifier fields (id, componentExport, onboardingExport) are emitted
  // verbatim into a webpackChunkName comment and used as JS identifier
  // accessors at runtime. Validate them up-front so a typo in a manifest
  // (or a malformed string with `*/`, quotes, or other syntax-breaking
  // characters) fails the generation step with a clear warning instead of
  // producing broken extension-config.ts source.
  const IDENT_RE = /^[A-Za-z_][A-Za-z0-9_-]*$/;
  const PACKAGE_RE = /^@?[A-Za-z0-9_./-]+$/;

  const perspectives = extensions
    .filter((ext) => {
      if (
        !Array.isArray(ext.extensionTypes) ||
        !ext.extensionTypes.includes('perspective')
      ) {
        return false;
      }
      if (!ext.id || !ext.packageName) {
        console.warn(
          `generateExtensionsConfig: perspective skipped — missing id or packageName: ${ext.extensionId || ext.extensionName}`,
        );
        return false;
      }
      if (!IDENT_RE.test(ext.id)) {
        console.warn(
          `generateExtensionsConfig: perspective skipped — id "${ext.id}" must match ${IDENT_RE}`,
        );
        return false;
      }
      if (!PACKAGE_RE.test(ext.packageName)) {
        console.warn(
          `generateExtensionsConfig: perspective skipped — packageName "${ext.packageName}" must match ${PACKAGE_RE}`,
        );
        return false;
      }
      const componentExport = ext.componentExport || 'default';
      if (!IDENT_RE.test(componentExport)) {
        console.warn(
          `generateExtensionsConfig: perspective "${ext.id}" skipped — componentExport "${componentExport}" must match ${IDENT_RE}`,
        );
        return false;
      }
      if (ext.onboardingExport && !IDENT_RE.test(ext.onboardingExport)) {
        console.warn(
          `generateExtensionsConfig: perspective "${ext.id}" skipped — onboardingExport "${ext.onboardingExport}" must match ${IDENT_RE}`,
        );
        return false;
      }
      return true;
    })
    .map((ext) => ({
      id: ext.id,
      packageName: ext.packageName,
      title: ext.title || ext.extensionName,
      key: ext.key || 'open' + ext.id + 'Perspective',
      pro: ext.pro === true,
      beta: ext.beta === true,
      iconName: ext.iconName || 'Extension',
      componentExport: ext.componentExport || 'default',
      onboardingExport: ext.onboardingExport || null,
    }));

  // Loader map — emitted as real source so webpack statically analyses each
  // dynamic import() and produces a separate code-split chunk per
  // perspective package.
  const loaderEntries = perspectives
    .map((p) => {
      const chunk = JSON.stringify('Perspective_' + p.id);
      return `  ${JSON.stringify(p.id)}: () => import(/* webpackChunkName: ${chunk} */ ${JSON.stringify(p.packageName)}),`;
    })
    .join('\n');
  const loaderMapSrc =
    perspectives.length > 0
      ? 'export const externalPerspectiveLoaders: Record<string, () => Promise<any>> = {\n' +
        loaderEntries +
        '\n};\n'
      : 'export const externalPerspectiveLoaders: Record<string, () => Promise<any>> = {};\n';

  const generated =
    '/** GENERATED CODE - DO NOT MODIFY: This source file was generated automatically and any changes made to it may be overwritten */\n' +
    'export const extensionsFound = ' +
    JSON.stringify(extensions, null, 2) +
    ';\n' +
    'export const supportedFileTypes = ' +
    JSON.stringify(supportedFileTypes, null, 2) +
    ';\n' +
    'export const externalPerspectives = ' +
    JSON.stringify(perspectives, null, 2) +
    ';\n' +
    loaderMapSrc;
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

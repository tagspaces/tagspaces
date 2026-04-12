import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { dependencies } from '../../release/app/package.json';
import webpackPaths from '../configs/webpack.paths';

if (
  Object.keys(dependencies || {}).length > 0 &&
  fs.existsSync(webpackPaths.appNodeModulesPath)
) {
  // Read electron version explicitly to avoid "Unable to find electron's version number" on Windows
  const electronPkgPath = path.resolve(
    __dirname,
    '..',
    '..',
    'node_modules',
    'electron',
    'package.json',
  );
  let electronVersion = '';
  try {
    const electronPkg = JSON.parse(fs.readFileSync(electronPkgPath, 'utf-8'));
    electronVersion = ` -v ${electronPkg.version}`;
  } catch (e) {
    console.warn('Could not read electron version from', electronPkgPath);
  }
  const electronRebuildCmd = `../../node_modules/.bin/electron-rebuild --force --types prod,dev,optional --module-dir .${electronVersion}`;
  const cmd =
    process.platform === 'win32'
      ? electronRebuildCmd.replace(/\//g, '\\')
      : electronRebuildCmd;
  execSync(cmd, {
    cwd: webpackPaths.appPath,
    stdio: 'inherit',
  });
}

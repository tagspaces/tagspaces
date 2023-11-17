/* eslint import/prefer-default-export: off */
import { URL } from 'url';
import path from 'path';
import webpackPaths from '../../.erb/configs/webpack.paths';
import fs from 'fs';
import chalk from 'chalk';
import { execSync } from 'child_process';

export function resolveHtmlPath(htmlFileName: string) {
  if (process.env.NODE_ENV === 'development') {
    const port = process.env.PORT || 1212;
    const url = new URL(`http://localhost:${port}`);
    url.pathname = htmlFileName;
    return url.href;
  }
  return `file://${path.resolve(__dirname, '../renderer/', htmlFileName)}`;
}

/**
 * Warn version.json is missing
 */
export function checkVersionJson() {
  const version = path.resolve(webpackPaths.srcRendererPath, 'version.json');
  if (!fs.existsSync(version)) {
    console.log(
      chalk.black.bgYellow.bold(
        'The version.json files are missing. Sit back while we build them for you with "npm run version-meta"',
      ),
    );
    execSync('npm run version-meta');
  }
}

/**
 * Warn third-party.txt is missing
 */
export function checkThirdPartyTxt() {
  const thirdParty = path.resolve(
    webpackPaths.srcRendererPath,
    'third-party.txt',
  );
  if (!fs.existsSync(thirdParty)) {
    console.log(
      chalk.black.bgYellow.bold(
        'The third-party.txt files are missing. Sit back while we build them for you with "npm run third-party"',
      ),
    );
    execSync('npm run third-party');
  }
}

/**
 * generate JWT token
 */
export function generateJWT() {
  const env = path.resolve(webpackPaths.appPath, '.env');
  if (!fs.existsSync(env)) {
    console.log(
      chalk.black.bgYellow.bold(
        'The env files are missing. Sit back while we generate them for you with "KEY=testDevKey"',
      ),
    );
    console.log(
      chalk.red.bgWhiteBright.bold("Don't forget to change this KEY!"),
    );
    execSync('echo "KEY=testDevKey" > ' + env);
  }

  execSync('npm run generate-jwt');
}

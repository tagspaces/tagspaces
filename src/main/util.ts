/* eslint import/prefer-default-export: off */
import { URL } from 'url';
import path from 'path';
import { BrowserWindow } from 'electron';
import webpackPaths from '../../.erb/configs/webpack.paths';
import fs from 'fs';
import chalk from 'chalk';
import { execSync } from 'child_process';
import http from 'http';
import settings from './settings';

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
  execSync('npm run version-meta');
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
    execSync('echo KEY=testDevKey > ' + env);
  }

  execSync('npm run generate-jwt');
}

/**
 * @param payload: string
 * @param endpoint: string
 */
export function postRequest(payload, endpoint) {
  return isWorkerAvailable().then((workerAvailable) => {
    if (!workerAvailable) {
      return Promise.reject(new Error('no Worker Available!'));
    }
    return new Promise((resolve, reject) => {
      const option = {
        hostname: '127.0.0.1',
        port: settings.getUsedWsPort(),
        method: 'POST',
        path: endpoint,
        headers: {
          Authorization: 'Bearer ' + settings.getToken(),
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload, 'utf8'),
        },
      };
      const reqPost = http
        .request(option, (resp) => {
          // .get('http://127.0.0.1:8888/thumb-gen?' + search.toString(), resp => {
          let data = '';

          // A chunk of data has been received.
          resp.on('data', (chunk) => {
            data += chunk;
          });

          // The whole response has been received. Print out the result.
          resp.on('end', () => {
            if (data) {
              try {
                resolve(JSON.parse(data));
              } catch (ex) {
                reject(ex);
              }
            } else {
              reject(new Error('Error: no data'));
            }
          });
        })
        .on('error', (err) => {
          console.log('Error: ' + err.message);
          reject(err);
        });
      reqPost.write(payload);
      reqPost.end();
    });
  });
}

/**
 * @param filename
 * @returns {Promise<TS.Tag[]>}
 */
export function readMacOSTags(filename) {
  const cmdArr = [
    'mdls',
    '-raw',
    '-name',
    'kMDItemUserTags',
    '"' + filename + '"',
  ];
  const cmd = cmdArr.join(' ');

  return new Promise((resolve, reject) => {
    const foundTags = [];
    const { exec } = require('child_process');
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.error(error);
        reject(error);
      }
      if (stderr) {
        console.log(stderr);
        reject(stderr);
      }
      if (stdout && stdout !== '(null)') {
        stdout
          .toString()
          .replace(/^\(|\)$/g, '')
          .split(',')
          .map((item) => {
            const newTag = {
              // id: uuidv1(),
              title: item.trim(),
            };
            foundTags.push(newTag);
            return newTag;
          });

        resolve(foundTags);
        // console.log('Tags in file "' + filename + '": ' + JSON.stringify(foundTags));
      } else {
        resolve(foundTags);
      }
    });
  });
}

/**
 * needs to run in init this function always return false first time
 */
export function isWorkerAvailable(): Promise<boolean> {
  if (settings.getToken() !== undefined) {
    return Promise.resolve(settings.getToken() !== 'not');
  }
  try {
    fetch('http://127.0.0.1:' + settings.getUsedWsPort(), {
      method: 'HEAD',
    }).then((res) => {
      if (res.status === 200) {
        const config = require('./config/config.json');
        if (config && config.jwt) {
          settings.setToken(config.jwt);
          return true;
        } else {
          console.error('jwt token not generated');
          settings.setToken('not');
        }
      }
    });
  } catch (e) {
    if (e && e.code && e.code === 'MODULE_NOT_FOUND') {
      console.error('WS error MODULE_NOT_FOUND');
      settings.setToken('not');
    }
    console.debug('isWorkerAvailable:', e);
  }
  return Promise.resolve(false);
}

export function newProgress(key, total) {
  return {
    loaded: 0,
    total: total,
    key,
  };
}
export function getOnProgress(key, progress) {
  const controller = new AbortController();
  const signal = controller.signal;

  progress[key].abort = () => {
    controller.abort();
    //reject(new Error('Promise aborted'));
  };
  signal.addEventListener('abort', progress[key].abort);
  const onProgress = (newProgress, abortFunc, fileName) => {
    signal.removeEventListener('abort', progress[key].abort);
    progress[key].abort = () => {
      if (abortFunc) {
        abortFunc();
      }
      controller.abort();
      //reject(new Error('Promise aborted'));
    };
    signal.addEventListener('abort', progress[key].abort);
    try {
      const mainWindow = BrowserWindow.getFocusedWindow();
      mainWindow.webContents.send('progress', fileName, newProgress);
    } catch (ex) {
      console.error(ex);
    }
  };
  return onProgress;
}

export function stringifyMaxDepth(obj, depth = 1) {
  // recursion limited by depth arg
  if (!obj || typeof obj !== 'object') return JSON.stringify(obj);

  let curDepthResult = '"<?>"'; // too deep
  if (depth > 0) {
    curDepthResult = Object.keys(obj)
      .map((key) => {
        let val = stringifyMaxDepth(obj[key], depth - 1);
        if (val === undefined) val = 'null';
        return `"${key}": ${val}`;
      })
      .join(', ');
    curDepthResult = `{${curDepthResult}}`;
  }

  return JSON.stringify(JSON.parse(curDepthResult));
}

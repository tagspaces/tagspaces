import pathLib from 'path';
import fs from 'fs';
import sh from 'shelljs';
import express from 'express';
import serveStatic from 'serve-static';
import portfinder from 'portfinder';
const S3rver = require('s3rver');
//const corsConfig = require.resolve('./s3rver/cors.xml');

export async function globalSetup() {
  // global.isWin = /^win/.test(process.platform);
  // global.isMac = /^darwin/.test(process.platform);

  const extensionDir = pathLib.resolve(__dirname); //,'../tests');
  if (!sh.test('-d', extensionDir)) {
    sh.mkdir(extensionDir);
  }

  sh.cd(extensionDir);
}

export async function startMinio(isWin, testWorkerDir) {
  const winMinio = pathLib.resolve(__dirname, './bin/minio.exe');
  const unixMinio = pathLib.resolve(__dirname, './bin/minio');

  const command = isWin ? winMinio : unixMinio;
  const minioProcess = await require('child_process').spawn(command, [
    'server',
    pathLib.resolve(__dirname, testWorkerDir, 'file-structure'),
  ]);

  minioProcess.on('exit', function (code) {
    // console.log('exit here with code: ', code);
  });
  minioProcess.on('close', (code, signal) => {
    // console.log(`child process terminated due to receipt of signal ${signal}`);
  });

  minioProcess.stdout.on('data', function (data) {
    // console.log('stdout: ' + data);
  });

  minioProcess.stderr.on('data', function (data) {
    console.log('stderr: ' + data);
  });
  return minioProcess;
}
/*export function stopMinio(process) {
  if (process) {
    // Send SIGHUP to process.
    console.log('stopMinio');
    process.stdin.pause();
    process.kill(); //'SIGHUP');
  }
}*/

/**
 * Start a static file server on a free port.
 *
 * @param {number} [preferredPort=0]  Pass 0 to let the OS pick an available port.
 * @returns {Promise<{ app: import('express').Express, port: number, server: import('http').Server }>}
 */
export async function startWebServer(preferredPort = 0) {
  const app = express();

  // Serve the contents of ../web with index.html as the default
  app.use(
    serveStatic(pathLib.resolve(__dirname, '../web'), {
      index: ['index.html'],
    }),
  );
  // If preferredPort is 0, let portfinder choose between 1024 and 49151
  let portToUse = preferredPort;
  if (preferredPort === 0) {
    portfinder.basePort = 1024;
    portfinder.highestPort = 49151;
    portToUse = await portfinder.getPortPromise();
  }

  return new Promise((resolve, reject) => {
    // Listen on 0 to let the OS assign a free port
    const server = app.listen(portToUse, '127.0.0.1', () => {
      const { port } = server.address();
      console.log(`Webserver listening at http://127.0.0.1:${port}`);
      resolve({ app, port, server });
    });

    server.on('error', reject);
  });
}

/*export async function stopServices(s3Server, webServer, minioServer) {
  await stopS3Server(s3Server);
  await stopWebServer(webServer);
  await stopMinio(minioServer);
}*/

/*export async function stopWebServer(app) {
  if (app) {
    await app.server.close();
    app = null;
  }
}*/

/*export async function stopS3Server(server) {
  if (server) {
    await server.close();
    server = null;
  }
}*/

export async function runS3Server(folder, silent = true) {
  // Set NODE_OPTIONS environment variable to use openssl-legacy-provider
  process.env.NODE_OPTIONS = '--openssl-legacy-provider';

  const directoryTargetPath = pathLib.resolve(
    __dirname,
    folder, //'testdata-tmp',
    'file-structure',
  );
  const corsConfig = pathLib.resolve(__dirname, 's3rver', 'cors.xml');
  const instance = new S3rver({
    port: 4569,
    address: 'localhost',
    silent: silent,
    directory: directoryTargetPath,
    resetOnClose: true,
    sslEnabled: false,
    configureBuckets: [
      {
        name: 'supported-filestypes',
        configs: [fs.readFileSync(corsConfig)],
      },
    ],
  });
  try {
    await instance.run();
    console.log('S3rver running for folder:' + directoryTargetPath);
  } catch (e) {
    console.log('S3rver run', e);
  }
  return instance;
}

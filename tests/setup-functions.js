import pathLib from 'path';
import fs from 'fs';
import sh from 'shelljs';
import express from 'express';
import serveStatic from 'serve-static';
import portfinder from 'portfinder';
import http from 'http';

export async function globalSetup() {
  const extensionDir = pathLib.resolve(__dirname);
  if (!sh.test('-d', extensionDir)) {
    sh.mkdir(extensionDir);
  }

  sh.cd(extensionDir);
}

/**
 * Start S3Proxy (Java-based S3-compatible server) for a given test worker directory.
 *
 * @param {string} testWorkerDir  Relative directory under tests/ (e.g. 'testdata-0')
 * @param {number} [port=4569]    Port to listen on
 * @param {boolean} [silent=true] Suppress stdout
 * @returns {Promise<import('child_process').ChildProcess>}
 */
export async function runS3Proxy(testWorkerDir, port = 4569, silent = true) {
  const { spawn } = require('child_process');

  const baseDir = pathLib.resolve(
    __dirname,
    testWorkerDir,
    'file-structure',
  );

  // Create the bucket directory if it doesn't exist
  const bucketDir = pathLib.join(baseDir, 'supported-filestypes');
  if (!fs.existsSync(bucketDir)) {
    fs.mkdirSync(bucketDir, { recursive: true });
  }

  // Write a per-worker config file
  const configPath = pathLib.resolve(
    __dirname,
    testWorkerDir,
    's3proxy.conf',
  );
  fs.writeFileSync(
    configPath,
    [
      's3proxy.authorization=none',
      `s3proxy.endpoint=http://127.0.0.1:${port}`,
      's3proxy.ignore-unknown-headers=true',
      'jclouds.provider=filesystem-nio2',
      'jclouds.identity=test',
      'jclouds.credential=test',
      `jclouds.filesystem.basedir=${baseDir}`,
    ].join('\n') + '\n',
  );

  const jarPath = pathLib.resolve(__dirname, 's3proxy.jar');
  const s3proxyProcess = spawn('java', [
    '-jar',
    jarPath,
    '--properties',
    configPath,
  ]);

  s3proxyProcess.on('exit', function (code) {
    // console.log('S3Proxy exit with code:', code);
  });
  s3proxyProcess.on('close', (code, signal) => {
    // console.log(`S3Proxy terminated due to signal ${signal}`);
  });

  if (!silent) {
    s3proxyProcess.stdout.on('data', function (data) {
      console.log('S3Proxy stdout: ' + data);
    });
  }

  s3proxyProcess.stderr.on('data', function (data) {
    if (!silent) {
      console.log('S3Proxy stderr: ' + data);
    }
  });

  // Wait for S3Proxy to be ready by polling the endpoint
  await waitForPort(port, 15000);
  console.log(`S3Proxy running on port ${port} for dir: ${baseDir}`);

  return s3proxyProcess;
}

/**
 * Poll until a port is accepting connections.
 */
function waitForPort(port, timeoutMs = 10000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const check = () => {
      const req = http.get(`http://127.0.0.1:${port}/`, (res) => {
        res.resume();
        resolve();
      });
      req.on('error', () => {
        if (Date.now() - start > timeoutMs) {
          reject(new Error(`S3Proxy did not start within ${timeoutMs}ms`));
        } else {
          setTimeout(check, 200);
        }
      });
      req.end();
    };
    check();
  });
}

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

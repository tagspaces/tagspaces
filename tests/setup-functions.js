import pathLib from 'path';
import fs from 'fs';
import sh from 'shelljs';
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

export async function startMinio() {
  const winMinio = pathLib.resolve(__dirname, './bin/minio.exe');
  const unixMinio = pathLib.resolve(__dirname, './bin/minio');

  const command = global.isWin ? winMinio : unixMinio;
  const minioProcess = await require('child_process').spawn(command, [
    'server',
    pathLib.resolve(__dirname, './testdata-tmp/file-structure'),
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
export function stopMinio(process) {
  // Send SIGHUP to process.
  console.log('stopMinio');
  process.stdin.pause();
  process.kill(); //'SIGHUP');
}

export async function startChromeDriver() {
  //const childProcess = await require('child_process');
  const chromeDriver = await require('chromedriver');
  //const binPath = chromedriver.path;

  const args = ['--url-base=/', '--port=9515'];

  await chromeDriver.start(args);
  /*const process = await childProcess.execFile(binPath, args, function (err, stdout, stderr) {
    // handle results
    console.log('err: ' + err);
    console.log('stdout: ' + stdout);
    console.log('stderr: ' + stderr);
  });*/
  return chromeDriver;
}

export async function stopChromeDriver(chromeDriver) {
  chromeDriver.stop();
  // Send SIGHUP to process.
  /*console.log('stopChromeDriver');
  process.stdin.pause();
  process.kill(); //'SIGHUP');*/
}

export async function startWebServer() {
  const express = await require('express');
  const serveStatic = await require('serve-static');

  const port = 8000;
  const app = express();

  await app.use(
    serveStatic(pathLib.resolve(__dirname, '../web'), {
      index: ['index.html'],
    }),
  );
  if (global.isMac) {
    //todo copyfiles do not work for MacOS
    // await app.use(serveStatic('../app'));
  }
  app.server = app.listen(port);
  console.log('Webserver listining on http://127.0.0.1:' + port);
  return app;
}

export async function stopServices(s3Server, webServer) {
  await stopS3Server(s3Server);
  await stopWebServer(webServer);
}

export async function stopWebServer(app) {
  if (app) {
    await app.server.close();
    app = null;
  }
}

export async function stopS3Server(server) {
  if (server) {
    await server.close();
    server = null;
  }
}

export async function runS3Server() {
  const directoryTargetPath = pathLib.resolve(
    __dirname,
    'testdata-tmp',
    'file-structure',
  );
  const corsConfig = pathLib.resolve(__dirname, 's3rver', 'cors.xml');
  const instance = new S3rver({
    port: 4569,
    address: 'localhost',
    silent: true,
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

  await instance.run();
  return instance;
}

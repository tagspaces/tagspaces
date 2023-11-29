import pathLib from 'path';
import sh from 'shelljs';

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

export async function stopWebServer(app) {
  await app.server.close();
  app = null;
}

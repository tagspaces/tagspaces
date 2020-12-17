import pathLib from 'path';
import sh from 'shelljs';
import { testDataRefresh } from './e2e/hook';

module.exports = async function() {
  // const winMinio = pathLib.resolve(__dirname, './bin/minio.exe');
  // const unixMinio = 'minio';

  global.isWin = /^win/.test(process.platform);
  global.isMac = /^darwin/.test(process.platform);
  // global.isWeb = process.env.NODE_JEST === 'test_web';
  // global.isMinio = global.isWeb || process.env.NODE_JEST === 'test_minio';

  async function startMinio() {
    const command = global.isWin ? pathLib.resolve(winMinio) : unixMinio;
    const minioProcess = await require('child_process').spawn(command, [
      'server',
      pathLib.resolve('./testdata/file-structure')
    ]);

    minioProcess.on('exit', function(code) {
      // console.log('exit here with code: ', code);
    });
    minioProcess.on('close', (code, signal) => {
      // console.log(`child process terminated due to receipt of signal ${signal}`);
    });

    minioProcess.stdout.on('data', function(data) {
      // console.log('stdout: ' + data);
    });

    minioProcess.stderr.on('data', function(data) {
      console.log('stderr: ' + data);
    });
    return minioProcess;
  }

  async function startChromeDriver() {
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

  async function startWebServer() {
    const express = await require('express');
    const serveStatic = await require('serve-static');

    const port = 8000;
    const app = await express();

    await app.use(
      serveStatic(pathLib.resolve(__dirname, '../web'), {
        index: ['index.html']
      })
    );
    if (global.isMac) {
      //todo copyfiles do not work for MacOS
      await app.use(serveStatic('../app'));
    }
    await app.listen(port);
    console.log('Webserver listining on http://127.0.0.1:' + port);
    return app;
  }

  const extensionDir = pathLib.resolve(__dirname); //,'../tests');
  if (!sh.test('-d', extensionDir)) {
    sh.mkdir(extensionDir);
  }

  sh.cd(extensionDir);

  /*if (global.isWeb) {
    global.webserver = await startWebServer();
    global.chromeDriver = await startChromeDriver();
  }
  if (global.isMinio) {
    global.minio = await startMinio();
  } else {*/
  // copy extconfig
  const fse = require('fs-extra');
  const path = require('path');

  let srcDir = path.join(__dirname, '..', 'scripts', 'extconfig.js');
  let destDir = path.join(__dirname, '..', 'app', 'extconfig.js');

  fse.copySync(srcDir, destDir);
  // testDataRefresh();
  // }
};

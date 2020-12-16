import pathLib from 'path';
import sh from 'shelljs';
import { testDataRefresh } from './e2e/hook';

module.exports = async function() {
  const winMinio = pathLib.resolve(__dirname, './bin/minio.exe');
  const unixMinio = 'minio';

  global.isWin = /^win/.test(process.platform);
  global.isMac = /^darwin/.test(process.platform);

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

  const extensionDir = pathLib.resolve(__dirname); //,'../tests');
  if (!sh.test('-d', extensionDir)) {
    sh.mkdir(extensionDir);
  }

  sh.cd(extensionDir);
  // testDataRefresh();
  global.minio = await startMinio();
};

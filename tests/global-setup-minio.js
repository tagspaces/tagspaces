import pathLib from 'path';
import { globalSetup, startMinio } from './setup-functions';

module.exports = async function() {
  await globalSetup();

  const fse = require('fs-extra');
  fse.removeSync(pathLib.join(__dirname, '..', 'app', 'extconfig.js'));

  global.minio = await startMinio();
};

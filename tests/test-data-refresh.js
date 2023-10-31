import pathLib from 'path';

const fse = require('fs-extra');

const src = pathLib.join(
  __dirname,
  'testdata',
  'file-structure',
  'supported-filestypes',
);
const dst = pathLib.join(__dirname, 'testdata-tmp', 'file-structure');

let newPath = pathLib.join(dst, pathLib.basename(src));
// fse.emptyDirSync(newPath);
fse.copySync(src, newPath); //, { overwrite: true });

const fs = require('fs-extra');
const pathLib = require('path');

fs.outputFileSync(
  pathLib.join(__dirname, '../release/app/.env'),
  'KEY=e2eTestKey',
);

/* const sh = require('shelljs');
const path = require('path');
// const fs = require('fs-extra');

if (!sh.which('git')) {
  sh.echo('Sorry, this script requires git');
  sh.exit(1);
}

if (!sh.which('yarn')) {
  sh.echo('Sorry, this script requires yarn');
  sh.exit(1);
}

const extensionDir = path.resolve(__dirname, '../tests');
if (!sh.test('-d', extensionDir)) {
  sh.mkdir(extensionDir);
}

sh.cd(extensionDir); */

/**
 * @Deprecated use github action script for setup instead
 */
/*
const extensionBranch = 'master';
const extensionList = [
  {
    path: 'testdata',
    url: 'https://github.com/tagspaces/testdata'
  }
];

extensionList.forEach(extension => {
  if (sh.test('-d', extension.path)) {
    sh.cd(extension.path);
    sh.exec('git checkout ' + extensionBranch);
    sh.exec('git pull');
  } else {
    sh.exec('git clone -b ' + extensionBranch + ' ' + extension.url);
    sh.cd(extension.path);
  }
  sh.cd('..');
});

// Download
const winUrl = 'https://dl.min.io/server/minio/release/windows-amd64/minio.exe';
const linuxUrl = 'https://dl.min.io/server/minio/release/linux-amd64/minio';
const macUrl = 'https://dl.min.io/server/minio/release/darwin-amd64/minio';
const isWin = /^win/.test(process.platform);
const isMac = /^darwin/.test(process.platform);
const isLinux = /^linux/.test(process.platform);
const url = isWin ? winUrl : isMac ? macUrl : isLinux ? linuxUrl : undefined;

const outDir = path.resolve(__dirname, '../tests/bin');
if (!sh.test('-d', outDir)) {
  sh.mkdir(outDir);
  sh.cd(outDir);
  sh.exec('curl -O -J ' + url);
  if (!isWin) {
    sh.exec('chmod -R +x .');
  }
}
*/
/* const outFile = path.join(outDir, 'minio.exe');
if (!fs.existsSync(outFile)) {
  //! sh.test('-d', 'bin') ||
  sh.exec('curl -O -J ' + outFile + ' ' + url);
} */

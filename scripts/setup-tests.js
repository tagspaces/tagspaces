const sh = require('shelljs');
// const path = require('path');

if (!sh.which('git')) {
  sh.echo('Sorry, this script requires git');
  sh.exit(1);
}

if (!sh.which('yarn')) {
  sh.echo('Sorry, this script requires yarn');
  sh.exit(1);
}

const extensionDir = 'tests';
const extensionBranch = 'master';

const extensionList = [
  {
    path: 'testdata',
    url: 'https://github.com/tagspaces/testdata'
  }
];

if (!sh.test('-d', extensionDir)) {
  sh.mkdir(extensionDir);
}

sh.cd(extensionDir);

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

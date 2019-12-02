const sh = require('shelljs');
const { version, productName } = require('../app/package.json');

if (!sh.which('git')) {
  sh.echo('Sorry, this script requires git');
  sh.exit(1);
}

const buildTime = new Date().toISOString();
sh.exec(
  'git log --format="%H" -n 1',
  { silent: true },
  (code, lastCommitId) => {
    if (lastCommitId.length > 1) {
      lastCommitId = lastCommitId.slice(0, lastCommitId.length - 1);
    }
    sh.echo(
      '{"commitId": "' +
        lastCommitId +
        '", "buildTime": "' +
        buildTime +
        '", "version": "' +
        version +
        '", "name": "' +
        productName +
        '"}'
    ).to('app/version.json');
    // sh.sed('-i', 'BUILD_VERSION', 'v0.1.2', file);
  }
);

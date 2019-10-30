const sh = require('shelljs');
const { version, productName } = require('../app/package.json');

const FILES_TO_CACHE = [
  'offline.html',
];

sh.cd('web/dist');
sh.ls('*.js').forEach((file) => {
  FILES_TO_CACHE.push('dist/' + file);
});
sh.ls('*.ttf').forEach((file) => {
  FILES_TO_CACHE.push('dist/' + file);
});
sh.ls('*.woff*').forEach((file) => {
  FILES_TO_CACHE.push('dist/' + file);
});
sh.ls('*.css').forEach((file) => {
  FILES_TO_CACHE.push('dist/' + file);
});

let CACHE_STRING = '\nconst FILES_TO_CACHE = [\n';
FILES_TO_CACHE.forEach((file) => {
  CACHE_STRING += '  "' + file + '",\n';
});
CACHE_STRING += '];';

const buildTime = (new Date()).getTime(); // toISOString();
sh.echo('const CACHE_NAME = "TS-' + version + '-' + buildTime + '";' + CACHE_STRING)
  .to('../sw-config.js');

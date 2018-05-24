const jsDAV = require('jsDAV/lib/jsdav');
const jsDAV_Auth_Backend_File = require('jsDAV/lib/DAV/plugins/auth/file');

jsDAV.debugMode = true;
jsDAV.createServer(
  {
    node: './cordova/www',
    authBackend: jsDAV_Auth_Backend_File.new('./scripts/jsdavauth'),
    realm: 'jdavtest'
  },
  8000
);

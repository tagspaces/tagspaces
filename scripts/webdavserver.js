const jsDAV = require('jsDAV/lib/jsdav');
const jsDAVAuthBackendFile = require('jsDAV/lib/DAV/plugins/auth/file');

jsDAV.debugMode = false;
jsDAV.createServer(
  {
    node: './web',
    authBackend: jsDAVAuthBackendFile.new('./scripts/jsdavauth'),
    realm: 'jdavtest'
  },
  8000
);

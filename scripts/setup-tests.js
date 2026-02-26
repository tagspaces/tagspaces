const fs = require('fs-extra');
const pathLib = require('path');

fs.outputFileSync(
  pathLib.join(__dirname, '../release/app/.env'),
  'KEY=e2eTestKey',
);

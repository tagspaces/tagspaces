module.exports = async function() {
  const fse = require('fs-extra');
  const path = require('path');
  fse.removeSync(path.join(__dirname, '..', 'app', 'extconfig.js'));
};

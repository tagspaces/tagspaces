const jwt = require('jsonwebtoken');
const fs = require('fs-extra');
const pathLib = require('path');
const propertiesReader = require('properties-reader');

const propsPath = pathLib.join(__dirname, '..', 'release', 'app', '.env');
if (!fs.existsSync(propsPath)) {
  throw new Error(
    propsPath + ' file not exist! Please create it and add property KEY=xxx',
  );
}
const properties = propertiesReader(propsPath);

const payload = { provider: 'tagspaces', date: Math.floor(Date.now() / 1000) };
const token = jwt.sign(payload, properties.get('KEY'));

const content = '{"jwt":"' + token + '"}';

fs.outputFileSync(
  pathLib.join(__dirname, '../src/main/config/config.json'),
  content,
);
/* fs.writeFile(
  pathLib.join(__dirname, '../app/config/config.json'),
  content,
  err => {
    if (err) {
      console.error(err);
    }
    // file written successfully
  }
); */

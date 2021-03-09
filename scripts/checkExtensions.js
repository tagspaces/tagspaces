const fs = require('fs');
const path = require('path');
const spawn = require('cross-spawn');

if (!fs.existsSync(path.resolve(__dirname, '../app/node_modules'))) {
  /* throw new Error(
    'Error: app/node_modules directory missing. Run "yarn install-ext" first'
  ); */
  const result = spawn.sync(
    'yarn',
    ['--cwd', path.resolve(__dirname, '../app'), 'install'],
    {
      stdio: 'inherit'
    }
  );
  console.log(result);
}

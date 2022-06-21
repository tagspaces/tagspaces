/* eslint global-require: off */
//const execa = require('execa');
const fs = require('fs-extra');
const path = require('path');

/*function getElectronVersion() {
  const { stdout } = execa.sync('electron', ['--version'], {
    env: { ELECTRON_RUN_AS_NODE: true }
  });
  return (
    stdout &&
    stdout
      .toString()
      .trim()
      .slice(1)
  );
}*/
function getElectronVersion() {
  const packageJson = fs.readFileSync(
    path.join(__dirname, 'package.json'),
    'utf8'
  );
  return JSON.parse(packageJson).devDependencies['electron'];
}

const developmentEnvironments = ['development', 'test'];

const developmentPlugins = [require('react-hot-loader/babel')];

const productionPlugins = [
  require('babel-plugin-dev-expression'),

  // babel-preset-react-optimize
  require('@babel/plugin-transform-react-constant-elements'),
  require('@babel/plugin-transform-react-inline-elements'),
  require('babel-plugin-transform-react-remove-prop-types')
];

module.exports = api => {
  // see docs about api at https://babeljs.io/docs/en/config-files#apicache

  const development = api.env(developmentEnvironments);

  return {
    presets: [
      [
        require('@babel/preset-env'),
        {
          targets: {
            electron: getElectronVersion() /* require('electron/package.json').version */
          },
          useBuiltIns: 'usage',
          corejs: '3.0.0'
        }
      ],
      require('@babel/preset-typescript'),
      [require('@babel/preset-react'), { development }]
    ],
    plugins: [
      // Stage 0
      require('@babel/plugin-proposal-function-bind'),

      // Stage 1
      require('@babel/plugin-proposal-export-default-from'),
      require('@babel/plugin-proposal-logical-assignment-operators'),
      [require('@babel/plugin-proposal-optional-chaining'), { loose: false }],
      [
        require('@babel/plugin-proposal-pipeline-operator'),
        { proposal: 'minimal' }
      ],
      [
        require('@babel/plugin-proposal-nullish-coalescing-operator'),
        { loose: false }
      ],
      require('@babel/plugin-proposal-do-expressions'),

      // Stage 2
      [require('@babel/plugin-proposal-decorators'), { legacy: true }],
      require('@babel/plugin-proposal-function-sent'),
      require('@babel/plugin-proposal-export-namespace-from'),
      require('@babel/plugin-proposal-numeric-separator'),
      require('@babel/plugin-proposal-throw-expressions'),

      // Stage 3
      require('@babel/plugin-syntax-dynamic-import'),
      require('@babel/plugin-syntax-import-meta'),
      [require('@babel/plugin-proposal-class-properties'), { loose: true }],
      require('@babel/plugin-proposal-json-strings'),

      [
        'module-resolver',
        {
          alias: {
            '-': './app'
          }
        }
      ],

      ...(development ? developmentPlugins : productionPlugins)
    ]
  };
};

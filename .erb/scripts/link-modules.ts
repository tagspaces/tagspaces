import fs from 'fs';
import webpackPaths from '../configs/webpack.paths';
import path from 'path';

const {
  srcNodeModulesPath,
  appNodeModulesPath,
  erbPath,
  erbNodeModulesPath,
  appPath,
  srcPath,
  distPath,
} = webpackPaths;

try {
  if (fs.existsSync(srcNodeModulesPath)) {
    fs.unlinkSync(srcNodeModulesPath);
  }
} catch (err) {
  console.error('Error removing file:' + srcNodeModulesPath, err);
}
if (fs.existsSync(appNodeModulesPath)) {
  fs.symlinkSync(appNodeModulesPath, srcNodeModulesPath, 'junction');
}

if (!fs.existsSync(erbNodeModulesPath) && fs.existsSync(appNodeModulesPath)) {
  fs.symlinkSync(appNodeModulesPath, erbNodeModulesPath, 'junction');
}

const targetNodeModules = path.join(distPath, 'node_modules');
try {
  if (fs.existsSync(targetNodeModules)) {
    fs.unlinkSync(targetNodeModules);
  }
} catch (err) {
  console.error('Error removing file:' + targetNodeModules, err);
}
if (fs.existsSync(appNodeModulesPath)) {
  try {
    fs.symlinkSync(appNodeModulesPath, targetNodeModules, 'junction');
  } catch (err) {
    console.error(
      'Error creating link target:' + targetNodeModules + ':' + err.message,
    );
  }
}

////////link .env
const targetEnv = path.join(erbPath, '.env'); //srcPath, '.env');
const appEnv = path.join(appPath, '.env');

try {
  if (fs.existsSync(targetEnv)) {
    fs.unlinkSync(targetEnv);
  }
} catch (err) {
  console.error('Error removing file:' + targetEnv, err);
}
if (fs.existsSync(appEnv)) {
  try {
    fs.symlinkSync(appEnv, targetEnv, 'file');
  } catch (e) {
    console.log(appEnv + ' exist');
  }
}

const distEnv = path.join(distPath, '.env');
try {
  if (fs.existsSync(distEnv)) {
    fs.unlinkSync(distEnv);
  }
} catch (err) {
  console.error('Error removing file:' + distEnv, err);
}
if (fs.existsSync(appEnv)) {
  try {
    fs.symlinkSync(appEnv, distEnv, 'file');
  } catch (e) {
    console.log(distEnv + ' exist');
  }
}

//node-lama-cpp
const nodeLama = path.join(
  __dirname,
  '..',
  '..',
  'node_modules',
  '@node-llama-cpp',
);
if (fs.existsSync(nodeLama)) {
  const targetNodeLama = path.join(
    __dirname,
    '..',
    '..',
    'release',
    'app',
    'node_modules',
    '@node-llama-cpp',
  );
  if (!fs.existsSync(targetNodeLama)) {
    try {
      fs.symlinkSync(nodeLama, targetNodeLama, 'junction');
    } catch (err) {
      console.error(
        'Error creating link target:' + targetNodeLama + ':' + err.message,
      );
    }
  }
}

const nLama = path.join(
  __dirname,
  '..',
  '..',
  'node_modules',
  'node-llama-cpp',
);
if (fs.existsSync(nLama)) {
  const targetNLama = path.join(
    __dirname,
    '..',
    '..',
    'release',
    'app',
    'node_modules',
    'node-llama-cpp',
  );
  if (!fs.existsSync(targetNLama)) {
    try {
      fs.symlinkSync(nLama, targetNLama, 'junction');
    } catch (err) {
      console.error(
        'Error creating link target:' + targetNLama + ':' + err.message,
      );
    }
  }
}

import fs from 'fs';
import webpackPaths from '../.erb/configs/webpack.paths';
import path from 'path';

const { releasePath, rootPath } = webpackPaths;

// Link extensions
const srcExt = path.join(releasePath, 'app/node_modules/@tagspaces/extensions');
const targetExt = path.join(rootPath, 'public/modules/@tagspaces/extensions');
try {
  if (fs.existsSync(targetExt)) {
    fs.unlinkSync(targetExt);
  }
} catch (err) {
  console.error('Error removing file:' + targetExt, err);
}

if (fs.existsSync(srcExt)) {
  fs.symlinkSync(srcExt, targetExt, 'junction');
}

// link Pro extensions
const srcProExt = path.join(
  releasePath,
  'app/node_modules/@tagspacespro/extensions',
);
const targetProExt = path.join(
  rootPath,
  'public/modules/@tagspacespro/extensions',
);
try {
  if (fs.existsSync(targetProExt)) {
    fs.unlinkSync(targetProExt);
  }
} catch (err) {
  console.error('Error removing file:' + targetProExt, err);
}

if (fs.existsSync(srcProExt)) {
  fs.symlinkSync(srcProExt, targetProExt, 'junction');
}

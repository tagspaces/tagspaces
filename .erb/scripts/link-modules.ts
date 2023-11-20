import fs from 'fs';
import webpackPaths from '../configs/webpack.paths';
import path from "path";

const { srcNodeModulesPath, appNodeModulesPath, appPath, srcPath, distPath } = webpackPaths;

if (!fs.existsSync(srcNodeModulesPath) && fs.existsSync(appNodeModulesPath)) {
  fs.symlinkSync(appNodeModulesPath, srcNodeModulesPath, 'junction');
}

const targetNodeModules = path.join(distPath, 'node_modules');

if (!fs.existsSync(targetNodeModules) && fs.existsSync(appNodeModulesPath)) {
  fs.symlinkSync(appNodeModulesPath, targetNodeModules, 'junction');
}

////////link .env

const targetEnv = path.join(srcPath, '.env');
const appEnv = path.join(appPath, '.env');

if (!fs.existsSync(targetEnv) && fs.existsSync(appEnv)) {
  fs.symlinkSync(appEnv, targetEnv, 'junction');
}

const distEnv = path.join(distPath, '.env');

if (!fs.existsSync(distEnv) && fs.existsSync(appEnv)) {
  fs.symlinkSync(appEnv, distEnv, 'junction');
}

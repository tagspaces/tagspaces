import webpack from 'webpack';
import path from 'path';
import webpackPaths from '../.erb/configs/webpack.paths';
import fs from 'fs';
import fsPromises from 'fs/promises';
import chalk from 'chalk';
import { execFile, spawn } from 'child_process';

export class TsMetaPlugin {
  apply(compiler: webpack.Compiler) {
    /**
     * Warn third-party.txt is missing
     */
    async function checkThirdPartyTxt(): Promise<void> {
      const thirdParty = path.resolve(
        webpackPaths.srcRendererPath,
        'third-party.txt',
      );

      try {
        // Try to read the file metadata; if it doesn't exist, we'll catch below
        await fsPromises.access(thirdParty);
        // file exists — nothing to do
      } catch {
        // file is missing
        console.log(
          chalk.black.bgYellow.bold(
            'The third-party.txt file is missing. Sit back while we build it for you with "npm run third-party"',
          ),
        );

        const root = path.resolve(webpackPaths.rootPath);
        const entryPoint = path.join(
          root,
          'node_modules',
          'generate-license-file',
          'bin',
          'generate-license-file',
        );

        if (!fs.existsSync(entryPoint)) {
          throw new Error(
            `Cannot find generate-license-file script at ${entryPoint}`,
          );
        }

        await new Promise<void>((resolve, reject) => {
          // On Windows, shell=false is fine because we're calling Node directly.
          const child = spawn(process.execPath, [entryPoint], {
            cwd: root,
            stdio: 'inherit',
            shell: false,
          });

          child.on('error', reject);
          child.on('exit', (code, signal) => {
            if (signal) return reject(new Error(`killed by signal ${signal}`));
            if (code !== 0) return reject(new Error(`exit code ${code}`));
            resolve();
          });
        });
      }
    }

    /**
     * Warn version.json is missing
     */
    async function checkVersionJson() {
      const cwd = path.resolve(webpackPaths.rootPath);
      const script = path.join(cwd, 'scripts', 'versionmeta.js');

      // Spawn "npm run version-meta" asynchronously
      await new Promise<void>((resolve, reject) => {
        execFile(
          'node',
          [script],
          { cwd, stdio: 'inherit' },
          (err, _stdout, _stderr) => {
            if (err) return reject(err);
            resolve();
          },
        );
      });
    }

    /**
     * generate JWT token
     */
    async function generateJWT() {
      const envPath = path.resolve(webpackPaths.appPath, '.env');
      try {
        // Try to read the file metadata; if it doesn't exist, we'll catch below
        await fsPromises.access(envPath);
        // file exists — nothing to do
      } catch {
        console.log(
          chalk.black.bgYellow.bold(
            'The env files are missing. Sit back while we generate them for you with "KEY=testDevKey"',
          ),
        );
        console.log(
          chalk.red.bgWhiteBright.bold("Don't forget to change this KEY!"),
        );
        // write the file atomically
        fs.writeFileSync(envPath, 'KEY=testDevKey\n', {
          encoding: 'utf8',
          flag: 'wx',
        });
      }

      const cwd = path.resolve(webpackPaths.rootPath);
      const script = path.join(cwd, 'scripts', 'jwt_generate.js');

      await new Promise((resolve, reject) => {
        execFile(
          'node',
          [script],
          { cwd, stdio: 'inherit' },
          (err, _stdout, _stderr) => {
            if (err) return reject(err);
            resolve();
          },
        );
      });
    }
    // beforeRun fires once, before compiling begins
    compiler.hooks.beforeRun.tapPromise('TsMetaPlugin', async () => {
      await checkVersionJson();
      await checkThirdPartyTxt();
      await generateJWT();
    });
  }
}

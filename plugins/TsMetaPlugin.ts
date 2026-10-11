import webpack from 'webpack';
import path from 'path';
import webpackPaths from '../.erb/configs/webpack.paths';
import fs from 'fs';
import fsPromises from 'fs/promises';
import chalk from 'chalk';
import { spawn } from 'child_process';

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

      // Run "node scripts/versionmeta.js" asynchronously, inheriting stdio
      await new Promise<void>((resolve, reject) => {
        const child = spawn(process.execPath, [script], {
          cwd,
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

    // beforeRun fires once, before compiling begins
    //
    // There is deliberately no key or JWT generation step here any more. The
    // worker-server key is created in memory at app launch (src/main/wsAuth.ts),
    // so no secret is written into the build or shipped in the package.
    compiler.hooks.beforeRun.tapPromise('TsMetaPlugin', async () => {
      await checkVersionJson();
      await checkThirdPartyTxt();
    });
  }
}

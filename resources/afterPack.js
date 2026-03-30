const { flipFuses, FuseVersion, FuseV1Options } = require('@electron/fuses');
const path = require('path');

module.exports = async ({ appOutDir, packager }) => {
  const platform = packager.platform.nodeName; // 'darwin', 'win32', 'linux'

  const exeName = {
    darwin: `${packager.appInfo.productName}.app`,
    win32: `${packager.appInfo.productName}.exe`,
    linux: packager.appInfo.productName,
  }[platform];

  const electronBinaryPath = path.join(appOutDir, exeName);

  await flipFuses(electronBinaryPath, {
    version: FuseVersion.V1,
    [FuseV1Options.RunAsNode]: false,
    [FuseV1Options.EnableCookieEncryption]: false, // true
    [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
    [FuseV1Options.EnableNodeCliInspectArguments]: false,
    [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
    [FuseV1Options.OnlyLoadAppFromAsar]: false,
  });
};

const { flipFuses, FuseVersion, FuseV1Options } = require('@electron/fuses');
const path = require('path');

exports.default = async function (context) {
  const { electronPlatformName, appOutDir, packager } = context;
  const ext = { darwin: '.app', win32: '.exe', linux: '' }[
    electronPlatformName
  ];
  const electronBinary = path.join(
    appOutDir,
    `${packager.appInfo.productFilename}${ext}`,
  );
  await flipFuses(electronBinary, {
    version: FuseVersion.V1,
    resetAdHocDarwinSignature: electronPlatformName === 'darwin',
    [FuseV1Options.RunAsNode]: false,
  });
};

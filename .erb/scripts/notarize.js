const { notarize } = require('@electron/notarize');

exports.default = async function notarizeMacos(context) {
  const { electronPlatformName, appOutDir } = context;
  if (electronPlatformName !== 'darwin') {
    return;
  }

  // if (process.env.CI !== 'true') {
  //   console.warn('Skipping notarizing step. Packaging is not running in CI');
  //   return;
  // }

  if (
    !(
      'APPLE_ID' in process.env &&
      'APPLE_APP_SPECIFIC_PASSWORD' in process.env &&
      'APPLE_TEAMID' in process.env
    )
  ) {
    console.warn(
      'Skipping notarizing step. APPLE_ID, APPEL_TEAMID and APPLE_APP_SPECIFIC_PASSWORD env variables must be set',
    );
    return;
  }

  const appName = context.packager.appInfo.productFilename;
  const appId = context.packager.info._configuration.appId;
  const appPath = `${appOutDir}/${appName}.app`;

  console.warn(JSON.stringify(process.env.APPLE_ID) + ' ' + appId);
  console.warn('Output: ' + appOutDir);
  console.warn('AppPath: ' + appPath);

  await notarize({
    appBundleId: appId,
    appPath: appPath,
    appleId: process.env.APPLE_ID,
    teamId: process.env.APPLE_TEAMID,
    appleIdPassword: process.env.APPLE_APP_SPECIFIC_PASSWORD,
  });
};

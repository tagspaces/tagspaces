import { startMinio } from './setup-functions';
import { removeExtConfig } from './e2e/hook';

module.exports = async function () {
  await removeExtConfig();

  global.minio = await startMinio();
};

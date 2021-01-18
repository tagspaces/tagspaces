import { stopMinio } from './setup-functions';

module.exports = function() {
  stopMinio(global.minio);
};

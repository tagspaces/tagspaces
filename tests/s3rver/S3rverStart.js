const { runS3Server } = require('./setup-functions');
const { uploadDirectory } = require('./S3DataRefresh');

module.exports = async function () {
  await runS3Server();
  await uploadDirectory();
};

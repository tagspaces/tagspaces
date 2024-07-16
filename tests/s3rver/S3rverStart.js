const { runS3Server } = require('../setup-functions');
const { refreshS3testData } = require('./S3DataRefresh');

module.exports = async function () {
  await runS3Server();
  await refreshS3testData();
};

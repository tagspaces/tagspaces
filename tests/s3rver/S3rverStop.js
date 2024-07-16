module.exports = async function () {
  await global.S3instance.close();
};

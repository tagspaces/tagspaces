module.exports = function() {
  // Send SIGHUP to process.
  console.log('stopMinio');
  const process = global.minio;
  process.stdin.pause();
  process.kill(); //'SIGHUP');
};

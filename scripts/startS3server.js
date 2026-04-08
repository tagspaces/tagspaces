import path from 'path';
import { uploadTestDirectory } from '../tests/s3rver/S3DataRefresh';
import { runS3Proxy } from '../tests/setup-functions';

runS3Proxy('testdata1')
  .then((process) =>
    uploadTestDirectory(path.resolve(__dirname, '..', 'tests', 'testdata')),
  )
  .then(() => {
    console.log('S3Proxy server started');
  });

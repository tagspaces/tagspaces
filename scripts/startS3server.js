import path from 'path';
import { uploadTestDirectory } from '../tests/s3rver/S3DataRefresh';
import { runS3Server } from '../tests/setup-functions';

runS3Server('testdata1')
  .then((instance) =>
    uploadTestDirectory(path.resolve(__dirname, '..', 'tests', 'testdata')),
  )
  .then(() => {
    console.log('S3.server started');
  });

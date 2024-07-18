import { runS3Server } from '../tests/setup-functions';
import { uploadTestDirectory } from '../tests/s3rver/S3DataRefresh';

runS3Server().then((instance) => {
  uploadTestDirectory().then(() => {
    console.log('S3.server started');
  });
});

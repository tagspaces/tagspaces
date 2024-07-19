import { runS3Server } from '../tests/setup-functions';
import { uploadTestDirectory } from '../tests/s3rver/S3DataRefresh';
import { deleteTestData } from '../tests/e2e/hook';
deleteTestData()
  .then(() => runS3Server(false))
  .then((instance) => uploadTestDirectory())
  .then(() => {
    console.log('S3.server started');
  });

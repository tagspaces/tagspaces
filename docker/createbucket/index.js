import { createBucket } from './s3_createbucket.js';
import { setCors } from './s3_setcors.js';

createBucket().then(data => {
  if (data) {
    console.log('Success Bucket ' + process.env.BUCKET_NAME + ' created', data);
    return setCors().then(data => {
      if (data) {
        console.log('CORS configured', data);
      } else {
        console.log('CORS not configured');
      }
      return data;
    });
  } else {
    console.log('Error creating bucket ' + process.env.BUCKET_NAME);
  }
});

import waitPort from 'wait-port';
import { createBucket } from './s3_createbucket.js';
import { setCors } from './s3_setcors.js';

const url = new URL(process.env.ENDPOINT);
const params = {
  host: url.hostname,
  port: parseInt(url.port, 10)
  // protocol: url.protocol
};

/*function sync() {
  const passwdFilePath = '/etc/passwd-s3fs';
  fs.writeFileSync(
    passwdFilePath,
    process.env.ACCESS_KEY_ID + ':' + process.env.SECRET_ACCESS_KEY,
    'utf-8'
  );
  fs.chmodSync(passwdFilePath, 600);
  execa('s3fs', [
    process.env.BUCKET_NAME,
    '/mnt/datas3fs',
    '-o',
    'passwd_file=' + passwdFilePath,
    '-o',
    'url="' + process.env.ENDPOINT + '"',
    '-o',
    'use_path_request_style'
  ]).stdout.pipe(process.stdout);
}*/

waitPort(params)
  .then(({ open, ipVersion }) => {
    if (open) {
      console.log(`The port is now open on IPv${ipVersion}!`);
      return createBucket().then(data => {
        if (data) {
          console.log(
            'Success Bucket ' + process.env.BUCKET_NAME + ' created',
            data
          );

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
    } else console.log('The port did not open before the timeout...');
  })
  .catch(err => {
    console.log(
      'An unknown error occurred while waiting for the port:' +
        JSON.stringify(params),
      err
    );
  });

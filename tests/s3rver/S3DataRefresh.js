const fs = require('fs');
const path = require('path');
const {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectsCommand,
  ListObjectsV2Command,
} = require('@aws-sdk/client-s3');
const bucketName = 'supported-filestypes';
const directoryPath = path.resolve(
  __dirname,
  '..',
  'testdata',
  'file-structure',
  'supported-filestypes',
);

function getFilesRecursive(dirPath) {
  let files = [];

  const traverse = (currentPath) => {
    const items = fs.readdirSync(currentPath);

    items.forEach((item) => {
      const itemPath = path.join(currentPath, item);
      const stat = fs.statSync(itemPath);

      if (stat.isDirectory()) {
        traverse(itemPath); // Recursively traverse directories
      } else {
        files.push(itemPath); // Add file path to the list
      }
    });
  };

  traverse(dirPath);
  return files;
}

function getS3Client() {
  return new S3Client({
    region: 'eu-central-1',
    endpoint: 'http://localhost:4569', // Adjust endpoint as needed
    credentials: {
      accessKeyId: 'S3RVER',
      secretAccessKey: 'S3RVER',
    },
    // Force path style required for local S3rver
    forcePathStyle: true,
    //logger: console,
  });
}

function getMinioClient() {
  return new S3Client({
    region: 'eu-central-1',
    endpoint: 'http://127.0.0.1:9000', // Adjust endpoint as needed
    credentials: {
      accessKeyId: 'minioadmin',
      secretAccessKey: 'minioadmin',
    },
    // Force path style required for local S3rver
    forcePathStyle: true,
    //logger: console,
  });
}

async function deleteAllObjects(bucketName) {
  try {
    // List objects in the bucket
    const listParams = {
      Bucket: bucketName,
      MaxKeys: 10, // Limit the number of keys to 10 per request
    };

    const s3Client = getS3Client();
    let listedObjects;
    do {
      listedObjects = await s3Client.send(new ListObjectsV2Command(listParams));

      if (!listedObjects.Contents || listedObjects.Contents.length === 0) break;

      // Prepare the list of objects to delete
      const deleteParams = {
        Bucket: bucketName,
        Delete: {
          Objects: listedObjects.Contents.map((object) => ({
            Key: object.Key,
          })),
        },
      };

      // Delete objects
      await s3Client.send(new DeleteObjectsCommand(deleteParams));

      // If the list is truncated, set the continuation token to get the next batch of objects
      listParams.ContinuationToken = listedObjects.NextContinuationToken;
    } while (listedObjects.IsTruncated);

    console.log(`All objects in bucket "${bucketName}" have been deleted.`);
  } catch (error) {
    console.error('Error deleting objects:', error);
  }
}

function getS3File({ isMinio }, filePath) {
  const key = filePath.replace(/\\/g, '/'); // Normalize path separators
  //const key = path.relative(directoryPath, filePath).replace(/\\/g, '/'); // Normalize path separators

  const params = {
    Bucket: bucketName,
    Key: key,
    ResponseCacheControl: 'no-cache',
  };
  const s3Client = isMinio ? getMinioClient() : getS3Client();
  return s3Client
    .send(new GetObjectCommand(params))
    .then((data) => {
      if (data.Body) {
        return data.Body.transformToString('utf-8');
      } else {
        return '';
      }
    })
    .catch((e) => {
      console.log('getFile ' + filePath, e);
      return Promise.reject(e);
    });
}

function uploadFile(filePath, content = undefined) {
  const fileContent =
    content !== undefined ? content : fs.readFileSync(filePath);

  const key = path.relative(directoryPath, filePath).replace(/\\/g, '/'); // Normalize path separators

  const params = {
    Bucket: bucketName,
    Key: key,
    Body: fileContent,
  };

  try {
    //console.log(`Uploaded ${filePath} to ${bucketName}/${key}`);
    const s3Client = getS3Client();
    return s3Client.send(new PutObjectCommand(params));
  } catch (err) {
    console.error(`Error uploading ${filePath}:`, err);
    return Promise.reject(err);
  }
}
function createDir(dirPath) {
  const key = //path.relative(directoryPath, dirPath)
    dirPath.replace(/\\/g, '/').replace(/\/?$/, '/'); // Ensure trailing slash

  const params = {
    Bucket: bucketName,
    Key: key,
    Body: '', // S3 requires a body, even if it's an empty string
  };

  const s3Client = getS3Client();

  return s3Client
    .send(new PutObjectCommand(params))
    .then(() => {
      console.log(`Created directory-like key ${bucketName}/${key}`);
    })
    .catch((err) => {
      console.error(`Error creating S3 'directory' ${dirPath}:`, err);
      return Promise.reject(err);
    });
}

function uploadTestDirectory(dirPath) {
  try {
    const files = getFilesRecursive(dirPath);
    console.log(`All files in ${dirPath} uploaded to ${bucketName}`);
    return Promise.all(files.map((file) => uploadFile(file)));
  } catch (err) {
    console.error(`Error uploading directory ${dirPath}:`, err);
  }
}

async function refreshS3testData(testDataDir) {
  await deleteAllObjects('supported-filestypes');
  await uploadTestDirectory(testDataDir);
}

module.exports = {
  uploadTestDirectory,
  refreshS3testData,
  uploadFile,
  createDir,
  getS3File,
};

const fs = require('fs');
const path = require('path');
const {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
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
    endpoint: 'http://localhost:4569',
    // S3Proxy is configured with authorization=none, but AWS SDK requires credentials
    credentials: {
      accessKeyId: 'test',
      secretAccessKey: 'test',
    },
    forcePathStyle: true,
    // S3Proxy does not support the CRC32 checksum header added by newer AWS SDK v3
    requestChecksumCalculation: 'WHEN_REQUIRED',
    responseChecksumValidation: 'WHEN_REQUIRED',
  });
}

async function deleteAllObjects(bucketName) {
  try {
    const s3Client = getS3Client();

    // Collect all keys first, then sort so deepest paths (files inside dirs) are deleted
    // before their parent directory markers. This avoids DirectoryNotEmptyException
    // on filesystem-backed S3 implementations like S3Proxy.
    let allKeys = [];
    const listParams = { Bucket: bucketName, MaxKeys: 1000 };
    let listedObjects;
    do {
      listedObjects = await s3Client.send(new ListObjectsV2Command(listParams));
      if (listedObjects.Contents) {
        allKeys.push(...listedObjects.Contents.map((o) => o.Key));
      }
      listParams.ContinuationToken = listedObjects.NextContinuationToken;
    } while (listedObjects.IsTruncated);

    if (allKeys.length === 0) return;

    // Sort by depth descending (deepest first), so children are deleted before parents
    allKeys.sort((a, b) => {
      const depthA = (a.match(/\//g) || []).length;
      const depthB = (b.match(/\//g) || []).length;
      return depthB - depthA;
    });

    // Delete one by one to avoid XML parsing issues with batch DeleteObjects
    // responses on S3-compatible backends (S3Proxy, S3rver)
    for (const key of allKeys) {
      try {
        await s3Client.send(
          new DeleteObjectCommand({ Bucket: bucketName, Key: key }),
        );
      } catch (err) {
        // Ignore errors for individual deletes (e.g. already deleted)
      }
    }

    console.log(`All objects in bucket "${bucketName}" have been deleted.`);
  } catch (error) {
    console.error('Error deleting objects:', error);
  }
}

function getS3File(filePath) {
  const key = filePath.replace(/\\/g, '/'); // Normalize path separators
  //const key = path.relative(directoryPath, filePath).replace(/\\/g, '/'); // Normalize path separators

  const params = {
    Bucket: bucketName,
    Key: key,
    ResponseCacheControl: 'no-cache',
  };
  const s3Client = getS3Client();
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
  try {
    await deleteAllObjects('supported-filestypes');
  } catch (error) {
    console.error('deleteAllObjects error:', error.message);
  }
  await uploadTestDirectory(testDataDir);
}

module.exports = {
  uploadTestDirectory,
  refreshS3testData,
  uploadFile,
  createDir,
  getS3File,
};

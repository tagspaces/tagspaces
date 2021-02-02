/* Amplify Params - DO NOT EDIT
	ENV
	REGION
Amplify Params - DO NOT EDIT */

const { indexer, persistIndex } = require('tsindexer');
const { thumbnailsHandler } = require('ts-thumbnails');

exports.handler = async (event, context, callback) => {
  console.log('Received event:', JSON.stringify(event, null, 2));
  const bucketName = event.Records[0].s3.bucket.name;
  const { key } = event.Records[0].s3.object;
  const path = '/';
  // const { path, bucketName } = event;
  const directoryIndex = await indexer(path, bucketName);
  const success = await persistIndex(path, directoryIndex, bucketName);

  thumbnailsHandler(bucketName, key, callback);
  if (success) {
    // console.log('createIndex: ' + JSON.stringify(directoryIndex));
    context.succeed({});
  }
};

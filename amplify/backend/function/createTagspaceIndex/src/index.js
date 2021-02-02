/* Amplify Params - DO NOT EDIT
	ENV
	REGION
Amplify Params - DO NOT EDIT */const { indexer, persistIndex } = require('indexer');

exports.handler = async (event, context) => {
  console.log('Received event:', JSON.stringify(event, null, 2));
  const bucketName = event.Records[0].s3.bucket.name;
  const path = "/";
  // const { path, bucketName } = event;
  const directoryIndex = await indexer(path, bucketName);
  const success = await persistIndex(path, directoryIndex, bucketName);
  if (success) {
    console.log('createIndex: ' + JSON.stringify(directoryIndex));
    context.succeed({});
  }
};

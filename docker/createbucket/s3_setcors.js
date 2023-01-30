/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
ABOUT THIS NODE.JS EXAMPLE: This sample is part of the SDK for JavaScript Developer Guide (scheduled for release September 2020) top
https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/s3-example-configuring-buckets.html.
Purpose:
s3_setcors.js demonstrates how to set the CORS configuration of an Amazon S3 bucket.
Inputs:
- BUCKET_NAME (into command line below)
Running the code:
node s3_setcors.js BUCKET_NAME REGION
 */
// snippet-start:[s3.JavaScript.v3.cors.putBucketCors]
// Import required AWS-SDK clients and commands for Node.js.
import { PutBucketCorsCommand } from '@aws-sdk/client-s3';
import { s3Client } from './libs/s3Client.js'; // Helper function that creates an Amazon S3 service client module.

let thisConfig;
if (process.env.CORS) {
  if (process.env.CORS === 'true') {
    // Create initial parameters JSON for putBucketCors.
    thisConfig = {
      AllowedHeaders: ['*'],
      AllowedMethods: ['GET', 'HEAD', 'PUT', 'POST', 'DELETE'],
      AllowedOrigins: ['*'],
      ExposeHeaders: [],
      MaxAgeSeconds: 3000
    };
  } /* else {
    thisConfig = eval('(' + process.env.CORS + ')');
  }  */
}
export async function setCors() {
  if (thisConfig) {
    // Create an array of configs then add the config object to it.
    const corsRules = new Array(thisConfig);
    // Create CORS parameters.
    const corsParams = {
      Bucket: process.env.BUCKET_NAME,
      CORSConfiguration: { CORSRules: corsRules }
    };
    try {
      const data = await s3Client.send(new PutBucketCorsCommand(corsParams));
      console.log('Success', data);
      return data; // For unit tests.
    } catch (err) {
      console.log('Error', err);
    }
  }
}

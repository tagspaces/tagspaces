/* eslint-disable-line */ const aws = require('aws-sdk');

exports.handler = async (event, context, callback) => {
  const cisp = new aws.CognitoIdentityServiceProvider({
    apiVersion: '2016-04-18'
  });
  /* const groupParams = {
    GroupName: process.env.GROUP,
    UserPoolId: event.userPoolId,
  };

  const addUserParams = {
    GroupName: process.env.GROUP,
    UserPoolId: event.userPoolId,
    Username: event.userName,
  }; */

  const updateParams = {
    UserAttributes: [
      {
        Name: 'custom:tenant',
        Value: 'custom tenant test' // ADD YOUR TENANT LOGIC HERE
      }
    ],
    UserPoolId: event.userPoolId,
    Username: event.userName
  };
  /* try {
    await cognitoidentityserviceprovider.getGroup(groupParams).promise();
  } catch (e) {
    await cognitoidentityserviceprovider.createGroup(groupParams).promise();
  } */

  try {
    // await cognitoidentityserviceprovider.adminAddUserToGroup(addUserParams).promise();
    await cisp.adminUpdateUserAttributes(updateParams).promise();
    callback(null, event);
  } catch (e) {
    callback(e);
  }
};

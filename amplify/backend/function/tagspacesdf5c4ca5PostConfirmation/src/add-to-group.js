/* eslint-disable-line */ const aws = require('aws-sdk');

exports.handler = async (event, context, callback) => {
  const cognitoidentityserviceprovider = new aws.CognitoIdentityServiceProvider(
    {
      apiVersion: '2016-04-18'
    }
  );
  const tenant = 'extconfig1';
  const groupParams = {
    GroupName: tenant, // process.env.GROUP,
    UserPoolId: event.userPoolId
  };

  const addUserParams = {
    GroupName: tenant, // process.env.GROUP,
    UserPoolId: event.userPoolId,
    Username: event.userName
  };

  /* const updateParams = {
    UserAttributes: [
      {
        Name: 'custom:tenant',
        Value: 'custom tenant test' // ADD YOUR TENANT LOGIC HERE
      }
    ],
    UserPoolId: event.userPoolId,
    Username: event.userName
  }; */
  try {
    await cognitoidentityserviceprovider.getGroup(groupParams).promise();
  } catch (e) {
    await cognitoidentityserviceprovider.createGroup(groupParams).promise();
  }

  try {
    await cognitoidentityserviceprovider
      .adminAddUserToGroup(addUserParams)
      .promise();
    // await cisp.adminUpdateUserAttributes(updateParams).promise();
    callback(null, event);
  } catch (e) {
    callback(e);
  }
};

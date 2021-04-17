import Auth from '@aws-amplify/auth';

/* interface Props {
  user: CognitoUserInterface;
} */
export default function useTOTPSetup(user, setCode) {
  /* invariant(
    Auth &&
      typeof Auth.setupTOTP === 'function' &&
      typeof Auth.verifyTotpToken === 'function' &&
      typeof Auth.setPreferredMFA === 'function',
    'No Auth module found, please ensure @aws-amplify/auth is imported'
  ); */

  const verifyTotpToken = async (totpCode: string) => {
    try {
      await Auth.verifyTotpToken(user, totpCode).then(data => {
        console.log(data);
        return data;
      });
      await Auth.setPreferredMFA(user, 'TOTP');
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const setupTOTP = () => {
    Auth.setupTOTP(user)
      .then(data => {
        console.debug('secret key', data);

        setCode(
          `otpauth://totp/AWSCognito:${user.username}?secret=${data}&issuer=AWSCognito`
        );
        return data;
      })
      .catch(e => console.error('setupTOTP error:', e));
  };

  if (user && 'SOFTWARE_TOKEN_MFA'.indexOf(user.preferredMFA) > -1) {
    setupTOTP();
  } else if ('NOMFA'.indexOf(user.preferredMFA) === 0) {
    Auth.setPreferredMFA(user, 'TOTP')
      .then(data => {
        console.log(data);
        setupTOTP();
        return true;
      })
      .catch(e => console.error('setupTOTP MFA error:', e));
  }

  return verifyTotpToken;
}

/* function mapStateToProps(state) {
  return {
    user: currentUser(state)
  };
}
export default connect(mapStateToProps)(useTOTPSetup); */

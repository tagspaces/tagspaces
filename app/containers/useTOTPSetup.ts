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
      await Auth.verifyTotpToken(user, totpCode);
      await Auth.setPreferredMFA(user, 'TOTP');
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  if (user && 'SOFTWARE_TOKEN_MFA'.indexOf(user.preferredMFA) > -1) {
    Auth.setupTOTP(user)
      .then(data => {
        console.debug('secret key', data);

        setCode(
          `otpauth://totp/AWSCognito:${user.username}?secret=${data}&issuer=AWSCognito`
        );
        return data;
      })
      .catch(e => console.error('setupTOTP error:', e));
  }

  return verifyTotpToken;
}

/* function mapStateToProps(state) {
  return {
    user: currentUser(state)
  };
}
export default connect(mapStateToProps)(useTOTPSetup); */

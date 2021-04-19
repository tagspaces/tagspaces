import Auth from '@aws-amplify/auth';
import { CognitoUserInterface } from '@aws-amplify/ui-components';
import i18n from '../services/i18n';

export default async function TOTPSetup(user: CognitoUserInterface, setCode) {
  const issuer = i18n.t('core:name');
  const verifyTotpToken = async (totpCode: string) => {
    try {
      await Auth.verifyTotpToken(user, totpCode);
      await Auth.setPreferredMFA(user, 'TOTP');

      console.log('SETUP_TOTP SUCCESS');
    } catch (error) {
      console.error(error);
    }
  };

  function buildOtpAuthPath(secretKey: string) {
    return `otpauth://totp/${issuer}:${user.username}?secret=${secretKey}&issuer=${issuer}`;
  }

  // if (user && 'SOFTWARE_TOKEN_MFA'.indexOf(user.preferredMFA) === -1) {
  try {
    const secretKey = await Auth.setupTOTP(user);
    console.debug('secret key', secretKey);
    setCode(buildOtpAuthPath(secretKey));
  } catch (error) {
    console.debug(error);
  }

  return verifyTotpToken;
}

/**
 * TagSpaces - universal file and folder organizer
 * Copyright (C) 2017-present TagSpaces GmbH
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License (version 3) as
 * published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 */

import React from 'react';
import {
  AmplifyAuthenticator,
  AmplifySignIn,
  AmplifySignUp,
  AmplifyTotpSetup,
} from '@aws-amplify/ui-react';
import { Amplify } from 'aws-amplify';
import HandleAuth from '-/utils/HandleAuth';
import LogoIcon from '-/assets/images/icon100x100.svg';
import { useTranslation } from 'react-i18next';

const TsAuth: React.FC<any> = (props) => {
  const { t } = useTranslation();
  let awsconfig;
  try {
    // eslint-disable-next-line global-require
    awsconfig = require('-/aws-exports');
  } catch (e) {
    if (e && e.code && e.code === 'MODULE_NOT_FOUND') {
      console.debug(
        'Auth functionality not available aws-exports.js is missing. Are you sure that you have run "amplitude init"?',
      );
      return props.children;
    }
    throw e;
  }

  if (awsconfig !== undefined) {
    Amplify.configure(awsconfig.default);
    return (
      <>
        <HandleAuth />
        <AmplifyAuthenticator
          usernameAlias="email"
          style={{
            // @ts-ignore
            '--amplify-primary-color': '#1dd19f',
            '--amplify-primary-tint': '#1dd19f',
            '--amplify-primary-shade': '#4A5568',
          }}
        >
          <AmplifyTotpSetup
            headerText="TagSpaces Time-Based One-Time Password Login"
            slot="totp-setup"
            issuer={t('core:appName') + ' ' + window.location.hostname}
            // user={props.user}
          />
          <AmplifySignUp
            slot="sign-up"
            usernameAlias="email"
            formFields={[
              {
                type: 'email',
                label: 'Email',
                placeholder: 'Enter your email',
                required: true,
              },
              {
                type: 'password',
                label: 'Password',
                placeholder: 'Enter your password',
                required: true,
              },
            ]}
          />
          <AmplifySignIn
            headerText=""
            slot="sign-in"
            usernameAlias="email"
            hideSignUp={true}
          >
            <div slot="header-subtitle" style={{ textAlign: 'center' }}>
              <h2>Welcome to TagSpaces</h2>
              <img alt="logo" src={LogoIcon} />
            </div>
          </AmplifySignIn>
          {props.children}
        </AmplifyAuthenticator>
      </>
    );
  }
  return <h1>Loading...</h1>;
};

export default TsAuth;

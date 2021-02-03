/**
 * TagSpaces - universal file and folder organizer
 * Copyright (C) 2017-present TagSpaces UG (haftungsbeschraenkt)
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
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { Amplify } from 'aws-amplify';
import {
  AmplifyAuthenticator,
  AmplifySignIn,
  AmplifySignUp
} from '@aws-amplify/ui-react';
import LoadingScreen from '../components/LoadingScreen';
import { actions as AppActions } from '../reducers/app';
import AppConfig from '-/config';
import App from '-/containers/App';
import MainPage from '-/containers/MainPage';
import awsconfig from '-/aws-exports';
import LogoIcon from '-/assets/images/icon100x100.svg';
import HandleAuth from '-/utils/HandleAuth';

type RootType = {
  store: {};
  persistor: {};
};

export default function Root({ store, persistor }: RootType) {
  let appContent = (
    <App>
      <MainPage />
    </App>
  );

  if (AppConfig.isWeb) {
    Amplify.configure(awsconfig);
    appContent = (
      <>
        <HandleAuth />
        <AmplifyAuthenticator
          usernameAlias="email"
          style={{
            // @ts-ignore
            '--amplify-primary-color': '#1dd19f',
            '--amplify-primary-tint': '#1dd19f',
            '--amplify-primary-shade': '#4A5568'
          }}
        >
          <AmplifySignUp
            slot="sign-up"
            usernameAlias="email"
            formFields={[
              {
                type: 'email',
                label: 'Email',
                placeholder: 'Enter your email',
                required: true
              },
              {
                type: 'password',
                label: 'Password',
                placeholder: 'Enter your password',
                required: true
              }
            ]}
          />
          <AmplifySignIn
            headerText="Sign in to your TagSpaces account"
            slot="sign-in"
            usernameAlias="email"
          >
            <div slot="header-subtitle" style={{ textAlign: 'center' }}>
              <img alt="logo" src={LogoIcon} />
            </div>
          </AmplifySignIn>
          {appContent}
        </AmplifyAuthenticator>
      </>
    );
  }

  return (
    <Provider
      // @ts-ignore
      store={store}
    >
      {/**
       * PersistGate delays the rendering of the app's UI until the persisted state has been retrieved
       * and saved to redux.
       * The `loading` prop can be `null` or any react instance to show during loading (e.g. a splash screen),
       * for example `loading={<SplashScreen />}`.
       * @see https://github.com/rt2zz/redux-persist/blob/master/docs/PersistGate.md
       */}
      <PersistGate
        loading={<LoadingScreen />}
        onBeforeLift={() => {
          // @ts-ignore
          // eslint-disable-next-line react/prop-types
          if(!AppConfig.isWeb ) { // || store.app.user !== undefined
            // @ts-ignore
            // eslint-disable-next-line react/prop-types
            store.dispatch(AppActions.initApp())
          }
        }}
        // @ts-ignore
        persistor={persistor}
      >
        {appContent}
      </PersistGate>
    </Provider>
  );
}

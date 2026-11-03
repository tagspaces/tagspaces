/**
 * TagSpaces - universal file and folder organizer
 * Copyright (C) 2023-present TagSpaces GmbH
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

import AppConfig from '-/AppConfig';
import React, { createContext, useMemo, useRef } from 'react';

/**
 * Generic authenticated-user shape. Previously this was Amplify's
 * `CognitoUserInterface`; it is now a local type so the auth scaffolding
 * (UserContext + account popover) is decoupled from any specific provider.
 * A future auth provider populates this via `loggedIn()`.
 */
export interface TsUser {
  username?: string;
  attributes?: { email?: string; [k: string]: any };
  preferredMFA?: string;
  challengeName?: string;
  challengeParam?: any;
  associateSoftwareToken?: () => void;
  verifySoftwareToken?: () => void;
}

type UserContextData = {
  currentUser: TsUser;
  loggedIn: (authData: any) => void;
  isLoggedIn: () => boolean;
};

export const UserContext = createContext<UserContextData>({
  currentUser: undefined,
  loggedIn: undefined,
  isLoggedIn: undefined,
});

export type UserContextProviderProps = {
  children: React.ReactNode;
};

export const UserContextProvider = ({ children }: UserContextProviderProps) => {
  // Create a factory function to generate a TsUser object
  const createUser = (attributes: any): TsUser => {
    return {
      attributes: attributes,
      associateSoftwareToken: () => {},
      verifySoftwareToken: () => {},
      challengeName: '',
      challengeParam: {},
    };
  };

  const user = useRef<TsUser>(
    AppConfig.ExtDemoUser ? createUser(AppConfig.ExtDemoUser) : undefined,
  );
  const [ignored, forceUpdate] = React.useReducer(
    (x: number) => x + 1,
    0,
    undefined,
  );

  function loggedIn(authData: TsUser) {
    user.current = authData;
    forceUpdate();
  }

  const context = useMemo(() => {
    return {
      currentUser: user.current,
      loggedIn: loggedIn,
      isLoggedIn: () => user.current !== undefined,
    };
  }, [user.current]);

  return (
    <UserContext.Provider value={context}>{children}</UserContext.Provider>
  );
};

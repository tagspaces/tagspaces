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

import React, { createContext, useMemo, useRef } from 'react';
import { CognitoUserInterface } from '@aws-amplify/ui-components';

type UserContextData = {
  currentUser: CognitoUserInterface;
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
  // Create a factory function to generate a CognitoUserInterface object
  const createCognitoUser = (attributes: any): CognitoUserInterface => {
    return {
      attributes: attributes,
      associateSoftwareToken: () => {},
      verifySoftwareToken: () => {},
      challengeName: '',
      challengeParam: {},
    };
  };

  const user = useRef<CognitoUserInterface>(
    window.ExtDemoUser ? createCognitoUser(window.ExtDemoUser) : undefined,
  );
  const [ignored, forceUpdate] = React.useReducer((x) => x + 1, 0, undefined);

  function loggedIn(authData: CognitoUserInterface) {
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

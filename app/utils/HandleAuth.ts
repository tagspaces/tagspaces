import React, { useRef } from 'react';
import {
  AuthState,
  CognitoUserInterface,
  onAuthUIStateChange
} from '@aws-amplify/ui-components';
import { API, Auth } from 'aws-amplify';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { getExtconfig } from '-/graphql/queries';
import { actions as LocationActions, Location } from '-/reducers/locations';
import { actions as AppActions } from '-/reducers/app';

interface Props {
  loggedIn: (user: CognitoUserInterface) => void;
  initApp: () => void;
  addLocations: (locations: Array<Location>, override: boolean) => void;
}
const HandleAuth = React.memo((props: Props) => {
  const username = useRef(undefined);

  React.useEffect(() => {
    onAuthUIStateChange((nextAuthState, authData) => {
      // setAuthState(nextAuthState);
      // TODO AuthState.SignedIn is called twice after login
      if (nextAuthState === AuthState.SignedIn) {
        // authData.signInUserSession.idToken.payload['custom:tenant']
        // @ts-ignore
        if (username.current !== authData.username) {
          fetchTenant()
            .then(async tenant => {
              // @ts-ignore
              const { data } = await API.graphql({
                query: getExtconfig,
                variables: { id: tenant }
              });
              if (data) {
                // console.log(data.getExtconfig.Locations.items);
                props.addLocations(data.getExtconfig.Locations.items, false);
              }

              return true;
            })
            .catch(e => {
              console.error(e);
            });
          // @ts-ignore
          username.current = authData.username;
          // @ts-ignore
          props.loggedIn(authData);
          props.initApp();
        }
      } else if (nextAuthState === AuthState.SignedOut) {
        username.current = undefined;
        props.loggedIn(undefined);
      }
    });
  }, []);

  const fetchTenant = () =>
    // get the access token of the signed in user
    Auth.currentSession()
      .then(session => {
        const accessToken = session.getAccessToken();
        const cognitogroups = accessToken.payload['cognito:groups'];
        return cognitogroups[0];
      })
      .catch(e => {
        console.error(e);
      });

  return null;
});

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      loggedIn: AppActions.loggedIn,
      initApp: AppActions.initApp,
      addLocations: LocationActions.addLocations
    },
    dispatch
  );
}

export default connect(undefined, mapDispatchToProps)(HandleAuth);

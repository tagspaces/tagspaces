import React, { useRef } from 'react';
import {
  AuthState,
  CognitoUserInterface,
  onAuthUIStateChange,
} from '@aws-amplify/ui-components';
import { API, Auth } from 'aws-amplify';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { actions as LocationActions } from '-/reducers/locations';
// import { actions as TagGroupActions } from '-/reducers/taglibrary';
import { actions as AppActions } from '-/reducers/app';
import { TS } from '-/tagspaces.namespace';
import { importTagGroups } from '-/services/taglibrary-utils';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';

interface Props {
  loggedIn: (user: CognitoUserInterface) => void;
  initApp: () => void;
}
function HandleAuth(props: Props) {
  const username = useRef(undefined);
  const { addLocations } = useCurrentLocationContext();

  React.useEffect(() => {
    onAuthUIStateChange((nextAuthState, authData) => {
      if (nextAuthState === AuthState.SignedIn) {
        // verifyTotpToken.current = useTOTPSetup(authData, setCode);

        let queries;
        try {
          // eslint-disable-next-line global-require
          queries = require('-/graphql/queries');
        } catch (e) {
          if (e && e.code && e.code === 'MODULE_NOT_FOUND') {
            console.debug(
              'graphql/queries is missing. You must run "amplify codegen" first',
            );
          }
        }

        // authData.signInUserSession.idToken.payload['custom:tenant']
        // TODO AuthState.SignedIn is called twice after login
        // @ts-ignore
        if (username.current !== authData.username && queries) {
          fetchTenant()
            .then(async (tenant) => {
              if (tenant) {
                await saveLocations(tenant, queries.getExtconfig);
                await addTagGroups(tenant, queries.tagGroupsByTenant);
              }
              return true;
            })
            .catch((e) => {
              console.log(e);
            });
          props.initApp();
        }
        // @ts-ignore
        username.current = authData.username;
        // @ts-ignore
        props.loggedIn(authData);
      } else if (nextAuthState === AuthState.SignedOut) {
        username.current = undefined;
        props.loggedIn(undefined);
      }
    });
  }, []);

  const saveLocations = async (tenant: string, query: any) => {
    // @ts-ignore
    const { data } = await API.graphql({
      query,
      variables: { id: tenant },
    });
    if (data) {
      // console.log(data.getExtconfig.Locations.items);
      addLocations(JSON.parse(data.getExtconfig.Locations), false);
    }
  };

  const addTagGroups = async (tenant: string, query: any) => {
    /* const filter = {
      tenant: {
        eq: tenant
      }
    }; */
    // const variables: TagGroupsByTenantQueryVariables = { tenant };

    // @ts-ignore
    const { data } = await API.graphql({
      query,
      variables: { tenant },
    });
    if (data && data.TagGroupsByTenant.items.length > 0) {
      const tagGroupsByTenant = data.TagGroupsByTenant.items[0];
      importTagGroups(
        JSON.parse(tagGroupsByTenant.tagGroups),
        tagGroupsByTenant.replace,
      );
    }
  };

  const fetchTenant = () =>
    // get the access token of the signed in user
    Auth.currentSession()
      .then((session) => {
        const accessToken = session.getAccessToken();
        const cognitogroups = accessToken.payload['cognito:groups'];
        if (cognitogroups) {
          return cognitogroups[0];
        }
        return undefined;
      })
      .catch((e) => {
        console.log(e);
      });

  return null;
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      loggedIn: AppActions.loggedIn,
      initApp: AppActions.initApp,
      // importTagGroups: TagGroupActions.importTagGroups
    },
    dispatch,
  );
}

export default connect(undefined, mapDispatchToProps)(React.memo(HandleAuth));

import React, { useRef, useState } from 'react';
import {
  AuthState,
  CognitoUserInterface,
  onAuthUIStateChange
} from '@aws-amplify/ui-components';
import QRCode from 'qrcode.react';
import { API, Auth } from 'aws-amplify';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { actions as LocationActions, Location } from '-/reducers/locations';
import { actions as TagGroupActions, TagGroup } from '-/reducers/taglibrary';
import { actions as AppActions } from '-/reducers/app';
import useTOTPSetup from '-/containers/useTOTPSetup';

interface Props {
  loggedIn: (user: CognitoUserInterface) => void;
  initApp: () => void;
  addLocations: (locations: Array<Location>, override: boolean) => void;
  importTagGroups: (tagGroups: Array<TagGroup>, replace: boolean) => void;
}
const HandleAuth = React.memo((props: Props) => {
  const username = useRef(undefined);
  const [code, setCode] = useState<string | null>(null);

  React.useEffect(() => {
    onAuthUIStateChange((nextAuthState, authData) => {
      if (nextAuthState === AuthState.SignedIn) {
        const verifyTotpToken = useTOTPSetup(authData, setCode);

        let queries;
        try {
          // eslint-disable-next-line global-require
          queries = require('-/graphql/queries');
        } catch (e) {
          if (e && e.code && e.code === 'MODULE_NOT_FOUND') {
            console.debug(
              'graphql/queries is missing. You must run "amplify codegen" first'
            );
          }
        }

        // authData.signInUserSession.idToken.payload['custom:tenant']
        // TODO AuthState.SignedIn is called twice after login
        // @ts-ignore
        if (username.current !== authData.username && queries) {
          fetchTenant()
            .then(async tenant => {
              await addLocations(tenant, queries.getExtconfig);
              await addTagGroups(tenant, queries.tagGroupsByTenant);

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

  const addLocations = async (tenant: string, query: any) => {
    // @ts-ignore
    const { data } = await API.graphql({
      query,
      variables: { id: tenant }
    });
    if (data) {
      // console.log(data.getExtconfig.Locations.items);
      props.addLocations(JSON.parse(data.getExtconfig.Locations), false);
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
      variables: { tenant }
    });
    if (data && data.TagGroupsByTenant.items.length > 0) {
      const tagGroupsByTenant = data.TagGroupsByTenant.items[0];
      props.importTagGroups(
        JSON.parse(tagGroupsByTenant.tagGroups),
        tagGroupsByTenant.replace
      );
    }
  };

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

  if (!code) {
    return null;
  }

  return <QRCode value={code} />;
});

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      loggedIn: AppActions.loggedIn,
      initApp: AppActions.initApp,
      addLocations: LocationActions.addLocations,
      importTagGroups: TagGroupActions.importTagGroups
    },
    dispatch
  );
}

export default connect(undefined, mapDispatchToProps)(HandleAuth);

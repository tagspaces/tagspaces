import * as React from 'react';
import createAuth0Client from '@auth0/auth0-spa-js';

const DEFAULT_REDIRECT_CALLBACK = () =>
  window.history.replaceState({}, document.title, window.location.pathname);

interface Auth0ProviderProps {
  children: React.ReactNode;
  onRedirectCallback: (any) => any;
  domain: string;
  clientId: string;
  redirectUri: string;
}

interface Auth0ContextProps {
  isAuthenticated: boolean;
  user: any;
  idToken: any;
  loading: boolean;
  popupOpen: boolean;
  loginWithPopup: (any) => any;
  handleRedirectCallback: (any) => any;
  getIdTokenClaims: (any) => any;
  loginWithRedirect: (any) => any;
  getTokenSilently: (any) => any;
  getTokenWithPopup: (any) => any;
  logout: (any) => any;
}

export const Auth0Context = React.createContext<Auth0ContextProps>(null);
export const useAuth0 = () => React.useContext(Auth0Context);

export const Auth0Provider: React.FunctionComponent<Auth0ProviderProps> = ({
  children,
  onRedirectCallback = DEFAULT_REDIRECT_CALLBACK,
  domain,
  clientId,
  redirectUri
}) => {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [user, setUser] = React.useState();
  const [auth0Client, setAuth0] = React.useState();
  const [loading, setLoading] = React.useState(true);
  const [popupOpen, setPopupOpen] = React.useState(false);
  const [idToken, setIdToken] = React.useState();

  React.useEffect(() => {
    const initAuth0 = async () => {
      const auth0FromHook = await createAuth0Client({
        domain,
        // audience: domain + '/api/v2/',
        // audience: domain + '/userinfo',
        client_id: clientId,
        redirect_uri: redirectUri,
        // scope: 'offline_access'
        scope: 'user_metadata read:users_app_metadata'
        // scope: 'openid profile email user_metadata read:current_user read:users_app_metadata read:groups',
      });
      setAuth0(auth0FromHook);

      if (window.location.search.includes('code=')) {
        const { appState } = await auth0FromHook.handleRedirectCallback();
        onRedirectCallback(appState);
      }

      const isAuth = await auth0FromHook.isAuthenticated();

      setIsAuthenticated(isAuth);

      if (isAuthenticated) {
        const user1 = await auth0FromHook.getUser();
        setUser(user1);
        const idTokenClaims = await auth0FromHook.getIdTokenClaims();
        setIdToken(idTokenClaims);
      }

      setLoading(false);
    };

    initAuth0();
  }, []);

  const loginWithPopup = async (params = {}) => {
    setPopupOpen(true);
    try {
      await auth0Client.loginWithPopup(params);
    } catch (error) {
      console.error(error);
    } finally {
      setPopupOpen(false);
    }
    const user1 = await auth0Client.getUser();
    setUser(user1);
    const idTokenClaims = await auth0Client.getIdTokenClaims();// { audience: domain + '/user_metadata'});
    setIdToken(idTokenClaims);
    setIsAuthenticated(true);
  };

  const handleRedirectCallback = async () => {
    setLoading(true);
    const result = await auth0Client.handleRedirectCallback();
    const user1 = await auth0Client.getUser();
    const idTokenClaims = await auth0Client.getIdTokenClaims();
    setIdToken(idTokenClaims);
    setLoading(false);
    setIsAuthenticated(true);
    setUser(user1);
    return result;
  };

  return (
    <Auth0Context.Provider
      value={{
        isAuthenticated,
        user,
        idToken,
        loading,
        popupOpen,
        loginWithPopup,
        handleRedirectCallback,
        getIdTokenClaims: (...p) => auth0Client.getIdTokenClaims(...p),
        loginWithRedirect: (...p) => auth0Client.loginWithRedirect(...p),
        getTokenSilently: (...p) => auth0Client.getTokenSilently(...p),
        getTokenWithPopup: (...p) => auth0Client.getTokenWithPopup(...p),
        logout: (...p) => auth0Client.logout(...p)
      }}
    >
      {children}
    </Auth0Context.Provider>
  );
};

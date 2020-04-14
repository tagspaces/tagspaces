import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import i18n from '-/services/i18n';
import UpgradeIcon from '@material-ui/icons/FlightTakeoff';
import React from 'react';
import { useAuth0 } from '-/login/auth0-spa';

interface Props {}

const Login: React.FunctionComponent<Props> = () => {
  const styles = {
    buttonIcon: {
      width: 28,
      height: 28,
      color: '#d6d6d6' // this.props.theme.palette.text.primary
    },
    button: {
      padding: 8,
      width: 44,
      height: 44
    },
    themingButton: {
      borderRadius: 0
    }
  };

  const {
    loading,
    isAuthenticated,
    user,
    loginWithPopup,
    logout,
    idToken
    // getIdTokenClaims
  } = useAuth0();

  return (
    <div>
      {!loading && !isAuthenticated && (
        <IconButton
          id="verticalNavLoginButton"
          title={i18n.t('core:login')}
          data-tid="login"
          onClick={() => loginWithPopup({})}
          // @ts-ignore
          style={{ ...styles.button, ...styles.themingButton }}
        >
          <UpgradeIcon
            style={{
              ...styles.buttonIcon
              // color: '1DD19F'
            }}
          />
        </IconButton>
      )}
      {!loading && isAuthenticated && user && (
        <IconButton
          id="verticalNavLogoutButton"
          title={i18n.t('core:logout') + ' ' + user.name}
          data-tid="login"
          onClick={() => logout({ returnTo: window.location.origin })}
          // @ts-ignore
          style={{ ...styles.button, ...styles.themingButton }}
        >
          <UpgradeIcon
            style={{
              ...styles.buttonIcon
              // color: '1DD19F'
            }}
          />
          <Button
            onClick={async () => {
              /* const claims = await getIdTokenClaims({
                scope: 'user_metadata read:users_app_metadata'
              }); */
              alert(JSON.stringify(user) + JSON.stringify(idToken));
            }}
            variant="contained"
            color="primary"
          >
            {user.name}
          </Button>
        </IconButton>
      )}
    </div>
  );
};

export default Login;

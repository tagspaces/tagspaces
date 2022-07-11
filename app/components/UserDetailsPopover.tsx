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

import React, { useState } from 'react';
import classNames from 'classnames';
import { CognitoUserInterface } from '@aws-amplify/ui-components';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Avatar from '@material-ui/core/Avatar';
import Tooltip from '@material-ui/core/Tooltip';
import Button from '@material-ui/core/Button';
import Auth from '@aws-amplify/auth';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import { clearAllURLParams } from '-/utils/dom';
import i18n from '-/services/i18n';
import styles from '-/components/SidePanels.css';
import { Pro } from '-/pro';

interface Props {
  classes?: any;
  theme?: any;
  user: CognitoUserInterface;
  // closeAllVerticalPanels: () => void;
  onClose: () => void;
}

function UserDetailsPopover(props: Props) {
  const [isSetupTOTPOpened, setSetupTOTPOpened] = useState<boolean>(false);
  const SetupTOTPDialog = Pro && Pro.UI ? Pro.UI.SetupTOTPDialog : false;

  let email;
  let initials;
  if (props.user && props.user.attributes && props.user.attributes.email) {
    ({ email } = props.user.attributes);
    const fullName = email.split('@')[0].split('.');
    const firstName = fullName[0];
    const lastName = fullName[fullName.length - 1];
    initials = firstName.charAt(0).toUpperCase();
    if (lastName) {
      initials += lastName.charAt(0).toUpperCase();
    }
  } else {
    return null;
  }

  const signOut = () => {
    Auth.signOut();
    clearAllURLParams();
    // props.closeAllVerticalPanels();
    props.onClose();
  };

  const { classes, theme } = props;

  return (
    <div
      style={{
        maxWidth: 400,
        height: '100%'
      }}
    >
      <Typography
        className={classNames(classes.panelTitle, classes.header)}
        variant="subtitle1"
      >
        User Profile
      </Typography>
      <Box>
        <ListItem>
          <ListItemIcon>
            <Avatar
              variant="rounded"
              style={{
                color: theme.palette.getContrastText(
                  theme.palette.primary.light
                ),
                backgroundColor: theme.palette.primary.light
              }}
            >
              {initials}
            </Avatar>
          </ListItemIcon>
          <Typography style={{ color: theme.palette.text.primary }}>
            {email}
          </Typography>
        </ListItem>
        {SetupTOTPDialog && (
          <Box
            style={{
              width: '100%',
              textAlign: 'center'
            }}
          >
            {isSetupTOTPOpened && (
              <SetupTOTPDialog
                open={isSetupTOTPOpened}
                onClose={() => setSetupTOTPOpened(false)}
                user={props.user}
                confirmCallback={result => {
                  if (result) {
                    window.location.reload(); // TODO SOFTWARE_TOKEN_MFA is not refreshed in signed user without window.reload()
                  }
                  console.log('TOTP is:' + result);
                }}
              />
            )}
            {'SOFTWARE_TOKEN_MFA'.indexOf(props.user.preferredMFA) === -1 ? (
              <Tooltip title={i18n.t('core:setupTOTPHelp')}>
                <Button
                  data-tid="setupTOTP"
                  className={classes.mainActionButton}
                  onClick={() => {
                    setSetupTOTPOpened(true);
                  }}
                  size="small"
                  variant="outlined"
                  color="primary"
                  style={{ width: '95%' }}
                >
                  {i18n.t('core:setupTOTP')}
                </Button>
              </Tooltip>
            ) : (
              <>
                <Typography style={{ color: theme.palette.text.primary }}>
                  {i18n.t('core:TOTPEnabled')}
                </Typography>
                <Button
                  className={classes.mainActionButton}
                  onClick={async () => {
                    try {
                      await Auth.setPreferredMFA(props.user, 'NOMFA');
                      signOut();
                    } catch (error) {
                      console.error(error);
                    }
                  }}
                  size="small"
                  variant="outlined"
                  color="primary"
                  style={{ width: '95%' }}
                >
                  {i18n.t('core:disableTOTP')}
                </Button>
              </>
            )}
          </Box>
        )}
        <Box
          style={{
            width: '100%',
            textAlign: 'center',
            marginBottom: 10
          }}
        >
          <Button
            data-tid="signOutTID"
            title={i18n.t('core:signOut')}
            className={classes.mainActionButton}
            onClick={signOut}
            size="small"
            variant="outlined"
            color="primary"
            style={{ width: '95%' }}
          >
            <ExitToAppIcon className={classNames(classes.leftIcon)} />
            {i18n.t('core:signOut')}
          </Button>
        </Box>
      </Box>
    </div>
  );
}

function mapStateToProps(state) {
  return {
    user: state.app.user
  };
}

/* function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      closeAllVerticalPanels: AppActions.closeAllVerticalPanels
    },
    dispatch
  );
} */

export default connect(mapStateToProps)(
  withStyles(styles, { withTheme: true })(UserDetailsPopover)
);

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
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import Avatar from '@mui/material/Avatar';
import Tooltip from '-/components/Tooltip';
import Button from '@mui/material/Button';
import Auth from '@aws-amplify/auth';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import { useSelector } from 'react-redux';
import { clearAllURLParams } from '-/utils/dom';
import { Pro } from '-/pro';
import { styled, useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { useUserContext } from '-/hooks/useUserContext';

const PREFIX = 'UserDetailsPopover';

const classes = {
  panelTitle: `${PREFIX}-panelTitle`,
  header: `${PREFIX}-header`,
  mainActionButton: `${PREFIX}-mainActionButton`,
  leftIcon: `${PREFIX}-leftIcon`,
};

const Root = styled('div')(({ theme }) => ({
  [`& .${classes.panelTitle}`]: {
    textTransform: 'uppercase',
    flex: 1,
    paddingLeft: 7,
    paddingTop: 12,
  },
  [`& .${classes.header}`]: {
    color: theme.palette.text.primary,
  },
  [`& .${classes.mainActionButton}`]: {
    marginTop: 10,
    marginLeft: 0,
    paddingLeft: 8,
  },
  [`& .${classes.leftIcon}`]: {
    marginRight: theme.spacing(1),
  },
}));

interface Props {
  onClose: () => void;
}

function UserDetailsPopover(props: Props) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { onClose } = props;
  const { currentUser } = useUserContext();

  const [isSetupTOTPOpened, setSetupTOTPOpened] = useState<boolean>(false);
  const SetupTOTPDialog = Pro && Pro.UI ? Pro.UI.SetupTOTPDialog : false;

  let email;
  let initials;
  if (currentUser && currentUser.attributes && currentUser.attributes.email) {
    ({ email } = currentUser.attributes);
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
    onClose();
  };

  return (
    <Root
      style={{
        maxWidth: 400,
        height: '100%',
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
                  theme.palette.primary.light,
                ),
                backgroundColor: theme.palette.primary.light,
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
              textAlign: 'center',
            }}
          >
            {isSetupTOTPOpened && (
              <SetupTOTPDialog
                open={isSetupTOTPOpened}
                onClose={() => setSetupTOTPOpened(false)}
                user={currentUser}
                confirmCallback={(result) => {
                  if (result) {
                    window.location.reload(); // TODO SOFTWARE_TOKEN_MFA is not refreshed in signed user without window.reload()
                  }
                  console.log('TOTP is:' + result);
                }}
              />
            )}
            {'SOFTWARE_TOKEN_MFA'.indexOf(currentUser.preferredMFA) === -1 ? (
              <Tooltip title={t('core:setupTOTPHelp')}>
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
                  {t('core:setupTOTP')}
                </Button>
              </Tooltip>
            ) : (
              <>
                <Typography style={{ color: theme.palette.text.primary }}>
                  {t('core:TOTPEnabled')}
                </Typography>
                <Button
                  className={classes.mainActionButton}
                  onClick={async () => {
                    try {
                      await Auth.setPreferredMFA(currentUser, 'NOMFA');
                      signOut();
                    } catch (error) {
                      console.log(error);
                    }
                  }}
                  size="small"
                  variant="outlined"
                  color="primary"
                  style={{ width: '95%' }}
                >
                  {t('core:disableTOTP')}
                </Button>
              </>
            )}
          </Box>
        )}
        <Box
          style={{
            width: '100%',
            textAlign: 'center',
            marginBottom: 10,
          }}
        >
          <Button
            data-tid="signOutTID"
            title={t('core:signOut')}
            className={classes.mainActionButton}
            onClick={signOut}
            size="small"
            variant="outlined"
            color="primary"
            style={{ width: '95%' }}
          >
            <ExitToAppIcon className={classNames(classes.leftIcon)} />
            {t('core:signOut')}
          </Button>
        </Box>
      </Box>
    </Root>
  );
}

export default UserDetailsPopover;

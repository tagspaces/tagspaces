/**
 * TagSpaces - universal file and folder organizer
 * Copyright (C) 2017-present TagSpaces GmbH
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

import TsButton from '-/components/TsButton';
import { useUserContext } from '-/hooks/useUserContext';
import { Pro } from '-/pro';
import { clearAllURLParams } from '-/utils/dom';
import Auth from '@aws-amplify/auth';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

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
    <div
      style={{
        maxWidth: 400,
        height: '100%',
      }}
    >
      <Typography
        style={{
          textTransform: 'uppercase',
          flex: 1,
          paddingLeft: 7,
          paddingTop: 12,
        }}
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
              <TsButton
                tooltip={t('core:setupTOTPHelp')}
                data-tid="setupTOTP"
                onClick={() => {
                  setSetupTOTPOpened(true);
                }}
                style={{
                  width: '95%',
                  marginTop: 10,
                  marginLeft: 0,
                  paddingLeft: 8,
                }}
              >
                {t('core:setupTOTP')}
              </TsButton>
            ) : (
              <>
                <Typography style={{ color: theme.palette.text.primary }}>
                  {t('core:TOTPEnabled')}
                </Typography>
                <TsButton
                  onClick={async () => {
                    try {
                      await Auth.setPreferredMFA(currentUser, 'NOMFA');
                      signOut();
                    } catch (error) {
                      console.log(error);
                    }
                  }}
                  style={{
                    width: '95%',
                    marginTop: 10,
                    marginLeft: 0,
                    paddingLeft: 8,
                  }}
                >
                  {t('core:disableTOTP')}
                </TsButton>
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
          <TsButton
            data-tid="signOutTID"
            title={t('core:signOut')}
            onClick={signOut}
            style={{
              width: '95%',
              marginTop: 10,
              marginLeft: 0,
              paddingLeft: 8,
            }}
          >
            <ExitToAppIcon style={{ marginRight: theme.spacing(1) }} />
            {t('core:signOut')}
          </TsButton>
        </Box>
      </Box>
    </div>
  );
}

export default UserDetailsPopover;

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
import { withStyles } from '@material-ui/core/styles';
import classNames from 'classnames';
import Typography from '@material-ui/core/Typography';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Tooltip from '@material-ui/core/Tooltip';
import Avatar from '@material-ui/core/Avatar';
import Box from '@material-ui/core/Box';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Divider from '@material-ui/core/Divider';
import DocumentationIcon from '@material-ui/icons/Help';
import AboutIcon from '@material-ui/icons/BlurOn';
import ChangeLogIcon from '@material-ui/icons/ImportContacts';
import OnboardingIcon from '@material-ui/icons/Explore';
import WebClipperIcon from '@material-ui/icons/Transform';
// import AccountIcon from '@material-ui/icons/AccountCircle';
import EmailIcon from '@material-ui/icons/Email';
import IssueIcon from '@material-ui/icons/BugReport';
import TranslationIcon from '@material-ui/icons/Translate';
import NewFeatureIcon from '@material-ui/icons/Gesture';
import SocialIcon from '@material-ui/icons/ThumbUp';
import Social2Icon from '@material-ui/icons/Mood';
import KeyShortcutsIcon from '@material-ui/icons/Keyboard';
import ProTeaserIcon from '@material-ui/icons/FlightTakeoff';
// import { AmplifySignOut } from '@aws-amplify/ui-react';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import { connect } from 'react-redux';
import { CognitoUserInterface } from '@aws-amplify/ui-components';
import Auth from '@aws-amplify/auth';
import { bindActionCreators } from 'redux';
import CustomLogo from './CustomLogo';
import ProTeaser from '../assets/images/spacerocket_undraw.svg';
import styles from './SidePanels.css';
import i18n from '../services/i18n';
import { clearAllURLParams } from '-/utils/misc';
import { Pro } from '-/pro';
import { actions as AppActions } from '-/reducers/app';
import Links from '-/links';

interface Props {
  classes?: any;
  theme?: any;
  openURLExternally: (url: string, skipConfirmation?: boolean) => void;
  toggleAboutDialog?: () => void;
  toggleKeysDialog: () => void;
  toggleOnboardingDialog: () => void;
  toggleProTeaser: () => void;
  user: CognitoUserInterface;
  style?: any;
  closeAllVerticalPanels: () => void;
}

const HelpFeedbackPanel = (props: Props) => {
  const [isSetupTOTPOpened, setSetupTOTPOpened] = useState<boolean>(false);

  const SetupTOTPDialog = Pro && Pro.UI ? Pro.UI.SetupTOTPDialog : false;

  const {
    classes,
    openURLExternally,
    toggleAboutDialog,
    toggleKeysDialog,
    toggleOnboardingDialog,
    toggleProTeaser,
    theme
  } = props;

  const signOut = () => {
    Auth.signOut();
    clearAllURLParams();
    props.closeAllVerticalPanels();
  };

  let email;
  let initials;
  if (props.user && props.user.attributes && props.user.attributes.email) {
    email = props.user.attributes.email;
    const fullName = email.split('@')[0].split('.');
    const firstName = fullName[0];
    const lastName = fullName[fullName.length - 1];
    initials = firstName.charAt(0).toUpperCase();
    if (lastName) {
      initials += lastName.charAt(0).toUpperCase();
    }
  }

  return (
    <div className={classes.panel} style={props.style}>
      <CustomLogo />
      {props.user && (
        <>
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
                {'SOFTWARE_TOKEN_MFA'.indexOf(props.user.preferredMFA) ===
                -1 ? (
                  <Tooltip title={i18n.t('core:setupTOTPHelp')}>
                    <Button
                      data-tid="setupTOTP"
                      title={i18n.t('core:setupTOTP')}
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
        </>
      )}
      <Typography
        className={classNames(classes.panelTitle, classes.header)}
        variant="subtitle1"
      >
        Help & Feedback
      </Typography>
      <div className={classes.helpFeedbackArea}>
        <List dense={false} component="nav" aria-label="main help area">
          <ListItem
            button
            onClick={toggleAboutDialog}
            title="Opens the about dialog"
          >
            <ListItemIcon>
              <AboutIcon />
            </ListItemIcon>
            <Typography style={{ color: theme.palette.text.primary }}>
              {i18n.t('core:aboutTitle')}
            </Typography>
          </ListItem>
          <ListItem
            button
            onClick={() =>
              openURLExternally(Links.documentationLinks.general, true)
            }
          >
            <ListItemIcon>
              <DocumentationIcon />
            </ListItemIcon>
            <Typography style={{ color: theme.palette.text.primary }}>
              {i18n.t('Open Documentation')}
            </Typography>
          </ListItem>
          <ListItem button onClick={toggleKeysDialog}>
            <ListItemIcon>
              <KeyShortcutsIcon />
            </ListItemIcon>
            <Typography style={{ color: theme.palette.text.primary }}>
              {i18n.t('core:shortcutKeys')}
            </Typography>
          </ListItem>
          <ListItem
            button
            onClick={() => openURLExternally(Links.links.changelogURL, true)}
            title="Opens the changelog of the app"
          >
            <ListItemIcon>
              <ChangeLogIcon />
            </ListItemIcon>
            <Typography style={{ color: theme.palette.text.primary }}>
              {i18n.t('core:whatsNew')}
            </Typography>
          </ListItem>
          <ListItem button onClick={toggleOnboardingDialog}>
            <ListItemIcon>
              <OnboardingIcon />
            </ListItemIcon>
            <Typography style={{ color: theme.palette.text.primary }}>
              {i18n.t('core:onboardingWizard')}
            </Typography>
          </ListItem>
          <ListItem
            button
            onClick={() => openURLExternally(Links.links.webClipper, true)}
          >
            <ListItemIcon>
              <WebClipperIcon />
            </ListItemIcon>
            <Typography style={{ color: theme.palette.text.primary }}>
              {i18n.t('core:webClipper')}
            </Typography>
          </ListItem>
          <Divider />
          <ListItem
            button
            onClick={() => openURLExternally(Links.links.suggestFeature, true)}
          >
            <ListItemIcon>
              <NewFeatureIcon />
            </ListItemIcon>
            <Typography style={{ color: theme.palette.text.primary }}>
              {i18n.t('core:suggestNewFeatures')}
            </Typography>
          </ListItem>
          <ListItem
            button
            onClick={() => openURLExternally(Links.links.reportIssue, true)}
          >
            <ListItemIcon>
              <IssueIcon />
            </ListItemIcon>
            <Typography style={{ color: theme.palette.text.primary }}>
              {i18n.t('core:reportIssues')}
            </Typography>
          </ListItem>
          <ListItem
            button
            onClick={() => openURLExternally(Links.links.helpTranslating, true)}
          >
            <ListItemIcon>
              <TranslationIcon />
            </ListItemIcon>
            <Typography style={{ color: theme.palette.text.primary }}>
              {i18n.t('core:helpWithTranslation')}
            </Typography>
          </ListItem>
          <Divider />
          <ListItem
            button
            onClick={() => openURLExternally(Links.links.emailContact, true)}
          >
            <ListItemIcon>
              <EmailIcon />
            </ListItemIcon>
            <Typography style={{ color: theme.palette.text.primary }}>
              {i18n.t('core:emailContact')}
            </Typography>
          </ListItem>
          <ListItem
            button
            onClick={() => openURLExternally(Links.links.twitter)}
          >
            <ListItemIcon>
              <Social2Icon />
            </ListItemIcon>
            <Typography style={{ color: theme.palette.text.primary }}>
              {i18n.t('core:followOnTwitter')}
            </Typography>
          </ListItem>
          <ListItem
            button
            onClick={() => openURLExternally(Links.links.facebook)}
          >
            <ListItemIcon>
              <SocialIcon />
            </ListItemIcon>
            <Typography style={{ color: theme.palette.text.primary }}>
              {i18n.t('core:likeUsOnFacebook')}
            </Typography>
          </ListItem>
          {Pro && (
            <React.Fragment>
              <Divider />
              <ListItem button onClick={toggleProTeaser}>
                <ListItemIcon>
                  <ProTeaserIcon />
                </ListItemIcon>
                <Typography style={{ color: theme.palette.text.primary }}>
                  {i18n.t('TagSpaces Pro Overview')}
                </Typography>
              </ListItem>
            </React.Fragment>
          )}
        </List>
        {!Pro && (
          <React.Fragment>
            {/* <Divider /> */}
            <div
              onClick={toggleProTeaser}
              role="button"
              tabIndex={0}
              style={{
                backgroundColor: 'rgba(29, 209, 159, 0.08)',
                textAlign: 'center'
              }}
            >
              <CardContent
                style={{
                  paddingBottom: 0
                }}
              >
                <Typography color="textSecondary" gutterBottom>
                  Achieve more with
                </Typography>
                <Typography variant="h6" component="h2" color="textPrimary">
                  TagSpaces Pro
                </Typography>
                <img
                  style={{ maxHeight: 80, marginTop: 10 }}
                  src={ProTeaser}
                  alt=""
                />
              </CardContent>
              <CardActions
                style={{ flexDirection: 'row', justifyContent: 'center' }}
              >
                <Button
                  size="small"
                  onClick={(event: any) => {
                    event.preventDefault();
                    event.stopPropagation();
                    toggleProTeaser();
                  }}
                >
                  Learn More
                </Button>
                <Button
                  size="small"
                  onClick={(event: any) => {
                    event.preventDefault();
                    event.stopPropagation();
                    openURLExternally(Links.links.productsOverview, true);
                  }}
                >
                  Get It
                </Button>
              </CardActions>
            </div>
            {/* <Divider /> */}
          </React.Fragment>
        )}
      </div>
    </div>
  );
};

function mapStateToProps(state) {
  return {
    user: state.app.user
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      closeAllVerticalPanels: AppActions.closeAllVerticalPanels
    },
    dispatch
  );
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles, { withTheme: true })(HelpFeedbackPanel));

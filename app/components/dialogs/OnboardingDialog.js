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
 * @flow
 */

import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import SwipeableViews from 'react-swipeable-views';
import Button from '@material-ui/core/Button';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Typography from '@material-ui/core/Typography';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import withMobileDialog from '@material-ui/core/withMobileDialog';
import GenericDialog, { onEnterKeyHandler } from './GenericDialog';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import MobileStepper from '@material-ui/core/MobileStepper';
import WelcomeImage from '../../assets/images/onboarding.jpg';
import NavigationV3 from '../../assets/images/navigation-v3.png';
import BrowserExtension from '../../assets/images/browser-extensions.png';
import NewLook from '../../assets/images/new-look.png';
import i18n from '../../services/i18n';
import {
  isFirstRun,
  getCurrentTheme,
  getPersistTagsInSidecarFile,
  actions as SettingsActions
} from '../../reducers/settings';

type Props = {
  open: boolean,
  isFirstRun: boolean,
  isPersistTagsInSidecar: boolean,
  fullScreen: boolean,
  currentTheme: string,
  // setFirstRun: (isFirstRun: boolean) => void,
  setPersistTagsInSidecarFile: (isPersistTagsInSidecar: boolean) => void,
  setCurrentTheme: () => void,
  onClose: () => void
};

type State = {
  license?: string
};

class OnboardingDialog extends React.Component<Props, State> {
  state = {
    activeStep: 0,
    isPersistTagsInSidecar: false
  };

  maxSteps = 5;

  handleNext = () => {
    this.setState(prevState => ({
      activeStep: prevState.activeStep + 1
    }));
  };

  handleBack = () => {
    this.setState(prevState => ({
      activeStep: prevState.activeStep - 1
    }));
  };

  handleStepChange = activeStep => {
    this.setState({ activeStep });
  };

  toggleTaggingType = () => {
    this.props.setPersistTagsInSidecarFile(!this.props.isPersistTagsInSidecar);
  };

  renderTitle = () => (
    <DialogTitle style={{ justifyContent: 'center', textAlign: 'center' }}>
      Welcome to TagSpaces
    </DialogTitle>
  );

  renderContent = () => {
    const { activeStep } = this.state;

    return (
      <DialogContent
        style={{ height: 620, overflow: 'hidden', paddingBottom: 0 }}
      >
        <SwipeableViews
          index={activeStep}
          onChangeIndex={this.handleStepChange}
          enableMouseEvents
        >
          <div
            style={{
              height: 550,
              padding: 5,
              overflow: 'hidden',
              textAlign: 'center'
            }}
          >
            <Typography variant="h4">Welcome to TagSpaces</Typography>
            <Typography variant="h6">&nbsp;</Typography>
            <Typography variant="h6">Your favorite file organizer has a fresh new look</Typography>
            <img
              style={{ maxHeight: 340, marginTop: 15 }}
              src={NewLook}
              alt=""
            />
            <Typography variant="h6">Try out our new themes</Typography>
            <ToggleButtonGroup
              value={this.props.currentTheme}
              exclusive
              onChange={(event, theme) => { this.props.setCurrentTheme(theme); }}
              style={{ boxShadow: 'none' }}
            >
              <ToggleButton value="light">
                Light
              </ToggleButton>
              <ToggleButton value="dark">
                Dark
              </ToggleButton>
            </ToggleButtonGroup>
          </div>
          <div
            style={{
              height: 550,
              padding: 5,
              overflow: 'hidden',
              textAlign: 'center'
            }}
          >
            <Typography variant="h4">Meet our new navigation</Typography>
            <img
              style={{ maxHeight: 500, marginTop: 15 }}
              src={NavigationV3}
              alt=""
            />
          </div>
          <div
            style={{
              height: 550,
              padding: 5,
              overflow: 'hidden',
              textAlign: 'center'
            }}
          >
            <Typography variant="h4">Tag your files and folder with ease!</Typography>
            <Typography variant="h6">&nbsp;</Typography>
            <Typography variant="h6">Choose your the default tagging method for files</Typography>
            <FormControl style={{ marginTop: 20 }} component="fieldset">
              <RadioGroup
                aria-label="Gender"
                name="isPersistTagsInSidecar"
                // value={this.props.isPersistTagsInSidecar}
                onChange={this.toggleTaggingType}
              >
                <FormControlLabel
                  value="false"
                  control={
                    <Radio checked={!this.props.isPersistTagsInSidecar} />
                  }
                  label={
                    <Typography variant="subtitle1" style={{ textAlign: 'left' }}>
                      Use the name of file for saving the tags - Tagging the
                      file <strong>image.jpg</strong> with a tag{' '}
                      <strong>sunset</strong> will rename it to{' '}
                      <strong>image[sunset].jpg</strong>
                    </Typography>
                  }
                />

                <FormControlLabel
                  style={{ marginTop: 20 }}
                  value="true"
                  control={
                    <Radio checked={this.props.isPersistTagsInSidecar} />
                  }
                  label={
                    <Typography variant="subtitle1" style={{ textAlign: 'left' }}>
                      Use sidecar file for saving the tags - Tagging the file{' '}
                      <strong>image.jpg</strong> with a tag{' '}
                      <strong>sunset</strong> will save this tag in an
                      additional file called <strong>image.jpg.json</strong>{' '}
                      located in a sub folder with the name <strong>.ts</strong>
                    </Typography>
                  }
                />
              </RadioGroup>
            </FormControl>
          </div>
          <div
            style={{
              height: 550,
              padding: 5,
              overflow: 'hidden',
              textAlign: 'center'
            }}
          >
            <Typography variant="h4">Collect web content in Chrome and Firefox</Typography>
            <Typography variant="h6">We have a web clipper browser extension</Typography>
            <img
              style={{ maxHeight: 400, marginTop: 15 }}
              src={BrowserExtension}
              alt=""
            />
            <Typography variant="h6">It is freely available on the official browser stores</Typography>
          </div>
          <div
            style={{
              height: 550,
              padding: 5,
              overflow: 'hidden',
              textAlign: 'center'
            }}
          >
            <Typography variant="h4">And... you&apos;re done</Typography>
            <img
              style={{ maxHeight: 300, marginTop: 15 }}
              src={WelcomeImage}
              alt=""
            />
            <Typography variant="h6">
              We hope you will love TagSpaces as much as we love it!
            </Typography>
          </div>
        </SwipeableViews>
        <MobileStepper
          style={{ marginTop: 10, backgroundColor: 'transparent' }}
          steps={this.maxSteps}
          position="static"
          activeStep={activeStep}
          nextButton={
            (activeStep === this.maxSteps - 1) ? (
              <Button
                size="small"
                onClick={this.props.onClose}
                variant="contained"
                color="primary"
                data-tid="startTagSpacesAfterOnboarding"
              >
                Start using TagSpaces
              </Button>

            ) : (
              <Button
                size="small"
                onClick={this.handleNext}
                data-tid="nextStepOnboarding"
              >
                Next
              </Button>
            )
          }
          backButton={
            <Button
              size="small"
              onClick={this.handleBack}
              disabled={activeStep === 0}
            >
              Back
            </Button>
          }
        />
      </DialogContent>
    );
  };
  renderActions = () => (
    <DialogActions style={{ justifyContent: 'center' }}>
      <Button
        data-tid="confirmLicenseDialog"
        onClick={this.props.onClose}
        variant={
          this.state.activeStep === this.maxSteps - 1 ? 'contained' : 'text'
        }
        color="primary"
      >
        {this.state.activeStep === this.maxSteps - 1
          ? 'Start using TagSpaces'
          : i18n.t('core:closeButton')}
      </Button>
    </DialogActions>
  );

  render() {
    const { fullScreen, open, onClose } = this.props;
    return (
      <GenericDialog
        fullScreen={fullScreen}
        open={open}
        onClose={onClose}
        // onEnterKey={(event) => onEnterKeyHandler(event, this.onConfirm)}
        // renderTitle={this.renderTitle}
        renderContent={this.renderContent}
        // renderActions={this.renderActions}
      />
    );
  }
}

function mapStateToProps(state) {
  return {
    isFirstRun: isFirstRun(state),
    isPersistTagsInSidecar: getPersistTagsInSidecarFile(state),
    currentTheme: getCurrentTheme(state)
  };
}

function mapActionCreatorsToProps(dispatch) {
  return bindActionCreators(
    {
      setFirstRun: SettingsActions.setFirstRun,
      setPersistTagsInSidecarFile: SettingsActions.setPersistTagsInSidecarFile,
      setCurrentTheme: SettingsActions.setCurrentTheme
    },
    dispatch
  );
}

export default connect(
  mapStateToProps,
  mapActionCreatorsToProps
)(withMobileDialog()(OnboardingDialog));

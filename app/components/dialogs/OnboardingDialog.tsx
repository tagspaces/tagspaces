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
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import MobileStepper from '@material-ui/core/MobileStepper';
import Dialog from '@material-ui/core/Dialog';
import NavigationV3 from '-/assets/images/navigation-v3.png';
import BrowserExtension from '-/assets/images/collectcontent.svg';
import WizardFinished from '-/assets/images/computer-desk.svg';
import ChooseTagging from '-/assets/images/abacus.svg';
import NewLook from '-/assets/images/desktop.svg';
import i18n from '-/services/i18n';
import {
  isFirstRun,
  getCurrentTheme,
  getPersistTagsInSidecarFile,
  actions as SettingsActions
} from '-/reducers/settings';
import { actions as AppActions } from '-/reducers/app';
import AppConfig from '-/config';
import DialogCloseButton from '-/components/dialogs/DialogCloseButton';
import Links from '-/links';

interface Props {
  classes: any;
  open: boolean;
  isPersistTagsInSidecar: boolean;
  fullScreen: boolean;
  currentTheme: string;
  // setFirstRun: (isFirstRun: boolean) => void,
  setPersistTagsInSidecarFile: (isPersistTagsInSidecar: boolean) => void;
  setCurrentTheme: (theme: string) => void;
  openURLExternally: (url: string, skipConfirmation?: boolean) => void;
  onClose: () => void;
}

const OnboardingDialog = (props: Props) => {
  const [activeStep, setActiveStep] = useState(0);
  const { fullScreen, open, onClose } = props;

  const maxSteps = 4;

  function handleNext() {
    setActiveStep(step => step + 1);
  }

  function handleBack() {
    setActiveStep(step => step - 1);
  }

  function handleStepChange(step: number) {
    setActiveStep(step);
  }

  function toggleTaggingType() {
    props.setPersistTagsInSidecarFile(!props.isPersistTagsInSidecar);
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      keepMounted
      fullScreen={fullScreen}
      scroll="paper"
    >
      <DialogTitle style={{ justifyContent: 'center', textAlign: 'center' }}>
        <DialogCloseButton onClose={onClose} testId="closeOnboardingDialog" />
      </DialogTitle>
      <DialogContent
        style={{
          marginTop: 20,
          // @ts-ignore
          overflowY: AppConfig.isFirefox ? 'auto' : 'overlay'
        }}
      >
        <SwipeableViews
          index={activeStep}
          onChangeIndex={handleStepChange}
          enableMouseEvents
        >
          <div
            style={{
              textAlign: 'center',
              overflowX: 'hidden'
            }}
          >
            <Typography variant="h5">
              {i18n.t('core:welcomeToTagSpaces')}
            </Typography>
            <img
              style={{ maxHeight: 300, marginTop: 15, marginBottom: 40 }}
              src={NewLook}
              alt=""
            />
            <Typography variant="h6">Try our our dark theme!</Typography>
            <Typography variant="h6">&nbsp;</Typography>
            <ToggleButtonGroup
              value={props.currentTheme}
              exclusive
              onChange={(event, theme) => {
                props.setCurrentTheme(theme);
              }}
              style={{ boxShadow: 'none' }}
            >
              <ToggleButton value="light">Light</ToggleButton>
              <ToggleButton value="dark">Dark</ToggleButton>
            </ToggleButtonGroup>
          </div>
          {/* <div
            style={{
              textAlign: 'center'
            }}
          >
            <Typography variant="h5">Navigation in the app</Typography>
            <img
              style={{ marginTop: 15, maxHeight: 500 }}
              src={NavigationV3}
              alt=""
            />
          </div> */}
          <div
            style={{
              textAlign: 'center'
            }}
          >
            <Typography variant="h5">
              Choose your the default tagging method for files
            </Typography>
            <Typography variant="h5">&nbsp;</Typography>
            <Typography variant="body1">
              Core functionality of the application the tagging of files and
              folders. Here you can choose how tags will attached to files.
            </Typography>
            <FormControl
              style={{ marginTop: 20, marginBottom: 20 }}
              component="fieldset"
            >
              <RadioGroup
                aria-label="fileTaggingType"
                name="isPersistTagsInSidecar"
                onChange={toggleTaggingType}
              >
                <FormControlLabel
                  value="false"
                  control={<Radio checked={!props.isPersistTagsInSidecar} />}
                  label={
                    <Typography
                      variant="subtitle1"
                      style={{ textAlign: 'left' }}
                    >
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
                  control={<Radio checked={props.isPersistTagsInSidecar} />}
                  label={
                    <Typography
                      variant="subtitle1"
                      style={{ textAlign: 'left' }}
                    >
                      Use sidecar file for saving the tags - Tagging the file{' '}
                      <strong>image.jpg</strong> with a tag{' '}
                      <strong>sunset</strong> will save this tag in an
                      additional sidecar file called{' '}
                      <strong>image.jpg.json</strong> located in a sub folder
                      with the name
                      <strong>.ts</strong>
                    </Typography>
                  }
                />
                <img
                  style={{ maxHeight: 200, marginTop: 15 }}
                  src={ChooseTagging}
                  alt=""
                />
              </RadioGroup>
            </FormControl>
            <Typography variant="body1">
              You can always revise you decision and change the tagging method.
              But files already tagged with the renaming method will stay
              renamed and the created sidecar file with the tags will stay.
            </Typography>
          </div>
          <div
            style={{
              textAlign: 'center'
            }}
          >
            <Typography variant="h5">
              Collect web pages, create bookmarks or take screenshot from
              websites directly in your web browser.
            </Typography>
            <img
              style={{ maxHeight: 300, marginTop: 15, marginBottom: 20 }}
              src={BrowserExtension}
              alt=""
            />
            <Typography variant="h6">
              Check out our web clipper browser extension for Chrome, Edge and
              Firefox.
            </Typography>
            <Typography variant="h6">
              It is available for free in the official browser stores.
            </Typography>
            <Button
              style={{ marginTop: 20 }}
              onClick={() => {
                props.openURLExternally(Links.links.webClipper, true);
              }}
              variant="contained"
              color="primary"
            >
              Get the web clipper
            </Button>
          </div>
          <div
            style={{
              textAlign: 'center'
            }}
          >
            <Typography variant="h5">And... you&apos;re done</Typography>
            <img
              style={{ maxHeight: 300, marginTop: 100 }}
              src={WizardFinished}
              alt=""
            />
            <Typography variant="h6">
              We hope you will love TagSpaces as much as we love it!
            </Typography>
          </div>
        </SwipeableViews>
      </DialogContent>
      <DialogActions style={{ justifyContent: 'center' }}>
        <MobileStepper
          style={{ marginTop: 10, backgroundColor: 'transparent' }}
          steps={maxSteps}
          position="static"
          activeStep={activeStep}
          nextButton={
            activeStep === maxSteps - 1 ? (
              <Button
                size="small"
                onClick={props.onClose}
                variant="contained"
                color="primary"
                style={{ marginLeft: 5 }}
                data-tid="startTagSpacesAfterOnboarding"
              >
                {i18n.t('core:startUsingTagSpaces')}
              </Button>
            ) : (
              <Button
                size="small"
                onClick={handleNext}
                data-tid="nextStepOnboarding"
              >
                {i18n.t('core:next')}
              </Button>
            )
          }
          backButton={
            <Button
              size="small"
              onClick={handleBack}
              disabled={activeStep === 0}
            >
              {i18n.t('core:prev')}
            </Button>
          }
        />
      </DialogActions>
    </Dialog>
  );
};

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
      setCurrentTheme: SettingsActions.setCurrentTheme,
      openURLExternally: AppActions.openURLExternally
    },
    dispatch
  );
}

export default connect(
  mapStateToProps,
  mapActionCreatorsToProps
)(withMobileDialog()(OnboardingDialog));

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

import React, { useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Slider from 'react-slick';
import TsButton from '-/components/TsButton';
import DialogContent from '@mui/material/DialogContent';
import Typography from '@mui/material/Typography';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Dialog from '@mui/material/Dialog';
import BrowserExtension from '-/assets/images/collectcontent.svg';
import WizardFinished from '-/assets/images/computer-desk.svg';
import ChooseTagging from '-/assets/images/abacus.svg';
import Organize from '-/assets/images/organize.svg';
import NewLook from '-/assets/images/desktop.svg';
import {
  getCurrentTheme,
  getPersistTagsInSidecarFile,
  actions as SettingsActions,
} from '-/reducers/settings';
import DialogCloseButton from '-/components/dialogs/DialogCloseButton';
import Links from 'assets/links';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { openURLExternally } from '-/services/utils-io';
import { AppDispatch } from '-/reducers/app';
import { useTranslation } from 'react-i18next';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import TsDialogTitle from '-/components/dialogs/components/TsDialogTitle';

interface Props {
  classes: any;
  open: boolean;
  onClose: () => void;
}

function OnboardingDialog(props: Props) {
  const { t } = useTranslation();
  const { open, onClose } = props;
  const isPersistTagsInSidecar = useSelector(getPersistTagsInSidecarFile);
  const currentTheme = useSelector(getCurrentTheme);
  const dispatch: AppDispatch = useDispatch();

  const setPersistTagsInSidecarFile = (isPersistTagsInSidecar) => {
    dispatch(
      SettingsActions.setPersistTagsInSidecarFile(isPersistTagsInSidecar),
    );
  };

  const setCurrentTheme = (theme) => {
    dispatch(SettingsActions.setCurrentTheme(theme));
  };

  const toggleTaggingType = () => {
    setPersistTagsInSidecarFile(!isPersistTagsInSidecar);
  };

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

  function NextArrow(props) {
    const { className, style, onClick } = props;
    return (
      <div className={className} onClick={onClick}>
        <NavigateNextIcon fontSize="large" color="primary" />
      </div>
    );
  }

  function PrevArrow(props) {
    const { className, style, onClick } = props;
    return (
      <div className={className} onClick={onClick}>
        <NavigateBeforeIcon fontSize="large" color="primary" />
      </div>
    );
  }

  const sliderSettings = {
    className: 'center',
    centerMode: true,
    // dots: true,
    infinite: false,
    initialSlide: 0,
    centerPadding: '0px',
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    adaptiveHeight: true,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      keepMounted
      fullScreen={fullScreen}
      scroll="paper"
    >
      <TsDialogTitle
        dialogTitle={''}
        onClose={onClose}
        closeButtonTestId="closeOnboardingDialog"
      />
      <DialogContent
        style={{
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
      >
        <style>
          {`
            .slick-arrow {
              height: 200px;
              width: 50px;
              display: flex;
              align-items: center;
            } 
            .slick-next:before {
              content: '';
            }
            .slick-prev:before {
              content: '';
            }
        `}
        </style>
        <Slider {...sliderSettings}>
          <div>
            <div
              style={{
                textAlign: 'center',
              }}
            >
              <Typography variant="h5">
                {t('core:welcomeToTagSpaces')}
              </Typography>
              <img
                style={{
                  maxHeight: 250,
                  paddingTop: 15,
                  paddingBottom: 40,
                  margin: 'auto',
                  display: 'block',
                }}
                src={NewLook}
                alt=""
              />
              <Typography variant="h6">Try our dark theme!</Typography>
              <Typography variant="h6">&nbsp;</Typography>
              <ToggleButtonGroup
                value={currentTheme}
                exclusive
                onChange={(event, theme) => {
                  setCurrentTheme(theme);
                }}
                style={{ boxShadow: 'none' }}
              >
                <ToggleButton value="light">Light</ToggleButton>
                <ToggleButton value="dark">Dark</ToggleButton>
              </ToggleButtonGroup>
            </div>
          </div>
          <div>
            <div
              style={{
                textAlign: 'center',
              }}
            >
              <Typography variant="h5">
                Choose the default tagging method for files
              </Typography>
              <Typography variant="h5">&nbsp;</Typography>
              {/* <Typography variant="body1">
                Core functionality of the application the tagging of files and
                folders. Here you can choose how tags will be attached to files.
              </Typography> */}
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
                    control={<Radio checked={!isPersistTagsInSidecar} />}
                    label={
                      <Typography
                        variant="subtitle1"
                        style={{ textAlign: 'left' }}
                      >
                        Use the name of file for saving the tags - tagging the
                        file <strong>image.jpg</strong> with the tag{' '}
                        <strong>sunset</strong> will rename it to{' '}
                        <strong>image[sunset].jpg</strong>
                      </Typography>
                    }
                  />
                  <FormControlLabel
                    style={{ marginTop: 20 }}
                    value="true"
                    control={<Radio checked={isPersistTagsInSidecar} />}
                    label={
                      <Typography
                        variant="subtitle1"
                        style={{ textAlign: 'left' }}
                      >
                        Use sidecar file for saving the tags - tagging the file{' '}
                        <strong>image.jpg</strong> with a tag{' '}
                        <strong>sunset</strong> will store this tag in an
                        separate file called <strong>image.jpg.json</strong>{' '}
                        located in a sub folder with the name{' '}
                        <strong>.ts</strong>
                      </Typography>
                    }
                  />
                </RadioGroup>
              </FormControl>
              <img
                style={{ maxHeight: 200, margin: 'auto' }}
                src={ChooseTagging}
                alt=""
              />
              <Typography variant="body2">
                You can change this decision later. But files already tagged
                with the renaming method will stay renamed.
              </Typography>
            </div>
          </div>
          <div>
            <div style={{ textAlign: 'center' }}>
              <Typography variant="h5" style={{ marginBottom: 20 }}>
                Create and collect digital content
              </Typography>
              <Typography variant="body1">
                With the TagSpaces Web Clipper you can collect web pages,
                bookmarks or screenshot from the Web. With the built-in text
                editors you can create digital notes, which can include tables,
                todo-lists, math formulas or diagrams.
              </Typography>
              <img
                style={{
                  maxHeight: 300,
                  paddingTop: 15,
                  paddingBottom: 20,
                  margin: 'auto',
                  display: 'block',
                }}
                src={BrowserExtension}
                alt=""
              />
              <Typography variant="body1">
                Check out our web clipper browser extension for Chrome, Edge and
                Firefox. It is available for free in the official browser
                stores.
              </Typography>
              <TsButton
                style={{
                  marginTop: 20,
                  marginLeft: 'auto',
                  marginRight: 'auto',
                  marginBottom: 20,
                  display: 'block',
                }}
                onClick={() => {
                  openURLExternally(Links.links.webClipper, true);
                }}
              >
                Get the web clipper
              </TsButton>
            </div>
          </div>
          <div>
            <div style={{ textAlign: 'center' }}>
              <Typography variant="h5" style={{ marginBottom: 20 }}>
                Organize and Annotate
              </Typography>
              <Typography variant="body1">
                TagSpaces can connect to folders from your hard drive or S3
                buckets. It provides a convenient way to browse and manage the
                content of the connected folders which we call <b>locations</b>.
                You have the ability to add tags to any file or folder.
              </Typography>
              <img
                style={{
                  maxHeight: 300,
                  maxWidth: '90%',
                  paddingTop: 15,
                  paddingBottom: 20,
                  margin: 'auto',
                  display: 'block',
                }}
                src={Organize}
                alt=""
              />
              <Typography variant="body1">
                In TagSpaces Pro you can add <b>description</b> and{' '}
                <b>geo-tags</b> to your files and folders. On top of that we
                offer various views for your folders which call{' '}
                <b>perspectives</b>.
              </Typography>
              <TsButton
                style={{
                  marginTop: 20,
                  marginLeft: 'auto',
                  marginRight: 'auto',
                  marginBottom: 20,
                  display: 'block',
                }}
                onClick={() => {
                  openURLExternally(Links.links.productPro, true);
                }}
              >
                More about TagSpaces Pro
              </TsButton>
            </div>
          </div>
          <div>
            <div style={{ textAlign: 'center' }}>
              <Typography variant="h5">
                We hope you will love TagSpaces as much as we do!
              </Typography>
              <img
                style={{
                  maxHeight: 300,
                  maxWidth: '90%',
                  paddingTop: 70,
                  margin: 'auto',
                  display: 'block',
                }}
                src={WizardFinished}
                alt=""
              />
              <Typography variant="body1">
                If you want to learn more about how to use the application,
                please start the introduction from the following screen.
              </Typography>
              <TsButton
                style={{
                  marginTop: 20,
                  marginLeft: 'auto',
                  marginRight: 'auto',
                  marginBottom: 20,
                  display: 'block',
                }}
                onClick={onClose}
              >
                Start using TagSpaces
              </TsButton>
            </div>
          </div>
        </Slider>
      </DialogContent>
    </Dialog>
  );
}

export default OnboardingDialog;

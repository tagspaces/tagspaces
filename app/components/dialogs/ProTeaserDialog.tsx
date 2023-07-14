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
import SwipeableViews from 'react-swipeable-views';
import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';
import MobileStepper from '@mui/material/MobileStepper';
import Dialog from '@mui/material/Dialog';
import i18n from '-/services/i18n';
import DialogCloseButton from '-/components/dialogs/DialogCloseButton';
import useTheme from '@mui/styles/useTheme';
import useMediaQuery from '@mui/material/useMediaQuery';
import { getProTeaserIndex } from '-/reducers/app';
import { useSelector } from 'react-redux';
import { getProTeaserSlides } from '-/content/ProTeaserSlides';
import Links from '-/content/links';
import { openURLExternally } from "-/services/utils-io";

interface Props {
  open: boolean;
  onClose: () => void;
}

interface SlideProps {
  title: string;
  description?: '';
  ctaURL?: string;
  ctaTitle?: string;
  items?: Array<string>;
  pictureURL?: string;
  pictureShadow?: boolean;
  videoURL?: string;
  videoPosterUrl?: string;
  pictureHeight?: number;
}

const slidesEN = getProTeaserSlides();

function Slide(props: SlideProps) {
  const {
    title,
    description,
    ctaURL,
    ctaTitle,
    items,
    pictureURL,
    videoURL,
    videoPosterUrl,
    pictureHeight,
    pictureShadow
  } = props;
  return (
    <div
      style={{
        padding: 5,
        textAlign: 'left'
      }}
    >
      <Typography
        variant="h5"
        style={{ textAlign: 'center', paddingBottom: 10 }}
      >
        {title}
      </Typography>
      {description && (
        <Typography variant="subtitle1">{description}</Typography>
      )}
      {items &&
        items.map(item => (
          <Typography variant="subtitle1">&#x2605;&nbsp;{item}</Typography>
        ))}
      <Typography variant="subtitle1">&nbsp;</Typography>
      <div style={{ textAlign: 'center' }}>
        {pictureURL && (
          <a
            href="#"
            onClick={() => {
              openURLExternally(ctaURL, true);
            }}
          >
            <img
              style={{
                cursor: 'pointer',
                maxHeight: pictureHeight,
                marginTop: 15,
                marginBottom: 15,
                boxShadow: pictureShadow
                  ? '2px 2px 13px 0 rgb(0 0 0 / 75%'
                  : 'none',
                maxWidth: '95%'
              }}
              src={pictureURL}
              alt=""
            />
          </a>
        )}
        {videoURL && (
          <video
            src={videoURL}
            poster={videoPosterUrl}
            autoPlay={true}
            loop
            controls
            style={{ width: '100%', marginBottom: 15 }}
          />
        )}
        <br />
        <Button
          onClick={() => {
            openURLExternally(Links.links.productsOverview, true);
          }}
          variant="contained"
          color="primary"
        >
          Compare TagSpaces Products
        </Button>
        {ctaTitle && (
          <Button
            onClick={() => {
              openURLExternally(ctaURL, true);
            }}
            style={{ marginLeft: 10 }}
            variant="contained"
            color="primary"
          >
            {ctaTitle}
          </Button>
        )}
      </div>
    </div>
  );
}

function ProTeaserDialog(props: Props) {
  const slideIndex = useSelector(getProTeaserIndex);
  const [activeStep, setActiveStep] = useState<number>(
    slideIndex && slideIndex > -1 ? slideIndex : 0
  );

  const maxSteps = Object.keys(slidesEN).length;

  const handleNext = () => {
    setActiveStep(activeStep + 1);
  };

  const handleBack = () => {
    setActiveStep(activeStep - 1);
  };

  const handleStepChange = step => {
    setActiveStep(step);
  };

  const { open, onClose } = props;

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

  const slides = [];
  for (let index in slidesEN) {
    slides.push(<Slide {...slidesEN[index]} />);
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={fullScreen}
      keepMounted
      scroll="paper"
    >
      <DialogTitle style={{ justifyContent: 'center', textAlign: 'center' }}>
        <DialogCloseButton testId="closeProTeaserTID" onClose={onClose} />
      </DialogTitle>
      <DialogContent
        style={{
          paddingBottom: 0,
          overflowY: 'auto'
        }}
      >
        <SwipeableViews
          index={activeStep}
          onChangeIndex={handleStepChange}
          enableMouseEvents
        >
          {slides ? slides : <></>}
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
              <Button size="small" onClick={onClose}>
                {i18n.t('core:closeButton')}
              </Button>
            ) : (
              <Button size="small" onClick={handleNext}>
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
}

export default ProTeaserDialog;

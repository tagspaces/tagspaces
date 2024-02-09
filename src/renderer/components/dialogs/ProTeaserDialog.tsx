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

import React, { useRef } from 'react';
import Button from '@mui/material/Button';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';
import Dialog from '@mui/material/Dialog';
import DialogCloseButton from '-/components/dialogs/DialogCloseButton';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { getProTeaserIndex } from '-/reducers/app';
import { useSelector } from 'react-redux';
import { getProTeaserSlides } from '-/content/ProTeaserSlides';
import Links from 'assets/links';
import { openURLExternally } from '-/services/utils-io';
import { register } from 'swiper/element/bundle';
import { Navigation, Pagination } from 'swiper/modules';
import { useTranslation } from 'react-i18next';

register();

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
    pictureShadow,
  } = props;
  return (
    <swiper-slide>
      <div
        style={{
          padding: 50,
          textAlign: 'left',
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
          items.map((item) => (
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
                  maxWidth: '95%',
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
            // variant="contained"
            color="primary"
            size="small"
          >
            Compare TagSpaces Products
          </Button>
          {ctaTitle && (
            <Button
              onClick={() => {
                openURLExternally(ctaURL, true);
              }}
              style={{ marginLeft: 10 }}
              // variant="contained"
              color="primary"
              size="small"
            >
              {ctaTitle}
            </Button>
          )}
        </div>
      </div>
    </swiper-slide>
  );
}

function ProTeaserDialog(props: Props) {
  const { t } = useTranslation();
  const swiperElRef = useRef(null); //<SwiperRef>
  const slideIndex = useSelector(getProTeaserIndex);

  const slidesEN = getProTeaserSlides(t);

  const { open, onClose } = props;

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

  const slides = [];
  for (let index in slidesEN) {
    slides.push(<Slide key={index} {...slidesEN[index]} />);
  }

  const initialSlide = slideIndex && slideIndex > -1 ? Number(slideIndex) : 0;

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
          overflowY: 'auto',
        }}
      >
        <style>
          {`
        swiper-container::part(bullet-active) {
          background-color: ${theme.palette.primary.main};
        }
        swiper-container::part(button-prev) {
          color: ${theme.palette.primary.main};
        }
        swiper-container::part(button-next) {
          color: ${theme.palette.primary.main};
        }
        `}
        </style>
        <swiper-container
          ref={swiperElRef}
          initialSlide={initialSlide}
          slidesPerView={1}
          navigation={true}
          /*scrollbar={true}*/
          pagination={{
            clickable: true,
          }}
          cssMode={false}
          /*keyboard={{
            enabled: true
          }}*/
          modules={[Pagination, Navigation]}
        >
          {slides}
        </swiper-container>
      </DialogContent>
    </Dialog>
  );
}

export default ProTeaserDialog;

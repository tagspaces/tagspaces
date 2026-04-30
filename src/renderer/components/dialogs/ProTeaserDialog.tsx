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

import AppConfig from '-/AppConfig';
import DraggablePaper from '-/components/DraggablePaper';
import TsButton from '-/components/TsButton';
import TsDialogTitle from '-/components/dialogs/components/TsDialogTitle';
import { getProTeaserSlides } from '-/content/ProTeaserSlides';
import { openURLExternally } from '-/services/utils-io';
import { Box, ButtonGroup } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Links from 'assets/links';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

interface Props {
  open: boolean;
  slideIndex: number;
  onClose: () => void;
}

interface SlideProps {
  title: string;
  description?: '';
  ctaURL?: string;
  ctaTitle?: string;
  items?: Array<React.ReactNode>;
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
  const { t } = useTranslation();

  return (
    <Box
      sx={{
        padding: '40px',
        marginTop: '-40px',
      }}
    >
      <Typography
        variant="h5"
        sx={{ textAlign: 'center', paddingBottom: '10px' }}
      >
        {title}
      </Typography>
      {description && (
        <Typography variant="subtitle1">{description}</Typography>
      )}
      {items &&
        items.map((item, index) => (
          <Typography key={index} variant="subtitle1">
            &#x2605;&nbsp;{item}
          </Typography>
        ))}
      <Box sx={{ textAlign: 'center', paddingTop: '10px' }}>
        {pictureURL && (
          <a
            href="#"
            onClick={() => {
              openURLExternally(ctaURL, true);
            }}
            style={{
              paddingTop: 15,
              paddingBottom: 15,
            }}
          >
            <img
              style={{
                borderRadius: AppConfig.defaultCSSRadius,
                cursor: 'pointer',
                maxHeight: pictureHeight,
                margin: 'auto',
                display: 'block',
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
        <Box sx={{ whiteSpace: 'nowrap' }}>
          <ButtonGroup>
            <TsButton
              onClick={() => {
                openURLExternally(Links.links.productsOverview, true);
              }}
            >
              {t('core:compareAndUpgrade')}
            </TsButton>
            {ctaTitle && (
              <TsButton
                onClick={() => {
                  openURLExternally(ctaURL, true);
                }}
                sx={{ marginLeft: AppConfig.defaultSpaceBetweenButtons }}
              >
                {ctaTitle}
              </TsButton>
            )}
          </ButtonGroup>
        </Box>
      </Box>
    </Box>
  );
}

function ProTeaserDialog(props: Props) {
  const { t } = useTranslation();
  const swiperRef = useRef(null);

  const slidesEN = getProTeaserSlides(t);
  const slideEntries = Object.values(slidesEN);
  const totalSlides = slideEntries.length;

  const { open, onClose, slideIndex } = props;

  const theme = useTheme();
  const smallScreen = useMediaQuery(theme.breakpoints.down('md'));

  const initialSlide = slideIndex && slideIndex > -1 ? Number(slideIndex) : 0;
  const [activeIndex, setActiveIndex] = useState<number>(initialSlide);

  // Sync activeIndex when the dialog is re-opened on a different slide
  // (e.g. user clicks a Pro feature → dialog opens at that slide's index).
  useEffect(() => {
    if (open) setActiveIndex(initialSlide);
  }, [open, initialSlide]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={smallScreen}
      keepMounted
      scroll="paper"
      PaperComponent={smallScreen ? Paper : DraggablePaper}
      aria-labelledby="draggable-dialog-title"
    >
      <TsDialogTitle
        closeButtonTestId="closeProTeaserTID"
        onClose={onClose}
        dialogTitle={''}
      />
      <DialogContent
        sx={{
          padding: 0,
          paddingBottom: 0,
        }}
      >
        {open && (
          <>
            <style>
              {`
                .pro-teaser-swiper {
                  width: 100%;
                  height: 100%;
                }
                .pro-teaser-swiper .swiper-slide {
                  box-sizing: border-box;
                  height: auto;
                }
                .proteaser-pagination {
                  display: flex;
                  justify-content: center;
                  flex: 1;
                  gap: 8px;
                }
                .proteaser-pagination .swiper-pagination-bullet {
                  width: 10px;
                  height: 10px;
                  border-radius: 50%;
                  background: ${theme.palette.text.secondary};
                  opacity: 0.35;
                  cursor: pointer;
                  transition: opacity 0.2s, transform 0.2s;
                }
                .proteaser-pagination .swiper-pagination-bullet:hover {
                  opacity: 0.6;
                }
                .proteaser-pagination .swiper-pagination-bullet-active {
                  background: ${theme.palette.primary.main};
                  opacity: 1;
                  transform: scale(1.2);
                }
              `}
            </style>
            <Swiper
              ref={swiperRef}
              modules={[Pagination]}
              pagination={{
                clickable: true,
                el: '.proteaser-pagination',
              }}
              slidesPerView={1}
              speed={500}
              initialSlide={initialSlide}
              loop={false}
              onSlideChange={(s) => setActiveIndex(s.activeIndex)}
              className="pro-teaser-swiper"
            >
              {slideEntries.map((slideData, index) => (
                <SwiperSlide key={index}>
                  <Slide {...slideData} />
                </SwiperSlide>
              ))}
            </Swiper>
          </>
        )}
      </DialogContent>
      <DialogActions
        sx={{
          // env(safe-area-inset-*) handles the iPhone home indicator and
          // the curved-screen edges on fullScreen dialogs. The max() keeps
          // a comfortable buffer even when env() resolves to 0 (older
          // browsers, missing viewport-fit=cover) so the buttons never
          // sit flush against the rounded display.
          paddingLeft: 'max(16px, env(safe-area-inset-left))',
          paddingRight: 'max(16px, env(safe-area-inset-right))',
          paddingTop: 1,
          paddingBottom: 'max(16px, env(safe-area-inset-bottom))',
          borderTop: '1px solid',
          borderColor: 'divider',
          gap: 1,
        }}
      >
        <TsButton
          data-tid="proTeaserBackTID"
          onClick={() => (swiperRef.current as any)?.swiper?.slidePrev()}
          disabled={activeIndex === 0}
          sx={{ minWidth: 80 }}
        >
          {t('core:goback')}
        </TsButton>
        <Box className="proteaser-pagination" />
        {activeIndex < totalSlides - 1 ? (
          <TsButton
            variant="contained"
            data-tid="proTeaserNextTID"
            onClick={() => (swiperRef.current as any)?.swiper?.slideNext()}
            sx={{ minWidth: 80 }}
          >
            {t('core:next')}
          </TsButton>
        ) : (
          <TsButton
            variant="contained"
            data-tid="proTeaserCloseTID"
            onClick={onClose}
            sx={{ minWidth: 80 }}
          >
            {t('core:closeButton')}
          </TsButton>
        )}
      </DialogActions>
    </Dialog>
  );
}

export default ProTeaserDialog;

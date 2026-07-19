/**
 * TagSpaces - universal file and folder organizer
 * Copyright (C) 2026-present TagSpaces GmbH
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

import AndroidMockup from '-/assets/images/android-app-mockup.avif';
import IosBadge from '-/assets/images/app-store-badge.svg';
import AndroidBadge from '-/assets/images/google-play-badge.svg';
import IosMockup from '-/assets/images/ios-app-mockup.avif';
import TeaserBackground from '-/assets/images/mobile-teaser-bg.svg';
import { NavigateBeforeIcon, NavigateNextIcon } from '-/components/CommonIcons';
import DraggablePaper from '-/components/DraggablePaper';
import TsIconButton from '-/components/TsIconButton';
import TsSwitch from '-/components/TsSwitch';
import TsDialogTitle from '-/components/dialogs/components/TsDialogTitle';
import {
  actions as SettingsActions,
  isMobileTeaserHidden,
} from '-/reducers/settings';
import { openURLExternally } from '-/services/utils-io';
import { Box, FormControlLabel } from '@mui/material';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Links from 'assets/links';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { QRCode } from 'react-qrcode-logo';
import { useDispatch, useSelector } from 'react-redux';
import { Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

interface Props {
  open: boolean;
  slideIndex: number;
  onClose: () => void;
}

interface SlideProps {
  headline: string;
  subtext: string;
  features: string[];
  mockupURL: string;
  badgeURL: string;
  storeURL: string;
  smallScreen: boolean;
}

function Slide(props: SlideProps) {
  const {
    headline,
    subtext,
    features,
    mockupURL,
    badgeURL,
    storeURL,
    smallScreen,
  } = props;
  const { t } = useTranslation();

  const openStore = () => openURLExternally(storeURL, true);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: smallScreen ? 'column' : 'row',
        minHeight: smallScreen ? 'auto' : 460,
      }}
    >
      {/* Left column — copy */}
      <Box
        sx={{
          flex: 1,
          padding: smallScreen ? '24px 24px 8px' : '48px 40px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        <Box>
          <Chip
            label={t('peri:mtNew')}
            size="small"
            color="primary"
            sx={{ fontWeight: 600, mb: 2 }}
          />
        </Box>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
          {headline}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
          {subtext}
        </Typography>
        <Box>
          {features.map((item, index) => (
            <Typography
              key={index}
              variant="body1"
              sx={{ mb: 1.5, display: 'flex', gap: 1 }}
            >
              <span style={{ color: '#f5a623' }}>&#x2605;</span>
              <span>{item}</span>
            </Typography>
          ))}
        </Box>
      </Box>

      {/* Right column — visual + QR + store badge */}
      <Box
        sx={{
          position: 'relative',
          flex: smallScreen ? 'none' : '0 0 46%',
          minHeight: smallScreen ? 360 : 'auto',
          background: 'linear-gradient(to top, #000000, #141521)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          padding: smallScreen ? '24px 20px 20px' : '32px 28px 28px',
        }}
      >
        {/* Blurred colorful blobs backdrop, layered beneath the mockup. */}
        <Box
          component="img"
          src={TeaserBackground}
          alt=""
          sx={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            pointerEvents: 'none',
          }}
        />
        <img
          src={mockupURL}
          alt="Mobile app mockup"
          style={{
            position: 'relative',
            zIndex: 1,
            maxHeight: smallScreen ? 280 : 400,
            maxWidth: '70%',
            display: 'block',
            borderRadius: '20px',
          }}
        />
        <Box
          role="link"
          tabIndex={0}
          aria-label={headline}
          onClick={openStore}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              openStore();
            }
          }}
          sx={{
            position: 'absolute',
            zIndex: 2,
            right: smallScreen ? 16 : 20,
            bottom: smallScreen ? 16 : 32,
            background: '#fff',
            borderRadius: '20px',
            padding: '12px',
            boxShadow: '0 6px 24px rgba(0,0,0,0.28)',
            textAlign: 'center',
            cursor: 'pointer',
            // The QR <canvas> and badge <img> render their own default cursor
            // over their pixels — force the link cursor on every child.
            '& *': { cursor: 'pointer' },
          }}
        >
          <QRCode
            value={storeURL}
            size={smallScreen ? 96 : 120}
            qrStyle="dots"
            eyeRadius={4}
          />
          <Box sx={{ mt: 1, lineHeight: 0 }}>
            <img
              src={badgeURL}
              alt="Badge pointing to the app store"
              style={{
                width: smallScreen ? 110 : 130,
                display: 'inline-block',
              }}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

function MobileTeaserDialog(props: Props) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const swiperRef = useRef(null);
  const teaserHidden = useSelector(isMobileTeaserHidden);

  const { open, onClose, slideIndex } = props;

  const theme = useTheme();
  const smallScreen = useMediaQuery(theme.breakpoints.down('md'));

  const slides: SlideProps[] = [
    {
      headline: t('peri:mtIosHeadline'),
      subtext: t('peri:mtIosSubtext'),
      features: [
        t('peri:mtIosFeature1'),
        t('peri:mtIosFeature2'),
        t('peri:mtIosFeature3'),
      ],
      mockupURL: IosMockup,
      badgeURL: IosBadge,
      storeURL: Links.links.appStoreApp,
      smallScreen,
    },
    {
      headline: t('peri:mtAndroidHeadline'),
      subtext: t('peri:mtAndroidSubtext'),
      features: [
        t('peri:mtAndroidFeature1'),
        t('peri:mtAndroidFeature2'),
        t('peri:mtAndroidFeature3'),
      ],
      mockupURL: AndroidMockup,
      badgeURL: AndroidBadge,
      storeURL: Links.links.playStoreApp,
      smallScreen,
    },
  ];
  const totalSlides = slides.length;

  const initialSlide = slideIndex && slideIndex > -1 ? Number(slideIndex) : 0;
  const [activeIndex, setActiveIndex] = useState<number>(initialSlide);

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
      maxWidth="md"
      fullWidth
      PaperComponent={smallScreen ? Paper : DraggablePaper}
      aria-labelledby="draggable-dialog-title"
    >
      <TsDialogTitle
        closeButtonTestId="closeMobileTeaserTID"
        onClose={onClose}
        dialogTitle=""
        // Reserve header height so the absolutely-positioned close button
        // (top-right corner) sits above the slide content, not over the mockup.
        style={{ minHeight: 48, padding: 0 }}
      />
      <DialogContent sx={{ padding: 0, paddingBottom: 0 }}>
        {open && (
          <>
            <style>
              {`
                .mobileteaser-swiper {
                  width: 100%;
                  height: 100%;
                }
                .mobileteaser-swiper .swiper-slide {
                  box-sizing: border-box;
                  height: auto;
                }
                ${
                  smallScreen
                    ? `
                .mobileteaser-swiper,
                .mobileteaser-swiper .swiper-wrapper {
                  height: 100%;
                }
                .mobileteaser-swiper .swiper-slide {
                  height: 100%;
                  overflow-y: auto;
                  -webkit-overflow-scrolling: touch;
                }`
                    : ''
                }
                .mobileteaser-pagination {
                  display: flex;
                  justify-content: center;
                  flex: 1;
                  gap: 8px;
                }
                .mobileteaser-pagination .swiper-pagination-bullet {
                  width: 10px;
                  height: 10px;
                  border-radius: 50%;
                  background: ${theme.palette.text.secondary};
                  opacity: 0.35;
                  cursor: pointer;
                  transition: opacity 0.2s, transform 0.2s;
                }
                .mobileteaser-pagination .swiper-pagination-bullet:hover {
                  opacity: 0.6;
                }
                .mobileteaser-pagination .swiper-pagination-bullet-active {
                  background: ${theme.palette.primary.main};
                  opacity: 1;
                  transform: scale(1.2);
                }
              `}
            </style>
            <Swiper
              ref={swiperRef}
              modules={[Pagination]}
              pagination={{ clickable: true, el: '.mobileteaser-pagination' }}
              slidesPerView={1}
              speed={500}
              initialSlide={initialSlide}
              loop={false}
              simulateTouch={false}
              onSlideChange={(s) => setActiveIndex(s.activeIndex)}
              className="mobileteaser-swiper"
            >
              {slides.map((slideData, index) => (
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
          paddingLeft: 'max(16px, env(safe-area-inset-left))',
          paddingRight: 'max(16px, env(safe-area-inset-right))',
          paddingTop: 1,
          paddingBottom: 'max(16px, env(safe-area-inset-bottom))',
          borderTop: '1px solid',
          borderColor: 'divider',
          gap: 1,
        }}
      >
        <FormControlLabel
          sx={{ ml: 2, mr: 1, whiteSpace: 'nowrap' }}
          control={
            <TsSwitch
              data-tid="mobileTeaserDoNotShowTID"
              size="small"
              checked={teaserHidden}
              onChange={(e) =>
                dispatch(SettingsActions.setHideMobileTeaser(e.target.checked))
              }
            />
          }
          label={
            <Typography sx={{ ml: 0.5 }} variant="body2" color="text.secondary">
              {t('peri:mtDoNotShowAgain')}
            </Typography>
          }
        />
        <Box className="mobileteaser-pagination" />
        <TsIconButton
          data-tid="mobileTeaserBackTID"
          tooltip={t('core:goback')}
          onClick={() => (swiperRef.current as any)?.swiper?.slidePrev()}
          disabled={activeIndex === 0}
        >
          <NavigateBeforeIcon />
        </TsIconButton>
        <TsIconButton
          data-tid="mobileTeaserNextTID"
          tooltip={t('core:next')}
          onClick={() => (swiperRef.current as any)?.swiper?.slideNext()}
          disabled={activeIndex === totalSlides - 1}
        >
          <NavigateNextIcon />
        </TsIconButton>
      </DialogActions>
    </Dialog>
  );
}

export default MobileTeaserDialog;

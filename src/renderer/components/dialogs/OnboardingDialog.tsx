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

import ChooseTagging from '-/assets/images/abacus.svg';
import BrowserExtension from '-/assets/images/collectcontent.svg';
import WizardFinished from '-/assets/images/computer-desk.svg';
import NewLook from '-/assets/images/desktop.svg';
import Organize from '-/assets/images/organize.svg';
import TsButton from '-/components/TsButton';
import TsToggleButton from '-/components/TsToggleButton';
import TsDialogTitle from '-/components/dialogs/components/TsDialogTitle';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import { AppDispatch } from '-/reducers/app';
import {
  actions as SettingsActions,
  getCurrentTheme,
  getPersistTagsInSidecarFile,
} from '-/reducers/settings';
import { openURLExternally } from '-/services/utils-io';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Links from 'assets/links';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import 'swiper/css';
import 'swiper/css/navigation';
import { Navigation } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

interface Props {
  classes: any;
  open: boolean;
  onClose: () => void;
}

function OnboardingDialog(props: Props) {
  const { t } = useTranslation();
  const { open, onClose } = props;
  const swiperRef = useRef(null);
  const isPersistTagsInSidecar = useSelector(getPersistTagsInSidecarFile);
  const currentTheme = useSelector(getCurrentTheme);
  const dispatch: AppDispatch = useDispatch();
  const { closeAllLocations } = useCurrentLocationContext();

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
  const smallScreen = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Dialog
      open={open}
      onClose={onClose}
      keepMounted
      fullScreen={smallScreen}
      scroll="paper"
    >
      <TsDialogTitle
        dialogTitle={''}
        style={{ height: 25 }}
        onClose={onClose}
        closeButtonTestId={'closeOnboardingDialog'}
      />
      <DialogContent
        style={{
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
      >
        {open && (
          <>
            <style>
              {`
                .onboarding-swiper {
                  width: 100%;
                  height: 100%;
                }
                .swiper-slide {
                  height: auto;
                  text-align: center;
                }
                .swiper-button-next,
                .swiper-button-prev {
                  color: ${theme.palette.primary.main};
                }
              `}
            </style>
            <Swiper
              ref={swiperRef}
              modules={[Navigation]}
              navigation
              slidesPerView={1}
              speed={500}
              initialSlide={0}
              loop={false}
              className="onboarding-swiper"
            >
              <SwiperSlide>
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
                <Typography variant="h6">{t('obTryThemes')}</Typography>
                <Typography variant="h6">&nbsp;</Typography>
                <ToggleButtonGroup
                  value={currentTheme}
                  exclusive
                  onChange={(event, theme) => {
                    setCurrentTheme(theme);
                  }}
                >
                  <TsToggleButton
                    style={{
                      borderTopRightRadius: 0,
                      borderBottomRightRadius: 0,
                    }}
                    value="light"
                  >
                    {t('light')}
                  </TsToggleButton>
                  <TsToggleButton
                    style={{
                      borderTopLeftRadius: 0,
                      borderBottomLeftRadius: 0,
                    }}
                    value="dark"
                  >
                    {t('dark')}
                  </TsToggleButton>
                </ToggleButtonGroup>
              </SwiperSlide>
              <SwiperSlide>
                <Typography variant="h5">
                  {t('obChooseTaggingTitle')}
                </Typography>
                <Typography variant="h5">&nbsp;</Typography>
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
                          {t('obChooseTaggingFilename')}
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
                          {t('obChooseTaggingSidecar')}
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
                  {t('obChooseTaggingClarification')}
                </Typography>
              </SwiperSlide>
              <SwiperSlide>
                <Typography variant="h5" style={{ marginBottom: 20 }}>
                  {t('obWebClipperTitle')}
                </Typography>
                <Typography variant="body1">{t('obWebClipperMain')}</Typography>
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
                  {t('obWebClipperClarification')}
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
                  {t('obWebClipperCTA')}
                </TsButton>
              </SwiperSlide>
              <SwiperSlide>
                <Typography variant="h5" style={{ marginBottom: 20 }}>
                  {t('obExplanationsTitle')}
                </Typography>
                <Typography variant="body1">
                  {t('obExplanationsMain1')}
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
                  {t('obExplanationsMain2')}
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
                  {t('obExplanationsCTA')}
                </TsButton>
              </SwiperSlide>
              <SwiperSlide>
                <Typography variant="h5">{t('obFinalTitle')}</Typography>
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
                  {t('obFinalExplanation')}
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
                    onClose();
                    closeAllLocations();
                  }}
                >
                  {t('startUsingTagSpaces')}
                </TsButton>
              </SwiperSlide>
            </Swiper>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default OnboardingDialog;

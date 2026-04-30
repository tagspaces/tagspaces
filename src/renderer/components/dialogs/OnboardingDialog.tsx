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
import TagsPoster from '-/assets/images/abacus.svg';
import WizardFinished from '-/assets/images/computer-desk.svg';
import NewLook from '-/assets/images/desktop.svg';
import LocationConcept from '-/assets/images/organize.svg';
import TagsDemoVideo from '-/assets/videos/tags-demo.mp4';
import TooltipTS from '-/components/Tooltip';
import TsButton from '-/components/TsButton';
import TsSelect from '-/components/TsSelect';
import TsDialogTitle from '-/components/dialogs/components/TsDialogTitle';
import { useCreateEditLocationDialogContext } from '-/components/dialogs/hooks/useCreateEditLocationDialogContext';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import { AppDispatch } from '-/reducers/app';
import {
  actions as SettingsActions,
  getCurrentLanguage,
  getCurrentTheme,
  getDefaultDarkTheme,
  getDefaultRegularTheme,
} from '-/reducers/settings';
import i18n from '-/services/i18n';
import { getDevicePaths, setLanguage } from '-/services/utils-io';
import { CommonLocation } from '-/utils/CommonLocation';
import { darkThemes, lightThemes } from '-/utils/Themes';
import CheckIcon from '@mui/icons-material/Check';
import FolderIcon from '@mui/icons-material/Folder';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import FormControlLabel from '@mui/material/FormControlLabel';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { locationType } from '@tagspaces/tagspaces-common/misc';
import { getUuid } from '@tagspaces/tagspaces-common/utils-io';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

interface Props {
  open: boolean;
  onClose: () => void;
}

// Names assigned to auto-bootstrapped locations in
// CurrentLocationContextProvider.setDefaultLocations(). Used to identify
// which locations were created by the bootstrap so the user can review
// and remove any they don't want during onboarding.
const BOOTSTRAP_NAME_KEYS = [
  'desktopFolder',
  'documentsFolder',
  'downloadsFolder',
  'musicFolder',
  'picturesFolder',
  'videosFolder',
  'iCloudFolder',
];

type ThemeTileProps = {
  themeKey: string;
  themeValue: {
    background?: { default?: string };
    primary?: { main?: string };
    secondary?: { main?: string };
  };
  selected: boolean;
  onSelect: () => void;
};

function ThemeTile({
  themeKey,
  themeValue,
  selected,
  onSelect,
}: ThemeTileProps) {
  const bg = themeValue.background?.default ?? '#fff';
  const primary = themeValue.primary?.main ?? '#888';
  const label = themeKey.charAt(0).toUpperCase() + themeKey.slice(1);
  return (
    <ButtonBase
      onClick={onSelect}
      data-tid={'onboardingTheme_' + themeKey}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        padding: '4px',
        borderRadius: 1,
        border: '2px solid',
        borderColor: selected ? 'primary.main' : 'transparent',
        transition: 'border-color 0.15s, transform 0.15s',
        '&:hover': { transform: 'translateY(-1px)' },
      }}
    >
      <Box
        sx={{
          position: 'relative',
          height: 44,
          borderRadius: 1,
          backgroundColor: bg,
          border: '1px solid',
          borderColor: 'divider',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            inset: 'auto 0 0 0',
            height: 14,
            backgroundColor: primary,
          }}
        />
        {selected && (
          <Box
            sx={{
              position: 'absolute',
              top: 4,
              right: 4,
              backgroundColor: 'primary.main',
              color: 'primary.contrastText',
              borderRadius: '50%',
              width: 18,
              height: 18,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CheckIcon sx={{ fontSize: 14 }} />
          </Box>
        )}
      </Box>
      <Typography
        variant="caption"
        sx={{
          marginTop: '4px',
          color: 'text.primary',
          textTransform: 'capitalize',
        }}
      >
        {label}
      </Typography>
    </ButtonBase>
  );
}

function OnboardingDialog(props: Props) {
  const { t } = useTranslation();
  const { open, onClose } = props;
  const swiperRef = useRef(null);
  const tagsVideoRef = useRef<HTMLVideoElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [devicePaths, setDevicePaths] = useState<Record<string, string>>({});
  const currentTheme = useSelector(getCurrentTheme);
  const currentRegularTheme = useSelector(getDefaultRegularTheme);
  const currentDarkTheme = useSelector(getDefaultDarkTheme);
  const currentLanguage = useSelector(getCurrentLanguage);
  const checkForUpdates = useSelector(
    (state: any) => state.settings.checkForUpdates,
  );
  // When extconfig sets ExtCheckForUpdatesOnStartup, the toggle is
  // disabled and reflects the externally-configured value, with a
  // tooltip explaining why — same pattern as SettingsGeneral.
  const checkForUpdatesExternallyConfigured =
    AppConfig.ExtCheckForUpdatesOnStartup !== undefined;
  const supportedLanguages = useSelector(
    (state: any) => state.settings.supportedLanguages,
  ) as Array<{ iso: string; title: string }>;
  const dispatch: AppDispatch = useDispatch();
  const { locations, openLocation, addLocation, deleteLocation } =
    useCurrentLocationContext();
  const { openCreateEditLocationDialog } = useCreateEditLocationDialogContext();
  const TOTAL_SLIDES = 5;

  // Fetch device paths once when the dialog first opens. Used to populate
  // slide 2 with system-folder suggestions a user can add to their sidebar
  // (Desktop, Documents, Downloads, etc.). On web this returns nothing.
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    getDevicePaths()
      .then((paths) => {
        if (!cancelled && paths) setDevicePaths(paths);
      })
      .catch(() => {
        /* getDevicePaths is best-effort; failure leaves the list empty */
      });
    return () => {
      cancelled = true;
    };
  }, [open]);

  // Drive the tags-demo video play/pause based on slide visibility.
  // Swiper hides inactive slides (display:none / visibility:hidden), so
  // Chromium delays preload — when slide 3 first becomes active the
  // element's readyState is still 0 and a bare play() rejects with an
  // AbortError (no media data). We force load(), wait for canplay, then
  // call play(). React's `muted` prop also occasionally lands on the DOM
  // property after autoplay is evaluated, so set it imperatively too.
  useEffect(() => {
    const video = tagsVideoRef.current;
    if (!video) return;
    if (!(open && activeIndex === 2)) {
      video.pause();
      return;
    }
    video.muted = true;
    if (video.readyState === 0) video.load();
    const tryPlay = () => {
      const result = video.play();
      if (result && typeof result.catch === 'function') {
        result.catch((err) => {
          // Surface the rejection reason so future regressions are
          // diagnosable; the static poster frame remains as fallback.
          console.warn(
            'Onboarding video play declined:',
            err?.name,
            err?.message,
          );
        });
      }
    };
    if (video.readyState >= 2) {
      tryPlay();
      return;
    }
    video.addEventListener('canplay', tryPlay, { once: true });
    return () => video.removeEventListener('canplay', tryPlay);
  }, [open, activeIndex]);

  // Apply a theme by clicking a tile on slide 4. Switches the light/dark
  // mode and the corresponding regular/dark theme key in one go, so the
  // change takes effect immediately and the tile selection mirrors what's
  // actually rendered.
  function selectTheme(themeKey: string, isDark: boolean) {
    dispatch(SettingsActions.setCurrentTheme(isDark ? 'dark' : 'light'));
    if (isDark) {
      dispatch(SettingsActions.setCurrentDarkTheme(themeKey));
    } else {
      dispatch(SettingsActions.setCurrentRegularTheme(themeKey));
    }
  }

  const theme = useTheme();
  const smallScreen = useMediaQuery(theme.breakpoints.down('md'));

  // The slide-5 CTA opens the user's "primary" connected location — the
  // first one matching slide 2's order (Desktop, Documents, Downloads, …),
  // falling back to any local location they may have added manually.
  // If they have nothing connected, the CTA flips to "choose a folder".
  function findPrimaryLocation() {
    for (const key of BOOTSTRAP_NAME_KEYS) {
      const path = devicePaths[key];
      if (!path) continue;
      const match = locations.find(
        (l) => l.type === locationType.TYPE_LOCAL && l.path === path,
      );
      if (match) return match;
    }
    return locations.find((l) => l.type === locationType.TYPE_LOCAL);
  }
  const primaryLocation = findPrimaryLocation();

  // Unified slide-2 list. Each row maps a known system-folder key to its
  // current state in the sidebar: "connected" if a local location with that
  // path already exists, otherwise it's offered as a suggestion the user
  // can add. This handles three cases with one component:
  //  - First-run after auto-bootstrap: rows are connected, action = remove.
  //  - Re-triggered wizard, user emptied locations: rows are suggestions.
  //  - Re-triggered wizard, user kept some folders: mixed list.
  type FolderRow = {
    key: string;
    name: string;
    path: string;
    connectedUuid?: string;
  };
  const folderRows: FolderRow[] = BOOTSTRAP_NAME_KEYS.filter(
    (k) => devicePaths[k],
  ).map((k) => {
    const path = devicePaths[k];
    const existing = locations.find(
      (l) => l.type === locationType.TYPE_LOCAL && l.path === path,
    );
    return {
      key: k,
      name: t(('core:' + k) as any) as string,
      path,
      connectedUuid: existing?.uuid,
    };
  });

  function addSuggested(row: FolderRow) {
    const location = new CommonLocation({
      uuid: getUuid(),
      type: locationType.TYPE_LOCAL,
      name: row.name,
      path: row.path,
      isDefault: false,
      isReadOnly: false,
      disableIndexing: false,
    });
    addLocation(location, false);
  }

  // Closing the dialog (X button, Escape, or any of slide 4's buttons)
  // counts as completion — there is no follow-up "we'll show you the rest
  // later" flow. One coherent dismiss semantic instead of two.
  function dismiss() {
    dispatch(SettingsActions.setOnboardingCompleted(true));
    onClose();
  }

  function finish(action: 'open-primary' | 'choose-other' | 'skip') {
    dismiss();
    if (action === 'open-primary' && primaryLocation) {
      openLocation(primaryLocation);
    } else if (action === 'choose-other') {
      openCreateEditLocationDialog();
    }
  }

  return (
    <Dialog
      open={open}
      onClose={dismiss}
      keepMounted
      fullScreen={smallScreen}
      scroll="paper"
      PaperProps={{ sx: { minHeight: smallScreen ? undefined : 560 } }}
    >
      <TsDialogTitle
        dialogTitle={''}
        sx={{ height: '25px' }}
        onClose={dismiss}
        closeButtonTestId={'closeOnboardingDialog'}
      />
      <DialogContent
        sx={{
          overflowY: 'auto',
          overflowX: 'hidden',
          paddingBottom: 0,
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
                  box-sizing: border-box;
                  height: auto;
                  text-align: center;
                }
                .onboarding-pagination {
                  display: flex;
                  justify-content: center;
                  flex: 1;
                  gap: 8px;
                }
                .onboarding-pagination .swiper-pagination-bullet {
                  width: 10px;
                  height: 10px;
                  border-radius: 50%;
                  background: ${theme.palette.text.secondary};
                  opacity: 0.35;
                  cursor: pointer;
                  transition: opacity 0.2s, transform 0.2s;
                }
                .onboarding-pagination .swiper-pagination-bullet:hover {
                  opacity: 0.6;
                }
                .onboarding-pagination .swiper-pagination-bullet-active {
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
                el: '.onboarding-pagination',
              }}
              slidesPerView={1}
              speed={500}
              initialSlide={0}
              loop={false}
              // Disable mouse-drag-to-swipe so MUI Select / Switch / form
              // controls inside slides receive their own pointer events
              // instead of Swiper's gesture handler swallowing them.
              // Touch swipe on phones still works; desktop users navigate
              // via Back/Next and clickable pagination dots.
              simulateTouch={false}
              onSlideChange={(s) => setActiveIndex(s.activeIndex)}
              className="onboarding-swiper"
            >
              {/* Slide 1 — Welcome */}
              <SwiperSlide>
                <Typography variant="h5">
                  {t('core:welcomeToTagSpaces')}
                </Typography>
                <img
                  style={{
                    maxHeight: 250,
                    paddingTop: 15,
                    paddingBottom: 24,
                    margin: 'auto',
                    display: 'block',
                  }}
                  src={NewLook}
                  alt=""
                />
                <Typography variant="body1" sx={{ marginTop: '12px' }}>
                  {t('core:obWelcomeBody')}
                </Typography>
                <Box
                  sx={{
                    marginTop: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 0.5,
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{ color: 'text.secondary' }}
                  >
                    {t('core:interfaceLanguage')}
                  </Typography>
                  <TsSelect
                    data-tid="onboardingLanguageTID"
                    fullWidth={false}
                    value={currentLanguage}
                    onChange={(event: any) => {
                      const next = event.target.value;
                      i18n.changeLanguage(next).then(() => {
                        dispatch(SettingsActions.setLanguage(next));
                        setLanguage(next);
                        return true;
                      });
                    }}
                  >
                    {supportedLanguages.map((language) => (
                      <MenuItem key={language.iso} value={language.iso}>
                        {language.title}
                      </MenuItem>
                    ))}
                  </TsSelect>
                </Box>
              </SwiperSlide>

              {/* Slide 2 — What is a Location? + bootstrap consent */}
              <SwiperSlide>
                <Typography variant="h5" sx={{ marginBottom: '12px' }}>
                  {t('core:obSlide2Title')}
                </Typography>
                <img
                  style={{
                    maxHeight: 160,
                    margin: 'auto',
                    display: 'block',
                    paddingBottom: 12,
                  }}
                  src={LocationConcept}
                  alt=""
                />
                <Typography variant="body1">
                  {t('core:obSlide2Body')}
                </Typography>
                {folderRows.length > 0 && (
                  <>
                    <Typography
                      variant="subtitle2"
                      sx={{ marginTop: '16px', textAlign: 'left' }}
                    >
                      {t('core:obBootstrappedFolders')}
                    </Typography>
                    <List
                      dense
                      sx={{
                        textAlign: 'left',
                        maxHeight: 180,
                        overflowY: 'auto',
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                        marginTop: '6px',
                      }}
                    >
                      {folderRows.map((row) => (
                        <ListItem
                          key={row.key}
                          secondaryAction={
                            row.connectedUuid ? (
                              <TsButton
                                size="small"
                                variant="text"
                                color="error"
                                data-tid={'onboardingRemoveLoc_' + row.key}
                                onClick={() => {
                                  // Re-check at click time in case the row's
                                  // state changed between render and click.
                                  if (row.connectedUuid) {
                                    deleteLocation(row.connectedUuid);
                                  }
                                }}
                              >
                                {t('core:removeLocation')}
                              </TsButton>
                            ) : (
                              <TsButton
                                size="small"
                                variant="text"
                                data-tid={'onboardingAddLoc_' + row.key}
                                onClick={() => addSuggested(row)}
                              >
                                {t('core:addAsLocation')}
                              </TsButton>
                            )
                          }
                          sx={{
                            opacity: row.connectedUuid ? 1 : 0.7,
                          }}
                        >
                          <ListItemIcon sx={{ minWidth: 32 }}>
                            <FolderIcon fontSize="small" />
                          </ListItemIcon>
                          <ListItemText
                            primary={row.name}
                            secondary={row.path}
                            primaryTypographyProps={{ variant: 'body2' }}
                            secondaryTypographyProps={{
                              variant: 'caption',
                              sx: {
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                display: 'block',
                              },
                            }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </>
                )}
              </SwiperSlide>

              {/* Slide 3 — What is a Tag? */}
              <SwiperSlide>
                <Typography variant="h5" sx={{ marginBottom: '12px' }}>
                  {t('core:obSlide3Title')}
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    paddingBottom: '16px',
                  }}
                >
                  <video
                    ref={tagsVideoRef}
                    src={TagsDemoVideo}
                    loop
                    muted
                    playsInline
                    preload="auto"
                    poster={TagsPoster}
                    aria-hidden="true"
                    style={{
                      maxHeight: 250,
                      maxWidth: '100%',
                      borderRadius: 8,
                      display: 'block',
                    }}
                  />
                </Box>
                <Typography variant="body1">
                  {t('core:obSlide3Body')}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ marginTop: '12px', color: 'text.secondary' }}
                >
                  {t('core:obSlide3DefaultGroups')}
                </Typography>
              </SwiperSlide>

              {/* Slide 4 — Preferences (theme + auto-update) */}
              <SwiperSlide>
                <Typography variant="h5" sx={{ marginBottom: '8px' }}>
                  {t('core:obPreferencesTitle')}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: 'text.secondary', marginBottom: '20px' }}
                >
                  {t('core:obTryThemes')}
                </Typography>

                <Typography
                  variant="subtitle2"
                  sx={{ textAlign: 'left', marginBottom: '6px' }}
                >
                  {t('core:light')}
                </Typography>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))',
                    gap: 1,
                    marginBottom: '20px',
                  }}
                >
                  {Object.entries(lightThemes).map(([key, value]) => (
                    <ThemeTile
                      key={key}
                      themeKey={key}
                      themeValue={value as any}
                      selected={
                        currentTheme === 'light' && currentRegularTheme === key
                      }
                      onSelect={() => selectTheme(key, false)}
                    />
                  ))}
                </Box>

                <Typography
                  variant="subtitle2"
                  sx={{ textAlign: 'left', marginBottom: '6px' }}
                >
                  {t('core:dark')}
                </Typography>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))',
                    gap: 1,
                  }}
                >
                  {Object.entries(darkThemes).map(([key, value]) => (
                    <ThemeTile
                      key={key}
                      themeKey={key}
                      themeValue={value as any}
                      selected={
                        currentTheme === 'dark' && currentDarkTheme === key
                      }
                      onSelect={() => selectTheme(key, true)}
                    />
                  ))}
                </Box>
                <Box
                  sx={{
                    marginTop: '24px',
                    paddingTop: '16px',
                    borderTop: '1px solid',
                    borderColor: 'divider',
                    display: 'flex',
                    justifyContent: 'center',
                  }}
                >
                  <TooltipTS
                    title={
                      checkForUpdatesExternallyConfigured
                        ? t('core:settingExternallyConfigured')
                        : ''
                    }
                  >
                    {/* span lets the tooltip catch hover events even
                        when the Switch is disabled (disabled controls
                        don't fire pointer events). */}
                    <span>
                      <FormControlLabel
                        control={
                          <Switch
                            data-tid="onboardingCheckForUpdatesTID"
                            disabled={checkForUpdatesExternallyConfigured}
                            checked={
                              checkForUpdatesExternallyConfigured
                                ? !!AppConfig.ExtCheckForUpdatesOnStartup
                                : !!checkForUpdates
                            }
                            onChange={(e) =>
                              dispatch(
                                SettingsActions.setCheckForUpdates(
                                  e.target.checked,
                                ),
                              )
                            }
                          />
                        }
                        label={t('core:checkForNewVersionOnStartup')}
                      />
                    </span>
                  </TooltipTS>
                </Box>
              </SwiperSlide>

              {/* Slide 5 — You're all set */}
              <SwiperSlide>
                <Typography variant="h5">{t('core:obSlide4Title')}</Typography>
                <img
                  style={{
                    maxHeight: 220,
                    maxWidth: '90%',
                    paddingTop: 30,
                    margin: 'auto',
                    display: 'block',
                  }}
                  src={WizardFinished}
                  alt=""
                />
                <Typography variant="body1" sx={{ marginTop: '12px' }}>
                  {t('core:obSlide4Body')}
                </Typography>
                {primaryLocation && (
                  <Box sx={{ marginTop: '16px' }}>
                    <TsButton
                      variant="text"
                      size="small"
                      onClick={() => finish('choose-other')}
                      data-tid="onboardingChooseFolderTID"
                    >
                      {t('core:obChooseDifferent')}
                    </TsButton>
                  </Box>
                )}
              </SwiperSlide>
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
          data-tid="onboardingBackTID"
          onClick={() => (swiperRef.current as any)?.swiper?.slidePrev()}
          disabled={activeIndex === 0}
          sx={{ minWidth: 80 }}
        >
          {t('core:goback')}
        </TsButton>
        <Box className="onboarding-pagination" />
        {activeIndex < TOTAL_SLIDES - 1 ? (
          <TsButton
            variant="contained"
            data-tid="onboardingNextTID"
            onClick={() => (swiperRef.current as any)?.swiper?.slideNext()}
            sx={{ minWidth: 80 }}
          >
            {t('core:next')}
          </TsButton>
        ) : primaryLocation ? (
          <TsButton
            variant="contained"
            data-tid="onboardingOpenPrimaryTID"
            onClick={() => finish('open-primary')}
            sx={{ minWidth: 80 }}
          >
            {t('core:obOpenDocuments', {
              folderName: primaryLocation.name,
            })}
          </TsButton>
        ) : (
          <TsButton
            variant="contained"
            data-tid="onboardingChooseFolderToStartTID"
            onClick={() => finish('choose-other')}
            sx={{ minWidth: 80 }}
          >
            {t('core:obChooseFolderToStart')}
          </TsButton>
        )}
      </DialogActions>
    </Dialog>
  );
}

export default OnboardingDialog;

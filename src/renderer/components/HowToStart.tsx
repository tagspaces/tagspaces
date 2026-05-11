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

import { ProSign } from '-/components/HelperComponents';
import TsTooltip from '-/components/TsTooltip';
import TsButton from '-/components/TsButton';
import { AppDispatch } from '-/reducers/app';
import { actions as SettingsActions } from '-/reducers/settings';
import { openURLExternally } from '-/services/utils-io';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Step from '@mui/material/Step';
import StepContent from '@mui/material/StepContent';
import StepLabel from '@mui/material/StepLabel';
import Stepper from '@mui/material/Stepper';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import Links from 'assets/links';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

const selectByTID: any = (tid) =>
  document.querySelector('[data-tid="' + tid + '"]');

const HIGHLIGHTED_TIDS = [
  'locationManager',
  'tagLibrary',
  'settings',
  'createNewDropdownButtonTID',
  'locationList',
  'tagLibraryTagGroupList',
  'quickAccessButton',
  'quickAccessArea',
  'floatingPerspectiveSwitcher',
];

function HowToStart() {
  const { t } = useTranslation();
  const theme = useTheme();
  const dispatch: AppDispatch = useDispatch();
  // Track pending setTimeout handles so navigating away (Next/Back) cancels
  // them — otherwise a deferred .add('highlighterOn') can fire after
  // clearHighlights() and leave a stale glow on a previous step's element.
  const pendingTimeouts = React.useRef<ReturnType<typeof setTimeout>[]>([]);

  function scheduleHighlight(fn: () => void, delayMs: number) {
    const handle = setTimeout(() => {
      pendingTimeouts.current = pendingTimeouts.current.filter(
        (h) => h !== handle,
      );
      fn();
    }, delayMs);
    pendingTimeouts.current.push(handle);
  }

  function clearHighlights() {
    pendingTimeouts.current.forEach(clearTimeout);
    pendingTimeouts.current = [];
    HIGHLIGHTED_TIDS.forEach((tid) => {
      selectByTID(tid)?.classList.remove('highlighterOn');
    });
  }

  const steps = [
    {
      label: t('htsIntroTitle'),
      description: t('htsIntro'),
    },
    {
      label: t('locationManager'),
      description: (
        <>
          {t('htsLocationManager')}
          <br />
          <SlideButton
            title={t('htsFindOutMore')}
            link={Links.documentationLinks.locations}
          />
        </>
      ),
      action: () => {
        selectByTID('locationManager')?.click();
        selectByTID('locationList')?.classList.add('highlighterOn');
      },
    },
    {
      label: t('htsCreatingLocationTitle'),
      description: (
        <>
          {t('htsCreatingLocation')}
          <br />
          <SlideButton
            title={t('htsFindOutMore')}
            link={Links.links.howToStart + '#locationsLocal'}
          />
        </>
      ),
      action: () => {
        selectByTID('createNewDropdownButtonTID')?.classList.add(
          'highlighterOn',
        );
      },
    },
    {
      label: t('tagLibrary'),
      description: (
        <>
          {t('htsTagLibrary')}
          <br />
          <SlideButton
            title={t('htsFindOutMore')}
            link={Links.links.howToStart + '#taglibrary'}
          />
        </>
      ),
      action: () => {
        selectByTID('tagLibrary')?.click();
        scheduleHighlight(() => {
          selectByTID('tagLibrary')?.classList.add('highlighterOn');
          selectByTID('tagLibraryTagGroupList')?.classList.add('highlighterOn');
        }, 2000);
      },
    },
    {
      label: t('quickAccess'),
      description: (
        <>
          {t('htsQuickAccess')}
          <ul>
            <li>{t('htsQuickAccessSection1')}</li>
            <li>
              {t('htsQuickAccessSection2')}&nbsp;
              <ProSign />
            </li>
            <li>
              {t('htsQuickAccessSection3')}&nbsp;
              <ProSign />
            </li>
            <li>
              {t('htsQuickAccessSection4')}&nbsp;
              <ProSign />
            </li>
            <li>
              {t('htsQuickAccessSection5')}&nbsp;
              <ProSign />
            </li>
          </ul>
        </>
      ),
      action: () => {
        selectByTID('quickAccessButton')?.click();
        scheduleHighlight(() => {
          selectByTID('quickAccessButton')?.classList.add('highlighterOn');
          selectByTID('quickAccessArea')?.classList.add('highlighterOn');
        }, 2000);
      },
    },
    {
      label: t('perspectiveSwitch'),
      description: (
        <>
          {t('htsPerspectiveSwitch')}
          <ul>
            <li>{t('htsPerspectiveGrid')}</li>
            <li>{t('htsPerspectiveList')}</li>
            <li>
              {t('htsPerspectiveGallery')}&nbsp;
              <ProSign />
            </li>
            <li>
              {t('htsPerspectiveMapique')}&nbsp;
              <ProSign />
            </li>
            <li>
              {t('htsPerspectiveKanban')}&nbsp;
              <ProSign />
            </li>
            <li>
              {t('htsPerspectiveFolderViz')}&nbsp;
              <ProSign />
            </li>
          </ul>
          <SlideButton
            title={t('htsFindOutMore')}
            link={Links.documentationLinks.perspectives}
          />
        </>
      ),
      action: () => {
        selectByTID('floatingPerspectiveSwitcher')?.classList.add(
          'highlighterOn',
        );
      },
    },
    {
      label: t('htsCreatingFilesTitle'),
      description: (
        <>
          {t('htsCreatingFiles')}
          <ul>
            <li>{t('htsCreatingFilesMD')}</li>
            <li>{t('htsCreatingFilesHTML')}</li>
            <li>{t('htsCreatingFilesText')}</li>
            <li>
              {t('htsCreatingFilesAudio')}&nbsp;
              <ProSign />
            </li>
            <li>
              {t('htsCreatingFilesTemplates')}&nbsp;
              <ProSign />
            </li>
          </ul>
          <SlideButton
            title={t('htsFindOutMore')}
            link={Links.documentationLinks.creatingFiles}
          />
        </>
      ),
      action: () => {
        selectByTID('createNewDropdownButtonTID')?.classList.add(
          'highlighterOn',
        );
      },
    },
    {
      label: t('settings'),
      description: (
        <>
          {t('htsSettings')}
          <br />
          <SlideButton
            title={t('htsFindOutMore')}
            link={Links.documentationLinks.settings}
          />
        </>
      ),
      action: () => {
        // Settings lives outside the Location Manager panel — don't click
        // locationManager here; it dismisses the panel that contains the
        // settings button on small layouts and confuses the highlight.
        selectByTID('settings')?.classList.add('highlighterOn');
      },
    },
    {
      label: t('startUsingTagSpaces'),
      description: t('htsStartUsingTS'),
      action: () => {
        selectByTID('createNewDropdownButtonTID')?.classList.add(
          'highlighterOn',
        );
        selectByTID('locationList')?.classList.add('highlighterOn');
        selectByTID('locationManager')?.click();
      },
    },
  ];

  function SlideButton(props) {
    const { title, link } = props;
    return (
      <TsButton
        onClick={() => {
          openURLExternally(link, true);
        }}
        //variant="text"
      >
        {title}
      </TsButton>
    );
  }

  const [activeStep, setActiveStep] = React.useState(0);

  const handleNext = () => {
    clearHighlights();
    const nextStep = activeStep + 1;
    if (steps[nextStep] && steps[nextStep].action) {
      steps[nextStep].action();
    }
    setActiveStep((nextActiveStep) => nextActiveStep + 1);
  };

  const handleBack = () => {
    clearHighlights();
    const prevStep = activeStep - 1;
    if (steps[prevStep] && steps[prevStep].action) {
      steps[prevStep].action();
    }
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    clearHighlights();
    setActiveStep(0);
  };

  // ${theme.palette.primary.main}; // #da15d8;
  // 0%   { box-shadow: 0 0 0 transparent; }
  // 20%  { box-shadow: 0 0 7px 6px #da15d8;  }
  // 70%  { box-shadow: 0 0 7px 6px #da15d8;  }
  // 100% { box-shadow: 0 0 0 transparent; }
  return (
    <Box sx={{ maxWidth: '480px', paddingLeft: '10px', paddingRight: '10px' }}>
      <style>
        {`
        .highlighterOn {
            animation: pulsate 2s infinite;
            z-index: 1;
        }
        @keyframes pulsate {
            0%   { box-shadow: 0 0 7px 6px ${theme.palette.secondary.main}; }
            50%  { box-shadow: 0 0 0 transparent; }
            100% { box-shadow: 0 0 7px 6px ${theme.palette.secondary.main}; }
        }
        `}
      </style>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          paddingTop: '20px',
          position: 'relative',
        }}
      >
        <Typography
          variant="inherit"
          sx={{
            color: 'text.primary',
            textTransform: 'uppercase',
            textAlign: 'center',
          }}
          noWrap
        >
          {t('core:htsGetStarted')}
        </Typography>
        <TsTooltip title={t('core:htsHideGuide')}>
          <IconButton
            size="small"
            data-tid="hideHowToStartTID"
            sx={{ position: 'absolute', right: 0 }}
            onClick={() => {
              clearHighlights();
              dispatch(SettingsActions.setHideHowToStart(true));
            }}
          >
            <VisibilityOffIcon fontSize="small" />
          </IconButton>
        </TsTooltip>
      </Box>
      <Stepper activeStep={activeStep} orientation="vertical">
        {steps.map((step, index) => (
          <Step key={step.label}>
            <StepLabel>{step.label}</StepLabel>
            <StepContent>
              <Typography sx={{ color: 'text.primary' }}>
                {step.description}
              </Typography>
              <Box sx={{ mb: 2 }}>
                <div>
                  <TsButton
                    disabled={index === 0}
                    onClick={handleBack}
                    sx={{ mt: 1, mr: 1 }}
                  >
                    {t('core:goback')}
                  </TsButton>
                  <TsButton
                    // variant="contained"
                    onClick={handleNext}
                    sx={{ mt: 1, mr: 1 }}
                  >
                    {index === steps.length - 1
                      ? t('core:finish')
                      : t('core:next')}
                  </TsButton>
                </div>
              </Box>
            </StepContent>
          </Step>
        ))}
      </Stepper>
      {activeStep === steps.length && (
        <Paper
          square
          elevation={0}
          sx={{ p: 3, backgroundColor: 'transparent' }}
        >
          <Typography>{t('core:htsAllStepsCompleted')}</Typography>
          <TsButton onClick={handleReset} sx={{ mt: 1, mr: 1 }}>
            {t('core:resetBtn')}
          </TsButton>
        </Paper>
      )}
    </Box>
  );
}

export default HowToStart;

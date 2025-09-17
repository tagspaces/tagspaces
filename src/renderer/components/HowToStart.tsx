import { ProSign } from '-/components/HelperComponents';
import TsButton from '-/components/TsButton';
import { openURLExternally } from '-/services/utils-io';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Step from '@mui/material/Step';
import StepContent from '@mui/material/StepContent';
import StepLabel from '@mui/material/StepLabel';
import Stepper from '@mui/material/Stepper';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import Links from 'assets/links';
import * as React from 'react';
import { useTranslation } from 'react-i18next';

/*export const styles: any = (theme: any) => ({
  recentTitle: {
    color: theme.palette.text.primary,
    textTransform: 'uppercase',
    textAlign: 'center'
  }
});*/

const selectByTID: any = (tid) =>
  document.querySelector('[data-tid="' + tid + '"]');

function clearHighlights() {
  selectByTID('locationManager')?.classList.remove('highlighterOn');
  selectByTID('tagLibrary')?.classList.remove('highlighterOn');
  selectByTID('settings')?.classList.remove('highlighterOn');
  selectByTID('createNewDropdownButtonTID')?.classList.remove('highlighterOn');
  selectByTID('locationList')?.classList.remove('highlighterOn');
  selectByTID('tagLibraryTagGroupList')?.classList.remove('highlighterOn');
  selectByTID('quickAccessButton')?.classList.remove('highlighterOn');
  selectByTID('quickAccessArea')?.classList.remove('highlighterOn');
  selectByTID('floatingPerspectiveSwitcher')?.classList.remove('highlighterOn');
}

function HowToStart() {
  const { t } = useTranslation();
  const theme = useTheme();
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
        selectByTID('tagLibrary').click();
        setTimeout(() => {
          selectByTID('tagLibrary')?.classList.add('highlighterOn');
          selectByTID('tagLibraryTagGroupList')?.classList.add('highlighterOn');
        }, 2000);
      },
    },
    {
      label: t('quickAccess'),
      description: (
        <>
          In this section you can find the following functionalities:
          <ul>
            <li>
              Search queries you have stored for later use&nbsp;
              <ProSign />
            </li>
            <li>
              Bookmarks to files and folders&nbsp;
              <ProSign />
            </li>
            <li>
              A list of recently opened files&nbsp;
              <ProSign />
            </li>
            <li>
              A list of recently edited files&nbsp;
              <ProSign />
            </li>
            <li>
              A list of recently opened folders&nbsp;
              <ProSign />
            </li>
          </ul>
        </>
      ),
      action: () => {
        selectByTID('quickAccessButton').click();
        setTimeout(() => {
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
            <li>
              <b>Grid</b> - displays files in a grid
            </li>
            <li>
              <b>List</b> - displays files in a list
            </li>
            <li>
              <b>Gallery</b>&nbsp;
              <ProSign /> - suitable for folders containing images and photos
            </li>
            <li>
              <b>Mapique</b>&nbsp;
              <ProSign /> - suitable for geo-tagging
            </li>
            <li>
              <b>Kanban</b>&nbsp;
              <ProSign /> - turns every folder into a Kanban board
            </li>
            <li>
              <b>FolderViz</b>&nbsp;
              <ProSign /> - display the file structure of a folder as visual
              tree
            </li>
          </ul>
          <SlideButton
            title="Find out more"
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
            <li>
              <b>Markdown</b> (recommended) - suitable for notes with simple
              formatting
            </li>
            <li>
              <b>HTML</b> - suitable for documents requiring rich text
              formatting
            </li>
            <li>
              <b>Text</b> - suitable for creating plain text files, with no
              formatting
            </li>
            <li>
              <b>Audio</b> - <ProSign /> suitable for audio notes
            </li>
          </ul>
          <SlideButton
            title="Find out more"
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
        selectByTID('locationManager')?.click();
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
    <Box style={{ maxWidth: 480, paddingLeft: 10, paddingRight: 10 }}>
      <style>
        {`
        .highlighterOn {
            animation: pulsate 2s infinite;
            z-index: 1;
        }
        @keyframes pulsate {
            0%   { box-shadow: 0 0 7px 6px #da15d8; }
            50%  { box-shadow: 0 0 0 transparent; }
            100% { box-shadow: 0 0 7px 6px #da15d8; }
        }
        `}
      </style>
      <Typography
        variant="inherit"
        style={{
          color: theme.palette.text.primary,
          textTransform: 'uppercase',
          textAlign: 'center',
          paddingTop: 20,
        }}
        noWrap
      >
        {t('Get Started with TagSpaces')}
      </Typography>
      <Stepper activeStep={activeStep} orientation="vertical">
        {steps.map((step, index) => (
          <Step key={step.label}>
            <StepLabel>{step.label}</StepLabel>
            <StepContent>
              <Typography style={{ color: theme.palette.text.primary }}>
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
                      : t('core:goforward')}
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
          sx={{ p: 3 }}
          style={{ backgroundColor: 'transparent' }}
        >
          <Typography>All steps completed - you&apos;re finished.</Typography>
          <TsButton onClick={handleReset} sx={{ mt: 1, mr: 1 }}>
            {t('core:resetBtn')}
          </TsButton>
        </Paper>
      )}
    </Box>
  );
}

export default HowToStart;

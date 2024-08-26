import * as React from 'react';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import StepContent from '@mui/material/StepContent';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Links from 'assets/links';
import { ProSign } from '-/components/HelperComponents';
import { openURLExternally } from '-/services/utils-io';
import { useTheme } from '@mui/material/styles';
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
  selectByTID('locationManager').classList.remove('highlighterOn');
  selectByTID('tagLibrary').classList.remove('highlighterOn');
  selectByTID('settings').classList.remove('highlighterOn');
  selectByTID('createNewFileTID').classList.remove('highlighterOn');
  // selectByTID('createNewLocation').classList.remove('highlighterOn');
  selectByTID('locationList').classList.remove('highlighterOn');
  selectByTID('tagLibraryTagGroupList') &&
    selectByTID('tagLibraryTagGroupList').classList.remove('highlighterOn');
  selectByTID('quickAccessButton').classList.remove('highlighterOn');
  selectByTID('quickAccessArea') &&
    selectByTID('quickAccessArea').classList.remove('highlighterOn');
  selectByTID('floatingPerspectiveSwitcher').classList.remove('highlighterOn');
  selectByTID('createNewDropdownButtonTID').classList.remove('highlighterOn');
}

function HowToStart() {
  const { t } = useTranslation();
  const theme = useTheme();
  const steps = [
    {
      label: 'Introduction',
      description: (
        <>
          The following guide will demonstrate some of the key areas and
          features of the application. We highly recommend it for first-time
          users.
        </>
      ),
    },
    {
      label: 'Location Manager',
      description: (
        <>
          In order to use a given folder in TagSpaces you have to connect it as
          location with the Location Manager. The Location Manager allows you to
          create, edit, remove, import, and export your locations. Any
          pre-existing locations already pointing to folders such as the
          Documents or Downloads can be removed if they are not needed.
          <br />
          <SlideButton
            title="Find out more"
            link={Links.documentationLinks.locations}
          />
        </>
      ),
      action: () => {
        selectByTID('locationManager').click();
        selectByTID('locationList').classList.add('highlighterOn');
      },
    },
    {
      label: 'Creating a Location',
      description: (
        <>
          By selecting the highlighted button, you can open a dialog to choose
          which folder you'd like to use in TagSpaces and create a location
          linked to it. Depending on the type of location, the folder can be
          located on your computer or in an S3-compatible cloud storage such as
          AWS, Cloudflare, Wasabi, or Minio.
          <br />
          <SlideButton
            title="Video about creating locations"
            link={Links.links.howToStart + '#locationsLocal'}
          />
        </>
      ),
      action: () => {
        selectByTID('createNewDropdownButtonTID').classList.add(
          'highlighterOn',
        );
      },
    },
    {
      label: 'Tag Library',
      description: (
        <>
          The Tag Library is the place where you can manage and organize the
          tags with which you can tag your files and folders. Tag Groups help
          you categorize different tags and applying a tag is as simple as
          dragging and dropping it onto a file or folder.
          <br />
          <SlideButton
            title="Video introducing the tag library"
            link={Links.links.howToStart + '#taglibrary'}
          />
        </>
      ),
      action: () => {
        selectByTID('tagLibrary').click();
        setTimeout(() => {
          selectByTID('tagLibrary').classList.add('highlighterOn');
          selectByTID('tagLibraryTagGroupList').classList.add('highlighterOn');
        }, 2000);
      },
    },
    {
      label: 'Quick access section',
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
          selectByTID('quickAccessButton').classList.add('highlighterOn');
          selectByTID('quickAccessArea').classList.add('highlighterOn');
        }, 2000);
      },
    },
    {
      label: 'Perspectives Switcher',
      description: (
        <>
          The perspectives offer a specific view on the files in a given folder.
          With the highlighted switcher you can change the perspective of the
          current folder.
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
        selectByTID('floatingPerspectiveSwitcher').classList.add(
          'highlighterOn',
        );
      },
    },
    {
      label: 'Creating files',
      description: (
        <>
          The highlighted button will open a dialog, where you can create a new
          file or <b>digital note</b>. The new files can be in the following
          file formats:
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
        selectByTID('createNewFileTID').classList.add('highlighterOn');
      },
    },
    {
      label: 'App Settings',
      description: (
        <>
          The highlighted button will open the settings of the application.
          There you can configure the application's color theme, language,
          default perspective, tagging method, and more. Additionally, keyboard
          shortcuts and preferences for editing supported file types can be also
          changed there.
          <br />
          <SlideButton
            title="Find out more"
            link={Links.documentationLinks.settings}
          />
        </>
      ),
      action: () => {
        selectByTID('locationManager').click();
        selectByTID('settings').classList.add('highlighterOn');
      },
    },
    {
      label: 'Start using TagSpaces',
      description: (
        <>
          You can start using the app by creating a new location or open an
          existing one from the location manager.
        </>
      ),
      action: () => {
        selectByTID('createNewFileTID').classList.add('highlighterOn');
        selectByTID('locationList').classList.add('highlighterOn');
        selectByTID('locationManager').click();
      },
    },
  ];

  function SlideButton(props) {
    const { title, link } = props;
    return (
      <Button
        onClick={() => {
          openURLExternally(link, true);
        }}
        variant="text"
        color="primary"
      >
        {title}
      </Button>
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
  return (
    <Box style={{ maxWidth: 480, paddingLeft: 10, paddingRight: 10 }}>
      <style>
        {`
        .highlighterOn {
            animation: pulsate 2s infinite;
        }
        @keyframes pulsate {
            0%   { box-shadow: 0 0 0 transparent; }
            20%  { box-shadow: 0 0 7px 6px #da15d8;  }
            70%  { box-shadow: 0 0 7px 6px #da15d8;  }
            100% { box-shadow: 0 0 0 transparent; }
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
                  <Button
                    // variant="contained"
                    onClick={handleNext}
                    sx={{ mt: 1, mr: 1 }}
                  >
                    {index === steps.length - 1
                      ? t('core:finish')
                      : t('core:goforward')}
                  </Button>
                  <Button
                    disabled={index === 0}
                    onClick={handleBack}
                    sx={{ mt: 1, mr: 1 }}
                  >
                    {t('core:goback')}
                  </Button>
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
          <Button onClick={handleReset} sx={{ mt: 1, mr: 1 }}>
            {t('core:resetBtn')}
          </Button>
        </Paper>
      )}
    </Box>
  );
}

export default HowToStart;

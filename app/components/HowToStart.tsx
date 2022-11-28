import * as React from 'react';
import withStyles from '@mui/styles/withStyles';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import StepContent from '@mui/material/StepContent';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import i18n from '-/services/i18n';
import Links from '-/links';
import { ProSign } from '-/components/HelperComponents';

export const styles: any = (theme: any) => ({
  recentTitle: {
    color: theme.palette.text.primary,
    textTransform: 'uppercase',
    textAlign: 'center'
  }
});

const selectByTID: any = tid =>
  document.querySelector('[data-tid="' + tid + '"]');

function clearHighlights() {
  selectByTID('locationManager').classList.remove('highlighterOn');
  selectByTID('tagLibrary').classList.remove('highlighterOn');
  selectByTID('settings').classList.remove('highlighterOn');
  selectByTID('createNewFileTID').classList.remove('highlighterOn');
  selectByTID('createNewLocation').classList.remove('highlighterOn');
  selectByTID('locationList').classList.remove('highlighterOn');
  selectByTID('tagLibraryTagGroupList') &&
    selectByTID('tagLibraryTagGroupList').classList.remove('highlighterOn');
  selectByTID('quickAccessButton').classList.remove('highlighterOn');
  selectByTID('quickAccessArea') &&
    selectByTID('quickAccessArea').classList.remove('highlighterOn');
  selectByTID('floatingPerspectiveSwitcher').classList.remove('highlighterOn');
}

interface Props {
  theme: any;
  classes: any;
  openURLExternally: (url: string, skipConfirmation?: boolean) => void;
}

function HowToStart(props: Props) {
  const { classes, openURLExternally, theme } = props;
  const steps = [
    {
      label: 'Introduction',
      description: (
        <>
          Here you will learn some basics about how to start using the
          application.
        </>
      )
    },
    {
      label: 'Location Manager',
      description: (
        <>
          Locations are connection to folder containing file, which you want to
          use in TagSpaces. The location manager is the place where you can
          create, edit, remove, order, import or export your locations. The
          pre-existing location pointing for example to your Desktop or Download
          folder are optional and can be remove.
          <br />
          <Button
            style={{ marginTop: 20 }}
            onClick={() => {
              openURLExternally(Links.documentationLinks.locations, true);
            }}
            variant="text"
            color="primary"
          >
            Find out more
          </Button>
        </>
      ),
      action: () => {
        selectByTID('locationManager').click();
        selectByTID('locationList').classList.add('highlighterOn');
      }
    },
    {
      label: 'Creating a Location',
      description: (
        <>
          Clicking the highlighted button will open a dialog where you can
          choose which folder you want to use in TagSpaces and create a location
          pointing to it. Depending on location type the folder can be on your
          computer or located on a object storage in cloud. TagSpaces supports
          object storage from AWS S3 compatible providers such as Wasabi or
          Minio.
          <br />
          <Button
            style={{ marginTop: 20 }}
            onClick={() => {
              openURLExternally(Links.links.howToStart, true);
            }}
            variant="text"
            color="primary"
          >
            Videos Tutorials
          </Button>
        </>
      ),
      action: () => {
        selectByTID('createNewLocation').classList.add('highlighterOn');
      }
    },
    {
      label: 'Tag Library',
      description: (
        <>
          The tag library is the place where you can manage and organize the
          tags with which you can tag your files and folders. In order to apply
          a tag you have to just and drop and drop it on a file or folder.
          <br />
          <Button
            style={{ marginTop: 20 }}
            onClick={() => {
              openURLExternally(Links.documentationLinks.taglibrary, true);
            }}
            variant="text"
            color="primary"
          >
            Find out more
          </Button>
        </>
      ),
      action: () => {
        selectByTID('tagLibrary').click();
        setTimeout(() => {
          selectByTID('tagLibrary').classList.add('highlighterOn');
          selectByTID('tagLibraryTagGroupList').classList.add('highlighterOn');
        }, 2000);
      }
    },
    {
      label: 'Quick access section',
      description: (
        <>
          In this section you can get easy access to the following list:
          <ul>
            <li>
              Search you have stored for later use&nbsp;
              <ProSign />
            </li>
            <li>
              Bookmarks to files and folders&nbsp;
              <ProSign />
            </li>
            <li>
              Recently opened files&nbsp;
              <ProSign />
            </li>
            <li>
              Recently edited files&nbsp;
              <ProSign />
            </li>
            <li>
              Recently opened folder&nbsp;
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
      }
    },
    {
      label: 'Perspectives Switcher',
      description: (
        <>
          Perspective offer a different view on the files in a given folder.
          With the switcher you can change the perspective of the current
          folder.
          <ul>
            <li>Grid</li>
            <li>List</li>
            <li>
              Gallery&nbsp;
              <ProSign />
            </li>
            <li>
              Mapique&nbsp;
              <ProSign />
            </li>
            <li>
              Kanban&nbsp;
              <ProSign />
            </li>
          </ul>
          <Button
            style={{ marginTop: 20 }}
            onClick={() => {
              openURLExternally(Links.documentationLinks.perspectives, true);
            }}
            variant="text"
            color="primary"
          >
            Find out more
          </Button>
        </>
      ),
      action: () => {
        selectByTID('floatingPerspectiveSwitcher').classList.add(
          'highlighterOn'
        );
      }
    },
    {
      label: 'Creating files',
      description: (
        <>
          The settings of the application can be accessed with highlighted
          button.
          <br />
          <Button
            style={{ marginTop: 20 }}
            onClick={() => {
              openURLExternally(Links.documentationLinks.creatingFiles, true);
            }}
            variant="text"
            color="primary"
          >
            Find out more
          </Button>
        </>
      ),
      action: () => {
        selectByTID('createNewFileTID').classList.add('highlighterOn');
      }
    },
    {
      label: 'App Settings',
      description: (
        <>
          The settings of the application can be accessed with highlighted
          button. In the settings dialog you can fine tune the application by
          choosing the color theme, language, perspective, tagging method and so
          on. Further more here you can change the key binding and define how
          you would like to open and edit certain file types.
          <br />
          <Button
            style={{ marginTop: 20 }}
            onClick={() => {
              openURLExternally(Links.documentationLinks.settings, true);
            }}
            variant="text"
            color="primary"
          >
            Find out more
          </Button>
        </>
      ),
      action: () => {
        selectByTID('locationManager').click();
        selectByTID('settings').classList.add('highlighterOn');
      }
    },
    {
      label: 'Start using TagSpaces',
      description: (
        <>
          You can start using the app by opening a location or creating a new
          one.
        </>
      ),
      action: () => {
        selectByTID('createNewLocation').classList.add('highlighterOn');
        selectByTID('locationList').classList.add('highlighterOn');
        selectByTID('locationManager').click();
      }
    }
  ];

  const [activeStep, setActiveStep] = React.useState(0);

  const handleNext = () => {
    clearHighlights();
    const nextStep = activeStep + 1;
    if (steps[nextStep] && steps[nextStep].action) {
      steps[nextStep].action();
    }
    setActiveStep(nextActiveStep => nextActiveStep + 1);
  };

  const handleBack = () => {
    clearHighlights();
    const prevStep = activeStep - 1;
    if (steps[prevStep] && steps[prevStep].action) {
      steps[prevStep].action();
    }
    setActiveStep(prevActiveStep => prevActiveStep - 1);
  };

  const handleReset = () => {
    clearHighlights();
    setActiveStep(0);
  };

  // ${theme.palette.primary.main};
  return (
    <Box style={{ maxWidth: 400, paddingLeft: 10, paddingRight: 10 }}>
      <style>
        {`
        .highlighterOn {
            animation: pulsate 2s infinite;
        }
        @keyframes pulsate {
            0%   { box-shadow: 0 0 0 transparent; }
            50%  { box-shadow: 0 0 7px 6px ${theme.palette.primary.main} }
            100% { box-shadow: 0 0 0 transparent; }
        }
        `}
      </style>
      <Typography
        variant="inherit"
        style={{
          paddingTop: 20
        }}
        className={classes.recentTitle}
        noWrap
      >
        {i18n.t('Get Started with TagSpaces')}
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
                    variant="contained"
                    onClick={handleNext}
                    sx={{ mt: 1, mr: 1 }}
                  >
                    {index === steps.length - 1
                      ? i18n.t('core:finish')
                      : i18n.t('core:goforward')}
                  </Button>
                  <Button
                    disabled={index === 0}
                    onClick={handleBack}
                    sx={{ mt: 1, mr: 1 }}
                  >
                    {i18n.t('core:goback')}
                  </Button>
                </div>
              </Box>
            </StepContent>
          </Step>
        ))}
      </Stepper>
      {activeStep === steps.length && (
        <Paper square elevation={0} sx={{ p: 3 }}>
          <Typography>All steps completed - you&apos;re finished</Typography>
          <Button onClick={handleReset} sx={{ mt: 1, mr: 1 }}>
            {i18n.t('core:resetBtn')}
          </Button>
        </Paper>
      )}
    </Box>
  );
}

export default withStyles(styles, { withTheme: true })(HowToStart);

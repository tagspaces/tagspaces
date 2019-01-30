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
 * @flow
 */

import React from 'react';
import SwipeableViews from 'react-swipeable-views';
import Button from '@material-ui/core/Button';
import BulletIcon from '@material-ui/icons/StarRate';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import withMobileDialog from '@material-ui/core/withMobileDialog';
import MobileStepper from '@material-ui/core/MobileStepper';
import GenericDialog, { onEnterKeyHandler } from './GenericDialog';
import WelcomeImage from '../../assets/images/onboarding.jpg';
import BrowserExtension from '../../assets/images/browser-extensions.png';
import i18n from '../../services/i18n';
import PlatformIO from '../../services/platform-io';

type Props = {
  open: boolean,
  fullScreen: boolean,
  onClose: () => void
};

type State = {
  activeStep: number
};

class ProTeaserDialog extends React.Component<Props, State> {
  state = {
    activeStep: 0,
  };

  maxSteps = 6;

  /* static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.show) {
      return {
        ...prevState,
        activeStep: 0,
      };
    }
    return null;
  } */

  handleNext = () => {
    this.setState(prevState => ({
      activeStep: prevState.activeStep + 1
    }));
  };

  handleBack = () => {
    this.setState(prevState => ({
      activeStep: prevState.activeStep - 1
    }));
  };

  handleStepChange = activeStep => {
    this.setState({ activeStep });
  };

  renderTitle = () => (
    <DialogTitle style={{ justifyContent: 'center', textAlign: 'center' }}>
      TagSpaces PRO Features Overview
    </DialogTitle>
  );

  renderContent = () => {
    const { activeStep } = this.state;
    const slideStyles = {
      height: 480,
      padding: 5,
      overflow: 'hidden',
      textAlign: 'left'
    };

    return (
      <DialogContent
        style={{ height: 550, overflow: 'hidden', paddingBottom: 0 }}
      >
        <SwipeableViews
          index={activeStep}
          onChangeIndex={this.handleStepChange}
          enableMouseEvents
        >
          <div style={slideStyles}>
            <Typography variant="h5" style={{ textAlign: 'center' }}>Key Features</Typography>
            <Typography variant="subtitle1">&nbsp;</Typography>
            <Typography variant="subtitle1"><BulletIcon /> Generating Persistent Thumbnails</Typography>
            <Typography variant="subtitle1"><BulletIcon /> Advanced Search by file type and tags</Typography>
            <Typography variant="subtitle1"><BulletIcon /> File and Folder Description</Typography>
            <Typography variant="subtitle1"><BulletIcon /> Connecting S3 Object Store Network Locations</Typography>
            <Typography variant="subtitle1">&nbsp;</Typography>
            <Typography variant="h5" style={{ textAlign: 'center' }}>
              <Button
                onClick={() => {
                  // this.props.onClose();
                  PlatformIO.openUrl('https://www.tagspaces.org/products/');
                }}
                variant="contained"
                color="primary"
              >
                Open Product Comparison Page
              </Button>
            </Typography>
          </div>
          <div style={slideStyles}>
            <Typography variant="h5" style={{ textAlign: 'center' }}>Generating Persistent Thumbnails</Typography>
            <Typography variant="subtitle1">&nbsp;</Typography>
            <Typography variant="subtitle1"><BulletIcon /> Images: JPG, PNG, GIF, ... (supported also in the free version)</Typography>
            <Typography variant="subtitle1"><BulletIcon /> Videos: WEBM, OGV, MP4, M4V, etc.</Typography>
            <Typography variant="subtitle1"><BulletIcon /> Notes: HTML, MD, etc.</Typography>
            <Typography variant="subtitle1"><BulletIcon /> Text files: TXT, source code files</Typography>
            <Typography variant="subtitle1"><BulletIcon /> Bookmarks: URL</Typography>
            <Typography variant="subtitle1"><BulletIcon /> Ebooks: EPUB</Typography>
            <Typography variant="subtitle1"><BulletIcon /> Archives: ZIP</Typography>
            <Typography variant="subtitle1"><BulletIcon /> Portable Documents: PDF</Typography>
            <Typography variant="subtitle1"><BulletIcon /> Office Documents: ODT, ODP, ODS, DOCX, XLSX, PPTX</Typography>
            <Typography variant="subtitle1">&nbsp;</Typography>
            <Button
              onClick={() => {
                // this.props.onClose();
                PlatformIO.openUrl('https://www.tagspaces.org/products/pro/#thumbnailsGeneration');
              }}
              variant="contained"
              color="primary"
            >
              Learn more
            </Button>
          </div>
          <div style={slideStyles}>
            <Typography variant="h5" style={{ textAlign: 'center' }}>Advanced Search Options</Typography>
            <Typography variant="h6">Search by file type</Typography>
            <Typography variant="subtitle1"><BulletIcon /> Documents: PDF, ODF, DOCX, EXL, etc.</Typography>
            <Typography variant="subtitle1"><BulletIcon /> Notes: MD, TXT, HTML, etc.</Typography>
            <Typography variant="subtitle1"><BulletIcon /> Audio files: OGG, MP3, WAV, etc.</Typography>
            <Typography variant="subtitle1"><BulletIcon /> Video files: WEBM, OGV, MP4, etc.</Typography>
            <Typography variant="subtitle1"><BulletIcon /> Archives: ZIP, RAR, TGZ, 7Z, etc.</Typography>
            <Typography variant="subtitle1"><BulletIcon /> Bookmarks: URL, LNK, etc.</Typography>
            <Typography variant="subtitle1"><BulletIcon /> eBook EPUB, MOBI, AZW, PRC, etc.</Typography>
            <Typography variant="subtitle1"><BulletIcon /> Filter for files or folders without tags</Typography>
            <Typography variant="h6">Searching types for tagged entries</Typography>
            <Typography variant="subtitle1"><BulletIcon /> At least one tag - logical OR search</Typography>
            <Typography variant="subtitle1"><BulletIcon /> All tag - logical AND search</Typography>
            <Typography variant="subtitle1" style={{ textAlign: 'right' }}>&nbsp;
              <Button
                onClick={() => {
                  // this.props.onClose();
                  PlatformIO.openUrl('https://www.tagspaces.org/products/pro/#advancedSearch');
                }}
                variant="contained"
                color="primary"
              >
                Learn more
              </Button>
            </Typography>
          </div>
          <div style={slideStyles}>
            <Typography variant="h5" style={{ textAlign: 'center' }}>Description for File and Folders</Typography>
            <Typography variant="h6">&nbsp;</Typography>
            <Typography variant="subtitle1">In addition to the tagging in the TagSpaces PRO you have the ability to annotate every file or folder with a description. This is useful in particular if you want to add some more textual content to given a file or folder.</Typography>
            <Typography variant="h6">&nbsp;</Typography>
            <Typography variant="subtitle1" style={{ textAlign: 'center' }}>&nbsp;
              <Button
                onClick={() => {
                  // this.props.onClose();
                  PlatformIO.openUrl('https://www.tagspaces.org/products/pro/#fileFolderMeta');
                }}
                variant="contained"
                color="primary"
              >
                Learn more
              </Button>
            </Typography>
          </div>
          <div style={slideStyles}>
            <Typography variant="h5" style={{ textAlign: 'center' }}>Connecting S3 Object Store Network Locations</Typography>
            <Typography variant="h6">&nbsp;</Typography>
            <Typography variant="subtitle1">With this feature, TagSpaces PRO is going into direction of supporting the Cloud as file storage. In general it enables you to creating a location pointing to a remote object storages also knows as buckets on AWS S3 infrastructure. By doing this, you get a full-fledged file organizer, browser and navigator for this bucket, directly in TagSpaces. You do not have to download every file separately and eventually upload it back in order to preview, edit or annotate it.
            </Typography>
            <Typography variant="h6">&nbsp;</Typography>
            <Typography variant="subtitle1" style={{ textAlign: 'center' }}>&nbsp;
              <Button
                onClick={() => {
                  // this.props.onClose();
                  PlatformIO.openUrl('https://www.tagspaces.org/products/pro/#s3objectStores');
                }}
                variant="contained"
                color="primary"
              >
                Learn more
              </Button>
            </Typography>
          </div>
          <div style={slideStyles}>
            <Typography variant="h5" style={{ textAlign: 'center' }}>Other advanced features</Typography>
            <Typography variant="subtitle1">&nbsp;</Typography>
            <Typography variant="subtitle1"><BulletIcon /> Location monitoring for changes</Typography>
            <Typography variant="subtitle1"><BulletIcon /> Persistent manual index</Typography>
            <Typography variant="subtitle1"><BulletIcon /> Signed installers for Windows</Typography>
            <Typography variant="subtitle1"><BulletIcon /> White label package (available in TagSpaces Enterprise)</Typography>
            <Typography variant="subtitle1"><BulletIcon /> Custom extension development (available in TagSpaces Enterprise)</Typography>
            <Typography variant="subtitle1">&nbsp;</Typography>
            <Typography variant="subtitle1">
              If you want more information, click on the following button to visit the product comparison page on our website.
            </Typography>
            <Typography variant="subtitle1" style={{ textAlign: 'center' }}>&nbsp;</Typography>
            <Typography variant="subtitle1" style={{ textAlign: 'center' }}>
              <Button
                onClick={() => {
                  // this.props.onClose();
                  PlatformIO.openUrl('https://www.tagspaces.org/products/');
                }}
                variant="contained"
                color="primary"
              >
                Open Product Comparison
              </Button>
            </Typography>
          </div>
        </SwipeableViews>
        <MobileStepper
          style={{ marginTop: 10, backgroundColor: 'transparent' }}
          steps={this.maxSteps}
          position="static"
          activeStep={activeStep}
          nextButton={
            (activeStep === this.maxSteps - 1) ? (
              <Button
                size="small"
                onClick={this.props.onClose}
                // variant="contained"
                // color="primary"
              >
                Close
              </Button>

            ) : (
              <Button
                size="small"
                onClick={this.handleNext}
              >
                Next
              </Button>
            )
          }
          backButton={
            <Button
              size="small"
              onClick={this.handleBack}
              disabled={activeStep === 0}
            >
              Back
            </Button>
          }
        />
      </DialogContent>
    );
  };
  renderActions = () => (
    <DialogActions style={{ justifyContent: 'center' }}>
      <Button
        data-tid="confirmLicenseDialog"
        onClick={this.props.onClose}
        variant={
          this.state.activeStep === this.maxSteps - 1 ? 'contained' : 'text'
        }
        color="primary"
      >
        {this.state.activeStep === this.maxSteps - 1
          ? 'Start using TagSpaces'
          : i18n.t('core:closeButton')}
      </Button>
    </DialogActions>
  );

  render() {
    const { fullScreen, open, onClose } = this.props;
    return (
      <GenericDialog
        fullScreen={fullScreen}
        open={open}
        onClose={onClose}
        onEnterKey={(event) => onEnterKeyHandler(event, this.onConfirm)}
        renderTitle={this.renderTitle}
        renderContent={this.renderContent}
        // renderActions={this.renderActions}
      />
    );
  }
}

export default (withMobileDialog()(ProTeaserDialog));

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
import Typography from '@material-ui/core/Typography';
import withMobileDialog from '@material-ui/core/withMobileDialog';
import MobileStepper from '@material-ui/core/MobileStepper';
import GenericDialog, { onEnterKeyHandler } from './GenericDialog';
import DecideImage from '../../assets/images/decide-undraw.svg';
import ThumbsImage from '../../assets/images/thumbnails-undraw.svg';
import CloudImage from '../../assets/images/cloud-undraw.svg';
import i18n from '../../services/i18n';
import AppConfig from '../../config';

type Props = {
  open: boolean,
  fullScreen: boolean,
  openFileNatively: (url: string) => void,
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
      TagSpaces Pro Features
    </DialogTitle>
  );

  renderContent = () => {
    const { activeStep } = this.state;
    const slideStyles = {
      height: 450,
      padding: 5,
      overflow: 'overflow',
      textAlign: 'left'
    };

    return (
      <DialogContent
        style={{ overflow: 'hidden', paddingBottom: 0 }}
      >
        <SwipeableViews
          index={activeStep}
          onChangeIndex={this.handleStepChange}
          enableMouseEvents
        >
          <div style={slideStyles}>
            <Typography variant="subtitle1"><BulletIcon /> Generating Persistent Thumbnails</Typography>
            <Typography variant="subtitle1"><BulletIcon /> Advanced Search</Typography>
            <Typography variant="subtitle1"><BulletIcon /> File and Folder Description</Typography>
            <Typography variant="subtitle1"><BulletIcon /> Custom thumbnails</Typography>
            <Typography variant="subtitle1"><BulletIcon /> Geo location tagging</Typography>
            <Typography variant="subtitle1"><BulletIcon /> Connect AWS S3 object storages as locations</Typography>
            <Typography variant="subtitle1">&nbsp;</Typography>
            <div style={{ textAlign: 'center' }}>
              <img
                style={{
                  maxHeight: 150,
                  marginTop: 15,
                  marginBottom: 15,
                }}
                src={DecideImage}
                alt=""
              />
              <br />
              <Button
                onClick={() => { this.props.openFileNatively(AppConfig.links.productsOverview); }}
                variant="contained"
                color="primary"
              >Open Product Comparison</Button>
            </div>
          </div>
          <div style={slideStyles}>
            <Typography variant="h5" style={{ textAlign: 'center' }}>Advanced Search Options</Typography>
            <Typography variant="h6">Full text search for your notes and text files</Typography>
            <Typography variant="subtitle1"><BulletIcon /> Keywords from your text files will be included in the index</Typography>
            <Typography variant="subtitle1"><BulletIcon /> Currently we support TXT, MD and HTML files</Typography>
            <Typography variant="h6">Search by type of the file</Typography>
            <Typography variant="subtitle1"><BulletIcon /> Documents</Typography>
            <Typography variant="subtitle1"><BulletIcon /> Notes</Typography>
            <Typography variant="subtitle1"><BulletIcon /> Audio files</Typography>
            <Typography variant="subtitle1"><BulletIcon /> Video files</Typography>
            <Typography variant="subtitle1"><BulletIcon /> Archives</Typography>
            <Typography variant="subtitle1"><BulletIcon /> Bookmarks</Typography>
            <Typography variant="subtitle1"><BulletIcon /> eBooks</Typography>
            <div style={{ textAlign: 'center' }}>
              <Button
                onClick={() => this.props.openFileNatively(AppConfig.links.productProAdvancedSearch)}
                variant="contained"
                color="primary"
              >Learn more</Button>
            </div>
          </div>
          <div style={slideStyles}>
            <Typography variant="h5" style={{ textAlign: 'center' }}>Add description to files and folders</Typography>
            <Typography variant="h6">&nbsp;</Typography>
            <Typography variant="subtitle1">In TagSpaces Pro you have the ability to annotate every file or folder with a description. This is useful in particular if you want to add some more textual content to given a file or folder.</Typography>
            <Typography variant="h6">&nbsp;</Typography>
            <div style={{ textAlign: 'center' }}>
              <Button
                onClick={() => this.props.openFileNatively(AppConfig.links.productProFileFolderMeta)}
                variant="contained"
                color="primary"
              >Learn more</Button>
            </div>
          </div>
          <div style={slideStyles}>
            <Typography variant="h5" style={{ textAlign: 'center' }}>Connect S3 object storages as locations</Typography>
            <Typography variant="h6">&nbsp;</Typography>
            <Typography variant="subtitle1">With this feature, TagSpaces Pro supports the AWS S3 buckets as file storage. In general it enables you to creating a location pointing to a remote object storages also knows as buckets on AWS S3 infrastructure. By doing this, you get a full-fledged file organizer, browser and navigator for this bucket, directly in TagSpaces. You do not have to download every file separately and eventually upload it back in order to preview, edit or annotate it.
            </Typography>
            <div style={{ textAlign: 'center' }}>
              <img
                style={{
                  maxHeight: 120,
                  marginTop: 15,
                  marginBottom: 15,
                }}
                src={CloudImage}
                alt=""
              /><br />
              <Button
                onClick={() => this.props.openFileNatively(AppConfig.links.productProObjectStore)}
                variant="contained"
                color="primary"
              >Learn more</Button>
            </div>
          </div>
          <div style={slideStyles}>
            <Typography variant="h5" style={{ textAlign: 'center' }}>Generating persistent thumbnails</Typography>
            <Typography variant="subtitle1">&nbsp;</Typography>
            <Typography variant="subtitle1">TagSpaces Pro generates persistent thumbnails for the following file type: Images & Videos, Notes, Source Code, Office Documents, Bookmarks, Ebooks, Archives and PDFs</Typography>
            <div style={{ textAlign: 'center' }}>
              <img
                style={{
                  maxHeight: 200,
                  marginTop: 15,
                  marginBottom: 15,
                }}
                src={ThumbsImage}
                alt=""
              /><br />
              <Button
                onClick={() => this.props.openFileNatively(AppConfig.links.productProThumbnailsGeneration)}
                variant="contained"
                color="primary"
              >Learn more</Button>
            </div>
          </div>
          <div style={slideStyles}>
            <Typography variant="h5" style={{ textAlign: 'center' }}>Other advanced features</Typography>
            <Typography variant="subtitle1">&nbsp;</Typography>
            <Typography variant="subtitle1"><BulletIcon /> Location monitoring for changes</Typography>
            <Typography variant="subtitle1"><BulletIcon /> Collecting all tags from locations</Typography>
            <Typography variant="subtitle1"><BulletIcon /> Persistent manual index</Typography>
            <Typography variant="subtitle1"><BulletIcon /> Signed installers for Windows</Typography>
            <Typography variant="subtitle1"><BulletIcon /> White label package (available in TagSpaces Enterprise)</Typography>
            <Typography variant="subtitle1"><BulletIcon /> Custom extension development (available in TagSpaces Enterprise)</Typography>
            <Typography variant="subtitle1">&nbsp;</Typography>
            <Typography variant="subtitle1">
              If you want more information, click on the following button to visit the product comparison page on our website.
            </Typography>
            <div style={{ textAlign: 'center' }}>
              <Button
                onClick={() => this.props.openFileNatively(AppConfig.links.productsOverview)}
                variant="contained"
                color="primary"
              >Get It</Button>
            </div>
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

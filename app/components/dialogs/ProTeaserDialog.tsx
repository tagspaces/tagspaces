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
 */

import React from 'react';
import SwipeableViews from 'react-swipeable-views';
import Button from '@material-ui/core/Button';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import Typography from '@material-ui/core/Typography';
import withMobileDialog from '@material-ui/core/withMobileDialog';
import MobileStepper from '@material-ui/core/MobileStepper';
import Dialog from '@material-ui/core/Dialog';
import DecideImage from '-/assets/images/decide-undraw.svg';
import ThumbsImage from '-/assets/images/thumbnails-undraw.svg';
import CloudImage from '-/assets/images/cloud-undraw.svg';
import SearchImage from '-/assets/images/search-undraw.svg';
import MapImage from '-/assets/images/map-undraw.svg';
import AnnotateImage from '-/assets/images/annotate-undraw.svg';
import EnterpriseImage from '-/assets/images/world-undraw.svg';
import i18n from '-/services/i18n';
import AppConfig from '-/config';

interface Props {
  open: boolean;
  fullScreen: boolean;
  openURLExternally: (url: string) => void;
  onClose: () => void;
}

interface State {
  activeStep: number;
}

class ProTeaserDialog extends React.Component<Props, State> {
  state = {
    activeStep: 0
  };

  maxSteps = 7;

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

  render() {
    const { activeStep } = this.state;
    const slideStyles: any = {
      padding: 5,
      textAlign: 'left'
    };
    const { fullScreen, open, onClose } = this.props;

    return (
      <Dialog
        open={open}
        onClose={onClose}
        fullScreen={fullScreen}
        keepMounted
        scroll="paper"
      >
        <DialogContent style={{ paddingBottom: 0 }}>
          <SwipeableViews
            index={activeStep}
            onChangeIndex={this.handleStepChange}
            enableMouseEvents
          >
            <div style={slideStyles}>
              <Typography variant="h5" style={{ textAlign: 'center' }}>
                TagSpaces Pro - Key Features
              </Typography>
              <br />
              <Typography variant="subtitle1">
                &#x2605; Connect cloud object storages as locations (e.g. AWS S3
                Buckets, Minio, DigitalOcean Spaces)
              </Typography>
              <Typography variant="subtitle1">
                &#x2605; Global search in all locations (cloud &amp; local ones)
              </Typography>
              <Typography variant="subtitle1">
                &#x2605; Advanced search with full text support for some file
                types
              </Typography>
              <Typography variant="subtitle1">
                &#x2605; Description and custom thumbnails for files and folder
              </Typography>
              <Typography variant="subtitle1">
                &#x2605; Custom background color for folders
              </Typography>
              <Typography variant="subtitle1">
                &#x2605; Advanced tagging with geo location support
              </Typography>
              <Typography variant="subtitle1">
                &#x2605; Generating persistent thumbnails
              </Typography>
              <Typography variant="subtitle1">&nbsp;</Typography>
              <div style={{ textAlign: 'center' }}>
                <img
                  style={{
                    maxHeight: 150,
                    marginTop: 15,
                    marginBottom: 15
                  }}
                  src={DecideImage}
                  alt=""
                />
                <br />
                <Button
                  onClick={() => {
                    this.props.openURLExternally(
                      AppConfig.links.productsOverview
                    );
                  }}
                  variant="contained"
                  color="primary"
                >
                  Open Product Comparison
                </Button>
              </div>
            </div>
            <div style={slideStyles}>
              <Typography variant="h5" style={{ textAlign: 'center' }}>
                Advanced Search
              </Typography>
              <br />
              <Typography variant="h6">Global search</Typography>
              <Typography variant="subtitle1">
                &#x2605; Search in all locations at once, regardless if they are
                local or in the Cloud
              </Typography>
              <Typography variant="h6">Full text search</Typography>
              <Typography variant="subtitle1">
                &#x2605; Keywords from text files (TXT, HTML, Markdown) will be
                included in the index
              </Typography>
              <Typography variant="h6">Filter by file type</Typography>
              <Typography variant="subtitle1">
                &#x2605; Documents, Notes, Audio files, Video files, Archives,
                Bookmarks, eBooks
              </Typography>
              <Typography variant="subtitle1">
                &#x2605; Filter for files, folders and untagged files
              </Typography>
              <Typography variant="h6">
                Filter by size, date and gps-coordinates
              </Typography>
              <div style={{ textAlign: 'center' }}>
                <img
                  style={{
                    maxHeight: 150,
                    marginTop: 15,
                    marginBottom: 15
                  }}
                  src={SearchImage}
                  alt=""
                />
                <br />
                <Button
                  onClick={() =>
                    this.props.openURLExternally(
                      AppConfig.links.productProAdvancedSearch
                    )
                  }
                  variant="contained"
                  color="primary"
                >
                  Learn more
                </Button>
              </div>
            </div>
            <div style={slideStyles}>
              <Typography variant="h5" style={{ textAlign: 'center' }}>
                Connect S3 object storages as locations
              </Typography>
              <br />
              <Typography variant="subtitle1">
                With this feature, TagSpaces Pro supports AWS S3 compatible
                buckets as file storage. Such buckets are offered by e.g. Amazon
                AWS, DigitalOcean or Minio. By doing this, you get a
                full-fledged{' '}
                <strong>
                  file organizer, browser and navigator for files in the Cloud
                </strong>
                , directly in TagSpaces. You do not have to download every file
                separately and eventually upload it back in order to preview,
                edit or annotate it.
              </Typography>
              <div style={{ textAlign: 'center' }}>
                <img
                  style={{
                    maxHeight: 120,
                    marginTop: 15,
                    marginBottom: 15
                  }}
                  src={CloudImage}
                  alt=""
                />
                <br />
                <Button
                  onClick={() =>
                    this.props.openURLExternally(
                      AppConfig.links.productProObjectStore
                    )
                  }
                  variant="contained"
                  color="primary"
                >
                  Learn more
                </Button>
              </div>
            </div>
            <div style={slideStyles}>
              <Typography variant="h5" style={{ textAlign: 'center' }}>
                Annotate your files and folders visually
              </Typography>
              <br />
              <Typography variant="subtitle1">
                &#x2605; Add <b>custom description</b> to every document, photo
                or folder
              </Typography>
              <Typography variant="subtitle1">
                &#x2605; The description can be in markdown allowing images and
                links
              </Typography>
              <Typography variant="subtitle1">
                &#x2605; Set a <b>custom thumbnail</b> for every file or folder
              </Typography>
              <Typography variant="subtitle1">
                &#x2605; Set a <b>custom background color</b> to folders
              </Typography>
              <Typography variant="subtitle1">
                These features will enable you to find with ease your documents
                via the build-in search or just visually.
              </Typography>
              <div style={{ textAlign: 'center' }}>
                <img
                  style={{
                    maxHeight: 200,
                    marginTop: 15,
                    marginBottom: 15
                  }}
                  src={AnnotateImage}
                  alt=""
                />
                <br />
                <Button
                  onClick={() =>
                    this.props.openURLExternally(
                      AppConfig.links.productProFileFolderMeta
                    )
                  }
                  variant="contained"
                  color="primary"
                >
                  Learn more
                </Button>
              </div>
            </div>
            <div style={slideStyles}>
              <Typography variant="h5" style={{ textAlign: 'center' }}>
                Tag with geo coordinates
              </Typography>
              <br />
              <Typography variant="subtitle1">
                &#x2605; This feature can be used to add geo coordinates to
                every file or folder.{' '}
              </Typography>
              <Typography variant="subtitle1">
                &#x2605; Dedicated perspective for showing geo-tags on a
                build-in map
              </Typography>
              <Typography variant="subtitle1">
                &#x2605; Extract geo location data from EXIF in JPGs files.
              </Typography>
              <Typography variant="subtitle1">
                &#x2605; Useful for planing or documenting trips and vacations.
              </Typography>
              <Typography variant="subtitle1">
                &#x2605; Useful for adding annotations for places on a map.
              </Typography>
              <div style={{ textAlign: 'center' }}>
                <img
                  style={{
                    maxHeight: 200,
                    marginTop: 15,
                    marginBottom: 15
                  }}
                  src={MapImage}
                  alt=""
                />
                <br />
                <Button
                  onClick={() =>
                    this.props.openURLExternally(
                      AppConfig.links.productProGeoTagging
                    )
                  }
                  variant="contained"
                  color="primary"
                >
                  Learn more
                </Button>
              </div>
            </div>
            <div style={slideStyles}>
              <Typography variant="h5" style={{ textAlign: 'center' }}>
                Generating persistent thumbnails
              </Typography>
              <br />
              <Typography variant="subtitle1">
                TagSpaces Pro generates persistent thumbnails for many file type
                such as: images, videos, notes, source code, office documents,
                bookmarks, ebooks, archives and PDFs.
              </Typography>
              <div style={{ textAlign: 'center' }}>
                <img
                  style={{
                    maxHeight: 200,
                    marginTop: 15,
                    marginBottom: 15
                  }}
                  src={ThumbsImage}
                  alt=""
                />
                <br />
                <Button
                  onClick={() =>
                    this.props.openURLExternally(
                      AppConfig.links.productProThumbnailsGeneration
                    )
                  }
                  variant="contained"
                  color="primary"
                >
                  Learn more
                </Button>
              </div>
            </div>
            <div style={slideStyles}>
              <Typography variant="h5" style={{ textAlign: 'center' }}>
                TagSpaces Enterprise
              </Typography>
              <br />
              <Typography variant="subtitle1">
                &#x2605; On-prem web based version of TagSpaces Pro
              </Typography>
              <Typography variant="subtitle1">
                &#x2605; PWA version of TagSpaces Pro optimized for use om
                mobile devices
              </Typography>
              <Typography variant="subtitle1">
                &#x2605; White label packages, with custom colors and logo
              </Typography>
              <Typography variant="subtitle1">
                &#x2605; Development of custom viewers for file (e.g. 3D-assets,
                medical data ...)
              </Typography>
              <Typography variant="subtitle1">
                &#x2605; Development of custom perspectives for folders (e.g.
                graphs, maps, trees)
              </Typography>
              <Typography variant="subtitle1">
                &#x2605; Premium technical support and signed installers
              </Typography>
              <div style={{ textAlign: 'center' }}>
                <img
                  style={{
                    maxHeight: 200,
                    marginTop: 15,
                    marginBottom: 15
                  }}
                  src={EnterpriseImage}
                  alt=""
                />
                <br />
                <Button
                  onClick={() =>
                    this.props.openURLExternally(
                      AppConfig.links.productsOverview
                    )
                  }
                  variant="outlined"
                  color="primary"
                >
                  Product Landscape
                </Button>
                &nbsp;
                <Button
                  onClick={() =>
                    this.props.openURLExternally('mailto:contact@tagspaces.org')
                  }
                  variant="outlined"
                  color="primary"
                >
                  {i18n.t('core:emailContact')}
                </Button>
              </div>
            </div>
          </SwipeableViews>
        </DialogContent>
        <DialogActions style={{ justifyContent: 'center' }}>
          <MobileStepper
            style={{ marginTop: 10, backgroundColor: 'transparent' }}
            steps={this.maxSteps}
            position="static"
            activeStep={this.state.activeStep}
            nextButton={
              this.state.activeStep === this.maxSteps - 1 ? (
                <Button size="small" onClick={this.props.onClose}>
                  {i18n.t('core:closeButton')}
                </Button>
              ) : (
                <Button size="small" onClick={this.handleNext}>
                  {i18n.t('core:next')}
                </Button>
              )
            }
            backButton={
              <Button
                size="small"
                onClick={this.handleBack}
                disabled={this.state.activeStep === 0}
              >
                {i18n.t('core:prev')}
              </Button>
            }
          />
        </DialogActions>
      </Dialog>
    );
  }
}

export default withMobileDialog()(ProTeaserDialog);

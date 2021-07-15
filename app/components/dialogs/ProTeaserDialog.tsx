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

import React, { useState } from 'react';
import SwipeableViews from 'react-swipeable-views';
import Button from '@material-ui/core/Button';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Typography from '@material-ui/core/Typography';
import withMobileDialog from '@material-ui/core/withMobileDialog';
import MobileStepper from '@material-ui/core/MobileStepper';
import Dialog from '@material-ui/core/Dialog';
import DecideImage from '-/assets/images/decide-undraw.svg';
import ThumbsImage from '-/assets/images/thumbnails-undraw.svg';
import PerspectivesImage from '-/assets/images/perspectives-undraw.svg';
import CloudImage from '-/assets/images/cloud-undraw.svg';
import SearchImage from '-/assets/images/search-undraw.svg';
import MapImage from '-/assets/images/map-undraw.svg';
import AnnotateImage from '-/assets/images/annotate-undraw.svg';
import EnterpriseImage from '-/assets/images/world-undraw.svg';
import i18n from '-/services/i18n';
import DialogCloseButton from '-/components/dialogs/DialogCloseButton';
import Links from '-/links';

interface Props {
  open: boolean;
  fullScreen: boolean;
  openURLExternally: (url: string, skipConfirmation: boolean) => void;
  onClose: () => void;
}

interface SlideProps {
  title: string;
  openURLExternally?: (url: string, skipConfirmation: boolean) => void;
  description?: '';
  ctaURL?: string;
  ctaTitle?: string;
  items?: Array<string>;
  pictureURL?: string;
  pictureHeight?: number;
}

const slidesEN = [];
slidesEN['general'] = {
  title: 'TagSpaces Pro - Key Features',
  items: [
    <>
      Connect cloud <b>object storage</b> as locations (e.g. AWS S3 Buckets,
      MinIO folders hosted on your NAS)
    </>,
    <>
      Advanced search with <b>full text</b> support for some files and{' '}
      <b>persisted queries</b>
    </>,
    <>
      <b>Global search</b> in all locations (cloud &amp; local ones)
    </>,
    <>
      Additional <b>perspectives</b> for custom use-cases with your files
    </>,
    <>
      Add <b>description</b> and <b>custom thumbnails</b> to your files and
      folder
    </>,
    <>
      Set custom background <b>color for folders</b>
    </>,
    <>
      Advanced tagging with <b>geo-location</b> support
    </>,
    <>Generating persistent thumbnails</>
  ],
  ctaURL: Links.links.productsOverview,
  ctaTitle: 'Open Product Comparison',
  pictureURL: DecideImage,
  pictureHeight: 150
};
slidesEN['search'] = {
  title: 'Advanced Search & Persisted Search Queries',
  items: [
    <>
      <b>Global search</b> - in all locations at once, regardless if they are
      local or in the Cloud
    </>,
    <>
      <b>Save search queries</b> - for easy finding common files
    </>,
    <>
      <b>Full text search</b> - find keywords in text, markdown and html files
    </>,
    <>
      <b>Filter by file type</b> - Documents, Notes, Audio files, Video files,
      Archives, Bookmarks, eBooks
    </>,
    'Filter for files, folders or untagged files',
    'Filter by size, date and gps-coordinates'
  ],
  ctaURL: Links.links.productProAdvancedSearch,
  ctaTitle: 'Learn more',
  pictureURL: SearchImage,
  pictureHeight: 150
};
slidesEN['objectstorage'] = {
  title: 'Connect AWS S3 or MinIO object storage',
  description: (
    <>
      With this feature, TagSpaces Pro supports AWS S3 compatible buckets as
      file storage. Such buckets are offered by e.g. Amazon AWS, DigitalOcean or
      MinIO. By doing so, you are getting a full-fledged <b>file organizer</b>,
      browser and navigator for files in the Cloud, directly in TagSpaces. You
      do not have to download every file separately and eventually upload it
      back in order to preview, edit or annotate it.
    </>
  ),
  items: [
    <>Connect self-hosted (e.g. on your NAS) MinIO folders as locations</>,
    <>Browse object storage buckets in TagSpaces</>,
    <>Direct streaming of the supported audio and video formats</>,
    <>Upload files with simple drag and drop actions</>
  ],
  ctaURL: Links.links.productProObjectStore,
  ctaTitle: 'Learn more',
  pictureURL: CloudImage,
  pictureHeight: 120
};
slidesEN['perspectives'] = {
  title: 'See your files from different perspectives',
  description: (
    <>
      Folder usually hosts files grouped by different purpose (e.g. photos from
      an event or managing a project). For such cases we offer the so called{' '}
      <b>perspectives</b>, allowing you to set a custom view for different kind
      of tasks you want to perform with your files.
    </>
  ),
  items: [
    <>
      <b>Default</b> - present your files as list or in grid, suitable for
      tagging and file management
    </>,
    <>
      <b>Gallery</b> - optimized for browsing and viewing images and photos,
      having a build-in presentation mode
    </>,
    <>
      <b>Mapique</b> - simply place files and folders on a map, allowing you to
      annotate geographic areas or plan and document trips
    </>,
    <>
      <b>Kanban</b> <sup>BETA</sup> - here subfolder of the current folder are
      represented as columns from Kanban board, the files from the sub-folders
      can be your tasks.
    </>
  ],
  ctaURL: Links.documentationLinks.perspectives,
  ctaTitle: 'Learn more',
  pictureURL: PerspectivesImage,
  pictureHeight: 120
};
slidesEN['annotation'] = {
  title: 'Annotate your files and folders visually',
  description: (
    <>
      These features will enable you to find with ease your documents via the
      build-in search or just visually:
    </>
  ),
  items: [
    <>
      Add <b>custom description</b> to every document, photo or folder
    </>,
    <>
      The description can be in <b>markdown</b> allowing images and links
    </>,
    <>
      Set a <b>custom thumbnail</b> for every file or folder
    </>,
    <>
      Set a <b>custom background color</b> to folders
    </>
  ],
  ctaURL: Links.links.productProFileFolderMeta,
  ctaTitle: 'Learn more',
  pictureURL: AnnotateImage,
  pictureHeight: 200
};
slidesEN['geotagging'] = {
  title: 'Tag with geo coordinates',
  items: [
    <>
      This feature can be used to add geo coordinates to every file or folder.
    </>,
    <>Dedicated perspective for showing geo-tags on a build-in map</>,
    <>Extract geo location data from EXIF in JPGs files.</>,
    <>Useful for planing or documenting trips and vacations.</>,
    <>Useful for adding annotations for places on a map.</>
  ],
  ctaURL: Links.links.productProGeoTagging,
  ctaTitle: 'Learn more',
  pictureURL: MapImage,
  pictureHeight: 200
};
slidesEN['persistentThumbs'] = {
  title: 'Generating persistent thumbnails',
  description: (
    <>
      TagSpaces Pro generates persistent thumbnails for many file type such as:
      images, videos, notes, source code, office documents, bookmarks, ebooks,
      archives and PDFs.
    </>
  ),
  ctaURL: Links.links.productProThumbnailsGeneration,
  ctaTitle: 'Learn more',
  pictureURL: ThumbsImage,
  pictureHeight: 200
};
slidesEN['enterprise'] = {
  title: 'TagSpaces Enterprise',
  items: [
    <>
      <b>On-prem web</b> version of TagSpaces Pro for <b>self-hosting</b>
    </>,
    <>
      <b>PWA</b> version of TagSpaces Pro optimized for use om{' '}
      <b>mobile devices</b>
    </>,
    <>
      <b>White label</b> packages, with custom colors and logo
    </>,
    <>
      Development of <b>custom viewers</b> for file (e.g. 3D-assets, medical
      data ...)
    </>,
    <>
      Development of <b>custom perspectives</b> for folders (e.g. graphs, maps,
      trees)
    </>,
    <>Premium technical support and signed installers</>
  ],
  ctaURL: Links.links.emailContact,
  ctaTitle: 'Contact Us',
  pictureURL: EnterpriseImage,
  pictureHeight: 200
};

const slideStyles: any = {
  padding: 5,
  textAlign: 'left'
};

const SlideComponent = (props: SlideProps) => {
  const {
    title,
    description,
    ctaURL,
    ctaTitle,
    items,
    pictureURL,
    pictureHeight,
    openURLExternally
  } = props;
  return (
    <div style={slideStyles}>
      <Typography
        variant="h5"
        style={{ textAlign: 'center', paddingBottom: 10 }}
      >
        {title}
      </Typography>
      {description && (
        <Typography variant="subtitle1">{description}</Typography>
      )}
      {items &&
        items.map(item => (
          <Typography variant="subtitle1">&#x2605;&nbsp;{item}</Typography>
        ))}
      <Typography variant="subtitle1">&nbsp;</Typography>
      <div style={{ textAlign: 'center' }}>
        {pictureURL && (
          <img
            style={{
              maxHeight: pictureHeight,
              marginTop: 15,
              marginBottom: 15
            }}
            src={pictureURL}
            alt=""
          />
        )}
        <br />
        {ctaTitle && openURLExternally && (
          <Button
            onClick={() => {
              openURLExternally(ctaURL, true);
            }}
            variant="contained"
            color="primary"
          >
            {ctaTitle}
          </Button>
        )}
      </div>
    </div>
  );
};

const ProTeaserDialog = (props: Props) => {
  const [activeStep, setActiveStep] = useState<number>(0);

  const maxSteps = 7;

  const handleNext = () => {
    setActiveStep(activeStep + 1);
  };

  const handleBack = () => {
    setActiveStep(activeStep - 1);
  };

  const handleStepChange = step => {
    setActiveStep(step);
  };

  const { fullScreen, open, onClose, openURLExternally } = props;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={fullScreen}
      keepMounted
      scroll="paper"
    >
      <DialogTitle style={{ justifyContent: 'center', textAlign: 'center' }}>
        <DialogCloseButton onClose={onClose} />
      </DialogTitle>
      <DialogContent style={{ paddingBottom: 0 }}>
        <SwipeableViews
          index={activeStep}
          onChangeIndex={handleStepChange}
          enableMouseEvents
        >
          <SlideComponent
            {...slidesEN['general']}
            openURLExternally={openURLExternally}
          />
          <SlideComponent
            {...slidesEN['search']}
            openURLExternally={openURLExternally}
          />
          <SlideComponent
            {...slidesEN['objectstorage']}
            openURLExternally={openURLExternally}
          />
          <SlideComponent
            {...slidesEN['perspectives']}
            openURLExternally={openURLExternally}
          />
          <SlideComponent
            {...slidesEN['annotation']}
            openURLExternally={openURLExternally}
          />
          <SlideComponent
            {...slidesEN['geotagging']}
            openURLExternally={openURLExternally}
          />
          {/* <SlideComponent
            {...slidesEN['persistentThumbs']}
            openURLExternally={openURLExternally}
          /> */}
          <SlideComponent
            {...slidesEN['enterprise']}
            openURLExternally={openURLExternally}
          />
        </SwipeableViews>
      </DialogContent>
      <DialogActions style={{ justifyContent: 'center' }}>
        <MobileStepper
          style={{ marginTop: 10, backgroundColor: 'transparent' }}
          steps={maxSteps}
          position="static"
          activeStep={activeStep}
          nextButton={
            activeStep === maxSteps - 1 ? (
              <Button size="small" onClick={props.onClose}>
                {i18n.t('core:closeButton')}
              </Button>
            ) : (
              <Button size="small" onClick={handleNext}>
                {i18n.t('core:next')}
              </Button>
            )
          }
          backButton={
            <Button
              size="small"
              onClick={handleBack}
              disabled={activeStep === 0}
            >
              {i18n.t('core:prev')}
            </Button>
          }
        />
      </DialogActions>
    </Dialog>
  );
};

export default withMobileDialog()(ProTeaserDialog);

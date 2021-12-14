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
import ProTeaserImage from '-/assets/images/pro-teaser.svg';
import ThumbsImage from '-/assets/images/thumbnails-undraw.svg';
import PerspectivesImage from '-/assets/images/perspectives-undraw.svg';
import CloudImage from '-/assets/images/aws-s3-in-tagspaces.png';
import SearchImage from '-/assets/images/search-undraw.svg';
import MapImage from '-/assets/images/mapique-perspective.jpg';
import GalleryImage from '-/assets/images/gallery-perspective.jpg';
import CustomFolderColor from '-/assets/images/custom-folder-color.jpg';
import EntryDescription from '-/assets/images/entry-description.jpg';
import AnnotateImage from '-/assets/images/annotate-undraw.svg';
import EnterpriseImage from '-/assets/images/world-undraw.svg';
import i18n from '-/services/i18n';
import DialogCloseButton from '-/components/dialogs/DialogCloseButton';
import Links from '-/links';
import AppConfig from '-/config';

interface Props {
  open: boolean;
  fullScreen: boolean;
  openURLExternally: (url: string, skipConfirmation: boolean) => void;
  onClose: () => void;
}

interface SlideProps {
  title: string;
  openURL?: (url: string, skipConfirmation: boolean) => void;
  description?: '';
  ctaURL?: string;
  ctaTitle?: string;
  items?: Array<string>;
  pictureURL?: string;
  pictureShadow?: boolean;
  videoURL?: string;
  videoPosterUrl?: string;
  pictureHeight?: number;
}

const slidesEN = [];
slidesEN['general'] = {
  title: 'Why TagSpaces Pro ?',
  description: (
    <>
      The TagSpaces project is entirely subscriber-supported. We do not make
      money through advertising or any form of data sharing, so buying a Pro
      subscription will support the further development of our core product
      TagSpaces Lite and our browser extensions, which are all freely available.
      <br />
      <br />
      On top of that you will get a lot of useful features, extended search
      functionalities, alternative perspectives for your files, geo tagging and
      ability to connect AWS S3 compatible object storage. Some of these
      features are briefly presented on the next pages.
    </>
  ),
  ctaURL: Links.links.productsOverview,
  ctaTitle: 'Compare TagSpaces Lite vs. Pro',
  pictureURL: ProTeaserImage,
  pictureHeight: 150
};
slidesEN['gallery'] = {
  title: 'Gallery Perspectives',
  description: (
    <>
      This perspective is optimized for displaying folders containing photos and
      other images. It has an integrated presentation mode, so by just clicking
      the play button, the images start to change automatically one after
      another. With the expand button you can the presentation in full screen,
      so you can enjoy your photos in a distraction-free way.
    </>
  ),
  ctaURL: Links.documentationLinks.galleryPerspective,
  ctaTitle: i18n.t('showMeMore'),
  pictureURL: GalleryImage,
  pictureShadow: true,
  // videoURL: 'https://www.tagspaces.org/content/v3-10/perpspective-switch.mp4_',
  // videoPosterURL: PerspectivesImage,
  pictureHeight: 300
};
slidesEN['mapique'] = {
  title: 'Mapique Perspective & Geo tagging',
  description: (
    <>
      The Mapique perspective displays files and folders tagged with geo-tags on
      a digital map. The perspective integrates an ability to extract geo
      coordinates from EXIF/IPTC data embedded in JPEG files. By default
      TagSpaces uses OpenStreetMap for the map, but other compatible map tile
      servers can be used instead.
    </>
  ),
  // items: [
  //   <>
  //     This feature can be used to add geo coordinates to every file or folder.
  //   </>,
  //   <>Dedicated perspective for showing geo-tags on a build-in map</>,
  //   <>Extract geo location data from EXIF in JPGs files.</>,
  //   <>Useful for planing or documenting trips and vacations.</>,
  //   <>Useful for adding annotations for places on a map.</>
  // ],
  ctaURL: Links.documentationLinks.mapiquePerspective,
  ctaTitle: i18n.t('showMeMore'),
  pictureURL: MapImage,
  pictureShadow: true,
  pictureHeight: 300
};
slidesEN['search'] = {
  title: 'Extended Search',
  items: [
    <>Stored search queries – save common or complex queries for later use</>,
    <>Full text search for TXT, Markdown and HTML files</>,
    <>Global search – searching all local locations at once</>,
    <>
      Filter by file type - Documents, Notes, Audio files, Video files,
      Archives, Bookmarks, eBooks
    </>,
    <>Filter for files, folders or untagged files</>,
    <>Filter by size and date</>
  ],
  ctaURL: Links.links.productProAdvancedSearch,
  ctaTitle: i18n.t('showMeMore'),
  pictureURL: SearchImage,
  pictureHeight: 150
};
slidesEN['objectstorage'] = {
  title: 'Connect AWS S3 or MinIO object storage',
  description: (
    <>
      TagSpaces Pro supports connecting of cloud object storage as locations.
      Such storage is offered by Amazon AWS, DigitalOcean or you can host the
      object storage on your NAS with the help of MinIO.
      <br />
      <br />
      By doing so, you are getting a full-fledged file organizer and browser for
      files in the Cloud, directly in TagSpaces. You do not have to download
      every file separately and eventually upload it back in order to preview,
      edit or annotate it.
    </>
  ),
  // Folder usually hosts files grouped by different purpose (e.g. photos from an event or
  // managing a project). For such cases we offer the so called{' '}
  // <b>perspectives</b>, allowing you to set a custom view for different kind
  // of tasks you want to perform with your files.
  // items: [
  //   <>Connect self-hosted (e.g. on your NAS) MinIO folders as locations</>,
  //   <>Browse object storage buckets in TagSpaces</>,
  //   <>Direct streaming of the supported audio and video formats</>,
  //   <>Upload files with simple drag and drop actions</>
  // ],
  ctaURL: Links.links.productProObjectStore,
  ctaTitle: i18n.t('showMeMore'),
  pictureURL: CloudImage,
  pictureShadow: true,
  pictureHeight: 300
};
slidesEN['annotation'] = {
  title: 'Annotate and link your files and folders',
  description: (
    <>
      In TagSpaces Pro you can add text annotations to every kind of file or
      folder. By using the optional Markdown format in the description, you can
      create links to other files and folders.
    </>
  ),
  // items: [
  //   <>
  //     Add <b>custom description</b> to every document, photo or folder
  //   </>,
  //   <>
  //     The description can be in <b>markdown</b> allowing images and links
  //   </>,
  //   <>
  //     Set a <b>custom thumbnail</b> for every file or folder
  //   </>,
  //   <>
  //     Set a <b>custom background color</b> to folders
  //   </>
  // ],
  ctaURL: Links.links.productProFileFolderMeta,
  ctaTitle: i18n.t('showMeMore'),
  pictureURL: EntryDescription,
  pictureShadow: true,
  pictureHeight: 300
};
slidesEN['folderColor'] = {
  title: 'Folders with custom background color',
  description: (
    <>
      In the Pro version you can set a background color for any folder. The
      color is visible in parent folder and once the folder is opened and allows
      an easy marking of important folder or grouping of folders with similar
      content.
    </>
  ),
  ctaURL: Links.links.productProFolderColor,
  ctaTitle: i18n.t('showMeMore'),
  pictureURL: CustomFolderColor,
  pictureShadow: true,
  pictureHeight: 300
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
  title: 'TagSpaces Web Pro & Enterprise',
  items: [
    <>
      <b>Web</b> version of TagSpaces Pro for <b>self-hosting</b>
    </>,
    <>
      <b>PWA</b> mode optimized for use on <b>mobile devices</b>
    </>,
    <>
      <b>White label</b> packages, with custom colors and logo
    </>,
    <>
      Development of custom <b>file viewers</b> or <b>perspectives</b>
    </>,
    <>Premium technical support</>
  ],
  ctaURL: Links.links.emailContact,
  ctaTitle: i18n.t('contactUs'),
  pictureURL: EnterpriseImage,
  pictureHeight: 200
};

const Slide = (props: SlideProps) => {
  const {
    title,
    description,
    ctaURL,
    ctaTitle,
    items,
    pictureURL,
    videoURL,
    videoPosterUrl,
    pictureHeight,
    pictureShadow,
    openURL
  } = props;
  return (
    <div
      style={{
        padding: 5,
        textAlign: 'left'
      }}
    >
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
              marginBottom: 15,
              boxShadow: pictureShadow
                ? '2px 2px 13px 0 rgb(0 0 0 / 75%'
                : 'none',
              width: '95%'
            }}
            src={pictureURL}
            alt=""
          />
        )}
        {videoURL && (
          <video
            src={videoURL}
            poster={videoPosterUrl}
            autoPlay={true}
            loop
            controls
            style={{ width: '100%', marginBottom: 15 }}
          ></video>
        )}
        <br />
        {ctaTitle && openURL && (
          <Button
            onClick={() => {
              openURL(ctaURL, true);
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

  const maxSteps = 8;

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
      <DialogContent
        style={{
          paddingBottom: 0,
          // @ts-ignore
          overflowY: AppConfig.isFirefox ? 'auto' : 'overlay'
        }}
      >
        <SwipeableViews
          index={activeStep}
          onChangeIndex={handleStepChange}
          enableMouseEvents
        >
          <Slide {...slidesEN['general']} openURL={openURLExternally} />
          <Slide {...slidesEN['gallery']} openURL={openURLExternally} />
          <Slide {...slidesEN['mapique']} openURL={openURLExternally} />
          <Slide {...slidesEN['annotation']} openURL={openURLExternally} />
          <Slide {...slidesEN['search']} openURL={openURLExternally} />
          <Slide {...slidesEN['objectstorage']} openURL={openURLExternally} />
          <Slide {...slidesEN['folderColor']} openURL={openURLExternally} />
          <Slide {...slidesEN['enterprise']} openURL={openURLExternally} />
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

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
import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';
import MobileStepper from '@mui/material/MobileStepper';
import Dialog from '@mui/material/Dialog';
import AppConfig from '@tagspaces/tagspaces-platforms/AppConfig';
import ProTeaserImage from '-/assets/images/pro-teaser.svg';
import ThumbsImage from '-/assets/images/thumbnails-undraw.svg';
// import PerspectivesImage from '-/assets/images/perspectives-undraw.svg';
import CloudImage from '-/assets/images/aws-s3-in-tagspaces.png';
import SearchImage from '-/assets/images/search-undraw.svg';
import MapImage from '-/assets/images/mapique-perspective.jpg';
import GalleryImage from '-/assets/images/gallery-perspective.jpg';
import CustomFolderColor from '-/assets/images/custom-folder-color.jpg';
import EntryDescription from '-/assets/images/entry-description.jpg';
// import AnnotateImage from '-/assets/images/annotate-undraw.svg';
import EnterpriseImage from '-/assets/images/world-undraw.svg';
import i18n from '-/services/i18n';
import DialogCloseButton from '-/components/dialogs/DialogCloseButton';
import Links from '-/links';
import useTheme from '@mui/styles/useTheme';
import useMediaQuery from '@mui/material/useMediaQuery';

interface Props {
  open: boolean;
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
      The TagSpaces project is entirely <b>subscriber-supported</b>. We do not
      make money through advertising or any form of data sharing, so buying a
      Pro subscription will support the further development of our core product
      TagSpaces Lite and our browser extensions, which are all freely available.
      <br />
      <br />
      On top of that you will get <b>a lot of useful features</b>, extended
      search functionalities, alternative perspectives for your files, geo
      tagging functionality and ability to connect AWS S3 compatible object
      storage. Some of these features are briefly presented on the next pages.
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
      This perspective is optimized for displaying folders with photos and other
      images. It has an integrated <b>presentation mode</b>, so by just clicking
      the play button, the images start to change automatically one after
      another. With the expand button you can start the presentation in{' '}
      <b>full screen</b>, so you can enjoy your photos in a distraction-free
      way.
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
  title: 'Digital Map & Geo tagging',
  description: (
    <>
      The Mapique perspective displays files and folders tagged with geo-tags on
      a digital map. The perspective integrates an ability to{' '}
      <b>extract geo coordinates</b> from EXIF/IPTC data embedded in JPEG files.
      By default TagSpaces uses OpenStreetMap for the map, but other compatible
      map tile servers can be used instead.
      <br />
      In the PRO version, you can add tags containing geolocation data to any
      file or folder. This can be useful for example for planing and documenting
      trips or just to <b>privately annotate maps</b>.
    </>
  ),
  ctaURL: Links.documentationLinks.mapiquePerspective,
  ctaTitle: i18n.t('showMeMore'),
  pictureURL: MapImage,
  pictureShadow: true,
  pictureHeight: 300
};
slidesEN['annotation'] = {
  title: 'Annotate and link your files and folders',
  description: (
    <>
      In TagSpaces Pro you can add text description to every kind of file or
      folder.
    </>
  ),
  items: [
    <>
      The description text can be in <b>Markdown</b> format.
    </>,
    <>
      This will allow so you have basic text formatting such as <b>bold</b> or{' '}
      <i>italic</i>.
    </>,
    <>
      You can easily create plain or numbered (<b>to-do</b>) lists.
    </>,
    <>
      <b>Create links</b> to other documents, folder, locations or web pages
    </>,
    <>
      You can also set a <b>custom thumbnail</b> for every file or folder,
      allowing you to emphasize visually its content.
    </>
  ],
  ctaURL: Links.links.productProFileFolderMeta,
  ctaTitle: i18n.t('showMeMore'),
  pictureURL: EntryDescription,
  pictureShadow: true,
  pictureHeight: 300
};
slidesEN['search'] = {
  title: 'Extended Search',
  description: (
    <>
      The search is essential part of TagSpaces, which is significantly extended
      in the PRO version.
    </>
  ),
  items: [
    <>
      <b>Stored search queries</b> – save common or complex queries for later
      use
    </>,
    <>
      <b>Full text search</b> on TXT, Markdown and HTML files
    </>,
    <>
      <b>Global search</b> – searching all local locations at once
    </>,
    <>
      <b>Filter by file type</b> – documents, notes, audio or video files,
      archives, bookmarks, ebooks, ...
    </>,
    <>Filter for files, folders or untagged files</>,
    <>Filter by size and date</>
  ],
  ctaURL: Links.links.productProAdvancedSearch,
  ctaTitle: i18n.t('showMeMore'),
  pictureURL: SearchImage,
  pictureHeight: 150
};
// slidesEN['objectstorage'] = {
//   title: 'Connect AWS S3 or MinIO object storage',
//   items: [
//     <>
//       TagSpaces Pro supports connecting{' '}
//       <b>Amazon S3 compliant storage providers</b> as locations. Such storage is
//       offered by Amazon AWS, Wasabi and many others. You can also host an object
//       storage <b>privately</b> (e.g. on your NAS) with the help of open source
//       projects like MinIO.
//     </>,
//     <>
//       This allows you to <b>work collaboratively</b> on the same files with
//       family members or co-workers.
//     </>,
//     <>
//       By doing so, you are getting a Cloud based{' '}
//       <b>full-fledged file organizer and browser</b>, so you do not have to
//       download files in order to preview, edit or annotate them. On top of that
//       you can <b>stream audio and video</b> files from the Cloud location.
//     </>
//   ],
//   ctaURL: Links.links.productProObjectStore,
//   ctaTitle: i18n.t('showMeMore'),
//   pictureURL: CloudImage,
//   pictureShadow: true,
//   pictureHeight: 300
// };
slidesEN['folderColor'] = {
  title: 'Folders with custom backgrounds',
  description: (
    <>
      In the Pro version you can set a background color to any folder. The color
      is visible also in the parent folder. Once it is opened the whole
      background area is having the specified folder color. This can be useful
      if you have common sub-folders structure, where for example the sub-folder{' '}
      <i>Archive</i> can marked <i>yellow</i> for easy recognition.
    </>
  ),
  ctaURL: Links.links.productProFolderColor,
  ctaTitle: i18n.t('showMeMore'),
  pictureURL: CustomFolderColor,
  pictureShadow: true,
  pictureHeight: 300
};
slidesEN['enterprise'] = {
  title: 'TagSpaces Web Pro & Enterprise',
  description: (
    <>
      TagSpaces is offered also as a web application running in your web
      browser.
    </>
  ),
  items: [
    <>
      <b>On-prem web</b> version of TagSpaces Pro for <b>self-hosting</b>
    </>,
    <>
      <b>PWA</b> mode optimized for use on <b>mobile devices</b>
    </>,
    <>
      <b>White label</b> packages, with custom colors and logo
    </>,
    <>
      Easy deployable on the AWS cloud stack, providing user management and
      MFA/2FA by utilizing Cognito.
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

function Slide(props: SlideProps) {
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
          <a
            href="#"
            onClick={() => {
              openURL(ctaURL, true);
            }}
          >
            <img
              style={{
                cursor: 'pointer',
                maxHeight: pictureHeight,
                marginTop: 15,
                marginBottom: 15,
                boxShadow: pictureShadow
                  ? '2px 2px 13px 0 rgb(0 0 0 / 75%'
                  : 'none',
                maxWidth: '95%'
              }}
              src={pictureURL}
              alt=""
            />
          </a>
        )}
        {videoURL && (
          <video
            src={videoURL}
            poster={videoPosterUrl}
            autoPlay={true}
            loop
            controls
            style={{ width: '100%', marginBottom: 15 }}
          />
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
}

function ProTeaserDialog(props: Props) {
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

  const { open, onClose, openURLExternally } = props;

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
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
}

export default ProTeaserDialog;

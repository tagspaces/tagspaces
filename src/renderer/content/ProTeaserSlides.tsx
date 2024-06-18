import Links from 'assets/links';
import ProTeaserImage from '-/assets/images/pro-teaser.svg';
import KanbanImage from '-/assets/images/kanban-perspective.jpg';
import GalleryImage from '-/assets/images/gallery-perspective.jpg';
import FolderVizImage from '-/assets/images/folderviz-perspective.jpg';
import MapImage from '-/assets/images/mapique-perspective.jpg';
import EntryDescription from '-/assets/images/entry-description.jpg';
import SearchImage from '-/assets/images/search-undraw.svg';
import CustomFolderColor from '-/assets/images/custom-folder-color.jpg';
import RevisionsAutosave from '-/assets/images/revisions-autosave.png';
import EnterpriseImage from '-/assets/images/world-undraw.svg';
import { PerspectiveIDs } from '-/perspectives';
import React from 'react';

export const slidesNames = [
  'general',
  PerspectiveIDs.KANBAN,
  PerspectiveIDs.FOLDERVIZ,
  PerspectiveIDs.MAPIQUE,
  PerspectiveIDs.GALLERY,
  'annotation',
  'revisions',
  'search',
  'folderColor',
  'enterprise',
];

export function getProTeaserSlides(t) {
  const slidesEN = [];
  slidesEN[slidesNames['general']] = {
    title: 'Why TagSpaces Pro ?',
    description: (
      <>
        <p>
          The TagSpaces project is completely supported by subscribers. We
          aren't paid through advertising or sharing data, so purchasing a Pro
          subscription will contribute to the further development of our core
          offering, TagSpaces Lite, and our browser extensions, which can all be
          accessed without a cost.
        </p>
        <p>
          Apart from that, you will be able to enjoy a lot of useful features,
          advanced search capabilities, perspectives for your files and folders,
          and geo-tagging. Several of these features will be highlighted in the
          following slides.
        </p>
      </>
    ),
    pictureURL: ProTeaserImage,
    pictureHeight: 150,
  };
  slidesEN[slidesNames[1]] = {
    title: 'TagSpaces Pro - Kanban Perspectives',
    description: (
      <>
        This perspective allows each folder to be transformed into a Kanban
        board, with columns representing the subfolders of the current folder.
        Each file residing in the subfolders is then displayed as a tile and can
        be shifted, via drag and drop, between the columns. The columns
        themselves can be rearranged also with drag and drop. A built-in Trello
        import is included, where an exported Trello board can be imported into
        the current folder.
      </>
    ),
    ctaURL: Links.documentationLinks.kanbanPerspective,
    ctaTitle: t('showMeMore'),
    pictureURL: KanbanImage,
    pictureShadow: true,
    pictureHeight: 300,
  };
  slidesEN[slidesNames[2]] = {
    title: 'TagSpaces Pro - FolderViz Perspective',
    description: (
      <>
        <p>
          FolderViz represent the structure of the current folder as a tree.
          Currently it supports the following views:
        </p>
        <ul>
          <li>Horizontal Tree</li>
          <li>Radial Tree</li>
          <li>Treemap</li>
        </ul>
        <small>
          <b>Note:</b> This perspective is still in development and has a
          preview status.
        </small>
      </>
    ),
    ctaURL: Links.documentationLinks.foldervizPerspective,
    ctaTitle: t('showMeMore'),
    pictureURL: FolderVizImage,
    pictureShadow: true,
    pictureHeight: 300,
  };
  slidesEN[slidesNames[3]] = {
    title: 'TagSpaces Pro - Mapique Perspective & Geo tagging',
    description: (
      <>
        <p>
          The Mapique Perspective displays files and folders that have been
          tagged with geotags on a digital map. This perspective is also able to
          automatically extract geocoordinates from EXIF/IPTC data stored in
          JPEG files. OpenStreetMap is the default choice for the map, though
          other compatible map tile servers may be used.{' '}
        </p>
        <p>
          The PRO version of TagSpaces allows users to tag their files and
          folders with geolocation data. This feature can be useful for planning
          trips or simply for privately annotating maps.
        </p>
      </>
    ),
    ctaURL: Links.documentationLinks.mapiquePerspective,
    ctaTitle: t('showMeMore'),
    pictureURL: MapImage,
    pictureShadow: true,
    pictureHeight: 300,
  };
  slidesEN[slidesNames[4]] = {
    title: 'TagSpaces Pro - Gallery Perspectives',
    description: (
      <>
        This perspective is designed to best display folders containing photos
        and other images. It includes a presentation mode, so you can simply
        click the play button and the images will change sequentially. The
        presentation can be started in full screen mode, for an undisturbed
        viewing experience.
      </>
    ),
    ctaURL: Links.documentationLinks.galleryPerspective,
    ctaTitle: t('showMeMore'),
    pictureURL: GalleryImage,
    pictureShadow: true,
    pictureHeight: 300,
  };
  slidesEN[slidesNames[5]] = {
    title: 'Annotate and link your files and folders',
    description: (
      <>
        In TagSpaces Pro, you can add a text description to every type of file
        or folder.
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
      </>,
    ],
    ctaURL: Links.links.productProFileFolderMeta,
    ctaTitle: t('showMeMore'),
    pictureURL: EntryDescription,
    pictureShadow: true,
    pictureHeight: 300,
  };
  slidesEN[slidesNames[6]] = {
    title: 'Revisions and auto-save for editable files',
    description: (
      <>
        <p>
          A key feature of document management systems is the ability to create
          revisions of the edited files. This feature can be enabled in the
          Advanced tab of the application's Settings dialog box. Once activated,
          a full copy of the current file (e.g. TXT, MD, HTML or JSON) is
          created with each save.
        </p>
        <p>
          The auto-save feature can be enabled individually for each editable
          file. When it is enabled, the application will save any changes you
          make automatically. You can also save the file manually by clicking
          the save button or by pressing the CTRL+S key combination.
        </p>
      </>
    ),
    ctaURL: Links.documentationLinks.revisions,
    ctaTitle: t('showMeMore'),
    pictureURL: RevisionsAutosave,
    pictureShadow: true,
    pictureHeight: 400,
  };
  slidesEN[slidesNames[7]] = {
    title: 'Extended Search',
    description: (
      <>
        The search is essential part of TagSpaces, which is significantly
        extended in the PRO version.
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
      <>Filter by size and date</>,
    ],
    ctaURL: Links.links.productProAdvancedSearch,
    ctaTitle: t('showMeMore'),
    pictureURL: SearchImage,
    pictureHeight: 150,
  };
  slidesEN[slidesNames[8]] = {
    title: 'Folders with custom backgrounds',
    description: (
      <>
        In the Pro version, you can set a background color to any folder, which
        is visible even in its parent folder. Once the folder is opened, the
        entire background area assumes the designated folder color. This is
        useful if you have common sub-folder structures, such as an 'Archive'
        folder which can be marked with a color like 'yellow' to make it stand
        out.
      </>
    ),
    ctaURL: Links.links.productProFolderColor,
    ctaTitle: t('showMeMore'),
    pictureURL: CustomFolderColor,
    pictureShadow: true,
    pictureHeight: 300,
  };
  slidesEN[slidesNames[9]] = {
    title: 'TagSpaces Web Pro & Enterprise',
    description: (
      <>
        TagSpaces is also available as a web application that runs on your web
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
      <>Premium technical support</>,
    ],
    ctaURL: Links.links.emailContact,
    ctaTitle: t('contactUs'),
    pictureURL: EnterpriseImage,
    pictureHeight: 200,
  };
  return slidesEN;
}

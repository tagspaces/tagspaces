/**
 * TagSpaces - universal file and folder organizer
 * Copyright (C) 2017-present TagSpaces GmbH
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
          The TagSpaces project is fully supported by its subscribers. We do not
          rely on advertising or data sharing for revenue, so purchasing a Pro
          subscription directly supports the ongoing development of our core
          product, TagSpaces Lite, as well as our browser extensions, which
          remain free to use.
        </p>
        <p>
          In addition, a Pro subscription unlocks a wide range of valuable
          features, including advanced search capabilities, unique perspectives
          for organizing your files and folders, and geo-tagging. Some of these
          features will be highlighted in the following slides.
        </p>
      </>
    ),
    pictureURL: ProTeaserImage,
    pictureHeight: 150,
  };
  slidesEN[slidesNames[1]] = {
    title: 'Kanban Perspectives in TagSpaces Pro',
    description: (
      <>
        This perspective transforms each folder into a Kanban board, where the
        columns represent the subfolders of the current folder. Files within
        these subfolders are displayed as tiles that can be easily moved between
        columns using drag and drop. The columns themselves can also be
        rearranged in the same way. Additionally, a built-in Trello import
        feature allows you to import an exported Trello board directly into the
        current folder.
      </>
    ),
    ctaURL: Links.documentationLinks.kanbanPerspective,
    ctaTitle: t('showMeMore'),
    pictureURL: KanbanImage,
    pictureShadow: true,
    pictureHeight: 300,
  };
  slidesEN[slidesNames[2]] = {
    title: 'FolderViz Perspective in TagSpaces Pro',
    description: (
      <>
        <p>
          FolderViz displays the contents of the current folder or search
          results as a graphical tree. It currently supports the following
          views:
        </p>
        <ul>
          <li>
            <b>Horizontal Tree</b> – Visualizes the location of files from the
            search results
          </li>
          <li>
            <b>Radial Tree</b> – Helps you identify folders with a large number
            of files
          </li>
          <li>
            <b>Treemap</b> – Assists in identifying large files
          </li>
        </ul>
        <small>
          <b>Note:</b> This perspective is still in development and currently
          has a preview status.
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
    title: 'Mapique Perspective in TagSpaces Pro',
    description: (
      <>
        <p>
          The Mapique Perspective displays files and folders tagged with
          geo-tags on a digital map. It can also automatically extract
          geo-coordinates from EXIF/IPTC data stored in JPEG files. By default,
          OpenStreetMap is used as the map provider, but other compatible map
          tile servers can be integrated as well.
        </p>
        <p>
          Users can tag files and folders with geolocation data (geo-tagging).
          This feature is especially useful for trip planning or for adding
          private annotations to maps.
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
    title: 'Gallery Perspectives in TagSpaces Pro',
    description: (
      <>
        This perspective is optimized for displaying folders that contain photos
        and other images. It includes a presentation mode, allowing you to click
        the play button and view the images in sequence. The presentation can
        also be started in full-screen mode for an immersive, distraction-free
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
        In the PRO version, you can add a text description to any type of file
        or folder.
      </>
    ),
    items: [
      <>
        The description text supports <b>Markdown</b> formatting.
      </>,
      <>
        This enables basic text styling, such as <b>bold</b> or <i>italic</i>.
      </>,
      <>
        You can easily create plain or numbered (<b>to-do</b>) lists.
      </>,
      <>
        <b>Create links</b> to other documents, folders, locations, or web
        pages.
      </>,
      <>
        You can also set a <b>custom thumbnail</b> for each file or folder,
        allowing you to visually highlight its content.
      </>,
    ],
    ctaURL: Links.links.productProFileFolderMeta,
    ctaTitle: t('showMeMore'),
    pictureURL: EntryDescription,
    pictureShadow: true,
    pictureHeight: 300,
  };
  slidesEN[slidesNames[6]] = {
    title: 'File revisions and auto-save for text files',
    description: (
      <>
        <p>
          A key feature of document management systems is the ability to create{' '}
          <b>revisions</b> of edited files. Once enabled, a full copy of the
          current file (e.g., TXT, MD, HTML, or JSON) is created with each save,
          allowing you to track changes over time.
        </p>
        <p>
          The <b>auto-save</b> feature can be activated individually for each
          editable file. When enabled, the application will automatically save
          any changes you make, ensuring that your progress is never lost.
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
        The search functionality is significantly enhanced in the PRO version.
      </>
    ),
    items: [
      <>
        <b>Stored search queries</b> – save frequently used or complex queries
        for future use.
      </>,
      <>
        <b>Full-text search</b> across text, markdown, and HTML files.
      </>,
      <>
        <b>Global search</b> – search across all local locations in one step.
      </>,
      <>
        <b>Filter by file type</b> – documents, notes, audio or video files,
        archives, bookmarks, ebooks, and more.
      </>,
      <>Filter by files, folders, or untagged files.</>,
      <>Filter by size and date.</>,
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
        <p>
          In the PRO version, you can assign a background color to any folder,
          which is visible even when viewing its parent folder. Once the folder
          is opened, the entire background area adopts the chosen color. This
          feature is especially useful for distinguishing common sub-folder
          structures. For example, an 'Archive' folder could be highlighted in
          yellow, making it easy to spot.
        </p>
      </>
    ),
    ctaURL: Links.links.productProFolderColor,
    ctaTitle: t('showMeMore'),
    pictureURL: CustomFolderColor,
    pictureShadow: true,
    pictureHeight: 300,
  };
  slidesEN[slidesNames[9]] = {
    title: 'TagSpaces Pro Web',
    description: (
      <>
        TagSpaces is also available as a web application that runs in your web
        browser on your IT infrastructure.
      </>
    ),
    items: [
      <>
        <b>On-prem web</b> version of TagSpaces Pro for <b>self-hosting</b>.
      </>,
      <>
        <b>PWA</b> mode optimized for <b>mobile devices</b>.
      </>,
      <>
        <b>White label</b> packages featuring custom colors and logos.
      </>,
      <>
        Easily deployable using <b>Docker</b> containers.
      </>,
      <>Premium technical support.</>,
      <>
        We offer development of custom <b>file viewers</b> and{' '}
        <b>perspectives</b>, as well as tailored installations on the{' '}
        <b>AWS cloud stack</b>, complete with user management and <b>MFA/2FA</b>
        .
      </>,
    ],
    ctaURL: Links.links.emailContact,
    ctaTitle: t('contactUs'),
    pictureURL: EnterpriseImage,
    pictureHeight: 200,
  };
  return slidesEN;
}
